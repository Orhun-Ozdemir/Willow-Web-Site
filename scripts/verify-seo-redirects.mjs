#!/usr/bin/env node
/**
 * SEO migration checks: legacy redirect map targets, 410 patterns, optional HTTP probes.
 *
 * Usage:
 *   node scripts/verify-seo-redirects.mjs
 *   BASE_URL=http://127.0.0.1:4321 node scripts/verify-seo-redirects.mjs --http
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const httpMode = process.argv.includes("--http");
const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:4321").replace(/\/+$/, "");

const middlewareSrc = fs.readFileSync(path.join(root, "astro-app/src/middleware.ts"), "utf8");
const site = JSON.parse(fs.readFileSync(path.join(root, "data/site-data.json"), "utf8"));

function extractRedirectMap(src) {
  const block = src.match(/const LEGACY_REDIRECTS[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!block) throw new Error("LEGACY_REDIRECTS not found in middleware.ts");
  return Object.fromEntries([...block[1].matchAll(/"(\/[^"]+)":\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));
}

function extractGoneExact(src) {
  const block = src.match(/const GONE_410_EXACT[^=]*=\s*new Set\(\[([\s\S]*?)\]\)/);
  if (!block) return [];
  return [...block[1].matchAll(/"(\/[^"]+)"/g)].map((m) => m[1]);
}

function extractGonePrefixes(src) {
  const block = src.match(/const GONE_410_PREFIXES[^=]*=\s*\[([\s\S]*?)\]/);
  if (!block) return [];
  return [...block[1].matchAll(/"(\/[^"]+)"/g)].map((m) => m[1]);
}

const redirects = extractRedirectMap(middlewareSrc);
const goneExact = extractGoneExact(middlewareSrc);
const gonePrefixes = extractGonePrefixes(middlewareSrc);

const productSlugs = new Set((site.products || []).map((p) => p.slug || p.id));
const newsSlugs = new Set((site.news || []).map((n) => n.slug || n.id));
const staticSections = new Set(["", "solutions", "services", "products", "company", "news", "glossary", "contact", "start-project", "privacy", "faq"]);

function validateTarget(target) {
  if (target === "/sitemap.xml") return null;
  const m = target.match(/^\/tr(?:\/([^/]+)(?:\/([^/]+))?)?$/);
  if (!m) return `non-/tr target: ${target}`;
  const [, section, slug] = m;
  if (!section) return null;
  if (!staticSections.has(section)) return `unknown section: ${section}`;
  if (section === "products" && slug && !productSlugs.has(slug)) return `missing product slug: ${slug}`;
  if (section === "news" && slug && !newsSlugs.has(slug)) return `missing news slug: ${slug}`;
  return null;
}

const errors = [];
const warnings = [];

for (const [from, to] of Object.entries(redirects)) {
  const err = validateTarget(to);
  if (err) errors.push(`301 ${from} -> ${to}: ${err}`);
}

const trProductsMissing = (site.products || []).filter((p) => !p.localized?.tr?.title);
if (trProductsMissing.length) {
  warnings.push(`${trProductsMissing.length} products missing localized.tr.title in site-data.json: ${trProductsMissing.map((p) => p.id).join(", ")}`);
}

const supabaseProductIds = new Set(productSlugs);
const newsIds = new Set(newsSlugs);
if (supabaseProductIds.size !== 12) warnings.push(`Expected 12 product slugs, found ${supabaseProductIds.size}`);
if (newsIds.size !== 10) warnings.push(`Expected 10 news slugs, found ${newsIds.size}`);

console.log(`Legacy redirects: ${Object.keys(redirects).length}`);
console.log(`410 exact paths: ${goneExact.length}, prefixes: ${gonePrefixes.length}`);

if (errors.length) {
  console.error("\nStatic validation FAILED:");
  for (const e of errors) console.error("  -", e);
} else {
  console.log("\nStatic validation: OK (all redirect targets resolve)");
}

if (warnings.length) {
  console.warn("\nWarnings:");
  for (const w of warnings) console.warn("  -", w);
}

const regressionCases = [
  { path: "/tag/lorawan/", expect: 301, target: "/tr/products" },
  { path: "/category/haberler/", expect: 301, target: "/tr/news" },
  { path: "/sitemap_index.xml", expect: 301, target: "/sitemap.xml" },
  { path: "/feed", expect: 410 },
  { path: "/comments/feed", expect: 410 },
  { path: "/wp-json/wp/v2/posts", expect: 410 },
  { path: "/xmlrpc.php", expect: 410 },
  { path: "/web_faqs/foo", expect: 410 },
  { path: "/2022/08/02", expect: 301, target: "/tr/news" },
  { path: "/iletisim", expect: 301, target: "/tr/contact" },
  { path: "/lorawan-soil-moisture-sensor", expect: 301, target: "/tr/products/willowmos" },
];

async function probe(caseDef) {
  const res = await fetch(`${baseUrl}${caseDef.path}`, { redirect: "manual" });
  if (res.status !== caseDef.expect) {
    return `${caseDef.path}: expected ${caseDef.expect}, got ${res.status}`;
  }
  if (caseDef.target) {
    const loc = res.headers.get("location") || "";
    if (!loc.includes(caseDef.target)) {
      return `${caseDef.path}: location ${loc} missing ${caseDef.target}`;
    }
  }
  return null;
}

const CANONICAL_HOST = "https://www.willowsoft.co";

// Extended SEO invariants (canonical host, admin noindex, slash, sitemap, hreflang,
// schema JSON parse, representative pages). All read-only GET requests.
async function checkSeoInvariants(base) {
  const errs = [];
  const get = async (p, redirect = "follow") => {
    const r = await fetch(`${base}${p}`, { redirect });
    return { status: r.status, headers: r.headers, body: redirect === "follow" ? await r.text() : "" };
  };

  // 1. Canonical host = www on representative pages (EN/TR/RTL/remote locales)
  for (const p of ["/en", "/tr", "/en/products", "/ar/faq", "/ja"]) {
    const r = await get(p);
    if (r.status !== 200) { errs.push(`canonical: ${p} status ${r.status}`); continue; }
    const m = r.body.match(/<link rel="canonical" href="([^"]+)"/);
    if (!m) errs.push(`canonical: ${p} has no canonical tag`);
    else if (!m[1].startsWith(CANONICAL_HOST)) errs.push(`canonical: ${p} -> ${m[1]} is not on ${CANONICAL_HOST}`);
    else if (/[^/]\/$/.test(m[1])) errs.push(`canonical: ${p} -> ${m[1]} has a trailing slash`);
  }

  // 2. Admin: noindex header AND never shared-cached
  {
    const r = await fetch(`${base}/admin`, { redirect: "manual" });
    const xr = r.headers.get("x-robots-tag") || "";
    if (!/noindex/i.test(xr)) errs.push(`admin: X-Robots-Tag missing noindex (got "${xr}")`);
    const cc = r.headers.get("cache-control") || "";
    if (/s-maxage/i.test(cc)) errs.push(`admin: must not be shared-cached (got "${cc}")`);
  }

  // 2b. Public HTML carries the short shared-cache pilot header
  {
    const r = await fetch(`${base}/en`, { redirect: "manual" });
    const cc = r.headers.get("cache-control") || "";
    if (!/s-maxage=\d+/.test(cc)) errs.push(`cache: /en missing s-maxage pilot header (got "${cc}")`);
  }

  // 3. Trailing slash collapses to the no-slash canonical in a single 301 hop
  {
    const r = await fetch(`${base}/en/products/`, { redirect: "manual" });
    if (r.status !== 301) errs.push(`slash: /en/products/ expected 301, got ${r.status}`);
    const loc = r.headers.get("location") || "";
    if (!/\/en\/products(?:$|[?#])/.test(loc)) errs.push(`slash: /en/products/ -> ${loc}`);
  }

  // 4. Sitemap: all locs on www host with no trailing slash, and 8 privacy URLs
  {
    const r = await get("/sitemap.xml");
    if (r.status !== 200) errs.push(`sitemap: status ${r.status}`);
    const locs = [...r.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    if (!locs.length) errs.push("sitemap: no <loc> entries found");
    const nonWww = locs.filter((l) => !l.startsWith(CANONICAL_HOST));
    if (nonWww.length) errs.push(`sitemap: ${nonWww.length} non-www locs (e.g. ${nonWww[0]})`);
    const privacy = locs.filter((l) => /\/privacy$/.test(l));
    if (privacy.length !== 8) errs.push(`sitemap: expected 8 privacy URLs, found ${privacy.length}`);
  }

  // 5. hreflang reciprocity: /en/products <-> /tr/products
  {
    const en = await get("/en/products");
    const enAlts = [...en.body.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    if (!enAlts.some((a) => a[1] === "tr")) errs.push("hreflang: /en/products missing tr alternate");
    const tr = await get("/tr/products");
    const trAlts = [...tr.body.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    if (!trAlts.some((a) => a[1] === "en")) errs.push("hreflang: /tr/products missing reciprocal en alternate");
  }

  // 6. JSON-LD parses on representative pages
  for (const p of ["/en", "/en/faq", "/en/glossary", "/en/privacy", "/en/products/willowbee"]) {
    const r = await get(p);
    if (r.status !== 200) { errs.push(`schema: ${p} status ${r.status}`); continue; }
    const blocks = [...r.body.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    if (!blocks.length) { errs.push(`schema: ${p} has no JSON-LD`); continue; }
    for (const b of blocks) {
      try { JSON.parse(b[1]); } catch (e) { errs.push(`schema: ${p} invalid JSON-LD (${e.message})`); }
    }
  }

  // 7. Representative pages return 200 (new hubs + locales)
  for (const p of ["/en/faq", "/tr/faq", "/en/glossary", "/en/privacy", "/tr/privacy", "/ar", "/ja/products"]) {
    const r = await fetch(`${base}${p}`, { redirect: "manual" });
    if (r.status !== 200) errs.push(`page: ${p} expected 200, got ${r.status}`);
  }

  return errs;
}

if (httpMode) {
  console.log(`\nHTTP probes against ${baseUrl} ...`);
  const httpErrors = [];
  for (const c of regressionCases) {
    try {
      const err = await probe(c);
      if (err) httpErrors.push(err);
    } catch (e) {
      httpErrors.push(`${c.path}: ${e.message}`);
    }
  }
  // Spot-check a legacy product redirect resolves to 200
  try {
    const chain = await fetch(`${baseUrl}/willowbee`, { redirect: "follow" });
    if (chain.status !== 200) httpErrors.push(`/willowbee final status ${chain.status}, expected 200`);
  } catch (e) {
    httpErrors.push(`/willowbee chain: ${e.message}`);
  }

  // Extended SEO invariant checks
  try {
    const invariantErrors = await checkSeoInvariants(baseUrl);
    httpErrors.push(...invariantErrors);
  } catch (e) {
    httpErrors.push(`seo-invariants: ${e.message}`);
  }

  if (httpErrors.length) {
    console.error("\nHTTP validation FAILED:");
    for (const e of httpErrors) console.error("  -", e);
    process.exit(1);
  }
  console.log("HTTP validation: OK");
}

process.exit(errors.length ? 1 : 0);

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

// Optional: bypass cookie for protected Vercel preview deployments. When set, it is
// attached to every request so the SEO probes can run against a preview URL.
const bypassCookie = process.env.VERCEL_BYPASS_COOKIE || "";
if (bypassCookie) {
  const nativeFetch = globalThis.fetch;
  globalThis.fetch = (input, init = {}) => {
    const headers = new Headers(init.headers || {});
    headers.set("cookie", bypassCookie);
    return nativeFetch(input, { ...init, headers });
  };
}

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

const productEntries = site.products || [];
const newsEntries = site.news || [];
const productIdentifiers = productEntries.map((p) => p.slug || p.id).filter(Boolean);
const newsIdentifiers = newsEntries.map((n) => n.slug || n.id).filter(Boolean);
const productSlugs = new Set(productIdentifiers);
const newsSlugs = new Set(newsIdentifiers);
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

if (productIdentifiers.length !== productEntries.length) {
  warnings.push(`${productEntries.length - productIdentifiers.length} products have no slug/id in site-data.json`);
}
if (newsIdentifiers.length !== newsEntries.length) {
  warnings.push(`${newsEntries.length - newsIdentifiers.length} news entries have no slug/id in site-data.json`);
}
if (productSlugs.size !== productIdentifiers.length) {
  warnings.push(`${productIdentifiers.length - productSlugs.size} duplicate product slug/id values in site-data.json`);
}
if (newsSlugs.size !== newsIdentifiers.length) {
  warnings.push(`${newsIdentifiers.length - newsSlugs.size} duplicate news slug/id values in site-data.json`);
}

console.log(`Legacy redirects: ${Object.keys(redirects).length}`);
console.log(`410 exact paths: ${goneExact.length}, prefixes: ${gonePrefixes.length}`);
console.log(`Content identifiers: ${productSlugs.size} products, ${newsSlugs.size} news entries`);

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
const CANONICAL_PATHS = [
  "/en",
  "/tr",
  "/ar/faq",
  "/ja",
  "/en/lorawan-sensors",
  "/de/lorawan-sensors",
  "/en/products",
  "/de/products/willowpre",
];

function htmlAttribute(tag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = tag.match(new RegExp(`\\b${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function canonicalLinks(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => htmlAttribute(tag, "rel").toLowerCase().split(/\s+/).includes("canonical"))
    .map((tag) => htmlAttribute(tag, "href"))
    .filter(Boolean);
}

function alternateLinks(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => htmlAttribute(tag, "rel").toLowerCase().split(/\s+/).includes("alternate"))
    .map((tag) => ({ hreflang: htmlAttribute(tag, "hreflang"), href: htmlAttribute(tag, "href") }))
    .filter((alternate) => alternate.hreflang && alternate.href);
}

function tagText(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return (match?.[1] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function metaContent(html, name) {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const tag = tags.find((candidate) => htmlAttribute(candidate, "name").toLowerCase() === name.toLowerCase());
  return tag ? htmlAttribute(tag, "content") : "";
}

function decodeXmlText(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function checkCanonical(errs, pathName, html, expected = `${CANONICAL_HOST}${pathName}`) {
  const canonicals = canonicalLinks(html);
  if (canonicals.length !== 1) {
    errs.push(`canonical: ${pathName} expected exactly one canonical tag, found ${canonicals.length}`);
    return;
  }

  const [canonical] = canonicals;
  let parsed;
  try {
    parsed = new URL(canonical);
  } catch {
    errs.push(`canonical: ${pathName} has invalid URL ${canonical}`);
    return;
  }

  if (parsed.origin !== CANONICAL_HOST) errs.push(`canonical: ${pathName} -> ${canonical} is not on ${CANONICAL_HOST}`);
  if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) errs.push(`canonical: ${pathName} -> ${canonical} has a trailing slash`);
  if (parsed.search || parsed.hash) errs.push(`canonical: ${pathName} -> ${canonical} contains a query/hash`);
  if (canonical !== expected) errs.push(`canonical: ${pathName} expected ${expected}, got ${canonical}`);
}

// Extended SEO invariants (canonical host, admin noindex, slash, sitemap, hreflang,
// schema JSON parse, representative pages). All read-only GET requests.
async function checkSeoInvariants(base) {
  const errs = [];
  const get = async (p, redirect = "follow") => {
    const r = await fetch(`${base}${p}`, { redirect });
    return { status: r.status, headers: r.headers, body: redirect === "follow" ? await r.text() : "" };
  };

  // 1. Representative pages have exactly one self-canonical URL on www with no slash/query.
  for (const p of CANONICAL_PATHS) {
    const r = await get(p);
    if (r.status !== 200) { errs.push(`canonical: ${p} status ${r.status}`); continue; }
    checkCanonical(errs, p, r.body);
  }

  // 2. Admin: noindex header AND never shared-cached
  {
    const r = await fetch(`${base}/admin`, { redirect: "manual" });
    const xr = r.headers.get("x-robots-tag") || "";
    if (!/noindex/i.test(xr)) errs.push(`admin: X-Robots-Tag missing noindex (got "${xr}")`);
    const cc = r.headers.get("cache-control") || "";
    if (/s-maxage/i.test(cc)) errs.push(`admin: must not be shared-cached (got "${cc}")`);
  }

  // 2b. Public HTML participates in the shared-cache pilot. On a standalone
  // origin this shows as an s-maxage directive; on Vercel the CDN consumes
  // s-maxage and rewrites the downstream Cache-Control, exposing the cache via
  // x-vercel-cache / cdn-cache-control instead. Accept either signal.
  {
    const r = await fetch(`${base}/en`, { redirect: "manual" });
    const cc = r.headers.get("cache-control") || "";
    const cdnCc = r.headers.get("cdn-cache-control") || r.headers.get("vercel-cdn-cache-control") || "";
    const vercelCache = r.headers.get("x-vercel-cache") || "";
    const shared = /s-maxage=\d+/.test(cc) || /s-maxage=\d+/.test(cdnCc) || vercelCache !== "";
    if (!shared) errs.push(`cache: /en not participating in shared-cache pilot (cache-control "${cc}", x-vercel-cache "${vercelCache}")`);
  }

  // 2c. Admin must never be shared-cached (no CDN HIT)
  {
    const r = await fetch(`${base}/admin`, { redirect: "manual" });
    const vercelCache = (r.headers.get("x-vercel-cache") || "").toUpperCase();
    if (["HIT", "STALE"].includes(vercelCache)) errs.push(`admin: unexpectedly shared-cached (x-vercel-cache "${vercelCache}")`);
  }

  // 3. Trailing slash collapses to the no-slash canonical in a single 301 hop
  {
    const r = await fetch(`${base}/en/products/`, { redirect: "manual" });
    if (r.status !== 301) errs.push(`slash: /en/products/ expected 301, got ${r.status}`);
    const loc = r.headers.get("location") || "";
    if (!/\/en\/products(?:$|[?#])/.test(loc)) errs.push(`slash: /en/products/ -> ${loc}`);
  }

  // 3b. Obsolete search parameters are removed without breaking real filters,
  // form prefills or campaign attribution.
  {
    const obsolete = await fetch(`${base}/en?s=%7Bsearch_term_string%7D&utm_source=gsc`, { redirect: "manual" });
    const obsoleteLocation = new URL(obsolete.headers.get("location") || "/", base);
    if (obsolete.status !== 301) errs.push(`query: obsolete search parameter expected 301, got ${obsolete.status}`);
    if (obsoleteLocation.pathname !== "/en" || obsoleteLocation.searchParams.has("s") || obsoleteLocation.searchParams.get("utm_source") !== "gsc") {
      errs.push(`query: obsolete cleanup produced ${obsoleteLocation.pathname}${obsoleteLocation.search}`);
    }

    const rootSearch = await fetch(`${base}/?s=legacy`, { redirect: "manual" });
    const rootLocation = new URL(rootSearch.headers.get("location") || "/", base);
    if (rootSearch.status !== 302 || rootLocation.pathname !== "/en" || rootLocation.search) {
      errs.push(`query: root search cleanup expected 302 /en, got ${rootSearch.status} ${rootLocation.pathname}${rootLocation.search}`);
    }

    for (const pathName of [
      "/en/contact?product=willowpre&type=question",
      "/en/products?category=industrial",
      "/en/products?utm_source=seo&gclid=test",
    ]) {
      const response = await fetch(`${base}${pathName}`, { redirect: "manual" });
      if (response.status !== 200) errs.push(`query: ${pathName} expected 200 with parameters preserved, got ${response.status}`);
    }

    const localeCase = await fetch(`${base}/EN/products/`, { redirect: "manual" });
    const localeCaseLocation = new URL(localeCase.headers.get("location") || "/", base);
    if (localeCase.status !== 301 || localeCaseLocation.pathname !== "/en/products") {
      errs.push(`locale-case: expected single 301 to /en/products, got ${localeCase.status} ${localeCaseLocation.pathname}`);
    }

    const categoryCase = await fetch(`${base}/en/products/category/Industrial`, { redirect: "manual" });
    const categoryCaseLocation = new URL(categoryCase.headers.get("location") || "/", base);
    if (categoryCase.status !== 301 || categoryCaseLocation.pathname !== "/en/products/category/industrial") {
      errs.push(`category-case: expected 301 to lowercase category, got ${categoryCase.status} ${categoryCaseLocation.pathname}`);
    }

    const productAlias = await fetch(`${base}/de/products/lorawan-neigungssensor`, { redirect: "manual" });
    const productAliasLocation = new URL(productAlias.headers.get("location") || "/", base);
    if (productAlias.status !== 301 || productAliasLocation.pathname !== "/de/products/willowtilt") {
      errs.push(`product-alias: expected 301 to /de/products/willowtilt, got ${productAlias.status} ${productAliasLocation.pathname}`);
    }

    const malformed = await fetch(`${base}/en/%`, { redirect: "manual" });
    if (malformed.status >= 500) {
      const body = await malformed.text();
      // Astro's development-only trailing-slash middleware decodes the path
      // before project middleware runs. Production/preview must still reject or
      // handle the malformed URL without an application 500.
      if (!/vite-plugin-astro-server\/trailing-slash|devTrailingSlash/i.test(body)) {
        errs.push(`malformed-path: /en/% returned ${malformed.status}`);
      }
    }
  }

  // 4. Sitemap: unique, queryless canonical locs on www; representative entries
  // resolve to pages whose canonical tag exactly matches the sitemap URL.
  {
    const r = await get("/sitemap.xml");
    if (r.status !== 200) errs.push(`sitemap: status ${r.status}`);
    const locs = [...r.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeXmlText(m[1].trim()));
    if (!locs.length) errs.push("sitemap: no <loc> entries found");
    const uniqueLocs = new Set(locs);
    if (uniqueLocs.size !== locs.length) {
      const seen = new Set();
      const duplicate = locs.find((loc) => seen.has(loc) || !seen.add(loc));
      errs.push(`sitemap: ${locs.length - uniqueLocs.size} duplicate <loc> entries (e.g. ${duplicate})`);
    }

    for (const loc of uniqueLocs) {
      let parsed;
      try {
        parsed = new URL(loc);
      } catch {
        errs.push(`sitemap: invalid <loc> URL ${loc}`);
        continue;
      }
      if (parsed.origin !== CANONICAL_HOST) errs.push(`sitemap: non-www <loc> ${loc}`);
      if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) errs.push(`sitemap: trailing-slash <loc> ${loc}`);
      if (parsed.search || parsed.hash) errs.push(`sitemap: query/hash must not appear in <loc> ${loc}`);
    }

    const privacy = locs.filter((l) => /\/privacy$/.test(l));
    if (privacy.length !== 8) errs.push(`sitemap: expected 8 privacy URLs, found ${privacy.length}`);

    for (const pathName of CANONICAL_PATHS.filter((pathName) => pathName.includes("lorawan-sensors") || pathName.includes("products"))) {
      const expected = `${CANONICAL_HOST}${pathName}`;
      if (!uniqueLocs.has(expected)) {
        errs.push(`sitemap: missing representative canonical URL ${expected}`);
        continue;
      }
      const page = await get(pathName);
      if (page.status !== 200) {
        errs.push(`sitemap: ${expected} returned ${page.status}`);
        continue;
      }
      checkCanonical(errs, `sitemap ${pathName}`, page.body, expected);
    }
  }

  // 5. hreflang reciprocity: /en/products <-> /tr/products
  {
    const en = await get("/en/products");
    const enAlts = alternateLinks(en.body);
    if (!enAlts.some((a) => a.hreflang === "tr")) errs.push("hreflang: /en/products missing tr alternate");
    const tr = await get("/tr/products");
    const trAlts = alternateLinks(tr.body);
    if (!trAlts.some((a) => a.hreflang === "en")) errs.push("hreflang: /tr/products missing reciprocal en alternate");
  }

  // 5b. Critical landing/product clusters expose all supported locales plus
  // x-default, and every alternate links back to the source page.
  {
    const supported = ["en", "tr", "de", "fr", "es", "it", "ar", "ja"];
    for (const sourcePath of ["/en/lorawan-sensors", "/de/products/willowpre"]) {
      const source = await get(sourcePath);
      const sourceAlternates = alternateLinks(source.body);
      const byLanguage = new Map(sourceAlternates.map((alternate) => [alternate.hreflang, alternate.href]));
      for (const language of [...supported, "x-default"]) {
        if (!byLanguage.has(language)) errs.push(`hreflang: ${sourcePath} missing ${language}`);
      }
      for (const language of supported) {
        const href = byLanguage.get(language);
        if (!href) continue;
        const targetUrl = new URL(href);
        const target = await get(`${targetUrl.pathname}${targetUrl.search}`);
        if (target.status !== 200) {
          errs.push(`hreflang: ${sourcePath} alternate ${language} returned ${target.status}`);
          continue;
        }
        const reverse = alternateLinks(target.body).some((alternate) => alternate.href === `${CANONICAL_HOST}${sourcePath}`);
        if (!reverse) errs.push(`hreflang: ${targetUrl.pathname} does not link back to ${sourcePath}`);
      }
    }
  }

  // 5c. Search-intent copy stays on the intended URL and remains readable in
  // the two priority languages identified by Search Console.
  {
    const checks = [
      { path: "/en/lorawan-sensors", title: /Industrial LoRaWAN Sensors and IoT Devices/i, h1: /Industrial LoRaWAN Sensors for Remote Monitoring/i, description: /level, pressure, air quality/i },
      { path: "/de/lorawan-sensors", title: /Industrielle LoRaWAN-Sensoren und IoT-Geräte/i, h1: /Industrielle LoRaWAN-Sensoren für Fernüberwachung/i, description: /Füllstand, Druck, Luftqualität/i },
      { path: "/de/products/willowpre", title: /WillowPre.*IP67.*LoRaWAN.*Drucksensor/i, h1: /WillowPre.*IP67.*LoRaWAN.*Drucksensor/i, description: /Flüssigkeitsdruck.*Rohrleitungen.*Tanks/i },
      { path: "/en/products", title: /IoT Products/i, h1: /WillowSoft IoT hardware catalog/i, description: /WillowSoft IoT product/i },
    ];
    for (const check of checks) {
      const response = await get(check.path);
      const titleText = tagText(response.body, "title");
      const h1Matches = [...response.body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
      const h1Text = h1Matches.length ? h1Matches[0][1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
      const descriptionText = metaContent(response.body, "description");
      if (h1Matches.length !== 1) errs.push(`content: ${check.path} expected one H1, found ${h1Matches.length}`);
      if (!check.title.test(titleText)) errs.push(`content: ${check.path} unexpected title "${titleText}"`);
      if (!check.h1.test(h1Text)) errs.push(`content: ${check.path} unexpected H1 "${h1Text}"`);
      if (!check.description.test(descriptionText)) errs.push(`content: ${check.path} unexpected description "${descriptionText}"`);
    }
    const pillar = await get("/en/lorawan-sensors");
    if (!/<table\b/i.test(pillar.body) || !/WillowPre/i.test(pillar.body) || !/WillowSonic/i.test(pillar.body)) {
      errs.push("content: /en/lorawan-sensors comparison table is missing WillowPre or WillowSonic");
    }
    const germanWillowPre = await get("/de/products/willowpre");
    for (const englishFragment of [
      "up to 15 km",
      "up to 10 years",
      ">10 years<",
      "IP67-rated",
      "Galvanized",
      "Low power design",
      "Pipeline Pressure Monitoring",
      "Chemical Processing Plants",
      "Wastewater Level Monitoring",
    ]) {
      if (germanWillowPre.body.includes(englishFragment)) {
        errs.push(`content: /de/products/willowpre still contains English fragment "${englishFragment}"`);
      }
    }
    for (const germanFragment of ["bis zu 15 km", "bis zu 10 Jahre", "Verzinkt", "Drucküberwachung in Rohrleitungen", "Wasserverteilungsnetze"]) {
      if (!germanWillowPre.body.includes(germanFragment)) {
        errs.push(`content: /de/products/willowpre missing localized fragment "${germanFragment}"`);
      }
    }
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

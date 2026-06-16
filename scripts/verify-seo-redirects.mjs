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
const staticSections = new Set(["", "solutions", "services", "products", "company", "news", "glossary", "contact", "start-project"]);

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

  if (httpErrors.length) {
    console.error("\nHTTP validation FAILED:");
    for (const e of httpErrors) console.error("  -", e);
    process.exit(1);
  }
  console.log("HTTP validation: OK");
}

process.exit(errors.length ? 1 : 0);

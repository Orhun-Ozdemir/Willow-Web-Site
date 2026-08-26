#!/usr/bin/env node
/**
 * Applies the narrow SEO/content migration introduced by the SEO foundation
 * work without replacing unrelated CMS fields.
 *
 * Dry run:
 *   node --env-file=.env scripts/sync-seo-foundation.mjs
 * Apply:
 *   node --env-file=.env scripts/sync-seo-foundation.mjs --apply
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDataPath = path.join(__dirname, "..", "data", "site-data.json");
const apply = process.argv.includes("--apply");
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const site = JSON.parse(fs.readFileSync(siteDataPath, "utf8"));
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const targetProductIds = ["willowpre", "willowsonic"];

const stableJson = (value) => JSON.stringify(value, (_key, current) => {
  if (!current || typeof current !== "object" || Array.isArray(current)) return current;
  return Object.fromEntries(Object.entries(current).sort(([left], [right]) => left.localeCompare(right)));
});

const normalizeCanonical = (value) => {
  if (!value) return value;
  let parsed;
  try {
    parsed = new URL(value, "https://www.willowsoft.co");
  } catch {
    return value;
  }
  if (!/(^|\.)willowsoft\.co$/i.test(parsed.hostname)) return value;
  parsed.protocol = "https:";
  parsed.host = "www.willowsoft.co";
  parsed.search = "";
  parsed.hash = "";
  if (parsed.pathname.length > 1) parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  return parsed.toString();
};

const { data: pageContentRow, error: pageContentError } = await supabase
  .from("page_content")
  .select("page, data")
  .eq("page", "products")
  .single();
if (pageContentError) throw new Error(`page_content/products read failed: ${pageContentError.message}`);

const desiredHeroTitle = site.pageContent?.products?.heroTitle;
const nextProductsPage = {
  ...(pageContentRow?.data || {}),
  heroTitle: desiredHeroTitle,
};
const productsPageChanged = stableJson(pageContentRow?.data?.heroTitle || null) !== stableJson(desiredHeroTitle || null);

const { data: productRows, error: productsError } = await supabase
  .from("products")
  .select("id, data, localized")
  .in("id", targetProductIds);
if (productsError) throw new Error(`products read failed: ${productsError.message}`);

const localProducts = new Map((site.products || []).map((product) => [product.id, product]));
const productUpdates = (productRows || []).map((row) => {
  const local = localProducts.get(row.id);
  const localized = { ...(row.localized || {}) };
  let localizedChanged = false;
  for (const [locale, localCopy] of Object.entries(local?.localized || {})) {
    const currentCopy = localized[locale] || {};
    const nextCopy = {
      ...currentCopy,
      title: localCopy.title,
      type: localCopy.type || currentCopy.type,
      ...(row.id === "willowpre" && locale === "tr" ? { applications: localCopy.applications } : {}),
    };
    if (stableJson(currentCopy) !== stableJson(nextCopy)) localizedChanged = true;
    localized[locale] = nextCopy;
  }
  const data = row.id === "willowpre"
    ? { ...(row.data || {}), applications: local?.applications || row.data?.applications }
    : row.data;
  const dataChanged = stableJson(row.data || {}) !== stableJson(data || {});
  return { id: row.id, data, localized, changed: localizedChanged || dataChanged };
});

const { data: pageSeoRows, error: pageSeoError } = await supabase
  .from("page_seo")
  .select("page, data");
if (pageSeoError) throw new Error(`page_seo read failed: ${pageSeoError.message}`);

const pageSeoUpdates = (pageSeoRows || []).map((row) => {
  const nextData = structuredClone(row.data || {});
  let changed = false;
  for (const seo of Object.values(nextData)) {
    if (!seo || typeof seo !== "object" || !seo.canonical) continue;
    const normalized = normalizeCanonical(seo.canonical);
    if (normalized !== seo.canonical) {
      seo.canonical = normalized;
      changed = true;
    }
  }
  return { page: row.page, data: nextData, changed };
});

const changedProducts = productUpdates.filter((row) => row.changed);
const changedSeoPages = pageSeoUpdates.filter((row) => row.changed);
console.log(`page_content/products heroTitle: ${productsPageChanged ? "change" : "already current"}`);
console.log(`product localization rows: ${changedProducts.length}/${targetProductIds.length} change`);
console.log(`page_seo canonical rows: ${changedSeoPages.length}/${pageSeoUpdates.length} change`);

if (!apply) {
  console.log("Dry run only. Re-run with --apply to write these targeted fields.");
  process.exit(0);
}

if (productsPageChanged) {
  const { error } = await supabase.from("page_content").update({ data: nextProductsPage }).eq("page", "products");
  if (error) throw new Error(`page_content/products update failed: ${error.message}`);
}

for (const row of changedProducts) {
  const { error } = await supabase.from("products").update({ data: row.data, localized: row.localized }).eq("id", row.id);
  if (error) throw new Error(`products/${row.id} update failed: ${error.message}`);
}

for (const row of changedSeoPages) {
  const { error } = await supabase.from("page_seo").update({ data: row.data }).eq("page", row.page);
  if (error) throw new Error(`page_seo/${row.page} update failed: ${error.message}`);
}

console.log("Supabase SEO foundation migration applied successfully.");

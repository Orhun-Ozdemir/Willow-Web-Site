#!/usr/bin/env node
/**
 * Mirror Supabase products.localized.tr into data/site-data.json fallback.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/sync-product-localized-tr.mjs
 *   # or: node --env-file=.env scripts/sync-product-localized-tr.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDataPath = path.join(__dirname, "..", "data", "site-data.json");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY).");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const site = JSON.parse(fs.readFileSync(siteDataPath, "utf8"));

const { data: rows, error } = await supabase
  .from("products")
  .select("id, localized")
  .order("sort_order");

if (error) {
  console.error("Supabase query failed:", error.message);
  process.exit(1);
}

const byId = new Map((rows || []).map((r) => [r.id, r.localized?.tr || {}]));
let updated = 0;

for (const product of site.products || []) {
  const tr = byId.get(product.id);
  if (!tr || Object.keys(tr).length === 0) {
    console.warn(`  skip ${product.id}: no tr localized in Supabase`);
    continue;
  }
  product.localized = { ...(product.localized || {}), tr };
  updated++;
}

site.meta = { ...(site.meta || {}), updatedAt: new Date().toISOString() };
fs.writeFileSync(siteDataPath, JSON.stringify(site, null, 2) + "\n", "utf8");
console.log(`Synced localized.tr for ${updated}/${site.products?.length ?? 0} products -> ${siteDataPath}`);

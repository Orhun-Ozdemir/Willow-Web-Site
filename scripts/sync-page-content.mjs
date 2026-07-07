#!/usr/bin/env node
/**
 * Sync page_content rows from data/site-data.json to Supabase.
 *
 * Usage:
 *   node --env-file=.env scripts/sync-page-content.mjs home
 *   node --env-file=.env scripts/sync-page-content.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, "..", "data", "site-data.json");

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const filterPages = process.argv.slice(2);
const site = JSON.parse(fs.readFileSync(dataFile, "utf8"));
const pageContent = site.pageContent || {};

const pages = filterPages.length
  ? filterPages.filter((p) => pageContent[p])
  : Object.keys(pageContent);

if (!pages.length) {
  console.error("No matching pages in site-data.json:", filterPages.join(", ") || "(none)");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const rows = pages.map((page) => ({ page, data: pageContent[page] }));

const { error } = await supabase.from("page_content").upsert(rows, { onConflict: "page" });
if (error) {
  console.error("Upsert failed:", error.message);
  process.exit(1);
}

console.log(`Synced page_content for: ${pages.join(", ")}`);

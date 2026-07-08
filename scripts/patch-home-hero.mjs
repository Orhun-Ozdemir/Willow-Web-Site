#!/usr/bin/env node
/**
 * Merge home hero fields from site-data.json into live Supabase page_content.home.
 * Does NOT overwrite other page_content keys or other pages.
 *
 * Usage:
 *   node --env-file=.env scripts/patch-home-hero.mjs --force
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, "..", "data", "site-data.json");

if (!process.argv.includes("--force")) {
  console.error(
    "Refusing to patch: merges site-data.json hero fields into live Supabase page_content.home.\n" +
      "Re-run with --force only after confirming seed values match approved CMS content."
  );
  process.exit(1);
}

const HERO_KEYS = ["heroEyebrow", "heroTitle", "heroLead", "heroCta", "heroCtaSecondary"];

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const siteData = JSON.parse(fs.readFileSync(dataFile, "utf8"));
const heroPatch = {};
for (const key of HERO_KEYS) {
  if (siteData.pageContent?.home?.[key]) heroPatch[key] = siteData.pageContent.home[key];
}

const supabase = createClient(url, serviceKey);
const { data: row, error: fetchError } = await supabase
  .from("page_content")
  .select("data")
  .eq("page", "home")
  .maybeSingle();

if (fetchError) {
  console.error("Fetch failed:", fetchError.message);
  process.exit(1);
}

const merged = { ...(row?.data || {}), ...heroPatch };
const { error: upsertError } = await supabase.from("page_content").upsert({ page: "home", data: merged });
if (upsertError) {
  console.error("Upsert failed:", upsertError.message);
  process.exit(1);
}

console.log("Patched page_content.home hero fields:", HERO_KEYS.join(", "));
console.log("TR heroTitle:", merged.heroTitle?.tr?.slice(0, 60) + "...");
console.log("TR heroCta:", merged.heroCta?.tr);
console.log("TR heroCtaSecondary:", merged.heroCtaSecondary?.tr);

#!/usr/bin/env node
/**
 * Seed /services page list arrays + missing section labels into Supabase page_content.services.
 * Preserves existing hero/process/stack fields; only fills empty arrays and missing text keys.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-services-page-lists.mjs --force
 */
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

if (!process.argv.includes("--force")) {
  console.error(
    "Refusing to seed: writes template list data into live Supabase page_content.services.\n" +
      "Re-run with --force only after confirming template content matches approved live copy."
  );
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

function loadSeedPayload() {
  const exportScript = path.join(__dirname, "_services-page-seed-export.ts");
  const out = execFileSync("npx", ["tsx", exportScript], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  return JSON.parse(out.trim());
}

function hasLocaleText(value) {
  if (!value || typeof value !== "object") return false;
  return Object.values(value).some((text) => typeof text === "string" && text.trim());
}

function mergeMissingSectionText(existing, sectionText) {
  const merged = { ...existing };
  const added = [];
  for (const [key, locales] of Object.entries(sectionText)) {
    if (!hasLocaleText(merged[key])) {
      merged[key] = locales;
      added.push(key);
    }
  }
  return { merged, added };
}

function mergeArrayIfEmpty(existing, seed, key) {
  if (Array.isArray(existing) && existing.length > 0) {
    return { value: existing, filled: false };
  }
  return { value: seed, filled: true, key };
}

const seed = loadSeedPayload();
const supabase = createClient(url, serviceKey);

const { data: row, error: fetchError } = await supabase
  .from("page_content")
  .select("data")
  .eq("page", "services")
  .maybeSingle();

if (fetchError) {
  console.error("Fetch failed:", fetchError.message);
  process.exit(1);
}

const existing = row?.data || {};
const layers = mergeArrayIfEmpty(existing.serviceLayers, seed.serviceLayers, "serviceLayers");
const deliverables = mergeArrayIfEmpty(existing.deliverables, seed.deliverables, "deliverables");
const processSteps = mergeArrayIfEmpty(existing.processSteps, seed.processSteps, "processSteps");
const { merged: withSectionText, added: addedSectionKeys } = mergeMissingSectionText(existing, seed.sectionText);

const merged = {
  ...withSectionText,
  serviceLayers: layers.value,
  deliverables: deliverables.value,
  processSteps: processSteps.value,
};

const filledArrays = [layers, deliverables, processSteps].filter((x) => x.filled).map((x) => x.key);

if (filledArrays.length === 0 && addedSectionKeys.length === 0) {
  console.log("Nothing to seed — page_content.services already has list data and section labels.");
  process.exit(0);
}

const { error: upsertError } = await supabase.from("page_content").upsert({ page: "services", data: merged });
if (upsertError) {
  console.error("Upsert failed:", upsertError.message);
  process.exit(1);
}

console.log("Seeded page_content.services:");
if (filledArrays.length) {
  console.log("  Arrays:", filledArrays.join(", "));
  console.log("  serviceLayers:", merged.serviceLayers.length);
  console.log("  deliverables:", merged.deliverables.length);
  console.log("  processSteps:", merged.processSteps.length);
}
if (addedSectionKeys.length) {
  console.log("  Section labels added:", addedSectionKeys.join(", "));
}
console.log("  Preserved existing keys:", Object.keys(existing).filter((k) => !filledArrays.includes(k) && !addedSectionKeys.includes(k)).join(", ") || "(none before)");

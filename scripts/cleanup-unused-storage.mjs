#!/usr/bin/env node
/**
 * Remove Supabase Storage files not referenced by live CMS data.
 * Read-only audit first; deletes with --force only.
 *
 *   node --env-file=.env scripts/cleanup-unused-storage.mjs          # dry-run
 *   node --env-file=.env scripts/cleanup-unused-storage.mjs --force  # delete
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listAllStorageFiles, STORAGE_BUCKET } from "../lib/storage-backup.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const force = process.argv.includes("--force");
const dryRun = !force;

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const CMS_TABLES = [
  "page_content",
  "page_seo",
  "company_facts",
  "products",
  "news",
  "articles",
  "solutions",
  "services",
  "clients",
  "platforms",
  "faqs",
  "glossary",
  "site_meta",
  "admin_snapshots",
];

/** Hard-coded live template paths (served via public/ or CMS fallbacks). */
const TEMPLATE_KEEP = [
  "pdf-assets/p06_01_X13.jpg",
  "pdf-assets/p08_01_X22.jpg",
  "pdf-assets/p14_01_X50.jpg",
  "pdf-assets/p29_06_X111.jpg",
  "assets/hero-industrial-iot.png",
  "assets/hero-industrial-iot.jpg",
  "assets/favicon.svg",
  "assets/willow-mark-transparent.png",
];

function pathVariants(raw) {
  if (!raw || typeof raw !== "string") return [];
  let s = raw.trim();
  if (!s) return [];
  s = s.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/assets\//, "");
  s = s.replace(/^https?:\/\/[^/]+\/assets\//, "");
  if (s.startsWith("/")) s = s.slice(1);

  const out = new Set([s]);
  if (s.startsWith("assets/")) out.add(s.slice("assets/".length));
  else out.add(`assets/${s}`);
  return [...out];
}

function collectRefs(val, refs) {
  if (val == null) return;
  if (typeof val === "string") {
    if (
      val.includes("/") ||
      val.includes(".png") ||
      val.includes(".jpg") ||
      val.includes(".jpeg") ||
      val.includes(".webp") ||
      val.includes(".pdf") ||
      val.includes(".svg")
    ) {
      for (const v of pathVariants(val)) refs.add(v);
    }
    return;
  }
  if (Array.isArray(val)) {
    for (const item of val) collectRefs(item, refs);
    return;
  }
  if (typeof val === "object") {
    for (const v of Object.values(val)) collectRefs(v, refs);
  }
}

function isKept(storagePath, refs) {
  for (const v of pathVariants(storagePath)) {
    if (refs.has(v)) return true;
  }
  return false;
}

/** QA / dev screenshots — never needed on production. */
function isNeverUseCandidate(storagePath) {
  return /(?:20260606|preview|current-site|current-preview|current-homepage|final-|dynamic-|homepage-depth|admin-login|company_desktop|screenshot)/i.test(
    storagePath,
  );
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const refs = new Set();
for (const p of TEMPLATE_KEEP) {
  for (const v of pathVariants(p)) refs.add(v);
}

for (const table of CMS_TABLES) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.warn(`Skip ${table}: ${error.message}`);
    continue;
  }
  collectRefs(data, refs);
}

const files = await listAllStorageFiles(supabase);
const keep = [];
const remove = [];

for (const file of files) {
  if (isKept(file.path, refs)) keep.push(file);
  else remove.push(file);
}

const reportDir = path.join(__dirname, "..", "backups", ".pre-storage-cleanup");
fs.mkdirSync(reportDir, { recursive: true });
const reportPath = path.join(reportDir, `storage-cleanup-${Date.now()}.json`);
fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      dryRun,
      total: files.length,
      keep: keep.length,
      remove: remove.length,
      keepPaths: keep.map((f) => f.path).sort(),
      removePaths: remove.map((f) => f.path).sort(),
      removeNeverUse: remove.filter((f) => isNeverUseCandidate(f.path)).length,
    },
    null,
    2,
  ),
);

console.log(`Report: ${reportPath}`);
console.log(`Total: ${files.length} | Keep: ${keep.length} | Remove: ${remove.length}`);
console.log(`  QA/dev never-use in remove set: ${remove.filter((f) => isNeverUseCandidate(f.path)).length}`);

if (dryRun) {
  console.log("\nDry-run only. Re-run with --force to delete.");
  console.log("Sample remove:", remove.slice(0, 10).map((f) => f.path).join("\n  "));
  process.exit(0);
}

console.log("\nDeleting in batches…");
const BATCH = 100;
let deleted = 0;
for (let i = 0; i < remove.length; i += BATCH) {
  const batch = remove.slice(i, i + BATCH).map((f) => f.path);
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(batch);
  if (error) {
    console.error(`Delete batch failed at ${i}:`, error.message);
    process.exit(1);
  }
  deleted += batch.length;
  process.stdout.write(`\r  ${deleted}/${remove.length}`);
}
console.log("\nDone.");

const after = await listAllStorageFiles(supabase);
console.log(`Storage objects after cleanup: ${after.length}`);

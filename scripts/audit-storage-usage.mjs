#!/usr/bin/env node
/**
 * Compare Supabase Storage assets vs CMS/DB references.
 * Read-only audit.
 */
import { createClient } from "@supabase/supabase-js";
import { listAllStorageFiles } from "../lib/storage-backup.mjs";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

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

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|avif|ico)(\?|$)/i;

function normalizeRef(raw) {
  if (!raw || typeof raw !== "string") return [];
  const out = new Set();
  let s = raw.trim();
  if (!s) return [];

  // Strip Supabase public URL prefix
  s = s.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/assets\//, "");
  s = s.replace(/^assets\//, "");
  if (s.startsWith("/")) s = s.slice(1);

  out.add(s);
  if (s.startsWith("assets/")) out.add(s.slice("assets/".length));
  if (s.startsWith("assets/team/")) out.add(s.replace("assets/", ""));

  // basename fallback for partial refs
  const base = s.split("/").pop();
  if (base) out.add(base);

  return [...out];
}

function collectRefsFromValue(val, refs) {
  if (val == null) return;
  if (typeof val === "string") {
    if (
      val.includes("/") ||
      IMAGE_EXT.test(val) ||
      val.startsWith("uploads/") ||
      val.startsWith("team/") ||
      val.startsWith("news/") ||
      val.startsWith("pdf-assets/") ||
      val.startsWith("images/") ||
      val.startsWith("datasheets/")
    ) {
      for (const r of normalizeRef(val)) refs.add(r);
    }
    return;
  }
  if (Array.isArray(val)) {
    for (const item of val) collectRefsFromValue(item, refs);
    return;
  }
  if (typeof val === "object") {
    for (const v of Object.values(val)) collectRefsFromValue(v, refs);
  }
}

function matchesStoragePath(storagePath, refs) {
  if (refs.has(storagePath)) return true;
  const base = storagePath.split("/").pop();
  if (base && refs.has(base)) return true;
  // legacy assets/ prefix in CMS
  if (refs.has(`assets/${storagePath}`)) return true;
  return false;
}

const files = await listAllStorageFiles(supabase);
const imageFiles = files.filter((f) => IMAGE_EXT.test(f.path));
const refs = new Set();

for (const table of CMS_TABLES) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.warn(`Skip ${table}: ${error.message}`);
    continue;
  }
  collectRefsFromValue(data, refs);
}

const used = [];
const unused = [];

for (const file of imageFiles) {
  if (matchesStoragePath(file.path, refs)) used.push(file);
  else unused.push(file);
}

const byFolder = (list) => {
  const map = {};
  for (const f of list) {
    const folder = f.path.split("/")[0] || "(root)";
    map[folder] = (map[folder] || 0) + 1;
  }
  return map;
};

const fmtMap = (map) =>
  Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n");

console.log(JSON.stringify({
  storageTotal: files.length,
  imageFiles: imageFiles.length,
  referencedInCms: used.length,
  notReferencedInCms: unused.length,
  cmsRefStrings: refs.size,
  byFolderAll: byFolder(imageFiles),
  byFolderUsed: byFolder(used),
  byFolderUnused: byFolder(unused),
  sampleUsed: used.slice(0, 15).map((f) => f.path),
  sampleUnused: unused.slice(0, 25).map((f) => f.path),
}, null, 2));

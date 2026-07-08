#!/usr/bin/env node
/**
 * Tam site yedeği: DB (localized dahil) + Storage → ZIP
 *
 *   node --env-file=.env scripts/backup-full.mjs
 *   node --env-file=.env scripts/backup-full.mjs --scope content
 *   node --env-file=.env scripts/backup-full.mjs --out backups/custom.zip
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exportFullBackup } from "../lib/full-backup.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const scope = args.includes("--scope") && args[args.indexOf("--scope") + 1] === "content" ? "content" : "full";
const noStorage = args.includes("--no-storage");
const outIdx = args.indexOf("--out");
const outArg = outIdx >= 0 ? args[outIdx + 1] : null;

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const defaultOut = path.join(__dirname, "..", "backups", `willowsoft-full-${scope}-${ts}.zip`);
const outPath = outArg ? path.resolve(outArg) : defaultOut;

fs.mkdirSync(path.dirname(outPath), { recursive: true });

const { manifest, zip } = await exportFullBackup(supabase, scope, {
  includeStorage: !noStorage,
  onProgress: (p) => {
    if (p.phase === "storage-download" && p.current && p.total) {
      process.stdout.write(`\rStorage: ${p.current}/${p.total} ${p.path?.slice(0, 50) || ""}          `);
    }
  },
});

if (!noStorage) process.stdout.write("\n");

fs.writeFileSync(outPath, zip);
console.log(`Tam yedek: ${outPath}`);
console.log(`  DB tabloları: ${Object.keys(manifest.stats).filter((k) => k !== "storageFiles" && k !== "storageBytes").length}`);
console.log(`  Storage dosyaları: ${manifest.stats.storageFiles || 0}`);
console.log(`  Storage boyutu: ${((manifest.stats.storageBytes || 0) / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Localizations: dahil (tables.*.localized)`);

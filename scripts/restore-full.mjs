#!/usr/bin/env node
/**
 * Tam ZIP yedekten geri yükleme — DB + Storage, duplicate/fazlalık yok.
 *
 *   node --env-file=.env scripts/restore-full.mjs backups/willowsoft-full-....zip --force
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exportFullBackup, restoreFullBackup } from "../lib/full-backup.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const force = args.includes("--force");
const fileArg = args.find((a) => !a.startsWith("--") && (a.endsWith(".zip") || a.endsWith(".json")));

if (!fileArg) {
  console.error("Kullanım: node scripts/restore-full.mjs <yedek.zip> --force");
  process.exit(1);
}

if (!force) {
  console.error(
    "Refusing to restore: canlı DB + Storage yedekle birebir eşitlenir; yedekte olmayan kayıtlar silinir.\n" +
      "Bilinçli geri yükleme için --force ekleyin."
  );
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  process.exit(1);
}

const filePath = path.resolve(fileArg);
if (!fs.existsSync(filePath)) {
  console.error(`Dosya bulunamadı: ${filePath}`);
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const scope = "full";
const safetyDir = path.join(__dirname, "..", "backups", ".pre-restore");
fs.mkdirSync(safetyDir, { recursive: true });
const safetyTs = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const safetyPath = path.join(safetyDir, `pre-restore-full-${safetyTs}.zip`);

console.log("Güvenlik yedeği alınıyor…");
const { zip: safetyZip } = await exportFullBackup(supabase, scope);
fs.writeFileSync(safetyPath, safetyZip);
console.log(`Güvenlik yedeği: ${safetyPath}`);

const zipBytes = new Uint8Array(fs.readFileSync(filePath));
console.log("Geri yükleniyor…");

const result = await restoreFullBackup(supabase, zipBytes, {
  onProgress: (p) => {
    if (p.current && p.total) {
      process.stdout.write(`\r${p.phase}: ${p.current}/${p.total}                    `);
    }
  },
});

process.stdout.write("\n");
console.log("DB:");
for (const [table, stats] of Object.entries(result.database.tables)) {
  console.log(`  ${table}: ${stats.upserted} upsert, ${stats.deleted} silindi`);
}
if (result.storage) {
  console.log(`Storage: ${result.storage.uploaded} yüklendi, ${result.storage.deleted} fazla dosya silindi`);
}

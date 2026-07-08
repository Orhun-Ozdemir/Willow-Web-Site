#!/usr/bin/env node
/**
 * Supabase yedekten geri yükleme.
 * Upsert + yedekte olmayan satırları siler — duplicate oluşmaz.
 *
 *   node --env-file=.env scripts/restore-db.mjs backups/willowsoft-db-full-....json --force
 *   node --env-file=.env scripts/restore-db.mjs backup.json --force --scope content
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exportBackup, restoreBackup, validateBackup } from "../lib/db-backup.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const force = args.includes("--force");
const scopeArg = args.includes("--scope") ? args[args.indexOf("--scope") + 1] : null;
const fileArg = args.find((a) => !a.startsWith("--") && a.endsWith(".json"));

if (!fileArg) {
  console.error("Kullanım: node scripts/restore-db.mjs <yedek.json> --force [--scope content|full]");
  process.exit(1);
}

if (!force) {
  console.error(
    "Refusing to restore: bu işlem canlı Supabase tablolarını yedekle eşitler ve yedekte olmayan satırları siler.\n" +
      "Yalnızca bilinçli geri yükleme için --force ekleyin."
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

const backup = JSON.parse(fs.readFileSync(filePath, "utf8"));
const validation = validateBackup(backup);
if (!validation.ok) {
  console.error("Geçersiz yedek:", validation.error);
  process.exit(1);
}

const scope = scopeArg === "content" || scopeArg === "full" ? scopeArg : validation.scope || "full";

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

// Önce güvenlik yedeği
const safetyDir = path.join(__dirname, "..", "backups", ".pre-restore");
fs.mkdirSync(safetyDir, { recursive: true });
const safetyTs = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const safetyPath = path.join(safetyDir, `pre-restore-${scope}-${safetyTs}.json`);
const safetyBackup = await exportBackup(supabase, scope);
fs.writeFileSync(safetyPath, JSON.stringify(safetyBackup, null, 2) + "\n", "utf8");
console.log(`Güvenlik yedeği: ${safetyPath}`);

console.log(`Geri yükleniyor (${scope})...`);
const result = await restoreBackup(supabase, backup, { scope });

console.log("Tamamlandı:");
for (const [table, stats] of Object.entries(result.tables)) {
  console.log(`  ${table}: ${stats.upserted} upsert, ${stats.deleted} silindi`);
}

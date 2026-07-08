#!/usr/bin/env node
/**
 * Supabase tam yedek alma.
 *
 *   node --env-file=.env scripts/backup-db.mjs
 *   node --env-file=.env scripts/backup-db.mjs --scope content
 *   node --env-file=.env scripts/backup-db.mjs --out backups/2026-07-08.json
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exportBackup } from "../lib/db-backup.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const scope = args.includes("--scope") && args[args.indexOf("--scope") + 1] === "content" ? "content" : "full";
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
const defaultOut = path.join(__dirname, "..", "backups", `willowsoft-db-${scope}-${ts}.json`);
const outPath = outArg ? path.resolve(outArg) : defaultOut;

fs.mkdirSync(path.dirname(outPath), { recursive: true });

const backup = await exportBackup(supabase, scope);
fs.writeFileSync(outPath, JSON.stringify(backup, null, 2) + "\n", "utf8");

console.log(`Yedek alındı: ${outPath}`);
for (const [table, count] of Object.entries(backup.stats)) {
  console.log(`  ${table}: ${count}`);
}

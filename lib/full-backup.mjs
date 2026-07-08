/**
 * Tam site yedeği: Supabase DB (tüm tablolar + localized) + Storage (assets bucket).
 */
import {
  exportBackup,
  restoreBackup,
  validateBackup,
  BACKUP_SOURCE,
} from "./db-backup.mjs";
import {
  listAllStorageFiles,
  downloadStorageFile,
  restoreStorageFiles,
  STORAGE_BUCKET,
} from "./storage-backup.mjs";
import { packBackupZip, unpackBackupZip } from "./zip-backup.mjs";

export const FULL_BACKUP_SCHEMA_VERSION = 2;

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {"content" | "full"} scope
 * @param {{ includeStorage?: boolean, onProgress?: (info: object) => void }} [opts]
 */
export async function exportFullBackup(supabase, scope = "full", opts = {}) {
  const includeStorage = opts.includeStorage !== false;
  const onProgress = opts.onProgress;

  onProgress?.({ phase: "db-start", scope });
  const db = await exportBackup(supabase, scope);

  /** @type {{ path: string, size: number, contentType: string }[]} */
  let storageManifest = [];
  /** @type {Record<string, Uint8Array>} */
  const storageFiles = {};

  if (includeStorage) {
    onProgress?.({ phase: "storage-list" });
    const files = await listAllStorageFiles(supabase);
    storageManifest = files.map((f) => ({
      path: f.path,
      size: f.size,
      contentType: f.contentType,
    }));

    let i = 0;
    for (const file of files) {
      i += 1;
      onProgress?.({ phase: "storage-download", current: i, total: files.length, path: file.path });
      const buf = await downloadStorageFile(supabase, file.path);
      storageFiles[file.path] = new Uint8Array(buf);
    }
  }

  const manifest = {
    schemaVersion: FULL_BACKUP_SCHEMA_VERSION,
    source: BACKUP_SOURCE,
    scope,
    createdAt: new Date().toISOString(),
    bucket: STORAGE_BUCKET,
    tables: db.tables,
    stats: {
      ...db.stats,
      storageFiles: storageManifest.length,
      storageBytes: storageManifest.reduce((a, f) => a + (f.size || 0), 0),
    },
    storage: storageManifest,
    // localized dahil tüm CMS verisi tables.*.localized alanında
    includes: {
      database: true,
      storage: includeStorage,
      localizations: true,
    },
  };

  onProgress?.({ phase: "zip-pack" });
  const zip = packBackupZip(manifest, storageFiles);

  return { manifest, zip, storageFiles };
}

/**
 * @param {unknown} manifest
 */
export function validateFullManifest(manifest) {
  const dbCheck = validateBackup(manifest);
  if (!dbCheck.ok) return dbCheck;

  const m = /** @type {Record<string, unknown>} */ (manifest);
  if (!m.storage || !Array.isArray(m.storage)) {
    return { ok: false, error: "Manifest içinde storage listesi yok." };
  }

  return { ok: true, format: "full-zip", scope: dbCheck.scope || "full" };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {Uint8Array} zipBytes
 * @param {{ scope?: "content" | "full", onProgress?: (info: object) => void }} [opts]
 */
export async function restoreFullBackup(supabase, zipBytes, opts = {}) {
  const onProgress = opts.onProgress;
  onProgress?.({ phase: "zip-unpack" });

  const { manifest, storageFiles } = unpackBackupZip(zipBytes);
  const validation = validateFullManifest(manifest);
  if (!validation.ok) throw new Error(validation.error);

  const scope = opts.scope || validation.scope || "full";

  onProgress?.({ phase: "db-restore", scope });
  const dbResult = await restoreBackup(supabase, manifest, { scope });

  /** @type {{ uploaded: number, deleted: number } | null} */
  let storageResult = null;

  const storageList = Array.isArray(manifest.storage) ? manifest.storage : [];
  if (storageList.length > 0) {
    onProgress?.({ phase: "storage-restore-start", total: storageList.length });
    storageResult = await restoreStorageFiles(
      supabase,
      storageList,
      async (path) => {
        const bytes = storageFiles[path];
        if (!bytes) throw new Error(`ZIP içinde storage dosyası eksik: ${path}`);
        return bytes;
      },
      onProgress,
    );
  }

  return {
    scope,
    database: dbResult,
    storage: storageResult,
    restoredAt: new Date().toISOString(),
  };
}

/**
 * JSON-only yedek (eski uyumluluk) — storage hariç.
 */
export { exportBackup, restoreBackup, validateBackup } from "./db-backup.mjs";

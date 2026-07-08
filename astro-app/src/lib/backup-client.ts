/**
 * Tarayıcıda tam yedek ZIP oluşturma / geri yükleme.
 */
import { zipSync, unzipSync, strToU8 } from "fflate";

const MANIFEST_NAME = "manifest.json";
const STORAGE_PREFIX = "storage/";

/** Tam ZIP manifest sürümü — lib/full-backup.mjs ile senkron. */
export const FULL_BACKUP_SCHEMA_VERSION = 2;

export type BackupProgress = {
  phase: string;
  current?: number;
  total?: number;
  path?: string;
  message?: string;
};

function publicStorageUrl(supabaseUrl: string, path: string) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/assets/${path.replace(/^\/+/, "")}`;
}

/** DB manifest + storage dosyalarından ZIP oluşturur. */
export async function buildFullBackupZip(
  manifest: Record<string, unknown>,
  supabaseUrl: string,
  storageFiles: { path: string; contentType: string }[],
  onProgress?: (p: BackupProgress) => void,
): Promise<Uint8Array> {
  /** @type {Record<string, Uint8Array>} */
  const storageBytes: Record<string, Uint8Array> = {};

  let i = 0;
  for (const file of storageFiles) {
    i += 1;
    onProgress?.({ phase: "storage-download", current: i, total: storageFiles.length, path: file.path });
    const res = await fetch(publicStorageUrl(supabaseUrl, file.path));
    if (!res.ok) throw new Error(`Storage indirilemedi (${file.path}): HTTP ${res.status}`);
    storageBytes[file.path] = new Uint8Array(await res.arrayBuffer());
  }

  onProgress?.({ phase: "zip-pack", message: "ZIP paketleniyor…" });

  /** @type {Record<string, Uint8Array>} */
  const entries: Record<string, Uint8Array> = {
    [MANIFEST_NAME]: strToU8(JSON.stringify(manifest, null, 2)),
  };
  for (const [path, bytes] of Object.entries(storageBytes)) {
    entries[`${STORAGE_PREFIX}${path}`] = bytes;
  }

  return zipSync(entries, { level: 6 });
}

export function unpackFullBackupZip(zipBytes: Uint8Array) {
  const entries = unzipSync(zipBytes);
  const manifestRaw = entries[MANIFEST_NAME];
  if (!manifestRaw) throw new Error("ZIP içinde manifest.json yok.");

  const manifest = JSON.parse(new TextDecoder().decode(manifestRaw));
  /** @type {Record<string, Uint8Array>} */
  const storageFiles: Record<string, Uint8Array> = {};

  for (const [key, bytes] of Object.entries(entries)) {
    if (key === MANIFEST_NAME) continue;
    if (!key.startsWith(STORAGE_PREFIX)) continue;
    storageFiles[key.slice(STORAGE_PREFIX.length)] = bytes;
  }

  return { manifest, storageFiles };
}

/** ZIP'ten DB + storage geri yükler. */
export async function restoreFullBackupZip(
  zipBytes: Uint8Array,
  onProgress?: (p: BackupProgress) => void,
): Promise<{ db: unknown; storage: { uploaded: number; deleted: number } }> {
  onProgress?.({ phase: "zip-unpack" });
  const { manifest, storageFiles } = unpackFullBackupZip(zipBytes);

  const scope = manifest.scope === "content" ? "content" : "full";

  onProgress?.({ phase: "db-restore", message: "Veritabanı geri yükleniyor…" });
  const dbRes = await fetch("/api/admin/backups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ backup: manifest, confirm: "RESTORE", scope }),
  });
  const dbJson = await dbRes.json();
  if (!dbRes.ok) throw new Error(dbJson.error || "DB geri yükleme başarısız");

  const storageList = Array.isArray(manifest.storage) ? manifest.storage : [];
  const paths = Object.keys(storageFiles);
  let i = 0;

  for (const path of paths) {
    i += 1;
    onProgress?.({ phase: "storage-upload", current: i, total: paths.length, path });
    const bytes = storageFiles[path];
    const meta = storageList.find((f: { path: string }) => f.path === path);
    const blob = new Blob([bytes.slice()], { type: meta?.contentType || "application/octet-stream" });
    const fd = new FormData();
    fd.append("path", path);
    fd.append("file", blob, path.split("/").pop() || "file");

    const upRes = await fetch("/api/admin/backups/storage-file", { method: "POST", body: fd });
    const upJson = await upRes.json();
    if (!upRes.ok) throw new Error(upJson.error || `Storage yüklenemedi: ${path}`);
  }

  onProgress?.({ phase: "storage-sync", message: "Fazla dosyalar temizleniyor…" });
  const syncRes = await fetch("/api/admin/backups/storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths, confirm: "SYNC" }),
  });
  const syncJson = await syncRes.json();
  if (!syncRes.ok) throw new Error(syncJson.error || "Storage senkron başarısız");

  return {
    db: dbJson,
    storage: { uploaded: paths.length, deleted: syncJson.deleted ?? 0 },
  };
}

export function downloadBytes(data: Uint8Array, filename: string) {
  const blob = new Blob([data.slice()], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * ZIP paketleme — manifest.json + storage/* dosyaları.
 * Node ve tarayıcıda fflate kullanır.
 */
import { strToU8, zipSync, unzipSync } from "fflate";

const MANIFEST_NAME = "manifest.json";
const STORAGE_PREFIX = "storage/";

/**
 * @param {object} manifest
 * @param {Record<string, Uint8Array>} storageFiles — key: storage path (uploads/foo.jpg)
 */
export function packBackupZip(manifest, storageFiles = {}) {
  /** @type {Record<string, Uint8Array>} */
  const zipEntries = {
    [MANIFEST_NAME]: strToU8(JSON.stringify(manifest, null, 2)),
  };

  for (const [path, bytes] of Object.entries(storageFiles)) {
    const key = STORAGE_PREFIX + path.replace(/^\/+/, "");
    zipEntries[key] = bytes;
  }

  return zipSync(zipEntries, { level: 6 });
}

/**
 * @param {Uint8Array} zipBytes
 */
export function unpackBackupZip(zipBytes) {
  const entries = unzipSync(zipBytes);
  const manifestRaw = entries[MANIFEST_NAME];
  if (!manifestRaw) throw new Error("ZIP içinde manifest.json bulunamadı.");

  const manifest = JSON.parse(new TextDecoder().decode(manifestRaw));
  /** @type {Record<string, Uint8Array>} */
  const storageFiles = {};

  for (const [key, bytes] of Object.entries(entries)) {
    if (key === MANIFEST_NAME) continue;
    if (!key.startsWith(STORAGE_PREFIX)) continue;
    const path = key.slice(STORAGE_PREFIX.length);
    storageFiles[path] = bytes;
  }

  return { manifest, storageFiles };
}

export { MANIFEST_NAME, STORAGE_PREFIX };

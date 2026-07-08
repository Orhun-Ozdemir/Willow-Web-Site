/**
 * Supabase Storage (assets bucket) yedekleme yardımcıları.
 */

export const STORAGE_BUCKET = "assets";

/**
 * Bucket içindeki tüm dosyaları özyinelemeli listeler.
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 */
export async function listAllStorageFiles(supabase) {
  /** @type {{ path: string, size: number, contentType: string, updatedAt?: string }[]} */
  const files = [];

  async function walk(prefix = "") {
    let offset = 0;
    while (true) {
      const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(prefix, {
        limit: 1000,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw new Error(`Storage list (${prefix || "root"}): ${error.message}`);
      if (!data?.length) break;

      for (const item of data) {
        const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
        // Klasör: id null veya metadata yok
        const isFolder = item.id == null && !item.metadata;
        if (isFolder) {
          await walk(itemPath);
        } else {
          files.push({
            path: itemPath,
            size: item.metadata?.size ?? 0,
            contentType: item.metadata?.mimetype || guessMime(itemPath),
            updatedAt: item.updated_at || item.created_at || undefined,
          });
        }
      }

      if (data.length < 1000) break;
      offset += 1000;
    }
  }

  await walk();
  return files;
}

function guessMime(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  const map = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".ico": "image/x-icon",
    ".avif": "image/avif",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
  };
  return map[ext] || "application/octet-stream";
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} filePath
 */
export async function downloadStorageFile(supabase, filePath) {
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(filePath);
  if (error) throw new Error(`Storage indirme (${filePath}): ${error.message}`);
  const buf = Buffer.from(await data.arrayBuffer());
  return buf;
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} filePath
 * @param {Buffer|Uint8Array|Blob} body
 * @param {string} contentType
 */
export async function uploadStorageFile(supabase, filePath, body, contentType) {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, body, {
    contentType: contentType || guessMime(filePath),
    upsert: true,
  });
  if (error) throw new Error(`Storage yükleme (${filePath}): ${error.message}`);
}

/**
 * Yedekte olmayan dosyaları siler — tam senkron (fazlalık kalmaz).
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {Set<string>} backupPaths
 * @param {(info: { phase: string, current: number, total: number, path?: string }) => void} [onProgress]
 */
export async function syncStorageDeleteStale(supabase, backupPaths, onProgress) {
  const current = await listAllStorageFiles(supabase);
  const stale = current.filter((f) => !backupPaths.has(f.path));
  let i = 0;
  for (const file of stale) {
    i += 1;
    onProgress?.({ phase: "storage-delete", current: i, total: stale.length, path: file.path });
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([file.path]);
    if (error) throw new Error(`Storage silme (${file.path}): ${error.message}`);
  }
  return { deleted: stale.length };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {{ path: string, contentType: string }[]} files
 * @param {(path: string) => Promise<Buffer|Uint8Array>} readBytes
 * @param {(info: { phase: string, current: number, total: number, path?: string }) => void} [onProgress]
 */
export async function restoreStorageFiles(supabase, files, readBytes, onProgress) {
  let i = 0;
  for (const file of files) {
    i += 1;
    onProgress?.({ phase: "storage-upload", current: i, total: files.length, path: file.path });
    const bytes = await readBytes(file.path);
    await uploadStorageFile(supabase, file.path, bytes, file.contentType);
  }
  const backupPaths = new Set(files.map((f) => f.path));
  const del = await syncStorageDeleteStale(supabase, backupPaths, onProgress);
  return { uploaded: files.length, deleted: del.deleted };
}

/**
 * Public URL'den dosya indirir (tarayıcı yedeklemesi).
 * @param {string} supabaseUrl
 * @param {string} filePath
 */
export async function downloadPublicStorageFile(supabaseUrl, filePath) {
  const url = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath.replace(/^\/+/, "")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${filePath}`);
  return new Uint8Array(await res.arrayBuffer());
}

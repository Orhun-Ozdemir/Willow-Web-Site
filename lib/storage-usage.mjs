/**
 * Supabase Storage dosyalarını CMS/DB referanslarıyla eşleştirir.
 * scripts/audit-storage-usage.mjs ve admin API tarafından kullanılır.
 */
import { listAllStorageFiles, STORAGE_BUCKET } from "./storage-backup.mjs";

export { STORAGE_BUCKET };

export const CMS_TABLES = [
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

/** Şablonda sabit tutulan / repo fallback yolları — silinmemeli. */
export const TEMPLATE_KEEP = [
  "pdf-assets/p06_01_X13.jpg",
  "pdf-assets/p08_01_X22.jpg",
  "pdf-assets/p14_01_X50.jpg",
  "pdf-assets/p29_06_X111.jpg",
  "assets/hero-industrial-iot.png",
  "assets/hero-industrial-iot.jpg",
  "assets/favicon.svg",
  "assets/willow-mark-transparent.png",
];

const MEDIA_EXT = /\.(png|jpe?g|webp|gif|svg|avif|ico|pdf|docx?|xlsx?|pptx?|txt|csv)(\?|$)/i;

export function pathVariants(raw) {
  if (!raw || typeof raw !== "string") return [];
  let s = raw.trim();
  if (!s) return [];

  s = s.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/assets\//, "");
  s = s.replace(/^https?:\/\/[^/]+\/assets\//, "");
  if (s.startsWith("/")) s = s.slice(1);

  const out = new Set([s]);
  if (s.startsWith("assets/")) out.add(s.slice("assets/".length));
  else out.add(`assets/${s}`);

  const base = s.split("/").pop();
  if (base) out.add(base);

  return [...out];
}

function looksLikeMediaRef(val) {
  if (typeof val !== "string") return false;
  return (
    val.includes("/") ||
    MEDIA_EXT.test(val) ||
    /^(uploads|team|news|pdf-assets|images|datasheets|products|clients)\//.test(val)
  );
}

/**
 * @param {unknown} val
 * @param {Set<string>} refs
 * @param {Map<string, Set<string>>} refSources
 * @param {string} sourceLabel
 */
export function collectRefsFromValue(val, refs, refSources, sourceLabel) {
  if (val == null) return;
  if (typeof val === "string") {
    if (looksLikeMediaRef(val)) {
      for (const v of pathVariants(val)) {
        refs.add(v);
        if (!refSources.has(v)) refSources.set(v, new Set());
        refSources.get(v).add(sourceLabel);
      }
    }
    return;
  }
  if (Array.isArray(val)) {
    for (const item of val) collectRefsFromValue(item, refs, refSources, sourceLabel);
    return;
  }
  if (typeof val === "object") {
    for (const v of Object.values(val)) collectRefsFromValue(v, refs, refSources, sourceLabel);
  }
}

export function isReferenced(storagePath, refs) {
  for (const v of pathVariants(storagePath)) {
    if (refs.has(v)) return true;
  }
  return false;
}

export function fileKind(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  if (/\.(png|jpe?g|webp|gif|svg|avif|ico)$/.test(ext)) return "image";
  if (/\.(pdf|docx?|xlsx?|pptx?|txt|csv)$/.test(ext)) return "document";
  return "other";
}

export function folderOf(filePath) {
  const idx = filePath.indexOf("/");
  return idx === -1 ? "(kök)" : filePath.slice(0, idx);
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 */
export async function buildStorageUsageReport(supabase) {
  const refs = new Set();
  /** @type {Map<string, Set<string>>} */
  const refSources = new Map();

  for (const p of TEMPLATE_KEEP) {
    for (const v of pathVariants(p)) {
      refs.add(v);
      if (!refSources.has(v)) refSources.set(v, new Set());
      refSources.get(v).add("template");
    }
  }

  for (const table of CMS_TABLES) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) continue;
    collectRefsFromValue(data, refs, refSources, table);
  }

  const files = await listAllStorageFiles(supabase);
  const enriched = files.map((file) => {
    const used = isReferenced(file.path, refs);
    const sources = new Set();
    for (const v of pathVariants(file.path)) {
      const src = refSources.get(v);
      if (src) for (const s of src) sources.add(s);
    }
    return {
      ...file,
      kind: fileKind(file.path),
      folder: folderOf(file.path),
      used,
      sources: [...sources].sort(),
      isTemplateKeep: TEMPLATE_KEEP.some((p) => pathVariants(p).includes(file.path)),
    };
  });

  const usedFiles = enriched.filter((f) => f.used);
  const unusedFiles = enriched.filter((f) => !f.used);

  const byFolder = (list) => {
    const map = {};
    for (const f of list) {
      map[f.folder] = (map[f.folder] || 0) + 1;
    }
    return map;
  };

  const totalBytes = enriched.reduce((a, f) => a + (f.size || 0), 0);

  return {
    bucket: STORAGE_BUCKET,
    files: enriched,
    stats: {
      total: enriched.length,
      used: usedFiles.length,
      unused: unusedFiles.length,
      totalBytes,
      images: enriched.filter((f) => f.kind === "image").length,
      documents: enriched.filter((f) => f.kind === "document").length,
      other: enriched.filter((f) => f.kind === "other").length,
      byFolderAll: byFolder(enriched),
      byFolderUsed: byFolder(usedFiles),
      byFolderUnused: byFolder(unusedFiles),
      cmsRefCount: refs.size,
    },
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string[]} paths
 * @param {{ allowUsed?: boolean }} [opts]
 */
export async function deleteStoragePaths(supabase, paths, opts = {}) {
  const report = await buildStorageUsageReport(supabase);
  const fileMap = new Map(report.files.map((f) => [f.path, f]));

  const toDelete = [];
  const blocked = [];

  for (const p of paths) {
    const file = fileMap.get(p);
    if (!file) {
      blocked.push({ path: p, reason: "not_found" });
      continue;
    }
    if (file.isTemplateKeep) {
      blocked.push({ path: p, reason: "template_keep" });
      continue;
    }
    if (file.used && !opts.allowUsed) {
      blocked.push({ path: p, reason: "in_use" });
      continue;
    }
    toDelete.push(p);
  }

  if (toDelete.length === 0) {
    return { deleted: 0, blocked, paths: [] };
  }

  const BATCH = 100;
  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += BATCH) {
    const batch = toDelete.slice(i, i + BATCH);
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(batch);
    if (error) throw new Error(`Silme hatası: ${error.message}`);
    deleted += batch.length;
  }

  return { deleted, blocked, paths: toDelete };
}

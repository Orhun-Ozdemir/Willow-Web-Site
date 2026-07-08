/**
 * WillowSoft Supabase yedekleme / geri yükleme — tek kaynak.
 *
 * - Dışa aktarma: tüm tabloları ham satır olarak JSON'a yazar.
 * - Geri yükleme: upsert + yedekte olmayan satırları siler (duplicate / fazlalık yok).
 * - Eski CMS formatı (products, pageContent kök alanları) geriye dönük desteklenir.
 */

export const BACKUP_SCHEMA_VERSION = 1;
export const BACKUP_SOURCE = "willowsoft-supabase";

/** @typedef {"content" | "full"} BackupScope */

/**
 * @typedef {Object} TableSpec
 * @property {string} pk
 * @property {"collection" | "keyed" | "singleton"} mode
 * @property {string} [scope] — content | full (default content)
 */

/** @type {Record<string, TableSpec>} */
export const TABLE_SPECS = {
  products: { pk: "id", mode: "collection", scope: "content" },
  news: { pk: "id", mode: "collection", scope: "content" },
  services: { pk: "id", mode: "collection", scope: "content" },
  solutions: { pk: "id", mode: "collection", scope: "content" },
  clients: { pk: "id", mode: "collection", scope: "content" },
  faqs: { pk: "id", mode: "collection", scope: "content" },
  glossary: { pk: "id", mode: "collection", scope: "content" },
  page_content: { pk: "page", mode: "keyed", scope: "content" },
  page_seo: { pk: "page", mode: "keyed", scope: "content" },
  translations: { pk: "locale", mode: "keyed", scope: "content" },
  company_facts: { pk: "id", mode: "singleton", scope: "content" },
  site_meta: { pk: "id", mode: "singleton", scope: "content" },
  leads: { pk: "id", mode: "collection", scope: "full" },
  notification_recipients: { pk: "id", mode: "collection", scope: "full" },
  admin_users: { pk: "id", mode: "collection", scope: "full" },
  events: { pk: "id", mode: "collection", scope: "full" },
  bot_events: { pk: "id", mode: "collection", scope: "full" },
  admin_audit_logs: { pk: "id", mode: "collection", scope: "full" },
};

const CONTENT_TABLES = Object.entries(TABLE_SPECS)
  .filter(([, s]) => s.scope === "content")
  .map(([name]) => name);

const FULL_EXTRA_TABLES = Object.entries(TABLE_SPECS)
  .filter(([, s]) => s.scope === "full")
  .map(([name]) => name);

const CMS_ROOT_KEYS = new Set([
  "products", "news", "services", "solutions", "clients", "faqs", "glossary",
  "pageContent", "pageSeo", "translations", "companyFacts", "meta",
]);

const CHUNK_SIZE = 100;
const PAGE_SIZE = 1000;

function chunk(arr, size = CHUNK_SIZE) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} table
 */
async function fetchAllRows(supabase, table) {
  const all = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw new Error(`${table} okuma: ${error.message}`);
    if (!data?.length) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return all;
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {BackupScope} scope
 */
export async function exportBackup(supabase, scope = "full") {
  const tables = scope === "content" ? CONTENT_TABLES : [...CONTENT_TABLES, ...FULL_EXTRA_TABLES];
  /** @type {Record<string, unknown[]>} */
  const payload = {};
  /** @type {Record<string, number>} */
  const stats = {};

  for (const table of tables) {
    const rows = await fetchAllRows(supabase, table);
    payload[table] = rows;
    stats[table] = rows.length;
  }

  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    source: BACKUP_SOURCE,
    scope,
    createdAt: new Date().toISOString(),
    tables: payload,
    stats,
  };
}

/**
 * @param {unknown} backup
 * @returns {{ ok: true, format: "tables" | "legacy-cms", scope?: BackupScope } | { ok: false, error: string }}
 */
export function validateBackup(backup) {
  if (!backup || typeof backup !== "object") {
    return { ok: false, error: "Geçersiz yedek — JSON nesnesi değil." };
  }

  const b = /** @type {Record<string, unknown>} */ (backup);

  if (b.tables && typeof b.tables === "object") {
    const tables = /** @type {Record<string, unknown>} */ (b.tables);
    const names = Object.keys(tables);
    if (!names.length) {
      return { ok: false, error: "Yedekte tablo verisi yok." };
    }
    for (const name of names) {
      if (!TABLE_SPECS[name]) {
        return { ok: false, error: `Bilinmeyen tablo: ${name}` };
      }
      if (!Array.isArray(tables[name])) {
        return { ok: false, error: `${name} dizisi değil.` };
      }
    }
    const scope = b.scope === "content" ? "content" : "full";
    return { ok: true, format: "tables", scope };
  }

  const legacyKeys = Object.keys(b).filter((k) => CMS_ROOT_KEYS.has(k));
  if (legacyKeys.length > 0) {
    return { ok: true, format: "legacy-cms" };
  }

  return { ok: false, error: "Tanınmayan yedek formatı — tables veya CMS alanları (products, pageContent vb.) gerekli." };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} table
 * @param {TableSpec} spec
 * @param {unknown[]} rows
 */
async function syncTable(supabase, table, spec, rows) {
  const pk = spec.pk;
  const cleanRows = rows.filter((r) => r && typeof r === "object" && (r)[pk] != null);

  if (spec.mode === "singleton") {
    if (!cleanRows.length) return { upserted: 0, deleted: 0 };
    for (const part of chunk(cleanRows)) {
      const { error } = await supabase.from(table).upsert(part, { onConflict: pk });
      if (error) throw new Error(`${table} upsert: ${error.message}`);
    }
    return { upserted: cleanRows.length, deleted: 0 };
  }

  const { data: current, error: readErr } = await supabase.from(table).select(pk);
  if (readErr) throw new Error(`${table} mevcut kayıt okuma: ${readErr.message}`);

  const currentKeys = new Set((current || []).map((r) => String(r[pk])));
  const backupKeys = new Set(cleanRows.map((r) => String((r)[pk])));

  let upserted = 0;
  for (const part of chunk(cleanRows)) {
    const { error } = await supabase.from(table).upsert(part, { onConflict: pk });
    if (error) throw new Error(`${table} upsert: ${error.message}`);
    upserted += part.length;
  }

  const stale = [...currentKeys].filter((k) => !backupKeys.has(k));
  let deleted = 0;
  for (const part of chunk(stale)) {
    const { error } = await supabase.from(table).delete().in(pk, part);
    if (error) throw new Error(`${table} eski kayıt silme: ${error.message}`);
    deleted += part.length;
  }

  return { upserted, deleted };
}

const num = (v) => (typeof v === "number" ? v : Number(v) || 0);

const collectionExtractors = {
  products: (it) => ({ slug: it.slug ?? null, category: it.category ?? null, featured: !!it.featured, sort_order: num(it.sortOrder) }),
  news: (it) => ({ slug: it.slug ?? null, category: it.category ?? null, date: it.date ?? null, featured: !!it.featured, sort_order: num(it.sortOrder) }),
  services: (it) => ({ sort_order: num(it.sortOrder) }),
  solutions: (it) => ({ slug: it.slug ?? null, category: it.category ?? null, featured: !!it.featured, sort_order: num(it.sortOrder) }),
  clients: (it) => ({ name: it.name ?? null, industry: it.industry ?? null, country: it.country ?? null, logo: it.logo ?? null, featured: !!it.featured, sort_order: num(it.sortOrder) }),
  faqs: (it) => ({ page: it.page ?? null, sort_order: num(it.sortOrder) }),
  glossary: (it) => ({ category: it.category ?? null, sort_order: num(it.sortOrder) }),
};

/**
 * Eski CMS JSON'unu tablo satırlarına çevirir (saveContent ile aynı mantık).
 * @param {Record<string, unknown>} cms
 */
export function legacyCmsToTables(cms) {
  /** @type {Record<string, unknown[]>} */
  const tables = {};

  const toRow = (it, extract) => {
    const data = { ...it };
    delete data.localized;
    return { id: it.id, ...extract(it), data, localized: it.localized || {} };
  };

  for (const [table, extract] of Object.entries(collectionExtractors)) {
    const items = Array.isArray(cms[table]) ? cms[table] : [];
    tables[table] = items.map((it) => toRow(it, extract));
  }

  if (cms.pageContent && typeof cms.pageContent === "object") {
    tables.page_content = Object.entries(cms.pageContent).map(([page, data]) => ({ page, data }));
  }
  if (cms.pageSeo && typeof cms.pageSeo === "object") {
    tables.page_seo = Object.entries(cms.pageSeo).map(([page, data]) => ({ page, data }));
  }
  if (cms.translations && typeof cms.translations === "object") {
    tables.translations = Object.entries(cms.translations).map(([locale, data]) => ({ locale, data }));
  }
  if (cms.companyFacts) {
    tables.company_facts = [{ id: 1, data: cms.companyFacts }];
  }
  if (cms.meta) {
    tables.site_meta = [{ id: 1, data: cms.meta }];
  }

  return tables;
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {unknown} backup
 * @param {{ scope?: BackupScope, tables?: string[] }} [options]
 */
export async function restoreBackup(supabase, backup, options = {}) {
  const validation = validateBackup(backup);
  if (!validation.ok) throw new Error(validation.error);

  /** @type {Record<string, unknown[]>} */
  let tableData;
  let effectiveScope = options.scope || validation.scope || "full";

  if (validation.format === "legacy-cms") {
    tableData = legacyCmsToTables(/** @type {Record<string, unknown>} */ (backup));
    effectiveScope = "content";
  } else {
    tableData = /** @type {Record<string, unknown[]>} */ ((/** @type {{ tables: Record<string, unknown[]> }} */ (backup)).tables);
  }

  const allowedTables =
    effectiveScope === "content"
      ? CONTENT_TABLES
      : [...CONTENT_TABLES, ...FULL_EXTRA_TABLES];

  const requested = options.tables?.length
    ? options.tables.filter((t) => allowedTables.includes(t))
    : allowedTables.filter((t) => tableData[t] != null);

  if (!requested.length) {
    throw new Error("Geri yüklenecek tablo bulunamadı.");
  }

  /** @type {Record<string, { upserted: number, deleted: number }>} */
  const results = {};

  for (const table of requested) {
    const spec = TABLE_SPECS[table];
    const rows = Array.isArray(tableData[table]) ? tableData[table] : [];
    results[table] = await syncTable(supabase, table, spec, rows);
  }

  return {
    scope: effectiveScope,
    tables: results,
    restoredAt: new Date().toISOString(),
  };
}

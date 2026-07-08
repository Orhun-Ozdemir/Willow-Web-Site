/** CMS metin & çeviri dışa/içe aktarım — Yedekler paneli. */

export const LOCALIZATION_EXPORT_TYPE = "willowsoft-localizations";
export const LOCALIZATION_SCHEMA_VERSION = 1;

const COLLECTION_KEYS = [
  "products",
  "news",
  "services",
  "solutions",
  "clients",
  "faqs",
  "glossary",
] as const;

type CollectionKey = (typeof COLLECTION_KEYS)[number];

export interface LocalizationBundle {
  exportType: typeof LOCALIZATION_EXPORT_TYPE;
  schemaVersion: number;
  exportedAt: string;
  /** UI string'leri (Ayarlar → Buton & Arayüz Metinleri) */
  translations?: Record<string, Record<string, string>>;
  /** Sayfa metinleri — buton alanları `{ label, url }` veya düz metin olabilir */
  pageContent?: Record<string, Record<string, unknown>>;
  pageSeo?: Record<string, Record<string, unknown>>;
  meta?: { brandTagline?: Record<string, string> };
  companyFacts?: Record<string, unknown>;
  collections?: Partial<
    Record<CollectionKey, Array<{ id: string; localized: Record<string, unknown> }>>
  >;
}

function pickLocalizedCollections(content: Record<string, unknown>): LocalizationBundle["collections"] {
  const out: NonNullable<LocalizationBundle["collections"]> = {};
  for (const key of COLLECTION_KEYS) {
    const items = content[key];
    if (!Array.isArray(items) || items.length === 0) continue;
    out[key] = items
      .filter((item) => item && typeof item === "object" && item.id)
      .map((item) => ({
        id: String(item.id),
        localized: (item.localized && typeof item.localized === "object" ? item.localized : {}) as Record<
          string,
          unknown
        >,
      }));
  }
  return Object.keys(out).length ? out : undefined;
}

/** Yalnızca çeviri/metin katmanını çıkarır (görseller, slug, ID vb. hariç). */
export function buildLocalizationBundle(content: Record<string, unknown>): LocalizationBundle {
  const meta = content.meta as Record<string, unknown> | undefined;
  const brandTagline =
    meta?.brandTagline && typeof meta.brandTagline === "object"
      ? (meta.brandTagline as Record<string, string>)
      : undefined;

  return {
    exportType: LOCALIZATION_EXPORT_TYPE,
    schemaVersion: LOCALIZATION_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    translations: (content.translations as LocalizationBundle["translations"]) || undefined,
    pageContent: (content.pageContent as LocalizationBundle["pageContent"]) || undefined,
    pageSeo: (content.pageSeo as LocalizationBundle["pageSeo"]) || undefined,
    meta: brandTagline ? { brandTagline } : undefined,
    companyFacts: (content.companyFacts as Record<string, unknown>) || undefined,
    collections: pickLocalizedCollections(content),
  };
}

export function isLocalizationBundle(data: unknown): data is LocalizationBundle {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as LocalizationBundle).exportType === LOCALIZATION_EXPORT_TYPE
  );
}

/** Tam CMS veya çeviri paketinde en az bir tanınan bölüm var mı? */
export function isRecognizedCmsPayload(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false;
  if (isLocalizationBundle(data)) return true;
  const d = data as Record<string, unknown>;
  if (d.tables && d.schemaVersion) return false; // DB yedeği — ayrı akış
  return Boolean(
    d.products ||
      d.pageContent ||
      d.pageSeo ||
      d.meta ||
      d.translations ||
      d.companyFacts ||
      d.news ||
      d.services ||
      d.solutions ||
      d.clients ||
      d.faqs ||
      d.glossary,
  );
}

function mergeCollectionLocalized(
  existing: unknown[],
  patch: Array<{ id: string; localized: Record<string, unknown> }>,
): unknown[] {
  const byId = new Map(patch.map((p) => [p.id, p.localized]));
  return existing.map((item) => {
    if (!item || typeof item !== "object" || !("id" in item)) return item;
    const id = String((item as { id: unknown }).id);
    const localizedPatch = byId.get(id);
    if (!localizedPatch) return item;
    return {
      ...item,
      localized: { ...((item as { localized?: Record<string, unknown> }).localized || {}), ...localizedPatch },
    };
  });
}

/** Çeviri paketini mevcut admin içeriğine birleştirir (yalnızca gelen bölümler güncellenir). */
export function mergeLocalizationBundle(
  content: Record<string, unknown>,
  bundle: LocalizationBundle,
): Record<string, unknown> {
  const next = { ...content };

  if (bundle.translations) {
    next.translations = { ...(content.translations as object), ...bundle.translations };
  }
  if (bundle.pageContent) {
    const pc: Record<string, unknown> = { ...(content.pageContent as Record<string, unknown>) };
    for (const [page, fields] of Object.entries(bundle.pageContent)) {
      pc[page] = {
        ...((pc[page] as Record<string, unknown>) || {}),
        ...(fields as Record<string, unknown>),
      };
    }
    next.pageContent = pc;
  }
  if (bundle.pageSeo) {
    const ps: Record<string, unknown> = { ...(content.pageSeo as Record<string, unknown>) };
    for (const [page, fields] of Object.entries(bundle.pageSeo)) {
      ps[page] = {
        ...((ps[page] as Record<string, unknown>) || {}),
        ...(fields as Record<string, unknown>),
      };
    }
    next.pageSeo = ps;
  }
  if (bundle.meta?.brandTagline) {
    next.meta = {
      ...(content.meta as object),
      brandTagline: {
        ...(((content.meta as Record<string, unknown>)?.brandTagline as object) || {}),
        ...bundle.meta.brandTagline,
      },
    };
  }
  if (bundle.companyFacts) {
    next.companyFacts = { ...(content.companyFacts as object), ...bundle.companyFacts };
  }
  if (bundle.collections) {
    for (const key of COLLECTION_KEYS) {
      const patch = bundle.collections[key];
      if (!patch?.length || !Array.isArray(content[key])) continue;
      next[key] = mergeCollectionLocalized(content[key] as unknown[], patch);
    }
  }

  return next;
}

/** Tam CMS JSON veya çeviri paketini birleştirir. */
export function mergeCmsPayload(
  content: Record<string, unknown>,
  data: Record<string, unknown>,
): { next: Record<string, unknown>; sections: string[] } {
  if (isLocalizationBundle(data)) {
    const sections: string[] = [];
    if (data.translations) sections.push("translations");
    if (data.pageContent) sections.push("pageContent");
    if (data.pageSeo) sections.push("pageSeo");
    if (data.meta?.brandTagline) sections.push("meta.brandTagline");
    if (data.companyFacts) sections.push("companyFacts");
    if (data.collections) {
      for (const key of Object.keys(data.collections)) {
        sections.push(`${key}.localized`);
      }
    }
    return { next: mergeLocalizationBundle(content, data), sections };
  }

  const sections = Object.keys(data);
  return { next: { ...content, ...data }, sections };
}

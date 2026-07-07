export const locales = ["en", "tr", "de", "fr", "es", "it", "ar", "ja"] as const;
export type Locale = (typeof locales)[number];

export interface LocalizedString {
  en: string;
  tr?: string;
  de?: string;
  fr?: string;
  es?: string;
  it?: string;
  ar?: string;
  ja?: string;
}

export function currentLocale(pathname: string): Locale {
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0] as Locale;
  return locales.includes(first) ? first : "en";
}

export function resolveLocale(value: any, pathname?: string): Locale {
  if (typeof value === "string" && locales.includes(value as Locale)) return value as Locale;
  if (pathname) return currentLocale(pathname);
  return "en";
}

export function localizedValue(
  map: any,
  locale: Locale,
  options?: { fallbackToEn?: boolean },
): string {
  if (!map) return "";
  if (typeof map === "string") return map;
  const localized = map[locale];
  if (localized) return localized;
  if (options?.fallbackToEn === false) return "";
  return map.en || "";
}

/** CMS page field: current locale first, optional fallback (no silent EN from CMS). */
export function pageText(
  pageContent: Record<string, any> | undefined,
  key: string,
  locale: Locale,
  fallback = "",
): string {
  const fromCms = localizedValue(pageContent?.[key], locale, { fallbackToEn: false });
  return fromCms || fallback;
}

/** Inline locale map (`{ en, tr, ... }`) with locale-first resolution. */
export function localeMapText(
  map: Record<string, string> | undefined,
  locale: Locale,
  fallback = "",
): string {
  if (!map) return fallback;
  return map[locale] || map.en || fallback;
}

/** CMS collection item field: localized map first, then optional fallback. */
export function itemText(
  item: any,
  key: string,
  locale: Locale,
  fallback = "",
): string {
  if (!item) return fallback;
  const localized = item.localized?.[locale]?.[key];
  if (localized !== undefined && localized !== null && localized !== "") return String(localized);
  const fromMap = localizedValue(item[key], locale, { fallbackToEn: false });
  if (fromMap) return fromMap;
  if (typeof item[key] === "string" && locale === "en") return item[key];
  return fallback;
}

/** CMS button field with optional fallback label. */
export function pageButtonText(value: any, locale: Locale, fallback = ""): string {
  return pageButtonLabel(value, locale) || fallback;
}

/** CMS button field: plain localized string or `{ label, url }` per locale. */
export function pageButtonLabel(value: any, locale: Locale): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value !== "object") return "";
  const localized = value[locale] ?? value.en;
  if (typeof localized === "string") return localized.trim();
  if (localized && typeof localized === "object" && localized.label) {
    return String(localized.label).trim();
  }
  return "";
}

export interface ServiceRailItem {
  title: string;
  desc: string;
}

/** Reads home page service-rail cards from pageContent (`serviceRail_0_title`, `serviceRail_0_desc`, …). */
export function serviceRailFromPageContent(
  pageContent: Record<string, any> | undefined,
  locale: Locale,
  maxItems = 8,
): ServiceRailItem[] {
  if (!pageContent) return [];
  const items: ServiceRailItem[] = [];
  for (let i = 0; i < maxItems; i++) {
    const title = localizedValue(pageContent[`serviceRail_${i}_title`], locale, { fallbackToEn: false }).trim();
    const desc = localizedValue(pageContent[`serviceRail_${i}_desc`], locale, { fallbackToEn: false }).trim();
    if (!title && !desc) break;
    items.push({ title, desc });
  }
  return items;
}

/** Reads home page ecosystem flow nodes from pageContent (`flowNode_0_title`, `flowNode_0_desc`, …). */
export function flowNodesFromPageContent(
  pageContent: Record<string, any> | undefined,
  locale: Locale,
  maxItems = 8,
): ServiceRailItem[] {
  if (!pageContent) return [];
  const items: ServiceRailItem[] = [];
  for (let i = 0; i < maxItems; i++) {
    const title = localizedValue(pageContent[`flowNode_${i}_title`], locale, { fallbackToEn: false }).trim();
    const desc = localizedValue(pageContent[`flowNode_${i}_desc`], locale, { fallbackToEn: false }).trim();
    if (!title && !desc) break;
    items.push({ title, desc });
  }
  return items;
}

/** Reads home page industry lane cards from pageContent (`industryLane_0_title`, `industryLane_0_desc`, …). */
export function industryLanesFromPageContent(
  pageContent: Record<string, any> | undefined,
  locale: Locale,
  maxItems = 8,
): ServiceRailItem[] {
  if (!pageContent) return [];
  const items: ServiceRailItem[] = [];
  for (let i = 0; i < maxItems; i++) {
    const title = localizedValue(pageContent[`industryLane_${i}_title`], locale, { fallbackToEn: false }).trim();
    const desc = localizedValue(pageContent[`industryLane_${i}_desc`], locale, { fallbackToEn: false }).trim();
    if (!title && !desc) break;
    items.push({ title, desc });
  }
  return items;
}

export function normalizeLocalizedList(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(/[\n,]+/g).map((item) => item.trim()).filter(Boolean);
  return [];
}

export function localizeItem(item: any, locale: Locale): any {
  if (!item) return null;
  const localized = item.localized?.[locale] || {};
  const next = { ...item };
  Object.entries(localized).forEach(([key, value]) => {
    if (value === "" || value === undefined || value === null) return;
    next[key] = key === "chips" || key === "deliverables" || key === "applications" ? normalizeLocalizedList(value) : value;
  });
  return next;
}

export function resolveAsset(path: string | undefined): string {
  if (!path) return '';
  
  if (path.startsWith('http')) return path;

  const cleanPath = path.startsWith('/') ? path.substring(1) : path;

  // If it is a local public asset in the repository, serve it directly
  if (cleanPath.startsWith('assets/') || cleanPath.startsWith('pdf-assets/')) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    return cleanBase + cleanPath;
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
  
  // Return absolute URL pointing to our 'assets' bucket
  return `${supabaseUrl}/storage/v1/object/public/assets/${cleanPath}`;
}

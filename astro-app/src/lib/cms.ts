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

export function localizedValue(map: any, locale: Locale): string {
  if (!map) return "";
  if (typeof map === "string") return map;
  return map[locale] || map.en || "";
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
    const title = localizedValue(pageContent[`serviceRail_${i}_title`], locale).trim();
    const desc = localizedValue(pageContent[`serviceRail_${i}_desc`], locale).trim();
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
    const title = localizedValue(pageContent[`flowNode_${i}_title`], locale).trim();
    const desc = localizedValue(pageContent[`flowNode_${i}_desc`], locale).trim();
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

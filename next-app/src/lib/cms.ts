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

export function localizedValue(map: any, locale: Locale): string {
  if (!map) return "";
  if (typeof map === "string") return map;
  return map[locale] || map.en || "";
}

export function normalizeLocalizedList(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

export function localizeItem(item: any, locale: Locale): any {
  if (!item) return null;
  const localized = item.localized?.[locale] || {};
  const next = { ...item };
  Object.entries(localized).forEach(([key, value]) => {
    if (value === "" || value === undefined || value === null) return;
    next[key] = key === "chips" || key === "deliverables" ? normalizeLocalizedList(value) : value;
  });
  return next;
}

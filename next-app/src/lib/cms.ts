import fs from "node:fs";
import path from "node:path";

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

export function fetchContentSync(): any {
  try {
    const dataPath = path.join(process.cwd(), "../data/site-data.json");
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, "utf8"));
    }
  } catch (error) {
    console.error("fetchContentSync failed", error);
  }
  return {};
}

export async function fetchContent(): Promise<any> {
  // If running on the server, load directly from filesystem to avoid HTTP overhead
  if (typeof window === "undefined") {
    return fetchContentSync();
  }
  
  // Client-side fetch
  const res = await fetch("/api/content", { cache: "no-store" });
  if (res.ok) return res.json();
  throw new Error("Failed to fetch content");
}

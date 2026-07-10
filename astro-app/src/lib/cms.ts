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

/** CMS button URL from `{ label, url }` per locale; plain strings use fallback. */
export function pageButtonUrl(value: any, locale: Locale, fallback = ""): string {
  if (!value || typeof value !== "object") return fallback;
  const localized = value[locale] ?? value.en;
  if (localized && typeof localized === "object" && localized.url) {
    return String(localized.url).trim();
  }
  return fallback;
}

/** Locale-prefixed href for a CMS button field. */
export function pageLocaleHref(locale: Locale, value: any, fallbackPath: string): string {
  const path = pageButtonUrl(value, locale, fallbackPath).trim();
  if (!path) return `/${locale}${fallbackPath.startsWith("/") ? fallbackPath : `/${fallbackPath}`}`;

  // External or protocol-relative URLs must not get a locale prefix.
  if (/^(https?:)?\/\//i.test(path) || /^(mailto:|tel:)/i.test(path)) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const segments = normalized.split("/").filter(Boolean);
  const first = segments[0] as Locale | undefined;
  if (first && locales.includes(first)) {
    segments.shift();
  }
  const rest = segments.length ? `/${segments.join("/")}` : "";
  return `/${locale}${rest}`;
}

/** Normalized `{ label, url }` for admin editors and previews. */
export function pageButtonParts(value: any, locale: Locale): { label: string; url: string } {
  if (!value) return { label: "", url: "" };
  if (typeof value === "string") return { label: value.trim(), url: "" };
  if (typeof value !== "object") return { label: "", url: "" };
  const localized = value[locale] ?? value.en;
  if (typeof localized === "string") return { label: localized.trim(), url: "" };
  if (localized && typeof localized === "object") {
    return {
      label: String(localized.label || "").trim(),
      url: String(localized.url || "").trim(),
    };
  }
  return { label: "", url: "" };
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

import { SUPABASE_URL } from "./supabase";

const SUPABASE_STORAGE_PREFIXES = [
  "team/",
  "uploads/",
  "images/",
  "datasheets/",
  "products/",
  "solutions/",
  "news/",
  "offices/",
];

function supabaseStorageUrl(key: string): string {
  if (!SUPABASE_URL) return "";
  return `${SUPABASE_URL}/storage/v1/object/public/assets/${key.replace(/^\/+/, "")}`;
}

/** Map legacy seed paths (assets/team/…) to bucket keys (team/…). */
function legacyStorageKey(cleanPath: string): string | null {
  if (cleanPath.startsWith("assets/team/")) return cleanPath.slice("assets/".length);
  if (cleanPath.startsWith("assets/offices/")) return cleanPath.slice("assets/".length);
  return null;
}

const STATIC_PUBLIC_PREFIXES = [
  "assets/favicon.",
  "assets/willow-mark",
  "assets/hero-",
  "assets/client-logos/",
  "assets/product-cutouts/",
  "pdf-assets/",
];

function isStaticPublicAsset(cleanPath: string): boolean {
  if (!cleanPath.startsWith("assets/") && !cleanPath.startsWith("pdf-assets/")) return false;
  return STATIC_PUBLIC_PREFIXES.some((prefix) => cleanPath.startsWith(prefix));
}

export function resolveAsset(path: string | undefined): string {
  if (!path) return "";

  const trimmed = path.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;

  if (SUPABASE_STORAGE_PREFIXES.some((prefix) => cleanPath.startsWith(prefix))) {
    return supabaseStorageUrl(cleanPath);
  }

  const legacyKey = legacyStorageKey(cleanPath);
  if (legacyKey) return supabaseStorageUrl(legacyKey);

  if (isStaticPublicAsset(cleanPath)) {
    const baseUrl = import.meta.env.BASE_URL || "/";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    return cleanBase + cleanPath;
  }

  if (cleanPath.startsWith("assets/") || cleanPath.startsWith("pdf-assets/")) {
    const fromStorage = supabaseStorageUrl(cleanPath);
    if (fromStorage) return fromStorage;
    const baseUrl = import.meta.env.BASE_URL || "/";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    return cleanBase + cleanPath;
  }

  return supabaseStorageUrl(cleanPath);
}

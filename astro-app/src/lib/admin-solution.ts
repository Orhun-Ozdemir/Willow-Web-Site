import type { Locale } from "@/lib/cms";

export function localizeSolutionItem(item: any, locale: Locale) {
  if (!item) return null;
  const localized = item.localized?.[locale] || {};
  const next = { ...item };
  for (const [key, value] of Object.entries(localized)) {
    if (value === "" || value === undefined || value === null) continue;
    next[key] = value;
  }
  return next;
}

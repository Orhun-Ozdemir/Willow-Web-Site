import translations from "@/data/company-item-translations.json";
import type { Locale } from "@/lib/cms";

export type CompanyItemGroup = "team" | "whyUs" | "principles" | "industries" | "expertise" | "timeline" | "offices";

const keyField: Record<CompanyItemGroup, string> = {
  team: "name",
  whyUs: "title",
  principles: "title",
  industries: "name",
  expertise: "label",
  timeline: "title",
  offices: "country",
};

/**
 * Completes older CMS records whose structured items only contain EN/TR.
 * An editor-provided locale always wins over the maintained fallback copy.
 */
export function localizeCompanyItem(group: CompanyItemGroup, item: any, locale: Locale): any {
  if (!item || typeof item !== "object") return item;
  if (locale === "en") return { ...item };

  const lookupKey = String(item[keyField[group]] || "").trim();
  const groupTranslations = (translations as Record<string, any>)[group] || {};
  const maintained = groupTranslations[lookupKey]?.[locale] || {};
  const cmsLocalized = item.localized?.[locale] || {};

  return { ...item, ...maintained, ...cmsLocalized };
}

export function localizedCompanyList(key: string, items: any[], locale: Locale): any[] {
  const maintained = (translations as Record<string, any>).lists?.[key]?.[locale];
  return Array.isArray(maintained) && maintained.length ? maintained : items;
}

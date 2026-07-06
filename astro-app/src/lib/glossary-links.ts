import { localizeItem, type Locale } from "@/lib/cms";
import { normalizeProductSlug } from "@/lib/product-model";

/** Product slug → glossary term ids (background reference links, not nav). */
const PRODUCT_GLOSSARY_TERMS: Record<string, string[]> = {
  willowbee: ["lorawan", "mcu"],
  willowmod: ["modbus-rtu", "lorawan"],
  willowair: ["lorawan", "sensor-node"],
  willowgps: ["lorawan", "gateway"],
  willowsens: ["sensor-node", "lorawan"],
  willowsonic: ["sensor-node", "lorawan"],
  willowtilt: ["sensor-node", "embedded"],
  willowtemp: ["sensor-node", "lorawan"],
  willowpanic: ["lorawan", "embedded"],
  willowmos: ["modbus-rtu", "lorawan"],
  willowpre: ["lorawan", "embedded"],
  willowane: ["lorawan", "mcu"],
};

const DEFAULT_TERMS = ["lorawan", "embedded"];

export type GlossaryLinkItem = {
  id: string;
  term: string;
  href: string;
};

export function glossaryLinksForProduct(
  slug: string,
  glossary: any[] = [],
  locale: Locale,
): GlossaryLinkItem[] {
  const ids = PRODUCT_GLOSSARY_TERMS[normalizeProductSlug(slug)] || DEFAULT_TERMS;

  return ids
    .map((id) => glossary.find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => {
      const localized = localizeItem(item, locale);
      return {
        id: item.id,
        term: localized.term || item.term,
        href: `/${locale}/glossary#${item.id}`,
      };
    });
}

export const glossaryLinkLabels: Record<string, Record<Locale, string>> = {
  heading: {
    en: "Related terms",
    tr: "İlgili terimler",
    de: "Verwandte Begriffe",
    fr: "Termes associés",
    es: "Términos relacionados",
    it: "Termini correlati",
    ar: "مصطلحات ذات صلة",
    ja: "関連用語",
  },
};

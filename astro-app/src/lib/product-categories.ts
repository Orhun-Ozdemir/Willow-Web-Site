import { localizedValue, type Locale } from "./cms";

export type ProductCategory = {
  key: string;
  sortOrder: number;
  visible: boolean;
  localized: Record<string, { title: string; description: string }>;
};

const category = (
  key: string,
  sortOrder: number,
  titles: Record<string, string>,
  descriptions: Record<string, string>,
): ProductCategory => ({
  key,
  sortOrder,
  visible: true,
  localized: Object.fromEntries(
    Object.keys(titles).map((locale) => [locale, {
      title: titles[locale],
      description: descriptions[locale] || descriptions.en || "",
    }]),
  ),
});

export const DEFAULT_PRODUCT_CATEGORIES: ProductCategory[] = [
  category("modules", 10,
    { en: "Modules", tr: "Modüller", de: "Module", fr: "Modules", es: "Módulos", it: "Moduli", ar: "الوحدات", ja: "通信モジュール" },
    { en: "Embedded LoRaWAN core", tr: "Gömülü LoRaWAN çekirdeği", de: "Eingebetteter LoRaWAN-Kern", fr: "Cœur LoRaWAN embarqué", es: "Núcleo LoRaWAN integrado", it: "Core LoRaWAN integrato", ar: "نواة LoRaWAN مدمجة", ja: "組み込みLoRaWANコア" },
  ),
  category("environment", 20,
    { en: "Environment & Sensing", tr: "Çevre & Ölçüm", de: "Umwelt & Messung", fr: "Environnement & Mesure", es: "Entorno y medición", it: "Ambiente e misura", ar: "البيئة والقياس", ja: "環境・計測" },
    { en: "Level, air, climate and soil", tr: "Seviye, hava, iklim ve toprak", de: "Füllstand, Luft, Klima und Boden", fr: "Niveau, air, climat et sol", es: "Nivel, aire, clima y suelo", it: "Livello, aria, clima e suolo", ar: "المستوى والهواء والمناخ والتربة", ja: "レベル・空気・気候・土壌" },
  ),
  category("tracking", 30,
    { en: "Assets & Safety", tr: "Varlık & Güvenlik", de: "Assets & Sicherheit", fr: "Actifs & Sécurité", es: "Activos y seguridad", it: "Asset e sicurezza", ar: "الأصول والسلامة", ja: "資産・安全" },
    { en: "Location, movement and alerts", tr: "Konum, hareket ve acil durum", de: "Standort, Bewegung und Warnungen", fr: "Localisation, mouvement et alertes", es: "Ubicación, movimiento y alertas", it: "Posizione, movimento e avvisi", ar: "الموقع والحركة والتنبيهات", ja: "位置・動き・アラート" },
  ),
  category("industrial", 40,
    { en: "Industrial Process", tr: "Endüstriyel Proses", de: "Industrieprozess", fr: "Process industriel", es: "Proceso industrial", it: "Processo industriale", ar: "العمليات الصناعية", ja: "産業プロセス" },
    { en: "Pressure, Modbus and machine data", tr: "Basınç, Modbus ve makine verisi", de: "Druck, Modbus und Maschinendaten", fr: "Pression, Modbus et données machine", es: "Presión, Modbus y datos de máquina", it: "Pressione, Modbus e dati macchina", ar: "الضغط وModbus وبيانات الآلات", ja: "圧力・Modbus・機械データ" },
  ),
];

export function normalizeProductCategories(value: unknown): ProductCategory[] {
  const list = Array.isArray(value) && value.length ? value : DEFAULT_PRODUCT_CATEGORIES;
  const seen = new Set<string>();
  return list
    .map((item: any, index) => {
      const key = String(item?.key || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
      if (!key || seen.has(key)) return null;
      seen.add(key);
      return {
        key,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
        visible: item?.visible !== false,
        localized: item?.localized && typeof item.localized === "object" ? item.localized : {},
      } as ProductCategory;
    })
    .filter((item): item is ProductCategory => Boolean(item))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function productCategoriesFromContent(content: any): ProductCategory[] {
  return normalizeProductCategories(content?.meta?.productCategories);
}

export function productCategoryText(category: ProductCategory, locale: Locale) {
  const localized = category.localized?.[locale] || category.localized?.en || {};
  return {
    title: localizedValue(localized.title || category.key, locale),
    description: localizedValue(localized.description || "", locale),
  };
}

export function productCategoryLabel(categories: ProductCategory[], key: string, locale: Locale): string {
  const item = categories.find((category) => category.key === key);
  return item ? productCategoryText(item, locale).title : key;
}

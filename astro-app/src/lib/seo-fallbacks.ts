import type { Locale } from "@/lib/cms";

/**
 * Code-only SEO fallbacks derived from existing localized content. These NEVER
 * write to the CMS/DB: any real value stored in `pageSeo`/`product.seo` keeps
 * priority; these only fill the gap when a locale has no meta yet. No automatic
 * truncation is applied — the goal is search-intent-aligned defaults, not
 * overwriting editorial copy.
 */

const BRAND = "Willow Software";

const strip = (value: unknown): string =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const compactDescription = (value: string, maxLength = 155): string => {
  const clean = strip(value);
  if (Array.from(clean).length <= maxLength) return clean;
  const initial = Array.from(clean).slice(0, maxLength - 1).join("");
  const sentence = initial.match(/^(.+[.!?])(?:\s|$)/)?.[1];
  if (sentence && Array.from(sentence).length >= 90) return sentence;
  const wordBoundary = initial.replace(/\s+\S*$/, "").trim();
  return `${wordBoundary || initial.trimEnd()}…`;
};

const hasBrand = (value: string) => /willow\s*software|willowsoft/i.test(value);

const compactTitle = (primary: string, suffix = ` | ${BRAND}`): string => {
  const cleanPrimary = strip(primary);
  if (!cleanPrimary) return BRAND;
  const withBrand = hasBrand(cleanPrimary) ? cleanPrimary : `${cleanPrimary}${suffix}`;
  // Keep the full localized product/news name whenever possible. If branding
  // pushes the title beyond the common mobile snippet range, the name carries
  // stronger query intent than a repeated brand suffix.
  const candidate = withBrand.length <= 60 ? withBrand : cleanPrimary;
  if (Array.from(candidate).length <= 60) return candidate;
  const chars = Array.from(candidate);
  const initial = chars.slice(0, 59).join("");
  const wordBoundary = initial.replace(/\s+\S*$/, "").trim();
  return `${wordBoundary.length >= 42 ? wordBoundary : initial.trimEnd()}…`;
};

// Factual product description templates used only when neither a CMS meta
// description nor a short description exists for the locale.
const PRODUCT_DESC: Record<Locale, (name: string, category: string) => string> = {
  en: (n, c) => `${n}${c ? ` — ${c}` : ""} by Willow Software. Industrial IoT hardware delivered with firmware, backend and dashboard integration.`,
  tr: (n, c) => `${n}${c ? ` — ${c}` : ""}, Willow Software tarafından geliştirilir. Firmware, backend ve panel entegrasyonuyla sunulan endüstriyel IoT donanımı.`,
  de: (n, c) => `${n}${c ? ` — ${c}` : ""} von Willow Software. Industrielle IoT-Hardware mit Firmware-, Backend- und Dashboard-Integration.`,
  fr: (n, c) => `${n}${c ? ` — ${c}` : ""} par Willow Software. Matériel IoT industriel livré avec firmware, backend et tableau de bord.`,
  es: (n, c) => `${n}${c ? ` — ${c}` : ""} de Willow Software. Hardware de IoT industrial con firmware, backend e integración de panel.`,
  it: (n, c) => `${n}${c ? ` — ${c}` : ""} di Willow Software. Hardware IoT industriale con firmware, backend e integrazione dashboard.`,
  ar: (n, c) => `${n}${c ? ` — ${c}` : ""} من Willow Software. عتاد إنترنت الأشياء الصناعي مع دمج البرامج الثابتة والخادم ولوحة التحكم.`,
  ja: (n, c) => `${n}${c ? `（${c}）` : ""}｜Willow Software の産業用 IoT ハードウェア。ファームウェア・バックエンド・ダッシュボードまで統合提供します。`,
};

const NEWS_DESC: Record<Locale, (title: string) => string> = {
  en: (t) => `${t} — news and updates from Willow Software on embedded hardware and Industrial IoT.`,
  tr: (t) => `${t} — Willow Software'tan gömülü donanım ve Endüstriyel IoT haberleri ve güncellemeleri.`,
  de: (t) => `${t} — Neuigkeiten von Willow Software zu Embedded-Hardware und Industrial IoT.`,
  fr: (t) => `${t} — actualités de Willow Software sur le matériel embarqué et l'IoT industriel.`,
  es: (t) => `${t} — noticias de Willow Software sobre hardware embebido e IoT industrial.`,
  it: (t) => `${t} — notizie di Willow Software su hardware embedded e IoT industriale.`,
  ar: (t) => `${t} — أخبار وتحديثات Willow Software حول العتاد المدمج وإنترنت الأشياء الصناعي.`,
  ja: (t) => `${t}｜組み込みハードウェアと産業用 IoT に関する Willow Software のニュース。`,
};

export interface SeoText {
  title: string;
  description: string;
}

/**
 * Search-intent overrides for the small number of products with verified GSC
 * opportunities. CMS values still win; these are factual, code-level defaults
 * for environments where the product row has no explicit SEO fields.
 */
const PRODUCT_SEO_OVERRIDES: Record<string, Partial<Record<Locale, SeoText>>> = {
  willowpre: {
    en: {
      title: "WillowPre IP67 LoRaWAN Pressure Sensor",
      description: "WillowPre monitors 0–1500 PSI liquid pressure in pipes and tanks with an IP67 enclosure, LoRaWAN 868/915 MHz and up to 10 years of battery life.",
    },
    tr: {
      title: "WillowPre IP67 LoRaWAN Basınç Sensörü",
      description: "WillowPre; boru ve tanklarda 0–1500 PSI sıvı basıncını izler. IP67 gövde, LoRaWAN 868/915 MHz ve 10 yıla varan pil ömrü sunar.",
    },
    de: {
      title: "WillowPre – IP67-LoRaWAN-Drucksensor",
      description: "WillowPre misst 0–1500 PSI Flüssigkeitsdruck in Rohrleitungen und Tanks. Mit IP67, LoRaWAN 868/915 MHz und bis zu 10 Jahren Batterielaufzeit.",
    },
    fr: {
      title: "WillowPre – Capteur de pression LoRaWAN IP67",
      description: "WillowPre mesure la pression des liquides de 0 à 1 500 PSI dans les conduites et réservoirs, avec IP67, LoRaWAN 868/915 MHz et jusqu’à 10 ans d’autonomie.",
    },
    es: {
      title: "WillowPre – Sensor de presión LoRaWAN IP67",
      description: "WillowPre mide de 0 a 1500 PSI de presión de líquidos en tuberías y tanques, con IP67, LoRaWAN 868/915 MHz y hasta 10 años de autonomía.",
    },
    it: {
      title: "WillowPre – Sensore di pressione LoRaWAN IP67",
      description: "WillowPre misura la pressione dei liquidi da 0 a 1500 PSI in tubazioni e serbatoi, con IP67, LoRaWAN 868/915 MHz e fino a 10 anni di autonomia.",
    },
    ar: {
      title: "WillowPre – مستشعر ضغط LoRaWAN بتصنيف IP67",
      description: "يراقب WillowPre ضغط السوائل من 0 إلى 1500 PSI في الأنابيب والخزانات، مع حماية IP67 واتصال LoRaWAN بتردد 868/915 MHz وعمر بطارية يصل إلى 10 سنوات.",
    },
    ja: {
      title: "WillowPre – IP67対応LoRaWAN圧力センサー",
      description: "WillowPreは配管・タンク内の液体圧力を0～1500 PSIで監視。IP67、LoRaWAN 868/915 MHz、最長10年のバッテリー寿命に対応します。",
    },
  },
  willowsonic: {
    en: {
      title: "WillowSonic LoRaWAN Ultrasonic Level Sensor",
      description: "WillowSonic measures liquid, silo, snow and manhole levels up to 7.5 m with IP67, LoRaWAN 868/915 MHz and up to 10 years of battery life.",
    },
    tr: {
      title: "WillowSonic LoRaWAN Ultrasonik Seviye Sensörü",
      description: "WillowSonic; sıvı, silo, kar ve rögar seviyelerini 7,5 metreye kadar ölçer. IP67, LoRaWAN 868/915 MHz ve 10 yıla varan pil ömrü sunar.",
    },
    de: {
      title: "WillowSonic LoRaWAN-Ultraschall-Füllstandssensor",
      description: "WillowSonic misst Flüssigkeits-, Silo-, Schnee- und Schachtfüllstände bis 7,5 m. Mit IP67, LoRaWAN 868/915 MHz und bis zu 10 Jahren Batterielaufzeit.",
    },
    fr: {
      title: "WillowSonic – Capteur de niveau ultrasonique LoRaWAN",
      description: "WillowSonic mesure jusqu’à 7,5 m les niveaux de liquides, silos, neige et regards, avec IP67, LoRaWAN 868/915 MHz et jusqu’à 10 ans d’autonomie.",
    },
    es: {
      title: "WillowSonic – Sensor ultrasónico de nivel LoRaWAN",
      description: "WillowSonic mide hasta 7,5 m en líquidos, silos, nieve y arquetas, con IP67, LoRaWAN 868/915 MHz y hasta 10 años de autonomía.",
    },
    it: {
      title: "WillowSonic – Sensore di livello LoRaWAN a ultrasuoni",
      description: "WillowSonic misura fino a 7,5 m i livelli di liquidi, sili, neve e pozzetti, con IP67, LoRaWAN 868/915 MHz e fino a 10 anni di autonomia.",
    },
    ar: {
      title: "WillowSonic – مستشعر مستوى LoRaWAN بالموجات فوق الصوتية",
      description: "يقيس WillowSonic مستويات السوائل والصوامع والثلوج وغرف التفتيش حتى 7.5 متر، مع حماية IP67 واتصال LoRaWAN بتردد 868/915 MHz وعمر بطارية يصل إلى 10 سنوات.",
    },
    ja: {
      title: "WillowSonic – LoRaWAN超音波レベルセンサー",
      description: "WillowSonicは液体、サイロ、積雪、マンホールのレベルを最大7.5 mまで測定。IP67、LoRaWAN 868/915 MHz、最長10年の電池寿命に対応します。",
    },
  },
};

/**
 * Builds a product title/description fallback from the localized name, category
 * label and short description. `seo` values (already resolved by the caller)
 * take priority; only missing fields are generated.
 */
export function productSeoFallback(
  locale: Locale,
  opts: { productId?: string; name: string; categoryLabel?: string; shortDescription?: string; seoTitle?: string; metaDescription?: string },
): SeoText {
  const productId = String(opts.productId || "").toLowerCase();
  const name = strip(opts.name);
  const category = strip(opts.categoryLabel);
  const shortDesc = strip(opts.shortDescription);
  const override = PRODUCT_SEO_OVERRIDES[productId]?.[locale];

  const descriptor = PRODUCT_TITLE_DESCRIPTORS[productId]?.[locale]
    || PRODUCT_TITLE_DESCRIPTORS[productId]?.en
    || category;
  const generatedTitle = compactTitle(override?.title || `${name}${descriptor ? ` ${descriptor}` : ""}`);

  const template = (PRODUCT_DESC[locale] || PRODUCT_DESC.en)(name, category);
  const generatedDescription = override?.description || shortDesc || template;

  return {
    title: opts.seoTitle ? compactTitle(opts.seoTitle) : generatedTitle,
    description: compactDescription(strip(opts.metaDescription) || generatedDescription),
  };
}

/**
 * Builds a news title/description fallback from the localized title and excerpt.
 */
export function newsSeoFallback(
  locale: Locale,
  opts: { title: string; excerpt?: string; seoTitle?: string; metaDescription?: string },
): SeoText {
  const title = strip(opts.title);
  const excerpt = strip(opts.excerpt);

  const generatedTitle = compactTitle(title);
  const generatedDescription = excerpt || (NEWS_DESC[locale] || NEWS_DESC.en)(title);

  return {
    title: opts.seoTitle ? compactTitle(opts.seoTitle) : generatedTitle,
    description: compactDescription(strip(opts.metaDescription) || generatedDescription),
  };
}

const PRODUCT_TITLE_DESCRIPTORS: Record<string, Partial<Record<Locale, string>>> = {
  willowbee: { en: "LoRaWAN MCU Module", tr: "LoRaWAN MCU Modülü", de: "LoRaWAN-MCU-Modul", fr: "Module MCU LoRaWAN", es: "Módulo MCU LoRaWAN", it: "Modulo MCU LoRaWAN", ar: "وحدة MCU LoRaWAN", ja: "LoRaWAN MCUモジュール" },
  willowsonic: { en: "LoRaWAN Ultrasonic Level Sensor", tr: "LoRaWAN Ultrasonik Seviye Sensörü", de: "LoRaWAN-Ultraschall-Füllstandssensor", fr: "Capteur de niveau ultrasonique LoRaWAN", es: "Sensor ultrasónico de nivel LoRaWAN", it: "Sensore di livello LoRaWAN a ultrasuoni", ar: "مستشعر مستوى LoRaWAN بالموجات فوق الصوتية", ja: "LoRaWAN超音波レベルセンサー" },
  willowair: { en: "LoRaWAN Air Quality Sensor", tr: "LoRaWAN Hava Kalitesi Sensörü", de: "LoRaWAN-Luftqualitätssensor", fr: "Capteur d’air LoRaWAN", es: "Sensor de aire LoRaWAN", it: "Sensore aria LoRaWAN", ar: "مستشعر جودة الهواء LoRaWAN", ja: "LoRaWAN空気品質センサー" },
  willowgps: { en: "LoRaWAN GPS Tracker", tr: "LoRaWAN GPS Takip Modülü", de: "LoRaWAN-GPS-Tracker", fr: "Traceur GPS LoRaWAN", es: "Rastreador GPS LoRaWAN", it: "Tracker GPS LoRaWAN", ar: "متعقب GPS LoRaWAN", ja: "LoRaWAN GPSトラッカー" },
  willowpanic: { en: "LoRaWAN Panic Button", tr: "LoRaWAN Panik Butonu", de: "LoRaWAN-Paniktaster", fr: "Bouton d’alerte LoRaWAN", es: "Botón de pánico LoRaWAN", it: "Pulsante di emergenza LoRaWAN", ar: "زر طوارئ LoRaWAN", ja: "LoRaWANパニックボタン" },
  willowsens: { en: "LoRaWAN Door Sensor", tr: "LoRaWAN Kapı Sensörü", de: "LoRaWAN-Türsensor", fr: "Capteur de porte LoRaWAN", es: "Sensor de puerta LoRaWAN", it: "Sensore porta LoRaWAN", ar: "مستشعر باب LoRaWAN", ja: "LoRaWANドアセンサー" },
  willowtilt: { en: "LoRaWAN Tilt Sensor", tr: "LoRaWAN Eğim Sensörü", de: "LoRaWAN-Neigungssensor", fr: "Capteur d’inclinaison LoRaWAN", es: "Sensor de inclinación LoRaWAN", it: "Sensore di inclinazione LoRaWAN", ar: "مستشعر ميل LoRaWAN", ja: "LoRaWAN傾斜センサー" },
  willowtemp: { en: "LoRaWAN Temperature Sensor", tr: "LoRaWAN Sıcaklık Sensörü", de: "LoRaWAN-Temperatursensor", fr: "Capteur de température LoRaWAN", es: "Sensor de temperatura LoRaWAN", it: "Sensore di temperatura LoRaWAN", ar: "مستشعر حرارة LoRaWAN", ja: "LoRaWAN温度センサー" },
  willowmod: { en: "LoRaWAN Modbus Bridge", tr: "LoRaWAN Modbus Köprüsü", de: "LoRaWAN-Modbus-Bridge", fr: "Passerelle Modbus LoRaWAN", es: "Puente Modbus LoRaWAN", it: "Bridge Modbus LoRaWAN", ar: "جسر Modbus LoRaWAN", ja: "LoRaWAN Modbusブリッジ" },
  willowmos: { en: "LoRaWAN Soil Moisture Sensor", tr: "LoRaWAN Toprak Nem Sensörü", de: "LoRaWAN-Bodenfeuchtesensor", fr: "Capteur d’humidité du sol LoRaWAN", es: "Sensor de humedad del suelo LoRaWAN", it: "Sensore umidità terreno LoRaWAN", ar: "مستشعر رطوبة التربة LoRaWAN", ja: "LoRaWAN土壌水分センサー" },
  willowpre: { en: "IP67 LoRaWAN Pressure Sensor", tr: "IP67 LoRaWAN Basınç Sensörü", de: "IP67-LoRaWAN-Drucksensor", fr: "Capteur de pression LoRaWAN IP67", es: "Sensor de presión LoRaWAN IP67", it: "Sensore di pressione LoRaWAN IP67", ar: "مستشعر ضغط LoRaWAN بتصنيف IP67", ja: "IP67対応LoRaWAN圧力センサー" },
  willowane: { en: "LoRaWAN Anemometer", tr: "LoRaWAN Anemometre", de: "LoRaWAN-Anemometer", fr: "Anémomètre LoRaWAN", es: "Anemómetro LoRaWAN", it: "Anemometro LoRaWAN", ar: "مقياس رياح LoRaWAN", ja: "LoRaWAN風速計" },
};

/** Search-intent descriptor for product headings, image alternatives and links. */
export function productSearchDescriptor(productId: string, locale: Locale): string {
  const descriptors = PRODUCT_TITLE_DESCRIPTORS[String(productId || "").toLowerCase()];
  return descriptors?.[locale] || descriptors?.en || "";
}

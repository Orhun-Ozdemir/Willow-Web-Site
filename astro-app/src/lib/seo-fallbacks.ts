import type { Locale } from "@/lib/cms";

/**
 * Code-only SEO fallbacks derived from existing localized content. These NEVER
 * write to the CMS/DB: any real value stored in `pageSeo`/`product.seo` keeps
 * priority; these only fill the gap when a locale has no meta yet. No automatic
 * truncation is applied — the goal is search-intent-aligned defaults, not
 * overwriting editorial copy.
 */

const BRAND = "WillowSoft";

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

const hasBrand = (value: string) => /willowsoft/i.test(value);

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
  en: (n, c) => `${n}${c ? ` — ${c}` : ""} by WillowSoft. Industrial IoT hardware delivered with firmware, backend and dashboard integration.`,
  tr: (n, c) => `${n}${c ? ` — ${c}` : ""}, WillowSoft tarafından geliştirilir. Firmware, backend ve panel entegrasyonuyla sunulan endüstriyel IoT donanımı.`,
  de: (n, c) => `${n}${c ? ` — ${c}` : ""} von WillowSoft. Industrielle IoT-Hardware mit Firmware-, Backend- und Dashboard-Integration.`,
  fr: (n, c) => `${n}${c ? ` — ${c}` : ""} par WillowSoft. Matériel IoT industriel livré avec firmware, backend et tableau de bord.`,
  es: (n, c) => `${n}${c ? ` — ${c}` : ""} de WillowSoft. Hardware de IoT industrial con firmware, backend e integración de panel.`,
  it: (n, c) => `${n}${c ? ` — ${c}` : ""} di WillowSoft. Hardware IoT industriale con firmware, backend e integrazione dashboard.`,
  ar: (n, c) => `${n}${c ? ` — ${c}` : ""} من WillowSoft. عتاد إنترنت الأشياء الصناعي مع دمج البرامج الثابتة والخادم ولوحة التحكم.`,
  ja: (n, c) => `${n}${c ? `（${c}）` : ""}｜WillowSoft の産業用 IoT ハードウェア。ファームウェア・バックエンド・ダッシュボードまで統合提供します。`,
};

const NEWS_DESC: Record<Locale, (title: string) => string> = {
  en: (t) => `${t} — news and updates from WillowSoft on embedded hardware and Industrial IoT.`,
  tr: (t) => `${t} — WillowSoft'tan gömülü donanım ve Endüstriyel IoT haberleri ve güncellemeleri.`,
  de: (t) => `${t} — Neuigkeiten von WillowSoft zu Embedded-Hardware und Industrial IoT.`,
  fr: (t) => `${t} — actualités de WillowSoft sur le matériel embarqué et l'IoT industriel.`,
  es: (t) => `${t} — noticias de WillowSoft sobre hardware embebido e IoT industrial.`,
  it: (t) => `${t} — notizie di WillowSoft su hardware embedded e IoT industriale.`,
  ar: (t) => `${t} — أخبار وتحديثات WillowSoft حول العتاد المدمج وإنترنت الأشياء الصناعي.`,
  ja: (t) => `${t}｜組み込みハードウェアと産業用 IoT に関する WillowSoft のニュース。`,
};

export interface SeoText {
  title: string;
  description: string;
}

/**
 * Builds a product title/description fallback from the localized name, category
 * label and short description. `seo` values (already resolved by the caller)
 * take priority; only missing fields are generated.
 */
export function productSeoFallback(
  locale: Locale,
  opts: { productId?: string; name: string; categoryLabel?: string; shortDescription?: string; seoTitle?: string; metaDescription?: string },
): SeoText {
  const name = strip(opts.name);
  const category = strip(opts.categoryLabel);
  const shortDesc = strip(opts.shortDescription);

  const descriptor = PRODUCT_TITLE_DESCRIPTORS[opts.productId || ""]?.[locale]
    || PRODUCT_TITLE_DESCRIPTORS[opts.productId || ""]?.en
    || category;
  const generatedTitle = compactTitle(`${name}${descriptor ? ` ${descriptor}` : ""}`);

  const template = (PRODUCT_DESC[locale] || PRODUCT_DESC.en)(name, category);
  const generatedDescription = shortDesc || template;

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
  willowsonic: { en: "LoRaWAN Level Sensor", tr: "LoRaWAN Seviye Sensörü", de: "LoRaWAN-Füllstandssensor", fr: "Capteur de niveau LoRaWAN", es: "Sensor de nivel LoRaWAN", it: "Sensore di livello LoRaWAN", ar: "مستشعر مستوى LoRaWAN", ja: "LoRaWANレベルセンサー" },
  willowair: { en: "LoRaWAN Air Quality Sensor", tr: "LoRaWAN Hava Kalitesi Sensörü", de: "LoRaWAN-Luftqualitätssensor", fr: "Capteur d’air LoRaWAN", es: "Sensor de aire LoRaWAN", it: "Sensore aria LoRaWAN", ar: "مستشعر جودة الهواء LoRaWAN", ja: "LoRaWAN空気品質センサー" },
  willowgps: { en: "LoRaWAN GPS Tracker", tr: "LoRaWAN GPS Takip Modülü", de: "LoRaWAN-GPS-Tracker", fr: "Traceur GPS LoRaWAN", es: "Rastreador GPS LoRaWAN", it: "Tracker GPS LoRaWAN", ar: "متعقب GPS LoRaWAN", ja: "LoRaWAN GPSトラッカー" },
  willowpanic: { en: "LoRaWAN Panic Button", tr: "LoRaWAN Panik Butonu", de: "LoRaWAN-Paniktaster", fr: "Bouton d’alerte LoRaWAN", es: "Botón de pánico LoRaWAN", it: "Pulsante di emergenza LoRaWAN", ar: "زر طوارئ LoRaWAN", ja: "LoRaWANパニックボタン" },
  willowsens: { en: "LoRaWAN Door Sensor", tr: "LoRaWAN Kapı Sensörü", de: "LoRaWAN-Türsensor", fr: "Capteur de porte LoRaWAN", es: "Sensor de puerta LoRaWAN", it: "Sensore porta LoRaWAN", ar: "مستشعر باب LoRaWAN", ja: "LoRaWANドアセンサー" },
  willowtilt: { en: "LoRaWAN Tilt Sensor", tr: "LoRaWAN Eğim Sensörü", de: "LoRaWAN-Neigungssensor", fr: "Capteur d’inclinaison LoRaWAN", es: "Sensor de inclinación LoRaWAN", it: "Sensore di inclinazione LoRaWAN", ar: "مستشعر ميل LoRaWAN", ja: "LoRaWAN傾斜センサー" },
  willowtemp: { en: "LoRaWAN Temperature Sensor", tr: "LoRaWAN Sıcaklık Sensörü", de: "LoRaWAN-Temperatursensor", fr: "Capteur de température LoRaWAN", es: "Sensor de temperatura LoRaWAN", it: "Sensore di temperatura LoRaWAN", ar: "مستشعر حرارة LoRaWAN", ja: "LoRaWAN温度センサー" },
  willowmod: { en: "LoRaWAN Modbus Bridge", tr: "LoRaWAN Modbus Köprüsü", de: "LoRaWAN-Modbus-Bridge", fr: "Passerelle Modbus LoRaWAN", es: "Puente Modbus LoRaWAN", it: "Bridge Modbus LoRaWAN", ar: "جسر Modbus LoRaWAN", ja: "LoRaWAN Modbusブリッジ" },
  willowmos: { en: "LoRaWAN Soil Moisture Sensor", tr: "LoRaWAN Toprak Nem Sensörü", de: "LoRaWAN-Bodenfeuchtesensor", fr: "Capteur d’humidité du sol LoRaWAN", es: "Sensor de humedad del suelo LoRaWAN", it: "Sensore umidità terreno LoRaWAN", ar: "مستشعر رطوبة التربة LoRaWAN", ja: "LoRaWAN土壌水分センサー" },
  willowpre: { en: "LoRaWAN Pressure Sensor", tr: "LoRaWAN Basınç Sensörü", de: "LoRaWAN-Drucksensor", fr: "Capteur de pression LoRaWAN", es: "Sensor de presión LoRaWAN", it: "Sensore di pressione LoRaWAN", ar: "مستشعر ضغط LoRaWAN", ja: "LoRaWAN圧力センサー" },
  willowane: { en: "LoRaWAN Anemometer", tr: "LoRaWAN Anemometre", de: "LoRaWAN-Anemometer", fr: "Anémomètre LoRaWAN", es: "Anemómetro LoRaWAN", it: "Anemometro LoRaWAN", ar: "مقياس رياح LoRaWAN", ja: "LoRaWAN風速計" },
};

/** Search-intent descriptor for product headings, image alternatives and links. */
export function productSearchDescriptor(productId: string, locale: Locale): string {
  const descriptors = PRODUCT_TITLE_DESCRIPTORS[String(productId || "").toLowerCase()];
  return descriptors?.[locale] || descriptors?.en || "";
}

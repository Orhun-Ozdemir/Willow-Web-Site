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
  opts: { name: string; categoryLabel?: string; shortDescription?: string; seoTitle?: string; metaDescription?: string },
): SeoText {
  const name = strip(opts.name);
  const category = strip(opts.categoryLabel);
  const shortDesc = strip(opts.shortDescription);

  const generatedTitle = compactTitle(name);

  const template = (PRODUCT_DESC[locale] || PRODUCT_DESC.en)(name, category);
  const generatedDescription = shortDesc || template;

  return {
    title: opts.seoTitle ? compactTitle(opts.seoTitle) : generatedTitle,
    description: strip(opts.metaDescription) || generatedDescription,
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
    description: strip(opts.metaDescription) || generatedDescription,
  };
}

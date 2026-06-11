import { locales, type Locale } from "@/lib/cms";

export const SITE_ORIGIN = "https://willowsoft.co";
export const SITE_NAME = "WillowSoft";
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/hero-industrial-iot.png`;

export const OG_LOCALE_MAP: Record<Locale, string> = {
  en: "en_US",
  tr: "tr_TR",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
  it: "it_IT",
  ar: "ar_AR",
  ja: "ja_JP",
};

export interface Alternate {
  hreflang: string;
  href: string;
}

/**
 * Builds hreflang alternates for a locale-relative sub path
 * (e.g. "" for home, "/products", "/news/some-slug").
 * Pass `slugByLocale` when the slug differs per locale (localized news slugs).
 */
export function buildAlternates(subPath: string, slugByLocale?: Partial<Record<Locale, string>>): Alternate[] {
  const hrefFor = (locale: Locale) => {
    const path = slugByLocale ? slugByLocale[locale] ?? subPath : subPath;
    return `${SITE_ORIGIN}/${locale}${path}`;
  };
  const alternates: Alternate[] = locales.map((locale) => ({ hreflang: locale, href: hrefFor(locale) }));
  alternates.push({ hreflang: "x-default", href: hrefFor("en") });
  return alternates;
}

export interface SeoProps {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  noindex: boolean;
  alternates: Alternate[];
}

/**
 * Resolves SEO props for a static page from `pageSeo` in site-data.json,
 * falling back to the English entry and finally to the provided defaults.
 */
export function pageSeo(
  content: any,
  pageKey: string,
  locale: Locale,
  subPath: string,
  fallbackTitle: string,
  fallbackDescription: string,
): SeoProps {
  const seo = content.pageSeo?.[pageKey]?.[locale] || {};
  const seoEn = content.pageSeo?.[pageKey]?.en || {};
  return {
    title: seo.seoTitle || seoEn.seoTitle || fallbackTitle,
    description: seo.metaDescription || seoEn.metaDescription || fallbackDescription,
    canonical: seo.canonical || `${SITE_ORIGIN}/${locale}${subPath}`,
    ogTitle: seo.ogTitle || seo.seoTitle || seoEn.ogTitle || fallbackTitle,
    ogDescription: seo.ogDescription || seo.metaDescription || seoEn.ogDescription || fallbackDescription,
    ogImage: seo.ogImage || seoEn.ogImage || DEFAULT_OG_IMAGE,
    noindex: Boolean(seo.noindex),
    alternates: buildAlternates(subPath),
  };
}

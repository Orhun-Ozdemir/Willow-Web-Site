import { locales, type Locale } from "@/lib/cms";
import { officesForContact } from "@/lib/company-contact";

export const SITE_ORIGIN = "https://www.willowsoft.co";
export const SITE_NAME = "WillowSoft";
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/hero-industrial-iot.jpg`;

/**
 * Forces any canonical/absolute URL onto the production host + scheme and strips
 * a trailing slash (root excepted). CMS rows may still hold legacy apex-host
 * canonicals; this normalizes the *rendered* output without touching stored data.
 */
export function normalizeCanonical(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(url, SITE_ORIGIN);
  } catch {
    return url ?? undefined;
  }
  const origin = new URL(SITE_ORIGIN);
  // Only rewrite our own willowsoft hosts (apex or www); leave foreign hosts alone.
  if (/(^|\.)willowsoft\.co$/i.test(parsed.hostname)) {
    parsed.protocol = origin.protocol;
    parsed.host = origin.host;
  }
  if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  }
  return parsed.toString();
}

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

export const ORGANIZATION_SCHEMA = {
  "@type": "Organization",
  "@id": `${SITE_ORIGIN}/#org`,
  name: "WillowSoft",
  alternateName: "WILLOWSOFT",
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/assets/willow-mark-transparent.png`,
  slogan: "Embedded Systems & IoT Connectivity",
  description:
    "Embedded hardware and Industrial IoT engineering company. WillowSoft designs LoRaWAN devices, firmware, backend APIs, dashboards, mobile apps and VR layers as one connected system.",
  foundingDate: "2020",
  areaServed: "Worldwide",
  address: { "@type": "PostalAddress", addressCountry: "TR" },
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@willowsoft.co",
    contactType: "Sales",
    areaServed: ["TR", "GB", "US", "DE", "IT", "JP", "SA"],
    availableLanguage: ["English", "Turkish", "German", "French", "Spanish", "Italian", "Arabic", "Japanese"],
  },
};

const OFFICE_COUNTRY_CODE: Record<string, string> = { "office-tr": "TR", "office-uk": "GB" };

/**
 * Returns the Organization node enriched with `location` Place nodes derived at
 * runtime from live `companyFacts.officesList`. Reads only — never writes to the
 * DB. Falls back to the static ORGANIZATION_SCHEMA when no offices are present.
 */
export function organizationWithOffices(companyFacts: Record<string, any> | undefined, locale: Locale) {
  const offices = officesForContact(companyFacts || {}, locale).filter((o) => o.address || o.country);
  if (!offices.length) return ORGANIZATION_SCHEMA;
  const location = offices.map((office) => {
    const address: Record<string, any> = { "@type": "PostalAddress" };
    if (office.address) address.streetAddress = office.address;
    const countryCode = OFFICE_COUNTRY_CODE[office.id];
    if (countryCode) address.addressCountry = countryCode;
    else if (office.country) address.addressCountry = office.country;
    const place: Record<string, any> = { "@type": "Place", address };
    if (office.country) place.name = office.country;
    if (office.phone) place.telephone = office.phone;
    return place;
  });
  return { ...ORGANIZATION_SCHEMA, location };
}

export const WEBSITE_SCHEMA = {
  "@type": "WebSite",
  "@id": `${SITE_ORIGIN}/#site`,
  url: SITE_ORIGIN,
  name: "WillowSoft",
  publisher: { "@id": `${SITE_ORIGIN}/#org` },
  inLanguage: [...locales],
};

/** Page-level node (AboutPage, ContactPage, CollectionPage…) tied to the org/site graph. */
export function webPageNode(type: string, canonical: string, name: string, description: string, locale: Locale) {
  return {
    "@type": type,
    "@id": canonical,
    url: canonical,
    name,
    description,
    inLanguage: locale,
    isPartOf: { "@id": `${SITE_ORIGIN}/#site` },
  };
}

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
  nofollow?: boolean;
  nosnippet?: boolean;
  alternates: Alternate[];
}

/**
 * Builds the `robots` meta content from CMS directives. Indexable pages keep the
 * rich snippet/preview hints; noindex/nofollow/nosnippet are honored per-page.
 */
export function robotsMeta(opts: { noindex?: boolean; nofollow?: boolean; nosnippet?: boolean }): string {
  const parts: string[] = [];
  parts.push(opts.noindex ? "noindex" : "index");
  parts.push(opts.nofollow ? "nofollow" : "follow");
  if (opts.nosnippet) {
    parts.push("nosnippet");
  } else if (!opts.noindex) {
    parts.push("max-snippet:-1", "max-image-preview:large", "max-video-preview:-1");
  }
  return parts.join(", ");
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
    canonical: normalizeCanonical(seo.canonical) || `${SITE_ORIGIN}/${locale}${subPath}`,
    ogTitle: seo.ogTitle || seo.seoTitle || seoEn.ogTitle || fallbackTitle,
    ogDescription: seo.ogDescription || seo.metaDescription || seoEn.ogDescription || fallbackDescription,
    ogImage: seo.ogImage || seoEn.ogImage || DEFAULT_OG_IMAGE,
    noindex: Boolean(seo.noindex),
    nofollow: Boolean(seo.nofollow),
    nosnippet: Boolean(seo.nosnippet),
    alternates: buildAlternates(subPath),
  };
}

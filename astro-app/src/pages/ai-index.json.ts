import type { APIRoute } from "astro";
import { loadContent } from "@/lib/content";
import { itemText, localizedValue, locales, type Locale } from "@/lib/cms";
import { SITE_ORIGIN } from "@/lib/seo";
import { stripHtml } from "@/lib/ai-search";
import { productCategoriesFromContent } from "@/lib/product-categories";
import { categorySearchName, categorySeoDescription, LORAWAN_LANDING_COPY } from "@/lib/lorawan-landing";

const staticPages = [
  { key: "home", path: "", type: "HomePage" },
  { key: "products", path: "/products", type: "CollectionPage" },
  { key: "lorawanSensors", path: "/lorawan-sensors", type: "CollectionPage" },
  { key: "services", path: "/services", type: "ServicePage" },
  { key: "solutions", path: "/solutions", type: "CollectionPage" },
  { key: "company", path: "/company", type: "AboutPage" },
  { key: "news", path: "/news", type: "CollectionPage" },
  { key: "glossary", path: "/glossary", type: "DefinedTermSet" },
  { key: "contact", path: "/contact", type: "ContactPage" },
  { key: "startProject", path: "/start-project", type: "WebPage" },
];

const urlFor = (locale: Locale, path: string) => `${SITE_ORIGIN}/${locale}${path}`;

export const GET: APIRoute = async () => {
  const content = await loadContent();
  const updatedAt = content.meta?.updatedAt || new Date().toISOString();

  const pages = locales.flatMap((locale) =>
    staticPages.map((page) => {
      const seo = content.pageSeo?.[page.key]?.[locale] || content.pageSeo?.[page.key]?.en || {};
      const lorawanCopy = LORAWAN_LANDING_COPY[locale] || LORAWAN_LANDING_COPY.en;
      return {
        type: page.type,
        locale,
        title: seo.seoTitle || (page.key === "lorawanSensors" ? lorawanCopy.title : page.key),
        description: seo.metaDescription || (page.key === "lorawanSensors" ? lorawanCopy.description : ""),
        url: urlFor(locale, page.path),
      };
    }),
  );

  const productCategories = productCategoriesFromContent(content).filter((category) => category.visible);
  const categoryPages = locales.flatMap((locale) =>
    productCategories.map((category) => {
      const productCount = (content.products || []).filter((product: any) => product.visible !== false && product.category === category.key).length;
      return {
        type: "CollectionPage",
        locale,
        title: categorySearchName(category.key, locale),
        description: categorySeoDescription(category.key, locale, productCount),
        url: urlFor(locale, `/products/category/${category.key}`),
      };
    }),
  );

  const products = locales.flatMap((locale) =>
    (content.products || []).map((product: any) => ({
      type: "Product",
      locale,
      name: localizedValue(product.title, locale),
      description: stripHtml(localizedValue(product.shortDescription, locale)),
      category: product.category || "Product",
      url: urlFor(locale, `/products/${product.slug || product.id}`),
    })),
  );

  const news = locales.flatMap((locale) =>
    (content.news || []).map((item: any) => ({
      type: "NewsArticle",
      locale,
      headline: localizedValue(item.title, locale),
      description: stripHtml(localizedValue(item.excerpt, locale)),
      datePublished: item.date || "",
      url: urlFor(locale, `/news/${itemText(item, "slug", locale, item.slug?.en || item.slug || item.id)}`),
    })),
  );

  return new Response(
    JSON.stringify(
      {
        site: SITE_ORIGIN,
        name: "WillowSoft",
        updatedAt,
        purpose:
          "Machine-readable public index for AI search, answer engines and internal retrieval systems. Prefer canonical HTML pages for citation.",
        languages: locales,
        capabilities: [
          "embedded hardware design",
          "firmware engineering",
          "LoRaWAN and RF connectivity",
          "backend APIs",
          "PostgreSQL database architecture",
          "web dashboards and admin panels",
          "mobile apps",
          "VR and simulation",
        ],
        pages: [...pages, ...categoryPages],
        products,
        news,
      },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
};

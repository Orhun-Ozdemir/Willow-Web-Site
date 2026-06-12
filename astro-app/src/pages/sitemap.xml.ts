import type { APIRoute } from "astro";
import { loadContent } from "@/lib/content";
import { localizedValue, locales, type Locale } from "@/lib/cms";
import { SITE_ORIGIN } from "@/lib/seo";

const STATIC_PAGES: { key: string; subPath: string }[] = [
  { key: "home", subPath: "" },
  { key: "solutions", subPath: "/solutions" },
  { key: "services", subPath: "/services" },
  { key: "products", subPath: "/products" },
  { key: "company", subPath: "/company" },
  { key: "news", subPath: "/news" },
  { key: "glossary", subPath: "/glossary" },
  { key: "contact", subPath: "/contact" },
  { key: "startProject", subPath: "/start-project" },
];

interface UrlEntry {
  loc: string;
  changefreq?: string;
  priority?: string;
  lastmod?: string;
  alternates: { hreflang: string; href: string }[];
}

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async () => {
  const content = await loadContent();
  const lastmod = content.meta?.updatedAt ? String(content.meta.updatedAt).slice(0, 10) : undefined;
  const entries: UrlEntry[] = [];

  const pushLocalizedSet = (
    hrefFor: (locale: Locale) => string,
    extra: Partial<UrlEntry> = {},
  ) => {
    const alternates = locales.map((l) => ({ hreflang: l as string, href: hrefFor(l) }));
    alternates.push({ hreflang: "x-default", href: hrefFor("en") });
    for (const locale of locales) {
      entries.push({ loc: hrefFor(locale), alternates, lastmod, ...extra });
    }
  };

  for (const page of STATIC_PAGES) {
    const seoEn = content.pageSeo?.[page.key]?.en || {};
    pushLocalizedSet((l) => `${SITE_ORIGIN}/${l}${page.subPath}`, {
      changefreq: seoEn.changefreq,
      priority: seoEn.priority,
    });
  }

  for (const product of content.products || []) {
    const slug = product.slug || product.id;
    pushLocalizedSet((l) => `${SITE_ORIGIN}/${l}/products/${slug}`, {
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  for (const item of content.news || []) {
    pushLocalizedSet(
      (l) => `${SITE_ORIGIN}/${l}/news/${localizedValue(item.slug, l) || item.slug?.en || item.id}`,
      { changefreq: "yearly", priority: "0.5", lastmod: item.date || lastmod },
    );
  }

  const body = entries
    .map((entry) => {
      const lines = [`  <url>`, `    <loc>${escapeXml(entry.loc)}</loc>`];
      for (const alt of entry.alternates) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXml(alt.href)}"/>`);
      }
      if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority) lines.push(`    <priority>${entry.priority}</priority>`);
      lines.push(`  </url>`);
      return lines.join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};

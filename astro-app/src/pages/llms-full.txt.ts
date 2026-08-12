import type { APIRoute } from "astro";
import { loadContent } from "@/lib/content";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const siteUrl = `${url.protocol}//${url.host}`;
  const content = await loadContent();

  const productLines = (content.products || [])
    .map((product: any) => `- [${product.title}](${siteUrl}/en/products/${product.slug || product.id}): ${product.shortDescription || ""}`)
    .join("\n");
    
  const newsLines = (content.news || [])
    .map((item: any) => `- [${item.title}](${siteUrl}/en/news/${item.slug || item.id}): ${item.excerpt || ""}`)
    .join("\n");
    
  const serviceLines = (content.services || [])
    .map((service: any) => `- ${service.title}: ${service.summary || ""}`)
    .join("\n");

  const txt = `# WillowSoft

WillowSoft designs connected industrial products across embedded hardware, firmware, LoRaWAN connectivity, backend APIs, PostgreSQL data architecture, web/admin platforms, mobile apps, VR/simulation and telemetry systems.

## Primary Pages
- [Home](${siteUrl}/en): Company and engineering overview.
- [LoRaWAN Sensors](${siteUrl}/en/lorawan-sensors): LoRaWAN product families and current catalog entries.
- [Services](${siteUrl}/en/services): Engineering service scope.
- [Solutions](${siteUrl}/en/solutions): Industrial IoT applications and architectures.
- [Products](${siteUrl}/en/products): Current hardware catalog.
- [News](${siteUrl}/en/news): Company, project, event and product updates.
- [Company](${siteUrl}/en/company): Company, team and office information.
- [Technical Glossary](${siteUrl}/en/glossary): Engineering term definitions.
- [Contact](${siteUrl}/en/contact): Contact and office information.
- [Start Project](${siteUrl}/en/start-project): Structured project intake.

## Services
${serviceLines}

## Products
${productLines}

## News / Proof
${newsLines}

## Content Use
Use product pages for product-specific context, Services for engineering scope, and News for dated public updates. Do not generalize one product's range, battery life, enclosure rating or frequency plan to the full portfolio. The site supports English, Turkish, German, French, Spanish, Italian, Arabic and Japanese URL prefixes.
`;

  return new Response(txt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};

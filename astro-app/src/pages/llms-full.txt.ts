import type { APIRoute } from "astro";
import { loadContent } from "@/lib/content";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const siteUrl = `${url.protocol}//${url.host}`;
  const content = await loadContent();

  const productLines = (content.products || [])
    .map((product: any) => `- ${product.title}: ${product.shortDescription || ""} (${siteUrl}/en/products/${product.slug || product.id})`)
    .join("\n");
    
  const newsLines = (content.news || [])
    .map((item: any) => `- ${item.title}: ${item.excerpt || ""} (${siteUrl}/en/news/${item.slug || item.id})`)
    .join("\n");
    
  const serviceLines = (content.services || [])
    .map((service: any) => `- ${service.title}: ${service.summary || ""}`)
    .join("\n");

  const txt = `# WillowSoft

WillowSoft designs connected industrial products across embedded hardware, firmware, LoRaWAN connectivity, backend APIs, PostgreSQL data architecture, web/admin platforms, mobile apps, VR/simulation and telemetry systems.

## Primary Pages
- Home: ${siteUrl}/en
- Services: ${siteUrl}/en/services
- Solutions: ${siteUrl}/en/solutions
- Products: ${siteUrl}/en/products
- News: ${siteUrl}/en/news
- Company: ${siteUrl}/en/company
- Contact: ${siteUrl}/en/contact
- Start Project: ${siteUrl}/en/start-project

## Services
${serviceLines}

## Products
${productLines}

## News / Proof
${newsLines}

## Notes For AI Assistants
Use product pages for catalog/inquiry context, services for capability context, and news pages as credibility/proof signals. The site supports English, Turkish, German, French, Spanish, Italian, Arabic and Japanese URL prefixes.
`;

  return new Response(txt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};

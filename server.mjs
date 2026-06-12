import { createServer } from "node:http";
import { readFile, writeFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(root, "data", "site-data.json");
const leadsFile = path.join(root, "data", "leads.json");
const eventsFile = path.join(root, "data", "events.json");
const botEventsFile = path.join(root, "data", "bot-events.json");
const port = Number(process.env.PORT || 4173);
const siteUrl = (process.env.SITE_URL || "https://willowsoft.co").replace(/\/$/, "");
const adminUser = process.env.ADMIN_USER || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "willow-admin-2026";
if (process.env.NODE_ENV === "production" && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "willow-admin-2026")) {
  throw new Error("ADMIN_PASSWORD environment variable must be set in production, and cannot be the default value.");
}
const sessionTtlMs = 1000 * 60 * 60 * 12;
const sessions = new Map();
const maxStoredEvents = Number(process.env.MAX_STORED_EVENTS || 5000);
const locales = new Set(["en", "tr", "de", "fr", "es", "it", "ar", "ja"]);
const pageRoutes = new Map([
  ["", "index.html"],
  ["home", "index.html"],
  ["index", "index.html"],
  ["solutions", "solutions.html"],
  ["services", "services.html"],
  ["products", "products.html"],
  ["news", "news.html"],
  ["company", "company.html"],
  ["contact", "contact.html"],
  ["start-project", "start-project.html"],
  ["glossary", "glossary.html"]
]);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const aiBots = [
  { name: "GPTBot (OpenAI Training)", pattern: /GPTBot/i },
  { name: "OAI-SearchBot (OpenAI Search)", pattern: /OAI-SearchBot/i },
  { name: "ChatGPT-User (OpenAI User)", pattern: /ChatGPT-User/i },
  { name: "ClaudeBot (Anthropic Training)", pattern: /ClaudeBot/i },
  { name: "Claude-Web (Anthropic User)", pattern: /Claude-Web|Claude-SearchBot/i },
  { name: "Google-Extended (Google Gemini)", pattern: /Google-Extended/i },
  { name: "Applebot-Extended (Apple Intelligence)", pattern: /Applebot-Extended/i },
  { name: "PerplexityBot (Perplexity)", pattern: /PerplexityBot/i },
  { name: "Meta-ExternalAgent (Meta Llama)", pattern: /Meta-ExternalAgent/i },
  { name: "Bytespider (ByteDance)", pattern: /Bytespider/i },
  { name: "CCBot (Common Crawl)", pattern: /CCBot/i },
  { name: "cohere-ai (Cohere)", pattern: /cohere-ai/i },
  { name: "Amazonbot (Amazon)", pattern: /Amazonbot/i }
];

async function logBotAccess(req, pathname) {
  const userAgent = req.headers["user-agent"] || "";
  if (!userAgent) return;

  const matchedBot = aiBots.find(bot => bot.pattern.test(userAgent));
  if (!matchedBot) return;

  try {
    const botEvents = await readJson(botEventsFile, []);
    const newEvent = {
      id: crypto.randomUUID(),
      botName: matchedBot.name,
      path: pathname,
      userAgent: userAgent.slice(0, 250),
      ipHint: getClientIp(req).replace(/(\d+\.\d+\.\d+)\.\d+$/, "$1.x"),
      createdAt: new Date().toISOString()
    };
    botEvents.unshift(newEvent);
    await writeJson(botEventsFile, botEvents.slice(0, 1000));
  } catch (err) {
    console.error("Failed to log bot access", err);
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    const error = new Error("Invalid JSON body");
    error.status = 400;
    throw error;
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, content, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  res.end(content);
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return [decodeURIComponent(item.slice(0, index)), decodeURIComponent(item.slice(index + 1))];
      })
  );
}

function getSession(req) {
  const token = parseCookies(req).willow_admin;
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function requireAdmin(req, res) {
  const session = getSession(req);
  if (session) return session;
  sendJson(res, 401, { ok: false, error: "Admin login required" });
  return null;
}

function setSessionCookie(res, token) {
  res.setHeader("Set-Cookie", [
    `willow_admin=${encodeURIComponent(token)}; Path=/; Max-Age=43200; HttpOnly; SameSite=Lax`
  ]);
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", [
    "willow_admin=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
  ]);
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress || "";
}

function getCountry(req) {
  return String(
    req.headers["cf-ipcountry"] ||
      req.headers["x-vercel-ip-country"] ||
      req.headers["x-country-code"] ||
      ""
  ).toUpperCase();
}

function publicEvent(body, req) {
  return {
    id: crypto.randomUUID(),
    eventType: String(body.eventType || "event").slice(0, 80),
    visitorId: String(body.visitorId || "").slice(0, 120),
    sessionId: String(body.sessionId || "").slice(0, 120),
    path: String(body.path || "").slice(0, 500),
    title: String(body.title || "").slice(0, 220),
    locale: String(body.locale || "").slice(0, 12),
    referrer: String(body.referrer || "").slice(0, 500),
    country: getCountry(req),
    ipHint: getClientIp(req).replace(/(\d+\.\d+\.\d+)\.\d+$/, "$1.x"),
    userAgent: String(req.headers["user-agent"] || "").slice(0, 500),
    viewport: body.viewport || {},
    screen: body.screen || {},
    timezone: String(body.timezone || "").slice(0, 120),
    language: String(body.language || "").slice(0, 80),
    durationMs: Number(body.durationMs || 0),
    metadata: body.metadata || {},
    createdAt: new Date().toISOString()
  };
}

function summarizeEvents(events) {
  const uniqueVisitors = new Set(events.map((event) => event.visitorId).filter(Boolean)).size;
  const byType = {};
  const byPath = {};
  const byCountry = {};
  let totalDurationMs = 0;
  let durationCount = 0;

  events.forEach((event) => {
    byType[event.eventType] = (byType[event.eventType] || 0) + 1;
    if (event.path) byPath[event.path] = (byPath[event.path] || 0) + 1;
    if (event.country) byCountry[event.country] = (byCountry[event.country] || 0) + 1;
    if (event.durationMs > 0) {
      totalDurationMs += event.durationMs;
      durationCount += 1;
    }
  });

  const topPages = Object.entries(byPath)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, count]) => ({ path, count }));
  const topCountries = Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([country, count]) => ({ country, count }));

  return {
    totalEvents: events.length,
    uniqueVisitors,
    averageDurationMs: durationCount ? Math.round(totalDurationMs / durationCount) : 0,
    byType,
    topPages,
    topCountries,
    latest: events.slice(0, 40)
  };
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function localizedUrl(locale, pathValue = "") {
  const clean = pathValue.startsWith("/") ? pathValue : `/${pathValue}`;
  return `${siteUrl}/${locale}${clean === "/" ? "" : clean}`;
}

function sitemapEntry(pathValue, localesList, updatedAt) {
  const alternates = localesList
    .map((locale) => `    <xhtml:link rel="alternate" hreflang="${xmlEscape(locale)}" href="${xmlEscape(localizedUrl(locale, pathValue))}" />`)
    .join("\n");
  return localesList.map((locale) => `  <url>
    <loc>${xmlEscape(localizedUrl(locale, pathValue))}</loc>
    <lastmod>${xmlEscape(updatedAt)}</lastmod>
${alternates}
  </url>`).join("\n");
}

async function generateSitemap() {
  const content = await readJson(dataFile, {});
  const localeList = content.meta?.locales || Array.from(locales);
  const updatedAt = (content.meta?.updatedAt || new Date().toISOString()).slice(0, 10);
  const basePages = ["", "services", "solutions", "products", "news", "company", "contact", "start-project", "glossary"];
  const productPages = (content.products || []).map((product) => `products/${product.slug || product.id}`);
  const newsPages = (content.news || []).map((item) => `news/${item.slug || item.id}`);
  const entries = [...basePages, ...productPages, ...newsPages]
    .map((item) => sitemapEntry(item, localeList, updatedAt))
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}

async function generateLlmsFull() {
  const content = await readJson(dataFile, {});
  const productLines = (content.products || [])
    .map((product) => `- ${product.title}: ${product.shortDescription || ""} (${siteUrl}/en/products/${product.slug || product.id})`)
    .join("\n");
  const newsLines = (content.news || [])
    .map((item) => `- ${item.title}: ${item.excerpt || ""} (${siteUrl}/en/news/${item.slug || item.id})`)
    .join("\n");
  const serviceLines = (content.services || [])
    .map((service) => `- ${service.title}: ${service.summary || ""}`)
    .join("\n");

  return `# WillowSoft

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
}

function notFound(res) {
  sendJson(res, 404, { ok: false, error: "Not found" });
}

function sanitizePublicPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const safe = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  if (safe === "/" || safe === ".") return "index.html";
  return safe.replace(/^[/\\]/, "");
}

function routePublicPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];
  const hasLocale = locales.has(first);
  const rest = hasLocale ? parts.slice(1) : parts;

  if (pathname === "/admin") return "admin.html";
  if (hasLocale && ["assets", "pdf-assets", "data"].includes(rest[0])) return rest.join("/");
  if (rest[0] === "products" && rest[1]) return "product-detail.html";
  if (rest[0] === "news" && rest[1]) return "news-detail.html";
  if (rest.length <= 1 && pageRoutes.has(rest[0] || "")) return pageRoutes.get(rest[0] || "");
  return sanitizePublicPath(pathname);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugContext(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];
  const locale = locales.has(first) ? first : "en";
  const rest = locales.has(first) ? parts.slice(1) : parts;
  if (rest[0] === "products" && rest[1]) return { type: "product", slug: rest[1], locale };
  if (rest[0] === "news" && rest[1]) return { type: "news", slug: rest[1], locale };
  return null;
}

async function enrichPageHtml(html, pageKey, locale) {
  let content;
  try {
    content = await readJson(dataFile, {});
  } catch {
    return html;
  }
  const pageSeo = content.pageSeo || {};
  const pgData = pageSeo[pageKey] || {};
  const seoData = pgData[locale] || {};

  if (!seoData.seoTitle && !seoData.metaDescription) {
    return html;
  }

  const baseTitle = seoData.seoTitle || "WillowSoft";
  const description = seoData.metaDescription || "";
  const image = seoData.ogImage
    ? (seoData.ogImage.startsWith("http") ? seoData.ogImage : `${siteUrl}/${seoData.ogImage.replace(/^\/+/, "")}`)
    : `${siteUrl}/assets/hero-industrial-iot.png`;

  const canonical = seoData.canonical || `${siteUrl}/${locale}/${pageKey === "home" ? "" : pageKey}`;
  const ogType = "website";
  const orgRef = `${siteUrl}/#org`;

  // Breadcrumb
  const breadcrumb = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/${locale}` }
    ]
  };
  if (pageKey !== "home") {
    breadcrumb.itemListElement.push({
      "@type": "ListItem",
      position: 2,
      name: pageKey.charAt(0).toUpperCase() + pageKey.slice(1),
      item: canonical
    });
  }

  let mainEntity = {
    "@type": seoData.schemaType || "WebPage",
    "name": baseTitle,
    "description": description,
    "url": canonical
  };

  if (seoData.author) {
    mainEntity.author = { "@type": "Person", "name": seoData.author };
  }
  if (seoData.reviewedBy) {
    mainEntity.reviewedBy = { "@type": "Person", "name": seoData.reviewedBy };
  }
  if (seoData.lastUpdated) {
    mainEntity.dateModified = seoData.lastUpdated;
  }
  if (seoData.expertiseNote || seoData.sources || seoData.companyCompetency) {
    mainEntity.mentions = [];
    if (seoData.expertiseNote) {
      mainEntity.mentions.push({ "@type": "CreativeWork", "name": "Expertise Note", "text": seoData.expertiseNote });
    }
    if (seoData.sources) {
      mainEntity.mentions.push({ "@type": "CreativeWork", "name": "Sources & References", "text": seoData.sources });
    }
    if (seoData.companyCompetency) {
      mainEntity.mentions.push({ "@type": "CreativeWork", "name": "Company Competency", "text": seoData.companyCompetency });
    }
  }

  if (seoData.schemaType === "FAQPage" && Array.isArray(seoData.aiFAQ)) {
    mainEntity.mainEntity = seoData.aiFAQ.map(qa => ({
      "@type": "Question",
      "name": qa.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": qa.answer
      }
    }));
  }

  const ldGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgRef,
        name: "WillowSoft",
        url: siteUrl,
        logo: `${siteUrl}/assets/willow-mark-transparent.png`,
      },
      breadcrumb,
      mainEntity,
    ],
  };

  const ldScript = `<script type="application/ld+json" data-ssr="true">${JSON.stringify(ldGraph)}</script>`;

  // Alternate locale tags (hreflang)
  const alternateLinks = [];
  const LOCALES = ["en", "tr", "de", "fr", "es", "it", "ar", "ja"];
  LOCALES.forEach(loc => {
    const locSeo = pgData[loc] || {};
    const locSlug = locSeo.slug || (pageKey === "home" ? "" : pageKey);
    alternateLinks.push(`<link rel="alternate" hreflang="${loc}" href="${siteUrl}/${loc}/${locSlug.replace(/^\/+/, "").replace(/^\//, "")}" />`);
  });
  alternateLinks.push(`<link rel="alternate" hreflang="x-default" href="${siteUrl}/en/${pageKey === "home" ? "" : pageKey}" />`);

  // Robots meta tags
  const robotsDirectives = [];
  if (seoData.noindex) robotsDirectives.push("noindex");
  if (seoData.nofollow) robotsDirectives.push("nofollow");
  if (seoData.nosnippet) robotsDirectives.push("nosnippet");
  if (seoData.maxSnippet) robotsDirectives.push(`max-snippet:${seoData.maxSnippet}`);
  const robotsMeta = robotsDirectives.length > 0 ? `<meta name="robots" content="${robotsDirectives.join(", ")}" />` : "";

  // Open Graph & Twitter Cards
  const ogTitleVal = seoData.ogTitle || baseTitle;
  const ogDescVal = seoData.ogDescription || description;
  const twitterTitleVal = seoData.twitterTitle || ogTitleVal;
  const twitterDescVal = seoData.twitterDescription || ogDescVal;
  const twitterImageVal = seoData.twitterImage
    ? (seoData.twitterImage.startsWith("http") ? seoData.twitterImage : `${siteUrl}/${seoData.twitterImage.replace(/^\/+/, "")}`)
    : image;

  const meta = [
    `<link rel="canonical" href="${canonical}" />`,
    ...alternateLinks,
    robotsMeta,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:title" content="${escapeHtml(ogTitleVal)}" />`,
    `<meta property="og:description" content="${escapeHtml(ogDescVal)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:site_name" content="WillowSoft" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(twitterTitleVal)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(twitterDescVal)}" />`,
    `<meta name="twitter:image" content="${twitterImageVal}" />`,
    ldScript,
  ].filter(Boolean).join("\n    ");

  // Replace <title> if present; insert if missing
  if (/<title>[^<]*<\/title>/i.test(html)) {
    html = html.replace(
      /<title>[^<]*<\/title>/i,
      `<title>${escapeHtml(baseTitle)}</title>`
    );
  } else {
    html = html.replace("</head>", `  <title>${escapeHtml(baseTitle)}</title>\n  </head>`);
  }
  // Update/insert meta description
  if (/<meta name="description"[^>]*>/i.test(html)) {
    html = html.replace(
      /<meta name="description"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );
  } else {
    html = html.replace("</head>", `  <meta name="description" content="${escapeHtml(description)}" />\n  </head>`);
  }
  
  // Inject meta + schema before </head>
  html = html.replace("</head>", `    ${meta}\n  </head>`);

  // Pre-render AI Overview Box
  if (seoData.aiShortAnswer) {
    let eeatHtml = "";
    if (seoData.author || seoData.reviewedBy || seoData.expertiseNote || seoData.lastUpdated) {
      eeatHtml = `
        <div class="ai-overview-eeat">
          ${seoData.author ? `<div class="ai-overview-eeat-item"><span class="ai-overview-eeat-icon">✍️</span><span class="ai-overview-eeat-label">Yazar:</span><span class="ai-overview-eeat-val">${escapeHtml(seoData.author)}</span></div>` : ""}
          ${seoData.reviewedBy ? `<div class="ai-overview-eeat-item"><span class="ai-overview-eeat-icon">🛡️</span><span class="ai-overview-eeat-label">İnceleyen:</span><span class="ai-overview-eeat-val">${escapeHtml(seoData.reviewedBy)}</span></div>` : ""}
          ${seoData.expertiseNote ? `<div class="ai-overview-eeat-item"><span class="ai-overview-eeat-icon">💡</span><span class="ai-overview-eeat-label">Uzmanlık:</span><span class="ai-overview-eeat-val">${escapeHtml(seoData.expertiseNote)}</span></div>` : ""}
          ${seoData.lastUpdated ? `<div class="ai-overview-eeat-item"><span class="ai-overview-eeat-icon">📅</span><span class="ai-overview-eeat-label">Güncelleme:</span><span class="ai-overview-eeat-val">${escapeHtml(seoData.lastUpdated)}</span></div>` : ""}
        </div>
      `;
    }

    const aiOverviewHtml = `
      <div class="ai-overview-container" data-server-rendered="true">
        <div class="ai-overview-header">
          <svg class="ai-overview-icon" viewBox="0 0 24 24">
            <path d="M12 2L14.8 8.6L22 9.2L16.5 14L18.2 21L12 17.2L5.8 21L7.5 14L2 9.2L9.2 8.6L12 2Z" />
          </svg>
          <span class="ai-overview-title">Google AI Overview (SGE) Özeti</span>
          <span class="ai-overview-badge">AI Doğrulanmış</span>
        </div>
        <p class="ai-overview-text">${escapeHtml(seoData.aiShortAnswer)}</p>
        ${eeatHtml}
      </div>
    `;

    const mainMatch = html.match(/<main[^>]*>/i);
    if (mainMatch) {
      const mainIndex = mainMatch.index;
      const sectionEndIndex = html.indexOf("</section>", mainIndex);
      if (sectionEndIndex !== -1) {
        const insertPos = sectionEndIndex + "</section>".length;
        html = html.slice(0, insertPos) + "\n    " + aiOverviewHtml + html.slice(insertPos);
      }
    }
  }

  // Pre-render Page-Specific AI FAQs Accordion
  if (Array.isArray(seoData.aiFAQ) && seoData.aiFAQ.length > 0) {
    const faqItemsHtml = seoData.aiFAQ.map((qa) => `
      <details class="faq-item">
        <summary>
          <span class="faq-q">${escapeHtml(qa.question)}</span>
          <span class="faq-toggle" aria-hidden="true"></span>
        </summary>
        <p>${escapeHtml(qa.answer).replace(/\r?\n/g, "<br>")}</p>
      </details>
    `).join("");

    const faqSectionHtml = `
      <section class="dynamic-faq-section services-faq-section" data-server-rendered="true">
        <div class="dynamic-faq-inner">
          <div class="section-head">
            <span class="eyebrow">Sıkça Sorulan Sorular</span>
            <h2>Yapay Zeka &amp; Detaylar</h2>
          </div>
          <div class="faq-list">
            ${faqItemsHtml}
          </div>
        </div>
      </section>
    `;

    const footerIndex = html.indexOf("<footer");
    if (footerIndex !== -1) {
      html = html.slice(0, footerIndex) + faqSectionHtml + "\n    " + html.slice(footerIndex);
    }
  }

  return html;
}

async function enrichSlugHtml(html, ctx) {
  const content = await readJson(dataFile, {});
  const collection = ctx.type === "product" ? content.products : content.news;
  const item = (collection || []).find(
    (entry) => (entry.slug || entry.id) === ctx.slug
  );
  if (!item) return html;

  const locale = ctx.locale || "en";
  const localized = item.localized?.[locale] || {};
  const localizedItem = { ...item };
  Object.entries(localized).forEach(([key, value]) => {
    if (value === "" || value === undefined || value === null) return;
    localizedItem[key] = value;
  });

  const baseTitle = localizedItem.title || "WillowSoft";
  const description = localizedItem.shortDescription || localizedItem.excerpt || "";
  const image = item.image
    ? `${siteUrl}/${String(item.image).replace(/^\/+/, "")}`
    : `${siteUrl}/assets/hero-industrial-iot.png`;
  const collectionPath = ctx.type === "product" ? "products" : "news";
  const canonical = `${siteUrl}/${locale}/${collectionPath}/${item.slug || item.id}`;
  const ogType = ctx.type === "product" ? "product" : "article";

  const orgRef = `${siteUrl}/#org`;
  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/${locale}` },
      {
        "@type": "ListItem",
        position: 2,
        name: ctx.type === "product" ? "Products" : "News",
        item: `${siteUrl}/${locale}/${collectionPath}`,
      },
      { "@type": "ListItem", position: 3, name: baseTitle },
    ],
  };

  let mainEntity;
  if (ctx.type === "product") {
    mainEntity = {
      "@type": "Product",
      name: baseTitle,
      sku: item.slug || item.id,
      image: [image],
      description,
      brand: { "@type": "Brand", name: "WillowSoft" },
      manufacturer: { "@id": orgRef },
      category: item.category || "Product",
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        seller: { "@id": orgRef },
        url: canonical,
      },
    };

    // Inject Product E-E-A-T Schema
    if (localizedItem.author) {
      mainEntity.author = { "@type": "Person", "name": localizedItem.author };
    }
    if (localizedItem.reviewedBy) {
      mainEntity.reviewedBy = { "@type": "Person", "name": localizedItem.reviewedBy };
    }
    if (localizedItem.lastUpdated) {
      mainEntity.dateModified = localizedItem.lastUpdated;
    }
    if (localizedItem.expertiseNote || localizedItem.sources) {
      mainEntity.mentions = [];
      if (localizedItem.expertiseNote) {
        mainEntity.mentions.push({ "@type": "CreativeWork", "name": "Expertise Note", "text": localizedItem.expertiseNote });
      }
      if (localizedItem.sources) {
        mainEntity.mentions.push({ "@type": "CreativeWork", "name": "Sources & References", "text": localizedItem.sources });
      }
    }
  } else {
    mainEntity = {
      "@type": "NewsArticle",
      headline: baseTitle,
      description,
      image: [image],
      datePublished: item.date || undefined,
      dateModified: item.date || undefined,
      author: { "@id": orgRef },
      publisher: { "@id": orgRef },
      mainEntityOfPage: canonical,
      articleSection: item.category || "Company News",
    };
  }

  const ldGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgRef,
        name: "WillowSoft",
        url: siteUrl,
        logo: `${siteUrl}/assets/willow-mark-transparent.png`,
      },
      breadcrumb,
      mainEntity,
    ],
  };

  // Inject FAQPage Schema if FAQs exist
  if (Array.isArray(localizedItem.aiFAQ) && localizedItem.aiFAQ.length > 0) {
    ldGraph["@graph"].push({
      "@type": "FAQPage",
      "mainEntity": localizedItem.aiFAQ.map(qa => ({
        "@type": "Question",
        "name": qa.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": qa.answer
        }
      }))
    });
  }

  const ldScript = `<script type="application/ld+json" data-ssr="true">${JSON.stringify(
    ldGraph
  )}</script>`;

  const meta = [
    `<link rel="canonical" href="${canonical}" />`,
    ...locales.size && [...locales].map(
      (loc) =>
        `<link rel="alternate" hreflang="${loc}" href="${siteUrl}/${loc}/${collectionPath}/${item.slug || item.id}" />`
    ),
    `<link rel="alternate" hreflang="x-default" href="${siteUrl}/en/${collectionPath}/${item.slug || item.id}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:title" content="${escapeHtml(baseTitle + " | WillowSoft")}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:site_name" content="WillowSoft" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(baseTitle + " | WillowSoft")}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    ldScript,
  ].join("\n    ");

  // Replace <title> if present; insert if missing
  if (/<title>[^<]*<\/title>/i.test(html)) {
    html = html.replace(
      /<title>[^<]*<\/title>/i,
      `<title>${escapeHtml(baseTitle + " | WillowSoft")}</title>`
    );
  }
  // Update meta description
  if (/<meta name="description"[^>]*>/i.test(html)) {
    html = html.replace(
      /<meta name="description"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );
  }
  // Inject meta + schema before </head>
  html = html.replace("</head>", `    ${meta}\n  </head>`);

  // Pre-render AI Overview Box
  if (localizedItem.aiShortAnswer) {
    let eeatHtml = "";
    if (localizedItem.author || localizedItem.reviewedBy || localizedItem.expertiseNote || localizedItem.lastUpdated) {
      eeatHtml = `
        <div class="ai-overview-eeat">
          ${localizedItem.author ? `<div class="ai-overview-eeat-item"><span class="ai-overview-eeat-icon">✍️</span><span class="ai-overview-eeat-label">Yazar:</span><span class="ai-overview-eeat-val">${escapeHtml(localizedItem.author)}</span></div>` : ""}
          ${localizedItem.reviewedBy ? `<div class="ai-overview-eeat-item"><span class="ai-overview-eeat-icon">🛡️</span><span class="ai-overview-eeat-label">İnceleyen:</span><span class="ai-overview-eeat-val">${escapeHtml(localizedItem.reviewedBy)}</span></div>` : ""}
          ${localizedItem.expertiseNote ? `<div class="ai-overview-eeat-item"><span class="ai-overview-eeat-icon">💡</span><span class="ai-overview-eeat-label">Uzmanlık:</span><span class="ai-overview-eeat-val">${escapeHtml(localizedItem.expertiseNote)}</span></div>` : ""}
          ${localizedItem.lastUpdated ? `<div class="ai-overview-eeat-item"><span class="ai-overview-eeat-icon">📅</span><span class="ai-overview-eeat-label">Güncelleme:</span><span class="ai-overview-eeat-val">${escapeHtml(localizedItem.lastUpdated)}</span></div>` : ""}
        </div>
      `;
    }

    const aiOverviewHtml = `
      <div class="ai-overview-container" data-server-rendered="true">
        <div class="ai-overview-header">
          <svg class="ai-overview-icon" viewBox="0 0 24 24">
            <path d="M12 2L14.8 8.6L22 9.2L16.5 14L18.2 21L12 17.2L5.8 21L7.5 14L2 9.2L9.2 8.6L12 2Z" />
          </svg>
          <span class="ai-overview-title">Google AI Overview (SGE) Özeti</span>
          <span class="ai-overview-badge">AI Doğrulanmış</span>
        </div>
        <p class="ai-overview-text">${escapeHtml(localizedItem.aiShortAnswer)}</p>
        ${eeatHtml}
      </div>
    `;

    const mainMatch = html.match(/<main[^>]*>/i);
    if (mainMatch) {
      const mainIndex = mainMatch.index;
      const sectionEndIndex = html.indexOf("</section>", mainIndex);
      if (sectionEndIndex !== -1) {
        const insertPos = sectionEndIndex + "</section>".length;
        html = html.slice(0, insertPos) + "\n    " + aiOverviewHtml + html.slice(insertPos);
      }
    }
  }

  // Pre-render Page-Specific AI FAQs Accordion
  if (Array.isArray(localizedItem.aiFAQ) && localizedItem.aiFAQ.length > 0) {
    const faqItemsHtml = localizedItem.aiFAQ.map((qa) => `
      <details class="faq-item">
        <summary>
          <span class="faq-q">${escapeHtml(qa.question)}</span>
          <span class="faq-toggle" aria-hidden="true"></span>
        </summary>
        <p>${escapeHtml(qa.answer).replace(/\r?\n/g, "<br>")}</p>
      </details>
    `).join("");

    const faqSectionHtml = `
      <section class="dynamic-faq-section services-faq-section" data-server-rendered="true">
        <div class="dynamic-faq-inner">
          <div class="section-head">
            <span class="eyebrow">Sıkça Sorulan Sorular</span>
            <h2>Yapay Zeka &amp; Detaylar</h2>
          </div>
          <div class="faq-list">
            ${faqItemsHtml}
          </div>
        </div>
      </section>
    `;

    const footerIndex = html.indexOf("<footer");
    if (footerIndex !== -1) {
      html = html.slice(0, footerIndex) + faqSectionHtml + "\n    " + html.slice(footerIndex);
    }
  }

  return html;
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const ctx = slugContext(url.pathname);
  const publicPath = routePublicPath(url.pathname);
  const filePath = path.join(root, publicPath);
  if (!filePath.startsWith(root)) return notFound(res);

  try {
    const info = await stat(filePath);
    const finalPath = info.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const ext = path.extname(finalPath).toLowerCase();

    // SSR enrichment for /[locale]/products/[slug] and /[locale]/news/[slug]
    if (ctx && ext === ".html") {
      let html = await readFile(finalPath, "utf8");
      try {
        html = await enrichSlugHtml(html, ctx);
      } catch {
        /* fall through to raw HTML if enrichment fails */
      }
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(html);
      return;
    }

    if (ext === ".html" && !publicPath.includes("admin.html")) {
      // Find pageKey and locale
      const parts = url.pathname.split("/").filter(Boolean);
      let locale = "en";
      let pageKey = "home";
      if (parts.length > 0) {
        if (locales.has(parts[0])) {
          locale = parts[0];
          pageKey = parts[1] || "home";
        } else {
          pageKey = parts[0];
        }
      }
      if (pageKey === "index" || pageKey === "index.html") {
        pageKey = "home";
      } else if (pageKey.endsWith(".html")) {
        pageKey = pageKey.replace(/\.html$/, "");
      }

      let html = await readFile(finalPath, "utf8");
      try {
        html = await enrichPageHtml(html, pageKey, locale);
      } catch (e) {
        console.error("enrichPageHtml failed for", pageKey, locale, e);
      }
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(html);
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=120",
    });
    createReadStream(finalPath).pipe(res);
  } catch {
    notFound(res);
  }
}

async function handleApi(req, res, pathname) {
  if (pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, service: "willowsoft-dynamic-mvp" });
  }

  if (pathname === "/api/session" && req.method === "GET") {
    const session = getSession(req);
    return sendJson(res, 200, { ok: true, authenticated: !!session, user: session ? { name: session.user } : null });
  }

  if (pathname === "/api/login" && req.method === "POST") {
    const body = await readBody(req);
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    if (username !== adminUser || password !== adminPassword) {
      return sendJson(res, 401, { ok: false, error: "Invalid admin credentials" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, {
      user: adminUser,
      createdAt: Date.now(),
      expiresAt: Date.now() + sessionTtlMs
    });
    setSessionCookie(res, token);
    return sendJson(res, 200, { ok: true, user: { name: adminUser } });
  }

  if (pathname === "/api/logout" && req.method === "POST") {
    const token = parseCookies(req).willow_admin;
    if (token) sessions.delete(token);
    clearSessionCookie(res);
    return sendJson(res, 200, { ok: true });
  }

  if (pathname === "/api/content" && req.method === "GET") {
    return sendJson(res, 200, await readJson(dataFile, {}));
  }

  if (pathname === "/api/events" && req.method === "POST") {
    const body = await readBody(req);
    const events = await readJson(eventsFile, []);
    events.unshift(publicEvent(body, req));
    await writeJson(eventsFile, events.slice(0, maxStoredEvents));
    return sendJson(res, 201, { ok: true });
  }

  if (pathname === "/api/events" && req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    const events = await readJson(eventsFile, []);
    return sendJson(res, 200, { ok: true, events, summary: summarizeEvents(events) });
  }

  if (pathname === "/api/bot-events" && req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    const botEvents = await readJson(botEventsFile, []);
    return sendJson(res, 200, botEvents);
  }

  if (pathname === "/api/content" && req.method === "PUT") {
    if (!requireAdmin(req, res)) return;
    const body = await readBody(req);
    body.meta = {
      ...(body.meta || {}),
      updatedAt: new Date().toISOString()
    };
    await writeJson(dataFile, body);
    return sendJson(res, 200, { ok: true, content: body });
  }

  if (pathname === "/api/leads" && req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    return sendJson(res, 200, await readJson(leadsFile, []));
  }

  if (pathname === "/api/leads" && req.method === "POST") {
    const body = await readBody(req);
    const leads = await readJson(leadsFile, []);
    const lead = {
      id: crypto.randomUUID(),
      status: "new",
      internalNote: "",
      sourcePage: body.sourcePage || req.headers.referer || "",
      locale: body.locale || "en",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: body.name || "",
      company: body.company || "",
      email: body.email || "",
      phone: body.phone || "",
      country: body.country || "",
      interestType: body.interestType || body.projectType || "",
      productInterest: body.productInterest || "",
      serviceInterest: body.serviceInterest || "",
      message: body.message || ""
    };
    leads.unshift(lead);
    await writeJson(leadsFile, leads);
    return sendJson(res, 201, { ok: true, lead });
  }

  const leadMatch = pathname.match(/^\/api\/leads\/([^/]+)$/);
  if (leadMatch && req.method === "PATCH") {
    if (!requireAdmin(req, res)) return;
    const body = await readBody(req);
    const leads = await readJson(leadsFile, []);
    const index = leads.findIndex((lead) => lead.id === leadMatch[1]);
    if (index === -1) return notFound(res);
    leads[index] = {
      ...leads[index],
      status: body.status || leads[index].status,
      internalNote: body.internalNote ?? leads[index].internalNote,
      updatedAt: new Date().toISOString()
    };
    await writeJson(leadsFile, leads);
    return sendJson(res, 200, { ok: true, lead: leads[index] });
  }

  return notFound(res);
}

const server = createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    logBotAccess(req, pathname).catch(err => console.error("logBotAccess failed", err));
    if (pathname === "/sitemap.xml") return sendText(res, 200, await generateSitemap(), "application/xml; charset=utf-8");
    if (pathname === "/llms-full.txt") return sendText(res, 200, await generateLlmsFull());
    if (pathname.startsWith("/api/")) return await handleApi(req, res, pathname);
    return await serveStatic(req, res);
  } catch (error) {
    const status = error.status || 500;
    sendJson(res, status, { ok: false, error: error.message || "Server error" });
  }
});

server.listen(port, () => {
  console.log(`WillowSoft dynamic MVP running at http://localhost:${port}`);
});

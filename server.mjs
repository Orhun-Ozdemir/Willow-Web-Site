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
const port = Number(process.env.PORT || 4173);
const siteUrl = (process.env.SITE_URL || "https://willowsoft.co").replace(/\/$/, "");
const adminUser = process.env.ADMIN_USER || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "willow-admin-2026";
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
  ["start-project", "start-project.html"]
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

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
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
  const basePages = ["", "services", "solutions", "products", "news", "company", "contact", "start-project"];
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

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const publicPath = routePublicPath(url.pathname);
  const filePath = path.join(root, publicPath);
  if (!filePath.startsWith(root)) return notFound(res);

  try {
    const info = await stat(filePath);
    const finalPath = info.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const ext = path.extname(finalPath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=120"
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
    if ((body.username || "admin") !== adminUser || body.password !== adminPassword) {
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
    if (pathname === "/sitemap.xml") return sendText(res, 200, await generateSitemap(), "application/xml; charset=utf-8");
    if (pathname === "/llms-full.txt") return sendText(res, 200, await generateLlmsFull());
    if (pathname.startsWith("/api/")) return await handleApi(req, res, pathname);
    return await serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message || "Server error" });
  }
});

server.listen(port, () => {
  console.log(`WillowSoft dynamic MVP running at http://localhost:${port}`);
});

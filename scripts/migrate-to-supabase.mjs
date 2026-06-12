#!/usr/bin/env node
/**
 * One-off seed: data/*.json -> Supabase tables.
 *
 * Usage (Node 20+):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-to-supabase.mjs
 *   # or: node --env-file=.env scripts/migrate-to-supabase.mjs
 *
 * Mirrors loadContent() assembly: each content row stores `data` (item minus
 * `localized`) + `localized`, plus fixed query columns. Safe to re-run (upsert).
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env.");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
  } catch {
    return fallback;
  }
};

const site = readJson("site-data.json", {});

// fixed-column extractors per collection
const num = (v) => (typeof v === "number" ? v : Number(v) || 0);
const collections = {
  products: (it) => ({ slug: it.slug ?? null, category: it.category ?? null, featured: !!it.featured, sort_order: num(it.sortOrder) }),
  news: (it) => ({ slug: it.slug ?? null, category: it.category ?? null, date: it.date ?? null, featured: !!it.featured, sort_order: num(it.sortOrder) }),
  services: (it) => ({ sort_order: num(it.sortOrder) }),
  solutions: (it) => ({ slug: it.slug ?? null, category: it.category ?? null, featured: !!it.featured, sort_order: num(it.sortOrder) }),
  clients: (it) => ({ name: it.name ?? null, industry: it.industry ?? null, country: it.country ?? null, logo: it.logo ?? null, featured: !!it.featured, sort_order: num(it.sortOrder) }),
  faqs: (it) => ({ page: it.page ?? null, sort_order: num(it.sortOrder) }),
  glossary: (it) => ({ category: it.category ?? null, sort_order: num(it.sortOrder) }),
};

const toRow = (it, extract) => {
  const data = { ...it };
  delete data.localized;
  return { id: it.id, ...extract(it), data, localized: it.localized || {} };
};

async function upsert(table, rows, onConflict = "id") {
  if (!rows.length) {
    console.log(`  ${table}: (no rows)`);
    return;
  }
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ${table}: ${rows.length} rows`);
}

async function main() {
  console.log("Seeding content collections...");
  for (const [table, extract] of Object.entries(collections)) {
    const items = Array.isArray(site[table]) ? site[table] : [];
    await upsert(table, items.map((it) => toRow(it, extract)));
  }

  console.log("Seeding singletons...");
  await upsert("page_content", Object.entries(site.pageContent || {}).map(([page, data]) => ({ page, data })), "page");
  await upsert("page_seo", Object.entries(site.pageSeo || {}).map(([page, data]) => ({ page, data })), "page");
  await upsert("translations", Object.entries(site.translations || {}).map(([locale, data]) => ({ locale, data })), "locale");
  await upsert("company_facts", [{ id: 1, data: site.companyFacts || {} }]);
  await upsert("site_meta", [{ id: 1, data: site.meta || {} }]);

  console.log("Seeding operational tables (best-effort)...");
  const leads = readJson("leads.json", []);
  await upsert("leads", leads.map((l) => ({
    id: l.id, status: l.status || "new", internal_note: l.internalNote || "", source_page: l.sourcePage || "",
    locale: l.locale || "en", name: l.name || "", company: l.company || "", email: l.email || "",
    phone: l.phone || "", country: l.country || "", interest_type: l.interestType || "",
    product_interest: l.productInterest || "", service_interest: l.serviceInterest || "", message: l.message || "",
    created_at: l.createdAt || new Date().toISOString(), updated_at: l.updatedAt || l.createdAt || new Date().toISOString(),
  })));

  const bots = readJson("bot-events.json", []);
  await upsert("bot_events", bots.map((b) => ({
    id: b.id, bot_name: b.botName || "", path: b.path || "", user_agent: b.userAgent || "",
    ip_hint: b.ipHint || "", created_at: b.createdAt || new Date().toISOString(),
  })));

  const events = readJson("events.json", []);
  await upsert("events", events.map((e) => ({
    id: e.id, event_type: e.eventType || "page_view", visitor_id: e.visitorId, session_id: e.sessionId,
    path: e.path, title: e.title, locale: e.locale, referrer: e.referrer, country: e.country, ip_hint: e.ipHint,
    user_agent: e.userAgent, viewport: e.viewport || null, screen: e.screen || null, timezone: e.timezone,
    language: e.language, duration_ms: e.durationMs ?? null, metadata: e.metadata || null,
    created_at: e.createdAt || new Date().toISOString(),
  })));

  console.log("Done.");
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});

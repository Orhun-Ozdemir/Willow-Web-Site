import type { APIRoute } from "astro";
import { getSession } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import {
  ALLOWED_ANALYTICS_EVENTS,
  ANALYTICS_CONSENT_VERSION,
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_VISITOR_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  VISITOR_MAX_AGE_SECONDS,
  analyticsCookieOptions,
  createAnonymousId,
  getAnalyticsGeo,
  hasAnalyticsConsent,
  isSameOriginRequest,
  parseUserAgent,
  readCookie,
} from "@/lib/analytics";

export const prerender = false;

const RANGE_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
const MAX_BODY_BYTES = 16_384;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 120;
const rateBuckets = new Map<string, { count: number; expiresAt: number }>();
let lastRetentionAttempt = 0;

const METADATA_KEYS = new Set([
  "label", "section", "itemId", "itemName", "itemCategory", "href",
  "scrollDepth", "formId", "productSlug", "errorType",
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function getClientIp(request: Request): string {
  return String(
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown",
  ).split(",")[0].trim();
}

function isRateLimited(request: Request, visitorId: string): boolean {
  const now = Date.now();
  const key = `${getClientIp(request)}:${visitorId || "anonymous"}`;
  const current = rateBuckets.get(key);
  if (!current || current.expiresAt <= now) {
    rateBuckets.set(key, { count: 1, expiresAt: now + RATE_WINDOW_MS });
    if (rateBuckets.size > 5_000) {
      for (const [bucketKey, bucket] of rateBuckets) {
        if (bucket.expiresAt <= now) rateBuckets.delete(bucketKey);
      }
    }
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT;
}

function maybePruneExpiredEvents() {
  const now = Date.now();
  if (now - lastRetentionAttempt < 86_400_000) return;
  lastRetentionAttempt = now;
  void Promise.resolve(getServiceClient().rpc("prune_analytics_events", { retention_days: 180 })).catch(() => {});
}

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanPath(value: unknown): string {
  const raw = cleanText(value, 500);
  if (!raw.startsWith("/")) return "/";
  try {
    const url = new URL(raw, "https://analytics.invalid");
    return `${url.pathname}${url.search}`.slice(0, 500);
  } catch {
    return raw.split("#")[0].slice(0, 500);
  }
}

function cleanExternalUrl(value: unknown): string {
  const raw = cleanText(value, 700);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (!/^https?:$/.test(url.protocol)) return "";
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return "";
  }
}

function cleanMetadata(value: unknown): Record<string, string | number | boolean> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result: Record<string, string | number | boolean> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (!METADATA_KEYS.has(key)) continue;
    if (typeof item === "string") result[key] = item.slice(0, 300);
    else if (typeof item === "number" && Number.isFinite(item)) result[key] = item;
    else if (typeof item === "boolean") result[key] = item;
  }
  return Object.keys(result).length ? result : null;
}

function countBy(events: any[], selector: (event: any) => string, limit = 8) {
  const counts = new Map<string, number>();
  events.forEach((event) => {
    const key = selector(event);
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function summarizeEvents(events: any[], range: string) {
  const pageViews = events.filter((event) => event.event_type === "page_view");
  const engagements = events.filter((event) => event.event_type === "page_engagement" && Number(event.duration_ms) > 0);
  const visitorIds = new Set(events.map((event) => event.visitor_id).filter(Boolean));
  const sessionIds = new Set(events.map((event) => event.session_id).filter(Boolean));
  const sessions = new Map<string, { pages: number; visitorId: string }>();
  const visitorSessions = new Map<string, Set<string>>();

  pageViews.forEach((event) => {
    if (!event.session_id) return;
    const current = sessions.get(event.session_id) || { pages: 0, visitorId: event.visitor_id || "" };
    current.pages += 1;
    sessions.set(event.session_id, current);
    if (event.visitor_id) {
      const ids = visitorSessions.get(event.visitor_id) || new Set<string>();
      ids.add(event.session_id);
      visitorSessions.set(event.visitor_id, ids);
    }
  });

  const returningVisitors = [...visitorSessions.values()].filter((ids) => ids.size > 1).length;
  const bouncedSessions = [...sessions.values()].filter((session) => session.pages <= 1).length;
  const averageEngagementMs = engagements.length
    ? Math.round(engagements.reduce((sum, event) => sum + Number(event.duration_ms || 0), 0) / engagements.length)
    : 0;
  const conversionEvents = events.filter((event) => /_form_submit$/.test(event.event_type));
  const conversionSessions = new Set(conversionEvents.map((event) => event.session_id).filter(Boolean)).size;

  const dailyMap = new Map<string, { pageViews: number; visitors: Set<string>; conversions: number }>();
  events.forEach((event) => {
    const day = String(event.created_at || "").slice(0, 10);
    if (!day) return;
    const row = dailyMap.get(day) || { pageViews: 0, visitors: new Set<string>(), conversions: 0 };
    if (event.event_type === "page_view") row.pageViews += 1;
    if (event.visitor_id) row.visitors.add(event.visitor_id);
    if (/_form_submit$/.test(event.event_type)) row.conversions += 1;
    dailyMap.set(day, row);
  });

  return {
    range,
    totalEvents: events.length,
    pageViews: pageViews.length,
    uniqueVisitors: visitorIds.size,
    sessions: sessionIds.size,
    returningVisitors,
    averageEngagementMs,
    bounceRate: sessions.size ? Math.round((bouncedSessions / sessions.size) * 100) : 0,
    conversions: conversionEvents.length,
    conversionRate: sessionIds.size ? Number(((conversionSessions / sessionIds.size) * 100).toFixed(1)) : 0,
    topPages: countBy(pageViews, (event) => event.path, 10),
    topCountries: countBy(pageViews, (event) => event.country, 10),
    topCities: countBy(pageViews, (event) => [event.city, event.country].filter(Boolean).join(", "), 10),
    topReferrers: countBy(pageViews, (event) => {
      if (!event.referrer) return "Direct";
      try { return new URL(event.referrer).hostname.replace(/^www\./, ""); } catch { return "Direct"; }
    }, 10),
    topDevices: countBy(pageViews, (event) => event.device_type || "unknown", 6),
    topBrowsers: countBy(pageViews, (event) => event.browser || "unknown", 8),
    topEvents: countBy(events, (event) => event.event_type, 12),
    topProducts: countBy(events.filter((event) => event.event_type === "product_view"), (event) => event.metadata?.productSlug || event.path, 10),
    daily: [...dailyMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, row]) => ({
      date,
      pageViews: row.pageViews,
      visitors: row.visitors.size,
      conversions: row.conversions,
    })),
  };
}

function mapEvent(event: any) {
  return {
    id: event.id,
    eventType: event.event_type,
    path: event.path,
    title: event.title,
    locale: event.locale,
    referrer: event.referrer,
    country: event.country,
    city: event.city,
    region: event.region,
    deviceType: event.device_type,
    browser: event.browser,
    operatingSystem: event.operating_system,
    durationMs: event.duration_ms,
    metadata: event.metadata,
    createdAt: event.created_at,
  };
}

function normalizeEvent(event: any) {
  const analytics = event?.metadata?._analytics || {};
  return {
    ...event,
    city: event.city || analytics.city || "",
    region: event.region || analytics.region || "",
    continent: event.continent || analytics.continent || "",
    device_type: event.device_type || analytics.deviceType || "",
    browser: event.browser || analytics.browser || "",
    operating_system: event.operating_system || analytics.operatingSystem || "",
    landing_page: event.landing_page || analytics.landingPage || "",
    utm_source: event.utm_source || analytics.utmSource || "",
    utm_medium: event.utm_medium || analytics.utmMedium || "",
    utm_campaign: event.utm_campaign || analytics.utmCampaign || "",
  };
}

export const GET: APIRoute = async ({ request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

  const url = new URL(request.url);
  const range = RANGE_DAYS[url.searchParams.get("range") || "30d"] ? (url.searchParams.get("range") || "30d") : "30d";
  const since = new Date(Date.now() - RANGE_DAYS[range] * 86_400_000).toISOString();

  try {
    const { data, error } = await getServiceClient()
      .from("events")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10_000);

    if (error) throw error;
    const events = (data || []).map(normalizeEvent);
    return json({ ok: true, summary: summarizeEvents(events, range), latest: events.slice(0, 60).map(mapEvent) });
  } catch (error: any) {
    return json({ ok: false, error: error?.message || "Analytics could not be loaded" }, 500);
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isSameOriginRequest(request)) return json({ ok: false, error: "Invalid origin" }, 403);
  if (!hasAnalyticsConsent(request)) return json({ ok: false, error: "Analytics consent required" }, 403);

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return json({ ok: false, error: "Payload too large" }, 413);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid payload" }, 400);
  }

  const eventType = cleanText(body.eventType, 80);
  if (!ALLOWED_ANALYTICS_EVENTS.has(eventType)) {
    return json({ ok: false, error: "Unsupported event" }, 400);
  }

  const cookieHeader = request.headers.get("cookie");
  const visitorId = readCookie(cookieHeader, ANALYTICS_VISITOR_COOKIE) || createAnonymousId();
  const sessionId = readCookie(cookieHeader, ANALYTICS_SESSION_COOKIE) || createAnonymousId();
  if (isRateLimited(request, visitorId)) return json({ ok: false, error: "Rate limit exceeded" }, 429);

  cookies.set(ANALYTICS_VISITOR_COOKIE, visitorId, analyticsCookieOptions(VISITOR_MAX_AGE_SECONDS, true));
  cookies.set(ANALYTICS_SESSION_COOKIE, sessionId, analyticsCookieOptions(SESSION_MAX_AGE_SECONDS, true));

  const userAgent = cleanText(request.headers.get("user-agent"), 500);
  const geo = getAnalyticsGeo(request);
  const device = parseUserAgent(userAgent);
  const attribution = body.attribution && typeof body.attribution === "object" ? body.attribution : {};
  const durationMs = Math.max(0, Math.min(86_400_000, Math.round(Number(body.durationMs || 0))));
  const clientMetadata = cleanMetadata(body.metadata) || {};
  const analyticsMetadata = {
    city: geo.city,
    region: geo.region,
    continent: geo.continent,
    deviceType: device.deviceType,
    browser: device.browser,
    operatingSystem: device.operatingSystem,
    landingPage: cleanPath(attribution.landingPage || body.path),
    utmSource: cleanText(attribution.utmSource, 160),
    utmMedium: cleanText(attribution.utmMedium, 160),
    utmCampaign: cleanText(attribution.utmCampaign, 200),
    utmTerm: cleanText(attribution.utmTerm, 200),
    utmContent: cleanText(attribution.utmContent, 200),
    consentVersion: ANALYTICS_CONSENT_VERSION,
  };

  const event = {
    id: createAnonymousId(),
    event_type: eventType,
    visitor_id: visitorId,
    session_id: sessionId,
    path: cleanPath(body.path),
    title: cleanText(body.title, 220),
    locale: cleanText(body.locale, 12),
    referrer: cleanExternalUrl(body.referrer),
    country: geo.country,
    ip_hint: null,
    user_agent: userAgent,
    viewport: body.viewport && typeof body.viewport === "object" ? {
      width: Math.max(0, Math.min(10_000, Number(body.viewport.width || 0))),
      height: Math.max(0, Math.min(10_000, Number(body.viewport.height || 0))),
    } : null,
    screen: null,
    timezone: geo.timezone || cleanText(body.timezone, 120),
    language: cleanText(body.language, 80),
    duration_ms: durationMs,
    metadata: { ...clientMetadata, _analytics: analyticsMetadata },
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await getServiceClient().from("events").insert(event);
    if (error) throw error;
    maybePruneExpiredEvents();
    return json({ ok: true }, 201);
  } catch (error: any) {
    return json({ ok: false, error: error?.message || "Event could not be stored" }, 500);
  }
};

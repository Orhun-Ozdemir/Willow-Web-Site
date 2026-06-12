import type { APIRoute } from "astro";
import crypto from "node:crypto";
import { getSession } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export const prerender = false;

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "";
}

function getCountry(request: Request) {
  return String(
    request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("x-country-code") ||
      ""
  ).toUpperCase();
}

function summarizeEvents(events: any[]) {
  const uniqueVisitors = new Set(events.map((event) => event.visitor_id).filter(Boolean)).size;
  const byType: Record<string, number> = {};
  const byPath: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  let totalDurationMs = 0;
  let durationCount = 0;

  events.forEach((event) => {
    byType[event.event_type] = (byType[event.event_type] || 0) + 1;
    if (event.path) byPath[event.path] = (byPath[event.path] || 0) + 1;
    if (event.country) byCountry[event.country] = (byCountry[event.country] || 0) + 1;
    if (event.duration_ms > 0) {
      totalDurationMs += event.duration_ms;
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
    latest: events.slice(0, 40).map(e => ({
      id: e.id,
      eventType: e.event_type,
      visitorId: e.visitor_id,
      sessionId: e.session_id,
      path: e.path,
      title: e.title,
      locale: e.locale,
      referrer: e.referrer,
      country: e.country,
      ipHint: e.ip_hint,
      userAgent: e.user_agent,
      viewport: e.viewport,
      screen: e.screen,
      timezone: e.timezone,
      language: e.language,
      durationMs: e.duration_ms,
      metadata: e.metadata,
      createdAt: e.created_at
    }))
  };
}

export const GET: APIRoute = async ({ request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false }).limit(1000);
  
  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const events = data || [];
  
  return new Response(JSON.stringify({ 
    ok: true, 
    events: events.map(e => ({
      id: e.id,
      eventType: e.event_type,
      visitorId: e.visitor_id,
      sessionId: e.session_id,
      path: e.path,
      title: e.title,
      locale: e.locale,
      referrer: e.referrer,
      country: e.country,
      ipHint: e.ip_hint,
      userAgent: e.user_agent,
      viewport: e.viewport,
      screen: e.screen,
      timezone: e.timezone,
      language: e.language,
      durationMs: e.duration_ms,
      metadata: e.metadata,
      createdAt: e.created_at
    })), 
    summary: summarizeEvents(events) 
  }), { status: 200, headers: { "Content-Type": "application/json" } });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const supabase = getServiceClient();
    
    const event = {
      id: crypto.randomUUID(),
      event_type: String(body.eventType || "event").slice(0, 80),
      visitor_id: String(body.visitorId || "").slice(0, 120),
      session_id: String(body.sessionId || "").slice(0, 120),
      path: String(body.path || "").slice(0, 500),
      title: String(body.title || "").slice(0, 220),
      locale: String(body.locale || "").slice(0, 12),
      referrer: String(body.referrer || "").slice(0, 500),
      country: getCountry(request),
      ip_hint: getClientIp(request).replace(/(\d+\.\d+\.\d+)\.\d+$/, "$1.x"),
      user_agent: String(request.headers.get("user-agent") || "").slice(0, 500),
      viewport: body.viewport || null,
      screen: body.screen || null,
      timezone: String(body.timezone || "").slice(0, 120),
      language: String(body.language || "").slice(0, 80),
      duration_ms: Number(body.durationMs || 0),
      metadata: body.metadata || null,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from("events").insert(event);
    if (error) throw new Error(error.message);

    return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, error: error.message || "Invalid payload" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
};

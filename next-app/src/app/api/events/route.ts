import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getSession } from "@/lib/auth";

const eventsFile = path.join(process.cwd(), "../data/events.json");

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "127.0.0.1";
}

function getCountry(req: NextRequest) {
  return String(
    req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("x-country-code") ||
      ""
  ).toUpperCase();
}

function summarizeEvents(events: any[]) {
  const uniqueVisitors = new Set(events.map((event) => event.visitorId).filter(Boolean)).size;
  const byType: Record<string, number> = {};
  const byPath: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
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

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = fs.existsSync(eventsFile) ? JSON.parse(fs.readFileSync(eventsFile, "utf8")) : [];
    return NextResponse.json({ ok: true, events, summary: summarizeEvents(events) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to read events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const events = fs.existsSync(eventsFile) ? JSON.parse(fs.readFileSync(eventsFile, "utf8")) : [];
    
    const event = {
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
      userAgent: String(req.headers.get("user-agent") || "").slice(0, 500),
      viewport: body.viewport || {},
      screen: body.screen || {},
      timezone: String(body.timezone || "").slice(0, 120),
      language: String(body.language || "").slice(0, 80),
      durationMs: Number(body.durationMs || 0),
      metadata: body.metadata || {},
      createdAt: new Date().toISOString()
    };

    events.unshift(event);
    fs.writeFileSync(eventsFile, JSON.stringify(events.slice(0, 5000), null, 2) + "\n", "utf8");
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    const status = error.status || 400;
    return NextResponse.json({ ok: false, error: error.message || "Invalid payload" }, { status });
  }
}

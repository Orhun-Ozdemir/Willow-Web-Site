import crypto from "node:crypto";

export const ANALYTICS_CONSENT_COOKIE = "willow_analytics_consent";
export const ANALYTICS_VISITOR_COOKIE = "willow_vid";
export const ANALYTICS_SESSION_COOKIE = "willow_sid";
export const ANALYTICS_CONSENT_VERSION = "1";

export const VISITOR_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
export const SESSION_MAX_AGE_SECONDS = 60 * 30;
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const ALLOWED_ANALYTICS_EVENTS = new Set([
  "page_view",
  "page_engagement",
  "scroll_depth",
  "cta_click",
  "nav_click",
  "language_switch",
  "product_card_click",
  "product_view",
  "document_download",
  "outbound_click",
  "email_click",
  "phone_click",
  "whatsapp_click",
  "contact_form_start",
  "contact_form_submit",
  "start_project_form_start",
  "start_project_form_submit",
  "form_error",
]);

export function createAnonymousId(): string {
  return crypto.randomUUID();
}

export function readCookie(cookieHeader: string | null, name: string): string {
  if (!cookieHeader) return "";
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export function hasAnalyticsConsent(request: Request): boolean {
  return readCookie(request.headers.get("cookie"), ANALYTICS_CONSENT_COOKIE) === `granted:${ANALYTICS_CONSENT_VERSION}`;
}

export function safeDecodeHeader(value: string | null): string {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getAnalyticsGeo(request: Request) {
  return {
    country: String(
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("x-country-code") ||
      "",
    ).toUpperCase().slice(0, 3),
    region: safeDecodeHeader(request.headers.get("x-vercel-ip-country-region")).slice(0, 120),
    city: safeDecodeHeader(request.headers.get("x-vercel-ip-city")).slice(0, 160),
    continent: String(request.headers.get("x-vercel-ip-continent") || "").toUpperCase().slice(0, 3),
    timezone: safeDecodeHeader(request.headers.get("x-vercel-ip-timezone")).slice(0, 120),
  };
}

export function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  const deviceType = /ipad|tablet|kindle|silk/.test(ua)
    ? "tablet"
    : /mobi|android|iphone|ipod/.test(ua)
      ? "mobile"
      : "desktop";

  let browser = "Other";
  if (/edg\//.test(ua)) browser = "Edge";
  else if (/opr\/|opera/.test(ua)) browser = "Opera";
  else if (/firefox\/|fxios\//.test(ua)) browser = "Firefox";
  else if (/crios\/|chrome\//.test(ua)) browser = "Chrome";
  else if (/safari\//.test(ua)) browser = "Safari";

  let operatingSystem = "Other";
  if (/windows nt/.test(ua)) operatingSystem = "Windows";
  else if (/iphone|ipad|ipod/.test(ua)) operatingSystem = "iOS";
  else if (/android/.test(ua)) operatingSystem = "Android";
  else if (/mac os x|macintosh/.test(ua)) operatingSystem = "macOS";
  else if (/linux/.test(ua)) operatingSystem = "Linux";

  return { deviceType, browser, operatingSystem };
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return !import.meta.env.PROD;
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
    const requestHosts = new Set([
      requestUrl.host.toLowerCase(),
      request.headers.get("host")?.toLowerCase(),
      forwardedHost?.toLowerCase(),
    ].filter((host): host is string => Boolean(host)));
    const originHost = originUrl.host.toLowerCase();

    if (requestHosts.has(originHost)) return true;

    // Vercel redirects the apex domain to www, while Astro can still expose the
    // configured apex host inside the server function. Treat only WillowSoft's
    // canonical apex/www pair as the same site; unrelated domains stay blocked.
    const willowHosts = new Set(["willowsoft.co", "www.willowsoft.co"]);
    return willowHosts.has(originHost) && [...requestHosts].some((host) => willowHosts.has(host));
  } catch {
    return false;
  }
}

export function analyticsCookieOptions(maxAge: number, httpOnly: boolean) {
  return {
    path: "/",
    maxAge,
    httpOnly,
    secure: import.meta.env.PROD,
    sameSite: "lax" as const,
  };
}

import type { APIRoute } from "astro";
import {
  ANALYTICS_CONSENT_COOKIE,
  ANALYTICS_CONSENT_VERSION,
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_VISITOR_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  SESSION_MAX_AGE_SECONDS,
  VISITOR_MAX_AGE_SECONDS,
  analyticsCookieOptions,
  createAnonymousId,
  isSameOriginRequest,
} from "@/lib/analytics";

export const prerender = false;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  },
});

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isSameOriginRequest(request)) return json({ ok: false, error: "Invalid origin" }, 403);

  let body: { granted?: boolean };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid payload" }, 400);
  }

  if (typeof body.granted !== "boolean") {
    return json({ ok: false, error: "Consent choice is required" }, 400);
  }

  cookies.set(
    ANALYTICS_CONSENT_COOKIE,
    `${body.granted ? "granted" : "denied"}:${ANALYTICS_CONSENT_VERSION}`,
    analyticsCookieOptions(CONSENT_MAX_AGE_SECONDS, false),
  );

  if (!body.granted) {
    cookies.delete(ANALYTICS_VISITOR_COOKIE, { path: "/" });
    cookies.delete(ANALYTICS_SESSION_COOKIE, { path: "/" });
    return json({ ok: true, consent: "denied" });
  }

  if (!cookies.get(ANALYTICS_VISITOR_COOKIE)?.value) {
    cookies.set(
      ANALYTICS_VISITOR_COOKIE,
      createAnonymousId(),
      analyticsCookieOptions(VISITOR_MAX_AGE_SECONDS, true),
    );
  }

  cookies.set(
    ANALYTICS_SESSION_COOKIE,
    createAnonymousId(),
    analyticsCookieOptions(SESSION_MAX_AGE_SECONDS, true),
  );

  return json({ ok: true, consent: "granted" });
};

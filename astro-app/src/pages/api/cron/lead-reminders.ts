import type { APIRoute } from "astro";
import { runLeadReminderDigest } from "@/lib/lead-reminders";

export const prerender = false;

const env = (key: string): string | undefined =>
  (import.meta.env as any)?.[key] ?? (typeof process !== "undefined" ? process.env?.[key] : undefined);

function isAuthorized(request: Request): boolean {
  const secret = env("CRON_SECRET");
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export const GET: APIRoute = async ({ request, url }) => {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const force = url.searchParams.get("force") === "1";
    const result = await runLeadReminderDigest({ force });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Lead reminder cron failed:", err);
    return new Response(JSON.stringify({ ok: false, error: err?.message || "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

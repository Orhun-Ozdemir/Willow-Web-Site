import type { APIRoute } from "astro";
import { getSession } from "@/lib/auth";
import { syncTelegram } from "@/lib/notifications";

export const prerender = false;

const env = (key: string): string | undefined =>
  (import.meta.env as any)?.[key] ?? (typeof process !== "undefined" ? process.env?.[key] : undefined);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const POST: APIRoute = async ({ request }) => {
  if (!getSession(request.headers.get("cookie"))) return json({ ok: false }, 401);

  const token = env("TELEGRAM_BOT_TOKEN");
  if (!token) return json({ ok: false, error: "TELEGRAM_BOT_TOKEN tanımlı değil" }, 500);

  try {
    const { added, total } = await syncTelegram(token);
    return json({ ok: true, added, total });
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

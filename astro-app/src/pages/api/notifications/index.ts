import type { APIRoute } from "astro";
import { getSession } from "@/lib/auth";
import { listRecipients, addRecipient, removeRecipient } from "@/lib/notifications";

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function authed(request: Request) {
  return Boolean(getSession(request.headers.get("cookie")));
}

export const GET: APIRoute = async ({ request }) => {
  if (!authed(request)) return json({ ok: false }, 401);
  try {
    return json(await listRecipients());
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!authed(request)) return json({ ok: false }, 401);
  try {
    const body = await request.json();

    if (body.type === "telegram") {
      const entry = await addRecipient("telegram", String(body.chatId || ""), body.label || "");
      return json({ ok: true, entry }, 201);
    }

    const email = String(body.email || "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: "Geçersiz e-posta" }, 400);
    }
    const entry = await addRecipient("email", email, body.label || "");
    return json({ ok: true, entry }, 201);
  } catch (e: any) {
    const status = /zaten ekli/.test(e.message) ? 409 : 400;
    return json({ ok: false, error: e.message }, status);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!authed(request)) return json({ ok: false }, 401);
  try {
    const { id, type } = await request.json();
    await removeRecipient(id, type === "telegram" ? "telegram" : "email");
    return json({ ok: true });
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

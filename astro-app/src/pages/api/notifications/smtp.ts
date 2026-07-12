import type { APIRoute } from "astro";
import { getSession } from "@/lib/auth";
import { getSmtpPublicStatus, saveSmtpSettings, getSmtpConfig } from "@/lib/smtp-settings";
import nodemailer from "nodemailer";

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function authed(request: Request) {
  return Boolean(getSession(request.headers.get("cookie")));
}

export const GET: APIRoute = async ({ request }) => {
  if (!authed(request)) return json({ ok: false, error: "Unauthorized" }, 401);
  try {
    return json({ ok: true, smtp: await getSmtpPublicStatus() });
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  if (!authed(request)) return json({ ok: false, error: "Unauthorized" }, 401);
  try {
    const body = await request.json();
    const user = String(body.user || "").trim();
    if (user && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user)) {
      return json({ ok: false, error: "Geçersiz SMTP kullanıcı e-postası" }, 400);
    }
    await saveSmtpSettings({
      host: body.host,
      port: body.port,
      user: body.user,
      pass: body.pass,
    });
    return json({ ok: true, smtp: await getSmtpPublicStatus() });
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

/** Optional connectivity test with current (or provided) credentials. */
export const POST: APIRoute = async ({ request }) => {
  if (!authed(request)) return json({ ok: false, error: "Unauthorized" }, 401);
  try {
    const body = await request.json().catch(() => ({}));
    const current = await getSmtpConfig();
    const host = String(body.host || current.host).trim();
    const port = Number(body.port || current.port) || 465;
    const user = String(body.user || current.user).trim();
    const pass = String(body.pass || "").trim() || current.pass;
    if (!user || !pass) return json({ ok: false, error: "SMTP kullanıcı ve şifre gerekli" }, 400);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transporter.verify();
    return json({ ok: true, message: "SMTP bağlantısı başarılı" });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || "SMTP doğrulanamadı" }, 400);
  }
};

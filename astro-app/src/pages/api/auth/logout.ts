import type { APIRoute } from "astro";
import { deleteSession, getSession } from "@/lib/auth";
import { resolveAdminProfile, getRequestMeta } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (session) {
    const profile = await resolveAdminProfile(session.user);
    const meta = getRequestMeta(request);
    void logAdminAction(profile, {
      action: "auth.logout",
      resource: "auth",
      ...meta,
    });
  }
  deleteSession(request.headers.get("cookie"));
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "willow_admin=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
    },
  });
};

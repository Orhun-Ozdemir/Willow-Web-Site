import type { APIRoute } from "astro";
import { getSession, hashPassword } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { resolveAdminProfile, getRequestMeta } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";

export const prerender = false;

function withDefaultRole<T extends { role?: string | null }>(row: T) {
  return { ...row, role: row.role || "super_admin" };
}

export const GET: APIRoute = async ({ request }) => {
  if (!getSession(request.headers.get("cookie"))) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const sb = getServiceClient();
    let result = await sb
      .from("admin_users")
      .select("id, username, active, role, created_at")
      .order("created_at", { ascending: true });

    if (result.error?.message?.includes("role")) {
      result = await sb
        .from("admin_users")
        .select("id, username, active, created_at")
        .order("created_at", { ascending: true });
    }

    if (result.error) throw result.error;
    const users = (result.data ?? []).map(withDefaultRole);
    return new Response(JSON.stringify({ ok: true, users }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!getSession(request.headers.get("cookie"))) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const body = await request.json();
    const { username, password } = body;
    if (!username || !password) {
      return new Response(JSON.stringify({ ok: false, error: "Kullanıcı adı ve şifre gerekli." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    if (password.length < 8) {
      return new Response(JSON.stringify({ ok: false, error: "Şifre en az 8 karakter olmalı." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const password_hash = hashPassword(password);
    const role = body.role && ["super_admin", "content_editor", "sales", "viewer"].includes(body.role)
      ? body.role
      : "content_editor";

    const sb = getServiceClient();
    let result = await sb
      .from("admin_users")
      .insert({ username: String(username).trim(), password_hash, active: true, role })
      .select("id, username, active, role, created_at")
      .single();

    if (result.error?.message?.includes("role")) {
      result = await sb
        .from("admin_users")
        .insert({ username: String(username).trim(), password_hash, active: true })
        .select("id, username, active, created_at")
        .single();
    }

    if (result.error) throw result.error;
    const data = withDefaultRole(result.data!);

    const session = getSession(request.headers.get("cookie"));
    if (session) {
      const profile = await resolveAdminProfile(session.user);
      const meta = getRequestMeta(request);
      void logAdminAction(profile, {
        action: "user.create",
        resource: "admin_users",
        resourceId: data.id,
        metadata: { username: data.username, role: data.role },
        ...meta,
      });
    }

    return new Response(JSON.stringify({ ok: true, user: data }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    const msg = e.code === "23505" ? "Bu kullanıcı adı zaten mevcut." : e.message;
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
};

import type { APIRoute } from "astro";
import { getSession, hashPassword } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { resolveAdminProfile, getRequestMeta } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";

export const prerender = false;

export const PATCH: APIRoute = async ({ request, params }) => {
  if (!getSession(request.headers.get("cookie"))) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const patch: Record<string, any> = {};

    if (typeof body.active === "boolean") patch.active = body.active;
    if (body.password) {
      if (String(body.password).length < 8) {
        return new Response(JSON.stringify({ ok: false, error: "Şifre en az 8 karakter olmalı." }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      patch.password_hash = hashPassword(body.password);
    }
    if (body.role && ["super_admin", "content_editor", "sales", "viewer"].includes(body.role)) {
      patch.role = body.role;
    }

    const sb = getServiceClient();
    let result = await sb
      .from("admin_users")
      .update(patch)
      .eq("id", id)
      .select("id, username, active, role, created_at")
      .single();

    if (result.error?.message?.includes("role")) {
      const { role: _role, ...patchWithoutRole } = patch;
      result = await sb
        .from("admin_users")
        .update(patchWithoutRole)
        .eq("id", id)
        .select("id, username, active, created_at")
        .single();
    }

    if (result.error) throw result.error;
    const data = { ...result.data, role: result.data?.role || "super_admin" };

    const session = getSession(request.headers.get("cookie"));
    if (session) {
      const profile = await resolveAdminProfile(session.user);
      const meta = getRequestMeta(request);
      void logAdminAction(profile, {
        action: "user.update",
        resource: "admin_users",
        resourceId: id,
        metadata: { fields: Object.keys(patch) },
        ...meta,
      });
    }

    return new Response(JSON.stringify({ ok: true, user: data }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!getSession(request.headers.get("cookie"))) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const { id } = params;
    const { error } = await getServiceClient()
      .from("admin_users")
      .delete()
      .eq("id", id);

    if (error) throw error;

    const session = getSession(request.headers.get("cookie"));
    if (session) {
      const profile = await resolveAdminProfile(session.user);
      const meta = getRequestMeta(request);
      void logAdminAction(profile, {
        action: "user.delete",
        resource: "admin_users",
        resourceId: id,
        ...meta,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

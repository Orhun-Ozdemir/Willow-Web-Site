import type { APIRoute } from "astro";
import { getSession, hashPassword } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

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

    const { data, error } = await getServiceClient()
      .from("admin_users")
      .update(patch)
      .eq("id", id)
      .select("id, username, active, created_at")
      .single();

    if (error) throw error;
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
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

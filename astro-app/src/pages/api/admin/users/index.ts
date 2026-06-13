import type { APIRoute } from "astro";
import { getSession, hashPassword } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!getSession(request.headers.get("cookie"))) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const { data, error } = await getServiceClient()
      .from("admin_users")
      .select("id, username, active, created_at")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, users: data }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!getSession(request.headers.get("cookie"))) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return new Response(JSON.stringify({ ok: false, error: "Kullanıcı adı ve şifre gerekli." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    if (password.length < 8) {
      return new Response(JSON.stringify({ ok: false, error: "Şifre en az 8 karakter olmalı." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const password_hash = hashPassword(password);
    const { data, error } = await getServiceClient()
      .from("admin_users")
      .insert({ username: String(username).trim(), password_hash, active: true })
      .select("id, username, active, created_at")
      .single();

    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, user: data }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    const msg = e.code === "23505" ? "Bu kullanıcı adı zaten mevcut." : e.message;
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
};

import type { APIRoute } from "astro";
import { requireAdmin, jsonResponse } from "@/lib/admin-auth";
import { getServiceClient } from "@/lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const auth = await requireAdmin(request, "audit.read");
  if (!auth.ok) {
    return jsonResponse({ ok: false, error: auth.error }, auth.status);
  }

  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 50));
    const action = url.searchParams.get("action")?.trim() || "";
    const actor = url.searchParams.get("actor")?.trim() || "";
    const from = url.searchParams.get("from")?.trim() || "";
    const to = url.searchParams.get("to")?.trim() || "";
    const offset = (page - 1) * limit;

    const sb = getServiceClient();
    let query = sb
      .from("admin_audit_logs")
      .select("id, actor_name, action, resource, resource_id, metadata, ip_hint, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (action) query = query.eq("action", action);
    if (actor) query = query.ilike("actor_name", `%${actor}%`);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data, error, count } = await query;
    if (error) throw error;

    return jsonResponse({
      ok: true,
      logs: data ?? [],
      pagination: { page, limit, total: count ?? 0 },
    });
  } catch (e: any) {
    const msg = e?.message || "Failed to load audit logs";
    if (msg.includes("admin_audit_logs") || msg.includes("does not exist")) {
      return jsonResponse({
        ok: true,
        logs: [],
        pagination: { page: 1, limit: 50, total: 0 },
        migrationPending: true,
      });
    }
    return jsonResponse({ ok: false, error: msg }, 500);
  }
};

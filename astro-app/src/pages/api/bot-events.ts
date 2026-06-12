import type { APIRoute } from "astro";
import { getSession } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase.from("bot_events").select("*").order("created_at", { ascending: false }).limit(1000);
  
  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  // Frontend expects camelCase properties
  const botEvents = (data || []).map(b => ({
    id: b.id,
    botName: b.bot_name,
    path: b.path,
    userAgent: b.user_agent,
    ipHint: b.ip_hint,
    createdAt: b.created_at
  }));
  
  return new Response(JSON.stringify(botEvents), { status: 200, headers: { "Content-Type": "application/json" } });
};

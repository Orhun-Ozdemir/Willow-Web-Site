import type { APIRoute } from "astro";
import { getServiceClient } from "@/lib/supabase";
import { processCampaign } from "@/lib/publishing";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const auth = request.headers.get("authorization");
  const secret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("publication_campaigns")
      .select("id")
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(5);
    if (error) throw error;
    const results = [];
    for (const campaign of data || []) {
      try {
        results.push(await processCampaign(campaign.id));
      } catch (error: any) {
        results.push({ campaignId: campaign.id, status: "failed", error: error?.message || "Unknown error" });
      }
    }
    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), { headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, error: error?.message || "Worker failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

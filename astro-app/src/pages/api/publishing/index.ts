import type { APIRoute } from "astro";
import { withAdminAuth, jsonResponse, getRequestMeta } from "@/lib/admin-auth";
import { getServiceClient } from "@/lib/supabase";
import { logAdminAction } from "@/lib/audit";
import { newIdempotencyKey, PUBLISHING_PLATFORMS } from "@/lib/publishing";
import { hasPermission } from "@/lib/permissions";

export const prerender = false;

function setupError(error: any) {
  const message = String(error?.message || error || "");
  if (/publication_|social_accounts|schema cache|does not exist/i.test(message)) {
    return jsonResponse({
      ok: false,
      code: "PUBLISHING_MIGRATION_REQUIRED",
      error: "Yayın Merkezi veri modeli henüz Supabase'e uygulanmamış.",
    }, 503);
  }
  return jsonResponse({ ok: false, error: message || "Yayın verisi okunamadı." }, 500);
}

export const GET: APIRoute = async ({ request }) => withAdminAuth(request, "publishing.read", async () => {
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("publication_campaigns")
      .select("*, publication_targets(*)")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return jsonResponse({ ok: true, campaigns: data || [] });
  } catch (error) {
    return setupError(error);
  }
});

export const POST: APIRoute = async ({ request }) => withAdminAuth(request, "publishing.write", async ({ profile }) => {
  try {
    const body = await request.json();
    const content = body.content || {};
    const title = String(content.title || "").trim();
    const targets = Array.isArray(body.targets)
      ? body.targets.filter((target: any) => PUBLISHING_PLATFORMS.includes(target.platform))
      : [];
    if (!title) return jsonResponse({ ok: false, error: "Yayın başlığı gerekli." }, 400);
    if (!targets.length) return jsonResponse({ ok: false, error: "En az bir kanal ekleyin." }, 400);
    if (body.scheduledAt && !hasPermission(profile.role, "publishing.schedule")) {
      return jsonResponse({ ok: false, error: "Bu hesabın yayın zamanlama yetkisi yok." }, 403);
    }

    const sb = getServiceClient();
    const campaignId = typeof body.id === "string" && body.id ? body.id : undefined;
    const now = new Date().toISOString();
    const campaignPayload: Record<string, any> = {
      title,
      canonical_content: content,
      timezone: body.timezone || "Europe/Istanbul",
      scheduled_at: body.scheduledAt || null,
      status: body.scheduledAt ? "scheduled" : "draft",
      updated_by: profile.id,
      updated_at: now,
    };
    if (!campaignId) {
      campaignPayload.idempotency_key = body.idempotencyKey || newIdempotencyKey();
      campaignPayload.created_by = profile.id;
    }
    const query = campaignId
      ? sb.from("publication_campaigns").update(campaignPayload).eq("id", campaignId).select("*").single()
      : sb.from("publication_campaigns").insert(campaignPayload).select("*").single();
    const { data: campaign, error } = await query;
    if (error || !campaign) throw error || new Error("Yayın kaydedilemedi.");

    for (const target of targets) {
      const accountId = typeof target.accountId === "string" && !target.accountId.startsWith("env:") && target.accountId !== "website"
        ? target.accountId
        : null;
      const { error: targetError } = await sb.from("publication_targets").upsert({
        campaign_id: campaign.id,
        platform: target.platform,
        account_id: accountId,
        enabled: target.enabled !== false,
        overrides: target.overrides || {},
        status: "pending",
        updated_at: now,
      }, { onConflict: "campaign_id,platform" });
      if (targetError) throw targetError;
    }

    await sb.from("publication_events").insert({
      campaign_id: campaign.id,
      event_type: campaignId ? "draft_updated" : "draft_created",
      message: campaignId ? "Yayın taslağı güncellendi." : "Yayın taslağı oluşturuldu.",
      actor_id: profile.id,
    });
    await logAdminAction(profile, {
      action: campaignId ? "publishing.update" : "publishing.create",
      resource: "publication_campaign",
      resourceId: campaign.id,
      metadata: { channels: targets.filter((target: any) => target.enabled !== false).map((target: any) => target.platform) },
      ...getRequestMeta(request),
    });
    return jsonResponse({ ok: true, campaign: { ...campaign, publication_targets: targets } }, campaignId ? 200 : 201);
  } catch (error) {
    return setupError(error);
  }
});

import type { APIRoute } from "astro";
import { withAdminAuth, jsonResponse, getRequestMeta } from "@/lib/admin-auth";
import { getServiceClient } from "@/lib/supabase";
import { logAdminAction } from "@/lib/audit";
import { processCampaign, type PublishingPlatform } from "@/lib/publishing";

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => withAdminAuth(request, "publishing.publish", async ({ profile }) => {
  const id = params.id;
  if (!id) return jsonResponse({ ok: false, error: "Yayın kimliği eksik." }, 400);
  try {
    const body = await request.json().catch(() => ({}));
    const requested = Array.isArray(body.targets) ? body.targets as PublishingPlatform[] : undefined;
    const idempotencyKey = String(body.idempotencyKey || "");
    const sb = getServiceClient();
    const { data: campaign, error } = await sb.from("publication_campaigns").select("id,idempotency_key,status").eq("id", id).single();
    if (error || !campaign) return jsonResponse({ ok: false, error: "Yayın bulunamadı." }, 404);
    if (campaign.status === "published" && (!requested || !requested.length)) {
      return jsonResponse({ ok: false, code: "ALREADY_PUBLISHED", error: "Bu yayın daha önce bütün kanallarda yayınlandı." }, 409);
    }
    if (idempotencyKey && campaign.idempotency_key && idempotencyKey !== campaign.idempotency_key) {
      return jsonResponse({ ok: false, code: "IDEMPOTENCY_MISMATCH", error: "Yayın güvenlik anahtarı eşleşmiyor." }, 409);
    }
    const result = await processCampaign(id, requested);
    await logAdminAction(profile, {
      action: "publishing.publish",
      resource: "publication_campaign",
      resourceId: id,
      metadata: { status: result.status, targets: result.targets.map((target) => target.platform) },
      ...getRequestMeta(request),
    });
    return jsonResponse({ ok: true, ...result });
  } catch (error: any) {
    return jsonResponse({ ok: false, error: error?.message || "Yayınlama tamamlanamadı." }, 422);
  }
});

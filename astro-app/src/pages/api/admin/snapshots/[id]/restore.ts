import type { APIRoute } from "astro";
import { withAdminAuth, getRequestMeta } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";
import { createCmsSnapshot, restoreSnapshot, getSnapshot } from "@/lib/snapshots";

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  return withAdminAuth(request, "history.manage", async ({ profile }) => {
    try {
      const id = params.id;
      if (!id) {
        return new Response(JSON.stringify({ ok: false, error: "Snapshot id gerekli" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const body = await request.json().catch(() => ({}));
      if (body?.confirm !== "RESTORE") {
        return new Response(
          JSON.stringify({ ok: false, error: 'Onay gerekli — confirm: "RESTORE" gönderin.' }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const target = await getSnapshot(id);
      if (!target) {
        return new Response(JSON.stringify({ ok: false, error: "Snapshot bulunamadı." }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const meta = getRequestMeta(request);

      // Geri yüklemeden önce güvenlik snapshot'ı
      await createCmsSnapshot(profile, {
        section: "pre-restore",
        ip_hint: meta.ip_hint,
        user_agent: meta.user_agent,
      });

      await restoreSnapshot(id);

      void logAdminAction(profile, {
        action: "snapshot.restore",
        resource: "cms",
        resourceId: id,
        metadata: {
          reason: target.reason,
          snapshotAt: target.created_at,
          actor: target.actor_name,
        },
        ...meta,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          restoredSnapshotId: id,
          restoredAt: new Date().toISOString(),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Geri yükleme başarısız";
      return new Response(JSON.stringify({ ok: false, error: msg }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  });
};

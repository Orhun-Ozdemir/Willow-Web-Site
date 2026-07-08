import type { APIRoute } from "astro";
import { withAdminAuth, getRequestMeta } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";
import { createCmsSnapshot, getSnapshot, revertSnapshotSection } from "@/lib/snapshots";

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
      if (body?.confirm !== "REVERT") {
        return new Response(
          JSON.stringify({ ok: false, error: 'Onay gerekli — confirm: "REVERT" gönderin.' }),
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

      await createCmsSnapshot(profile, {
        section: "pre-restore",
        ip_hint: meta.ip_hint,
        user_agent: meta.user_agent,
      });

      const { section, page } = await revertSnapshotSection(id);

      await logAdminAction(profile, {
        action: "snapshot.revert_section",
        resource: section,
        resourceId: id,
        metadata: {
          page,
          reason: target.reason,
          snapshotAt: target.created_at,
        },
        ...meta,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          revertedSection: section,
          page,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Geri alma başarısız";
      return new Response(JSON.stringify({ ok: false, error: msg }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  });
};

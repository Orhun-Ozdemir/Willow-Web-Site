import type { APIRoute } from "astro";
import { withAdminAuth, jsonResponse } from "@/lib/admin-auth";
import { listSnapshots, getSnapshot } from "@/lib/snapshots";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  return withAdminAuth(request, "history.manage", async () => {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get("id")?.trim();

      if (id) {
        const snapshot = await getSnapshot(id);
        if (!snapshot) {
          return jsonResponse({ ok: false, error: "Snapshot bulunamadı." }, 404);
        }
        return jsonResponse({ ok: true, snapshot });
      }

      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));
      const actor = url.searchParams.get("actor")?.trim() || "";
      const reason = url.searchParams.get("reason")?.trim() || "";
      const from = url.searchParams.get("from")?.trim() || "";
      const to = url.searchParams.get("to")?.trim() || "";

      const { snapshots, total } = await listSnapshots({ page, limit, actor, reason, from, to });

      return jsonResponse({
        ok: true,
        snapshots,
        pagination: { page, limit, total },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Snapshot listesi alınamadı";
      if (msg.includes("admin_snapshots") || msg.includes("does not exist")) {
        return jsonResponse({
          ok: true,
          snapshots: [],
          pagination: { page: 1, limit: 20, total: 0 },
          migrationPending: true,
        });
      }
      return jsonResponse({ ok: false, error: msg }, 500);
    }
  });
};

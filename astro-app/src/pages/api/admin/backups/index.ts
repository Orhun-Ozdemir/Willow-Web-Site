import type { APIRoute } from "astro";
import { withAdminAuth, getRequestMeta } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";
import { exportBackup, restoreBackup, validateBackup } from "@/lib/backup";
import { getServiceClient } from "@/lib/supabase";
import { bustContentCache } from "@/lib/content";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  return withAdminAuth(request, "backups.manage", async ({ profile }) => {
    try {
      const url = new URL(request.url);
      const scope = url.searchParams.get("scope") === "content" ? "content" : "full";

      const sb = getServiceClient();
      const backup = await exportBackup(sb, scope);

      const meta = getRequestMeta(request);
      void logAdminAction(profile, {
        action: "backup.export",
        resource: "database",
        metadata: { scope, stats: backup.stats },
        ...meta,
      });

      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const filename = `willowsoft-db-backup-${scope}-${ts}.json`;

      return new Response(JSON.stringify(backup, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Yedek alınamadı";
      return new Response(JSON.stringify({ ok: false, error: msg }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  });
};

export const POST: APIRoute = async ({ request }) => {
  return withAdminAuth(request, "backups.manage", async ({ profile }) => {
    try {
      const body = await request.json();
      const backup = body?.backup;
      const confirm = typeof body?.confirm === "string" ? body.confirm.trim() : "";
      const scope = body?.scope === "content" ? "content" : "full";
      const tables = Array.isArray(body?.tables) ? body.tables.filter((t: unknown) => typeof t === "string") : undefined;

      if (confirm !== "RESTORE") {
        return new Response(
          JSON.stringify({ ok: false, error: 'Onay gerekli — confirm: "RESTORE" gönderin.' }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const validation = validateBackup(backup);
      if (!validation.ok) {
        return new Response(JSON.stringify({ ok: false, error: validation.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const sb = getServiceClient();
      const preRestore = await exportBackup(sb, scope);
      const result = await restoreBackup(sb, backup, { scope, tables });
      bustContentCache();

      const meta = getRequestMeta(request);
      void logAdminAction(profile, {
        action: "backup.restore",
        resource: "database",
        metadata: { scope, tables: result.tables },
        ...meta,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          result,
          preRestoreSnapshot: {
            schemaVersion: preRestore.schemaVersion,
            createdAt: preRestore.createdAt,
            scope: preRestore.scope,
            stats: preRestore.stats,
          },
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

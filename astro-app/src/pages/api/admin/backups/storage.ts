import type { APIRoute } from "astro";
import { withAdminAuth, getRequestMeta } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";
import { getServiceClient, SUPABASE_URL } from "@/lib/supabase";
import { listAllStorageFiles, STORAGE_BUCKET } from "../../../../../../lib/storage-backup.mjs";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  return withAdminAuth(request, "backups.manage", async () => {
    try {
      const sb = getServiceClient();
      const files = await listAllStorageFiles(sb);
      const totalBytes = files.reduce((a: number, f: { size?: number }) => a + (f.size || 0), 0);
      return new Response(
        JSON.stringify({
          ok: true,
          bucket: STORAGE_BUCKET,
          supabaseUrl: SUPABASE_URL,
          files,
          stats: { count: files.length, totalBytes },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Storage listesi alınamadı";
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
      if (body?.confirm !== "SYNC") {
        return new Response(JSON.stringify({ ok: false, error: 'confirm: "SYNC" gerekli' }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const paths = Array.isArray(body?.paths) ? body.paths.filter((p: unknown) => typeof p === "string") : [];
      const backupPaths = new Set(paths);

      const sb = getServiceClient();
      const current = await listAllStorageFiles(sb);
      const stale = current.filter((f: { path: string }) => !backupPaths.has(f.path));

      for (const file of stale) {
        const { error } = await sb.storage.from(STORAGE_BUCKET).remove([file.path]);
        if (error) throw new Error(`Silinemedi (${file.path}): ${error.message}`);
      }

      const meta = getRequestMeta(request);
      void logAdminAction(profile, {
        action: "backup.storage-sync",
        resource: "assets",
        metadata: { kept: paths.length, deleted: stale.length },
        ...meta,
      });

      return new Response(JSON.stringify({ ok: true, deleted: stale.length, kept: paths.length }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Storage senkron başarısız";
      return new Response(JSON.stringify({ ok: false, error: msg }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  });
};

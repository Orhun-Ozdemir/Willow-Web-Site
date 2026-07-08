import type { APIRoute } from "astro";
import { withAdminAuth, getRequestMeta } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";
import { getServiceClient, SUPABASE_URL } from "@/lib/supabase";
import {
  buildStorageUsageReport,
  deleteStoragePaths,
  STORAGE_BUCKET,
} from "../../../../../../lib/storage-usage.mjs";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  return withAdminAuth(request, "storage.manage", async () => {
    try {
      const sb = getServiceClient();
      const report = await buildStorageUsageReport(sb);
      const files = report.files.map((f: {
        path: string;
        size: number;
        contentType: string;
        updatedAt?: string;
        kind: string;
        folder: string;
        used: boolean;
        sources: string[];
        isTemplateKeep: boolean;
      }) => ({
        ...f,
        publicUrl: `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/${f.path}`,
      }));

      return new Response(
        JSON.stringify({
          ok: true,
          bucket: STORAGE_BUCKET,
          supabaseUrl: SUPABASE_URL,
          stats: report.stats,
          files,
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

export const DELETE: APIRoute = async ({ request }) => {
  return withAdminAuth(request, "storage.manage", async ({ profile }) => {
    try {
      const body = await request.json();
      if (body?.confirm !== "SİL") {
        return new Response(JSON.stringify({ ok: false, error: 'Onay için confirm: "SİL" gerekli' }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const paths = Array.isArray(body?.paths)
        ? body.paths.filter((p: unknown) => typeof p === "string" && p.length > 0)
        : [];

      if (paths.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: "Silinecek dosya yolu gerekli" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const allowUsed = body?.allowUsed === true;
      const sb = getServiceClient();
      const result = await deleteStoragePaths(sb, paths, { allowUsed });

      const meta = getRequestMeta(request);
      void logAdminAction(profile, {
        action: "storage.delete",
        resource: "assets",
        metadata: {
          deleted: result.deleted,
          blocked: result.blocked.length,
          allowUsed,
          paths: result.paths,
        },
        ...meta,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          deleted: result.deleted,
          blocked: result.blocked,
          paths: result.paths,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Silme işlemi başarısız";
      return new Response(JSON.stringify({ ok: false, error: msg }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  });
};

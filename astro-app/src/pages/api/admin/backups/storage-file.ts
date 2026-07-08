import type { APIRoute } from "astro";
import { withAdminAuth, getRequestMeta } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";
import { getServiceClient } from "@/lib/supabase";
import { uploadStorageFile, STORAGE_BUCKET } from "../../../../../../lib/storage-backup.mjs";

export const prerender = false;

const SAFE_PATH_RE = /^[a-z0-9][a-z0-9/_.-]*$/i;

export const POST: APIRoute = async ({ request }) => {
  return withAdminAuth(request, "backups.manage", async ({ profile }) => {
    try {
      const formData = await request.formData();
      const storagePath = String(formData.get("path") || "").trim();
      const file = formData.get("file");

      if (!storagePath || !SAFE_PATH_RE.test(storagePath) || storagePath.includes("..")) {
        return new Response(JSON.stringify({ ok: false, error: "Geçersiz storage path" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ ok: false, error: "Dosya gerekli" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const sb = getServiceClient();
      await uploadStorageFile(sb, storagePath, buffer, file.type || "application/octet-stream");

      const meta = getRequestMeta(request);
      void logAdminAction(profile, {
        action: "backup.storage-file",
        resource: STORAGE_BUCKET,
        resourceId: storagePath,
        metadata: { size: buffer.byteLength },
        ...meta,
      });

      return new Response(JSON.stringify({ ok: true, path: storagePath }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Storage yükleme başarısız";
      return new Response(JSON.stringify({ ok: false, error: msg }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  });
};

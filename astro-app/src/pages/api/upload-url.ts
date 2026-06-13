import type { APIRoute } from "astro";
import { getServiceClient, hasSupabaseEnv, SUPABASE_URL } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import path from "node:path";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const folder = url.searchParams.get("folder") || "uploads";
  const filename = url.searchParams.get("filename") || "";

  if (!filename) {
    return new Response(JSON.stringify({ ok: false, error: "filename is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const extension = path.extname(filename).toLowerCase();
  const baseName = path.basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const storedFilename = `${baseName}-${Date.now()}${extension}`;
  const storagePath = `${folder}/${storedFilename}`;

  if (!hasSupabaseEnv) {
    return new Response(JSON.stringify({ ok: false, error: "Storage not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.storage
      .from("assets")
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      return new Response(JSON.stringify({ ok: false, error: error?.message || "Failed to create signed URL" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/assets/${storagePath}`;

    return new Response(JSON.stringify({ ok: true, signedUrl: data.signedUrl, token: data.token, publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("upload-url error:", err);
    return new Response(JSON.stringify({ ok: false, error: err?.message || "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
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

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || "";
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("upload-url: missing env vars", { hasUrl: !!SUPABASE_URL, hasKey: !!SUPABASE_SERVICE_ROLE_KEY });
    return new Response(JSON.stringify({ ok: false, error: "Storage not configured" }), {
      status: 500,
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

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.storage
      .from("assets")
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error("upload-url createSignedUploadUrl error:", error);
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

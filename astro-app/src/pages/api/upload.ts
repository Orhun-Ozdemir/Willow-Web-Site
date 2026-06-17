import type { APIRoute } from "astro";
import { getServiceClient, hasSupabaseEnv, SUPABASE_URL } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import fs from "node:fs";
import path from "node:path";

export const prerender = false;

// Only authenticated admins may upload, and only known-safe file types/locations.
const ALLOWED_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg", ".pdf",
]);
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB
// Folder must be a simple relative path (optionally nested), no traversal, no leading slash.
const SAFE_FOLDER_RE = /^[a-z0-9][a-z0-9/_-]*$/;

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = getSession(request.headers.get("cookie"));
    if (!session) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file || !file.name) {
      return new Response(JSON.stringify({ ok: false, error: "No file uploaded or invalid file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!SAFE_FOLDER_RE.test(folder) || folder.includes("..")) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid upload folder" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const extension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return new Response(JSON.stringify({ ok: false, error: `File type not allowed: ${extension || "unknown"}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (typeof file.size === "number" && file.size > MAX_FILE_BYTES) {
      return new Response(JSON.stringify({ ok: false, error: "File too large (max 15 MB)" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.byteLength > MAX_FILE_BYTES) {
      return new Response(JSON.stringify({ ok: false, error: "File too large (max 15 MB)" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }

    const originalName = file.name;
    const baseName = path.basename(originalName, path.extname(originalName))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    const filename = `${baseName}-${Date.now()}${extension}`;
    const storagePath = `${folder}/${filename}`;

    if (hasSupabaseEnv) {
      const supabase = getServiceClient();
      const { data, error } = await supabase.storage
        .from("assets")
        .upload(storagePath, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (error) {
        console.error("Supabase storage upload error:", error);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/assets/${storagePath}`;
      return new Response(JSON.stringify({ ok: true, url: publicUrl, filename }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Local dev filesystem fallback
      const uploadDir = path.join(process.cwd(), "..", "next-app", "public", "assets", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const localFilePath = path.join(uploadDir, filename);
      fs.writeFileSync(localFilePath, buffer);
      
      const publicUrl = `assets/uploads/${filename}`;
      return new Response(JSON.stringify({ ok: true, url: publicUrl, filename }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    console.error("Upload API error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message || "Server error during upload" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

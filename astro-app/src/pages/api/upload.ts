import type { APIRoute } from "astro";
import { getServiceClient, hasSupabaseEnv, SUPABASE_URL } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { resolveAdminProfile, getRequestMeta } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

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
    
    const timestamp = Date.now();
    const filename = `${baseName}-${timestamp}${extension}`;
    const storagePath = `${folder}/${filename}`;
    const optimizeRaster = file.type.startsWith("image/") && ![".gif", ".svg"].includes(extension);
    const optimizedFiles: { path: string; buffer: Buffer; width: number; height: number }[] = [];
    let imageMeta: { width: number; height: number; variants: Record<string, string> } | undefined;

    if (optimizeRaster) {
      const rotated = sharp(buffer, { failOn: "none" }).rotate();
      const metadata = await rotated.metadata();
      const sourceWidth = metadata.width || 1600;
      const variants: Record<string, string> = {};
      for (const width of [480, 768, 1200]) {
        if (width >= sourceWidth) continue;
        const variantPath = `${folder}/${baseName}-${timestamp}-${width}.webp`;
        const variant = await sharp(buffer, { failOn: "none" })
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 78, effort: 5 })
          .toBuffer({ resolveWithObject: true });
        optimizedFiles.push({ path: variantPath, buffer: variant.data, width: variant.info.width, height: variant.info.height });
        variants[String(width)] = variantPath;
      }
      const mainPath = `${folder}/${baseName}-${timestamp}.webp`;
      const main = await sharp(buffer, { failOn: "none" })
        .rotate()
        .resize({ width: Math.min(1600, sourceWidth), withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toBuffer({ resolveWithObject: true });
      optimizedFiles.push({ path: mainPath, buffer: main.data, width: main.info.width, height: main.info.height });
      imageMeta = { width: main.info.width, height: main.info.height, variants };
    }

    if (hasSupabaseEnv) {
      const supabase = getServiceClient();
      const filesToUpload = optimizedFiles.length
        ? optimizedFiles.map((item) => ({ path: item.path, body: new Blob([new Uint8Array(item.buffer)], { type: "image/webp" }), contentType: "image/webp" }))
        : [{ path: storagePath, body: file, contentType: file.type || "application/octet-stream" }];

      for (const item of filesToUpload) {
        const { error } = await supabase.storage.from("assets").upload(item.path, item.body, {
          contentType: item.contentType,
          cacheControl: "31536000",
          upsert: true,
        });
        if (error) {
          const status = (error as any).statusCode || (error as any).status;
          console.error("Supabase storage upload error:", status, error.message, error);
          return new Response(JSON.stringify({ ok: false, error: error.message, status }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      const finalPath = optimizedFiles.at(-1)?.path || storagePath;
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/assets/${finalPath}`;
      const profile = await resolveAdminProfile(session.user);
      const meta = getRequestMeta(request);
      void logAdminAction(profile, {
        action: "media.upload",
        resource: "assets",
        resourceId: finalPath,
        metadata: { filename, folder, size: file.size, optimized: optimizedFiles.length > 0 },
        ...meta,
      });
      return new Response(JSON.stringify({ ok: true, url: publicUrl, path: finalPath, filename: path.basename(finalPath), imageMeta }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Local dev filesystem fallback
      const uploadDir = path.join(process.cwd(), "public", "assets", folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      if (optimizedFiles.length) {
        for (const item of optimizedFiles) {
          const localFilePath = path.join(process.cwd(), "public", "assets", item.path);
          fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
          fs.writeFileSync(localFilePath, item.buffer);
        }
      } else {
        const localFilePath = path.join(uploadDir, filename);
        fs.writeFileSync(localFilePath, buffer);
      }
      
      const finalPath = optimizedFiles.at(-1)?.path || storagePath;
      const publicUrl = `assets/${finalPath}`;
      const profile = await resolveAdminProfile(session.user);
      const meta = getRequestMeta(request);
      void logAdminAction(profile, {
        action: "media.upload",
        resource: "assets",
        metadata: { filename, folder, size: file.size },
        ...meta,
      });
      return new Response(JSON.stringify({ ok: true, url: publicUrl, path: finalPath, filename: path.basename(finalPath), imageMeta }), {
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

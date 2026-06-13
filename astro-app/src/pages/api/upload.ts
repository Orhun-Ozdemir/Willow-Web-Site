import type { APIRoute } from "astro";
import { getServiceClient, hasSupabaseEnv, SUPABASE_URL } from "@/lib/supabase";
import fs from "node:fs";
import path from "node:path";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";
    
    if (!file || !file.name) {
      return new Response(JSON.stringify({ ok: false, error: "No file uploaded or invalid file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const originalName = file.name;
    const extension = path.extname(originalName).toLowerCase();
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

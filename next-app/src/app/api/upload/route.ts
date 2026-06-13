import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";
    
    if (!file || !file.name) {
      return NextResponse.json({ ok: false, error: "No file uploaded or invalid file" }, { status: 400 });
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

    if (hasSupabaseEnv && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data, error } = await supabase.storage
        .from("assets")
        .upload(storagePath, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (error) {
        console.error("Next.js Supabase storage upload error:", error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/assets/${storagePath}`;
      return NextResponse.json({ ok: true, url: publicUrl, filename });
    } else {
      // Local dev filesystem fallback
      const uploadDir = path.join(process.cwd(), "public", "assets", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const localFilePath = path.join(uploadDir, filename);
      fs.writeFileSync(localFilePath, buffer);
      
      const publicUrl = `assets/uploads/${filename}`;
      return NextResponse.json({ ok: true, url: publicUrl, filename });
    }
  } catch (err: any) {
    console.error("Next.js Upload API error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Server error during upload" }, { status: 500 });
  }
}

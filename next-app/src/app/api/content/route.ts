import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getSession } from "@/lib/auth";

const dataFile = path.join(process.cwd(), "../data/site-data.json");

export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to read content" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    body.meta = {
      ...(body.meta || {}),
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(dataFile, JSON.stringify(body, null, 2) + "\n", "utf8");
    return NextResponse.json({ ok: true, content: body });
  } catch (error: any) {
    const status = error.status || 400;
    return NextResponse.json({ ok: false, error: error.message || "Invalid payload" }, { status });
  }
}

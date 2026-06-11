import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getSession } from "@/lib/auth";

const leadsFile = path.join(process.cwd(), "../data/leads.json");

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const leads = fs.existsSync(leadsFile) ? JSON.parse(fs.readFileSync(leadsFile, "utf8")) : [];
    const index = leads.findIndex((lead: any) => lead.id === id);
    
    if (index === -1) {
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }

    leads[index] = {
      ...leads[index],
      status: body.status || leads[index].status,
      internalNote: body.internalNote !== undefined ? body.internalNote : leads[index].internalNote,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2) + "\n", "utf8");
    return NextResponse.json({ ok: true, lead: leads[index] });
  } catch (error: any) {
    const status = error.status || 400;
    return NextResponse.json({ ok: false, error: error.message || "Invalid payload" }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const leads = fs.existsSync(leadsFile) ? JSON.parse(fs.readFileSync(leadsFile, "utf8")) : [];
    const filtered = leads.filter((lead: any) => lead.id !== id);

    if (filtered.length === leads.length) {
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }

    fs.writeFileSync(leadsFile, JSON.stringify(filtered, null, 2) + "\n", "utf8");
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Delete failed" }, { status: 400 });
  }
}

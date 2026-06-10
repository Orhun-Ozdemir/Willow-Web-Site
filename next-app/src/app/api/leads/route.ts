import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getSession } from "@/lib/auth";

const leadsFile = path.join(process.cwd(), "../data/leads.json");

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leads = fs.existsSync(leadsFile) ? JSON.parse(fs.readFileSync(leadsFile, "utf8")) : [];
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to read leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const leads = fs.existsSync(leadsFile) ? JSON.parse(fs.readFileSync(leadsFile, "utf8")) : [];
    
    const lead = {
      id: crypto.randomUUID(),
      status: "new",
      internalNote: "",
      sourcePage: body.sourcePage || req.headers.get("referer") || "",
      locale: body.locale || "en",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: body.name || "",
      company: body.company || "",
      email: body.email || "",
      phone: body.phone || "",
      country: body.country || "",
      interestType: body.interestType || body.projectType || "",
      productInterest: body.productInterest || "",
      serviceInterest: body.serviceInterest || "",
      message: body.message || ""
    };

    leads.unshift(lead);
    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2) + "\n", "utf8");
    return NextResponse.json({ ok: true, lead }, { status: 201 });
  } catch (error: any) {
    const status = error.status || 400;
    return NextResponse.json({ ok: false, error: error.message || "Invalid payload" }, { status });
  }
}

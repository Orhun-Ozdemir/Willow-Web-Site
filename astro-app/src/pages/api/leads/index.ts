import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getSession } from "@/lib/auth";

export const prerender = false;

const leadsFile = path.join(process.cwd(), "../data/leads.json");

function readLeads(): any[] {
  try {
    return fs.existsSync(leadsFile) ? JSON.parse(fs.readFileSync(leadsFile, "utf8")) : [];
  } catch {
    return [];
  }
}

export const GET: APIRoute = async ({ request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify(readLeads()), { status: 200, headers: { "Content-Type": "application/json" } });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const leads = readLeads();

    const lead = {
      id: crypto.randomUUID(),
      status: "new",
      internalNote: "",
      sourcePage: body.sourcePage || request.headers.get("referer") || "",
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
      message: body.message || "",
    };

    leads.unshift(lead);
    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2) + "\n", "utf8");
    return new Response(JSON.stringify({ ok: true, lead }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, error: error.message || "Invalid payload" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
};

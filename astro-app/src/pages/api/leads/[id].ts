import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
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

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const PATCH: APIRoute = async ({ params, request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

  const { id } = params;
  try {
    const body = await request.json();
    const leads = readLeads();
    const index = leads.findIndex((l: any) => l.id === id);
    if (index === -1) return json({ ok: false, error: "Lead not found" }, 404);

    leads[index] = {
      ...leads[index],
      status: body.status || leads[index].status,
      internalNote: body.internalNote !== undefined ? body.internalNote : leads[index].internalNote,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2) + "\n", "utf8");
    return json({ ok: true, lead: leads[index] });
  } catch (error: any) {
    return json({ ok: false, error: error.message || "Invalid payload" }, 400);
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

  const { id } = params;
  try {
    const leads = readLeads();
    const filtered = leads.filter((l: any) => l.id !== id);
    if (filtered.length === leads.length) return json({ ok: false, error: "Lead not found" }, 404);

    fs.writeFileSync(leadsFile, JSON.stringify(filtered, null, 2) + "\n", "utf8");
    return json({ ok: true });
  } catch (error: any) {
    return json({ ok: false, error: error.message || "Delete failed" }, 400);
  }
};

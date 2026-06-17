import type { APIRoute } from "astro";
import { getSession } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { resolveAdminProfile, getRequestMeta } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";

export const prerender = false;

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const PATCH: APIRoute = async ({ params, request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

  const { id } = params;
  try {
    const body = await request.json();
    const supabase = getServiceClient();
    
    const updateData: any = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) updateData.status = body.status;
    if (body.internalNote !== undefined) updateData.internal_note = body.internalNote;
    
    const { data, error } = await supabase.from("leads").update(updateData).eq("id", id).select().single();
    
    if (error) {
      if (error.code === 'PGRST116') return json({ ok: false, error: "Lead not found" }, 404);
      throw new Error(error.message);
    }

    const responseLead = {
      ...data,
      internalNote: data.internal_note,
      sourcePage: data.source_page,
      interestType: data.interest_type,
      productInterest: data.product_interest,
      serviceInterest: data.service_interest,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    const profile = await resolveAdminProfile(session.user);
    const reqMeta = getRequestMeta(request);
    void logAdminAction(profile, {
      action: "lead.update",
      resource: "leads",
      resourceId: id,
      metadata: {
        status: body.status,
        noteUpdated: body.internalNote !== undefined,
      },
      ...reqMeta,
    });
    
    return json({ ok: true, lead: responseLead });
  } catch (error: any) {
    return json({ ok: false, error: error.message || "Invalid payload" }, 400);
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

  const { id } = params;
  try {
    const supabase = getServiceClient();
    const { error, count } = await supabase.from("leads").delete({ count: "exact" }).eq("id", id);
    
    if (error) throw new Error(error.message);
    if (count === 0) return json({ ok: false, error: "Lead not found" }, 404);

    const profile = await resolveAdminProfile(session.user);
    const reqMeta = getRequestMeta(request);
    void logAdminAction(profile, {
      action: "lead.delete",
      resource: "leads",
      resourceId: id,
      ...reqMeta,
    });
    
    return json({ ok: true });
  } catch (error: any) {
    return json({ ok: false, error: error.message || "Delete failed" }, 400);
  }
};

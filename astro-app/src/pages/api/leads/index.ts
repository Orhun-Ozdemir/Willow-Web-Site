import type { APIRoute } from "astro";
import crypto from "node:crypto";
import { getSession } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { getRecipientChannels } from "@/lib/notifications";
import { sendLeadNotification, sendTelegramNotification, type LeadMailData } from "@/lib/mailer";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const session = getSession(request.headers.get("cookie"));
  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  
  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  // Map snake_case back to camelCase for the frontend
  const leads = (data || []).map(l => ({
    id: l.id, status: l.status, internalNote: l.internal_note, sourcePage: l.source_page,
    locale: l.locale, name: l.name, company: l.company, email: l.email, phone: l.phone,
    country: l.country, interestType: l.interest_type, productInterest: l.product_interest,
    serviceInterest: l.service_interest, message: l.message, createdAt: l.created_at, updatedAt: l.updated_at
  }));

  return new Response(JSON.stringify(leads), { status: 200, headers: { "Content-Type": "application/json" } });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const supabase = getServiceClient();

    const lead = {
      id: crypto.randomUUID(),
      status: "new",
      internal_note: "",
      source_page: body.sourcePage || request.headers.get("referer") || "",
      locale: body.locale || "en",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: body.name || "",
      company: body.company || "",
      email: body.email || "",
      phone: body.phone || "",
      country: body.country || "",
      interest_type: body.interestType || body.projectType || "",
      product_interest: body.productInterest || "",
      service_interest: body.serviceInterest || "",
      message: body.message || "",
    };

    const { error } = await supabase.from("leads").insert(lead);

    if (error) {
      throw new Error(error.message);
    }

    // Fire-and-forget bildirimler — kayıt başarılıysa Telegram + e-posta gönder.
    // Hata olsa bile form yanıtını bloklamaz.
    try {
      const mailData: LeadMailData = {
        name: lead.name, email: lead.email, company: lead.company, phone: lead.phone,
        country: lead.country, interestType: lead.interest_type, productInterest: lead.product_interest,
        serviceInterest: lead.service_interest, message: lead.message, sourcePage: lead.source_page,
        locale: lead.locale,
        projectType: body.projectType, currentStatus: body.currentStatus, layers: body.layers,
        timeline: body.timeline, budgetRange: body.budgetRange,
      };
      const { emails, chatIds } = await getRecipientChannels();
      await Promise.allSettled([
        sendTelegramNotification(chatIds, mailData),
        sendLeadNotification(emails, mailData),
      ]);
    } catch (notifyErr) {
      console.error("Lead bildirimi gönderilemedi:", notifyErr);
    }

    // Convert back to camelCase for response
    const responseLead = {
      ...lead,
      internalNote: lead.internal_note,
      sourcePage: lead.source_page,
      interestType: lead.interest_type,
      productInterest: lead.product_interest,
      serviceInterest: lead.service_interest,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    };

    return new Response(JSON.stringify({ ok: true, lead: responseLead }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, error: error.message || "Invalid payload" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
};

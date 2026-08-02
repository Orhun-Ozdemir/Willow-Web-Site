import { getServiceClient } from "./supabase";
import { getRecipientChannels } from "./notifications";
import {
  sendUncontactedLeadsDigest,
  sendUncontactedLeadsTelegramDigest,
  type LeadDigestRow,
} from "./mailer";

const DIGEST_SETTING_KEY = "lead_digest_last_sent_at";
const ISTANBUL_TZ = "Europe/Istanbul";
const GRACE_HOURS = 24;

const env = (key: string): string | undefined =>
  (import.meta.env as any)?.[key] ?? (typeof process !== "undefined" ? process.env?.[key] : undefined);

function istanbulTodayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: ISTANBUL_TZ });
}

function daysWaiting(createdAt: string): number {
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.max(1, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

async function getLastDigestDate(): Promise<string | null> {
  const { data, error } = await getServiceClient()
    .from("app_settings")
    .select("value")
    .eq("key", DIGEST_SETTING_KEY)
    .maybeSingle();
  if (error) return null;
  return data?.value || null;
}

async function markDigestSent(): Promise<void> {
  const now = new Date().toISOString();
  await getServiceClient()
    .from("app_settings")
    .upsert(
      { key: DIGEST_SETTING_KEY, value: istanbulTodayKey(), updated_at: now },
      { onConflict: "key" }
    );
}

export type LeadReminderResult = {
  ok: boolean;
  skipped: boolean;
  reason?: string;
  count: number;
  emailsSent?: number;
};

export async function runLeadReminderDigest(options?: { force?: boolean }): Promise<LeadReminderResult> {
  const today = istanbulTodayKey();
  if (!options?.force) {
    const last = await getLastDigestDate();
    if (last === today) {
      return { ok: true, skipped: true, reason: "already_sent_today", count: 0 };
    }
  }

  const cutoff = new Date(Date.now() - GRACE_HOURS * 60 * 60 * 1000).toISOString();
  const { data: leads, error } = await getServiceClient()
    .from("leads")
    .select("id, name, email, company, phone, source_page, created_at")
    .eq("status", "new")
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  if (!leads?.length) {
    return { ok: true, skipped: true, reason: "no_stale_leads", count: 0 };
  }

  const digestRows: LeadDigestRow[] = leads.map((lead) => ({
    id: lead.id,
    name: lead.name || "—",
    email: lead.email || "—",
    company: lead.company || "",
    phone: lead.phone || "",
    sourcePage: lead.source_page || "",
    createdAt: lead.created_at,
    daysWaiting: daysWaiting(lead.created_at),
  }));

  const { emails, chatIds } = await getRecipientChannels();
  const adminUrl = `${(env("SITE_URL") || "https://willowsoft.co").replace(/\/$/, "")}/admin`;

  await Promise.allSettled([
    sendUncontactedLeadsDigest(emails, digestRows, adminUrl),
    sendUncontactedLeadsTelegramDigest(chatIds, digestRows, adminUrl),
  ]);

  const now = new Date().toISOString();
  const ids = leads.map((lead) => lead.id);
  const { error: updateError } = await getServiceClient()
    .from("leads")
    .update({ last_reminder_at: now, updated_at: now })
    .in("id", ids);

  if (updateError) throw new Error(updateError.message);

  await markDigestSent();

  return { ok: true, skipped: false, count: leads.length, emailsSent: emails.length };
}

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getServiceClient, hasSupabaseEnv } from "./supabase";

export interface EmailEntry { id: string; email: string; label: string; }
export interface TelegramEntry { id: string; chatId: string; label: string; }
export interface NotifData { emails: EmailEntry[]; telegram: TelegramEntry[]; }

const TABLE = "notification_recipients";
const file = path.join(process.cwd(), "../data/notification-emails.json");

// ── Local-file fallback (dev only, when Supabase env absent) ──────────────────
function readFile(): NotifData {
  try {
    const d = JSON.parse(fs.readFileSync(file, "utf8"));
    return { emails: d.emails || [], telegram: d.telegram || [] };
  } catch {
    return { emails: [], telegram: [] };
  }
}
function writeFile(data: NotifData) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// ── List ──────────────────────────────────────────────────────────────────────
export async function listRecipients(): Promise<NotifData> {
  if (!hasSupabaseEnv) return readFile();

  const { data, error } = await getServiceClient()
    .from(TABLE)
    .select("id, type, value, label")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  const emails: EmailEntry[] = [];
  const telegram: TelegramEntry[] = [];
  for (const r of data || []) {
    if (r.type === "email") emails.push({ id: r.id, email: r.value, label: r.label || "" });
    else if (r.type === "telegram") telegram.push({ id: r.id, chatId: r.value, label: r.label || "" });
  }
  return { emails, telegram };
}

// ── Add ────────────────────────────────────────────────────────────────────────
export async function addRecipient(
  type: "email" | "telegram",
  value: string,
  label: string
): Promise<EmailEntry | TelegramEntry> {
  const clean = value.trim();
  if (!clean) throw new Error(type === "email" ? "E-posta boş olamaz" : "Chat ID boş olamaz");

  if (!hasSupabaseEnv) {
    const data = readFile();
    const list = type === "email" ? data.emails : data.telegram;
    const exists = list.some((e: any) => (type === "email" ? e.email : e.chatId) === clean);
    if (exists) throw new Error(type === "email" ? "Bu e-posta zaten ekli" : "Bu Chat ID zaten ekli");
    const entry: any = { id: crypto.randomUUID(), label: label || "" };
    if (type === "email") { entry.email = clean; data.emails.push(entry); }
    else { entry.chatId = clean; data.telegram.push(entry); }
    writeFile(data);
    return entry;
  }

  const { data, error } = await getServiceClient()
    .from(TABLE)
    .insert({ type, value: clean, label: label || "" })
    .select("id, type, value, label")
    .single();
  if (error) {
    if ((error as any).code === "23505") {
      throw new Error(type === "email" ? "Bu e-posta zaten ekli" : "Bu Chat ID zaten ekli");
    }
    throw new Error(error.message);
  }
  return type === "email"
    ? { id: data.id, email: data.value, label: data.label || "" }
    : { id: data.id, chatId: data.value, label: data.label || "" };
}

// ── Remove ──────────────────────────────────────────────────────────────────────
export async function removeRecipient(id: string, type: "email" | "telegram"): Promise<void> {
  if (!hasSupabaseEnv) {
    const data = readFile();
    if (type === "telegram") data.telegram = data.telegram.filter((t) => t.id !== id);
    else data.emails = data.emails.filter((e) => e.id !== id);
    writeFile(data);
    return;
  }
  const { error } = await getServiceClient().from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Telegram chat-ID auto-discovery via getUpdates ──────────────────────────────
export async function syncTelegram(token: string): Promise<{ added: TelegramEntry[]; total: number }> {
  const tgRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`);
  const tgData = await tgRes.json();
  if (!tgData.ok) throw new Error("Telegram API hatası");

  const current = await listRecipients();
  const existing = new Set(current.telegram.map((t) => String(t.chatId)));
  const added: TelegramEntry[] = [];

  for (const update of tgData.result || []) {
    const chat = update.message?.chat || update.my_chat_member?.chat;
    if (!chat) continue;
    const chatId = String(chat.id);
    if (existing.has(chatId)) continue;
    existing.add(chatId);

    const label =
      [chat.first_name, chat.last_name].filter(Boolean).join(" ") ||
      chat.title || chat.username || chatId;

    const entry = (await addRecipient("telegram", chatId, label)) as TelegramEntry;
    added.push(entry);
  }

  const after = await listRecipients();
  return { added, total: after.telegram.length };
}

// ── Helpers for the lead-notification sender ──────────────────────────────────
export async function getRecipientChannels(): Promise<{ emails: string[]; chatIds: string[] }> {
  const data = await listRecipients();
  return {
    emails: data.emails.map((e) => e.email).filter(Boolean),
    chatIds: data.telegram.map((t) => t.chatId).filter(Boolean),
  };
}

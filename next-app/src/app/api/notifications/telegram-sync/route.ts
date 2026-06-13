import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getSession } from "@/lib/auth";

const file = path.join(process.cwd(), "../data/notification-emails.json");

function read() {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return { emails: [], telegram: [] }; }
}
function write(data: object) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN tanımlı değil" }, { status: 500 });

  // Telegram'dan son mesajları çek
  const tgRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`);
  const tgData = await tgRes.json();

  if (!tgData.ok) return NextResponse.json({ ok: false, error: "Telegram API hatası" }, { status: 500 });

  const data = read();
  const existingIds = new Set((data.telegram || []).map((t: any) => String(t.chatId)));

  const newEntries: { id: string; chatId: string; label: string }[] = [];

  for (const update of tgData.result) {
    const chat = update.message?.chat || update.my_chat_member?.chat;
    if (!chat) continue;

    const chatId = String(chat.id);
    if (existingIds.has(chatId)) continue;

    const label = [chat.first_name, chat.last_name].filter(Boolean).join(" ")
      || chat.title
      || chat.username
      || chatId;

    const entry = { id: crypto.randomUUID(), chatId, label };
    newEntries.push(entry);
    existingIds.add(chatId);
  }

  if (newEntries.length) {
    data.telegram = [...(data.telegram || []), ...newEntries];
    write(data);
  }

  return NextResponse.json({ ok: true, added: newEntries, total: data.telegram.length });
}

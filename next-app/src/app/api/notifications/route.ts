import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getSession } from "@/lib/auth";

const file = path.join(process.cwd(), "../data/notification-emails.json");

type Entry = { id: string; label: string };
type EmailEntry = Entry & { email: string };
type TelegramEntry = Entry & { chatId: string };
type NotifData = { emails: EmailEntry[]; telegram: TelegramEntry[] };

function read(): NotifData {
  try {
    const d = JSON.parse(fs.readFileSync(file, "utf8"));
    return { emails: d.emails || [], telegram: d.telegram || [] };
  } catch {
    return { emails: [], telegram: [] };
  }
}

function write(data: NotifData) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json(read());
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json();
  const data = read();

  // Telegram chat ID ekle
  if (body.type === "telegram") {
    const chatId = String(body.chatId || "").trim();
    if (!chatId) return NextResponse.json({ ok: false, error: "Chat ID boş olamaz" }, { status: 400 });
    if (data.telegram.find((t) => t.chatId === chatId))
      return NextResponse.json({ ok: false, error: "Bu Chat ID zaten ekli" }, { status: 409 });
    const entry: TelegramEntry = { id: crypto.randomUUID(), chatId, label: body.label || "" };
    data.telegram.push(entry);
    write(data);
    return NextResponse.json({ ok: true, entry }, { status: 201 });
  }

  // E-posta ekle
  const email = String(body.email || "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ ok: false, error: "Geçersiz e-posta" }, { status: 400 });
  if (data.emails.find((e) => e.email === email))
    return NextResponse.json({ ok: false, error: "Bu e-posta zaten ekli" }, { status: 409 });
  const entry: EmailEntry = { id: crypto.randomUUID(), email, label: body.label || "" };
  data.emails.push(entry);
  write(data);
  return NextResponse.json({ ok: true, entry }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const { id, type } = await req.json();
  const data = read();
  if (type === "telegram") {
    data.telegram = data.telegram.filter((t) => t.id !== id);
  } else {
    data.emails = data.emails.filter((e) => e.id !== id);
  }
  write(data);
  return NextResponse.json({ ok: true });
}

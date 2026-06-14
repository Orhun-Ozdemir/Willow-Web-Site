import nodemailer from "nodemailer";

// Works for both build-time (import.meta.env) and SSR runtime (process.env on Vercel/Node).
const env = (key: string): string | undefined =>
  (import.meta.env as any)?.[key] ?? (typeof process !== "undefined" ? process.env?.[key] : undefined);

export interface LeadMailData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  country?: string;
  interestType?: string;
  productInterest?: string;
  serviceInterest?: string;
  message?: string;
  sourcePage?: string;
  locale?: string;
  // Start Project alanları
  projectType?: string;
  currentStatus?: string;
  layers?: string | string[];
  timeline?: string;
  budgetRange?: string;
}

function getTransporter() {
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");
  if (!user || !pass) throw new Error("SMTP_USER ve SMTP_PASS env değişkenleri tanımlı değil");

  return nodemailer.createTransport({
    host: env("SMTP_HOST") || "smtp.gmail.com",
    port: Number(env("SMTP_PORT") || 465),
    secure: true,
    auth: { user, pass },
  });
}

export async function sendLeadNotification(to: string[], lead: LeadMailData) {
  if (!to.length) return;
  const user = env("SMTP_USER");
  if (!user || !env("SMTP_PASS")) return; // e-posta yapılandırılmamış — sessizce geç

  const transporter = getTransporter();
  const from = `"WillowSoft Admin" <${user}>`;

  const rows = [
    ["Ad Soyad", lead.name],
    ["E-posta", lead.email],
    ["Şirket", lead.company],
    ["Telefon", lead.phone],
    ["Ülke", lead.country],
    ["İlgi Alanı", lead.interestType],
    ["Ürün", lead.productInterest],
    ["Hizmet", lead.serviceInterest],
    ["Kaynak Sayfa", lead.sourcePage],
    ["Dil", lead.locale],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:600;color:#555;white-space:nowrap">${k}</td><td style="padding:6px 12px;color:#222">${v}</td></tr>`)
    .join("");

  const messageBlock = lead.message
    ? `<div style="margin-top:16px;padding:14px 16px;background:#f4f6fb;border-left:4px solid #132175;border-radius:4px;font-size:14px;color:#333;white-space:pre-wrap">${lead.message}</div>`
    : "";

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#132175;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="color:#fff;margin:0;font-size:18px">Yeni Form Başvurusu</h2>
        <p style="color:#a0b4e8;margin:4px 0 0;font-size:13px">WillowSoft web sitesinden yeni bir lead geldi</p>
      </div>
      <div style="border:1px solid #e0e5f0;border-top:none;border-radius:0 0 8px 8px;padding:20px 24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
        ${messageBlock}
        <hr style="margin:20px 0;border:none;border-top:1px solid #eee">
        <p style="font-size:12px;color:#aaa;margin:0">Bu mail WillowSoft admin paneli tarafından otomatik gönderilmiştir.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: to.join(", "),
    subject: `Yeni Lead: ${lead.name}${lead.company ? ` — ${lead.company}` : ""}`,
    html,
  });
}

export async function sendTelegramNotification(chatIds: string[], lead: LeadMailData) {
  const token = env("TELEGRAM_BOT_TOKEN");
  if (!token || !chatIds.length) return;

  const isStartProject = !!(lead.projectType || lead.timeline || lead.budgetRange);
  const layersArr = Array.isArray(lead.layers) ? lead.layers : lead.layers ? [lead.layers] : [];
  const divider = "─────────────────────";
  const parts: string[] = [];

  parts.push(isStartProject ? `🚀 *YENİ PROJE BAŞLATMA TALEBI*` : `📬 *YENİ İLETİŞİM FORMU*`);
  parts.push(`🌐 WillowSoft${lead.sourcePage ? ` — \`${lead.sourcePage}\`` : ""}`);
  parts.push(divider);

  parts.push(`👤 *${lead.name}*`);
  if (lead.email)   parts.push(`📧 ${lead.email}`);
  if (lead.company) parts.push(`🏢 ${lead.company}`);
  if (lead.phone)   parts.push(`📞 ${lead.phone}`);
  if (lead.country) parts.push(`🌍 ${lead.country}`);

  if (isStartProject) {
    parts.push(divider);
    parts.push(`📋 *Proje Detayları*`);
    if (lead.projectType)   parts.push(`▸ *Kapsam:* ${lead.projectType}`);
    if (lead.currentStatus) parts.push(`▸ *Mevcut Durum:* ${lead.currentStatus}`);
    if (layersArr.length)   parts.push(`▸ *Katmanlar:* ${layersArr.join(", ")}`);
    if (lead.timeline)      parts.push(`▸ *Zaman Planı:* ${lead.timeline}`);
    if (lead.budgetRange)   parts.push(`▸ *Bütçe:* ${lead.budgetRange}`);
  } else {
    if (lead.interestType)    parts.push(`💡 *İlgi:* ${lead.interestType}`);
    if (lead.productInterest) parts.push(`📦 *Ürün:* ${lead.productInterest}`);
    if (lead.serviceInterest) parts.push(`⚙️ *Hizmet:* ${lead.serviceInterest}`);
  }

  if (lead.message) {
    parts.push(divider);
    parts.push(`💬 *Mesaj:*`);
    parts.push(lead.message);
  }

  parts.push(divider);
  const now = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
  parts.push(`🕐 ${now}`);

  const lines = parts.join("\n");

  await Promise.allSettled(
    chatIds.map((chatId) =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: "Markdown" }),
      })
    )
  );
}

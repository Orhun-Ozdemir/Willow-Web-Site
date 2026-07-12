import nodemailer from "nodemailer";
import { getSmtpConfig } from "./smtp-settings";

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
  subject?: string;
}

async function getTransporter() {
  const cfg = await getSmtpConfig();
  if (!cfg.user || !cfg.pass) {
    throw new Error("SMTP_USER ve SMTP_PASS tanımlı değil (Ayarlar → Bildirimler veya env)");
  }

  return {
    transporter: nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
    }),
    user: cfg.user,
  };
}

export async function sendLeadNotification(to: string[], lead: LeadMailData) {
  const recipients = [...new Set((to || []).map((e) => e.trim()).filter((e) => e.includes("@")))];
  if (!recipients.length) return;

  const cfg = await getSmtpConfig();
  if (!cfg.user || !cfg.pass) {
    console.error("Lead e-posta atlandı: SMTP yapılandırılmamış");
    return;
  }

  const { transporter, user } = await getTransporter();
  const from = `"WillowSoft Admin" <${user}>`;

  const layersStr = Array.isArray(lead.layers)
    ? lead.layers.filter(Boolean).join(", ")
    : lead.layers || "";

  const rows = [
    ["Ad Soyad", lead.name],
    ["E-posta", lead.email],
    ["Şirket", lead.company],
    ["Telefon", lead.phone],
    ["Ülke", lead.country],
    ["İlgi Alanı", lead.interestType],
    ["Konu", lead.subject],
    ["Ürün", lead.productInterest],
    ["Hizmet", lead.serviceInterest],
    ["Kapsam", lead.projectType],
    ["Mevcut Durum", lead.currentStatus],
    ["Katmanlar", layersStr],
    ["Zaman Planı", lead.timeline],
    ["Bütçe", lead.budgetRange],
    ["Kaynak Sayfa", lead.sourcePage],
    ["Dil", lead.locale],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:600;color:#555;white-space:nowrap">${k}</td><td style="padding:6px 12px;color:#222">${v}</td></tr>`)
    .join("");

  const messageBlock = lead.message
    ? `<div style="margin-top:16px;padding:14px 16px;background:#f4f6fb;border-left:4px solid #132175;border-radius:4px;font-size:14px;color:#333;white-space:pre-wrap">${lead.message}</div>`
    : "";

  const isContact = !!(lead.sourcePage || "").includes("contact") && !lead.projectType;
  const title = isContact ? "Yeni İletişim Formu" : "Yeni Form Başvurusu";
  const mailSubject = isContact
    ? `İletişim: ${lead.name}${lead.subject ? ` — ${lead.subject}` : ""}`
    : `Yeni Lead: ${lead.name}${lead.company ? ` — ${lead.company}` : ""}`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#132175;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="color:#fff;margin:0;font-size:18px">${title}</h2>
        <p style="color:#a0b4e8;margin:4px 0 0;font-size:13px">WillowSoft web sitesinden yeni bir başvuru geldi</p>
      </div>
      <div style="border:1px solid #e0e5f0;border-top:none;border-radius:0 0 8px 8px;padding:20px 24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
        ${messageBlock}
        <hr style="margin:20px 0;border:none;border-top:1px solid #eee">
        <p style="font-size:12px;color:#aaa;margin:0">Bu mail WillowSoft admin paneli tarafından otomatik gönderilmiştir.</p>
      </div>
    </div>
  `;

  // Send one message per recipient so Hostinger/SMTP delivers to everyone on the
  // Ayarlar → Bildirimler list (comma-joined To: is unreliable with some providers).
  const results = await Promise.allSettled(
    recipients.map((addr) =>
      transporter.sendMail({ from, to: addr, subject: mailSubject, html })
    )
  );
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length) {
    console.error(
      `Lead e-posta kısmi hata: ${failed.length}/${recipients.length} başarısız`,
      failed.map((r) => (r as PromiseRejectedResult).reason?.message || r)
    );
  }
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
    if (lead.subject)         parts.push(`📝 *Konu:* ${lead.subject}`);
    if (lead.interestType && lead.interestType !== lead.subject) {
      parts.push(`💡 *İlgi:* ${lead.interestType}`);
    }
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

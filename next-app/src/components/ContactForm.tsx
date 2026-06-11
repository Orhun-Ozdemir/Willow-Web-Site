"use client";

import { useState } from "react";
import type { Locale } from "@/lib/cms";

interface ContactFormProps {
  locale: Locale;
}

export default function ContactForm({ locale }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "General Inquiry",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const successTitles: Record<string, string> = {
    en: "Submission Received!",
    tr: "Talebiniz Alındı!",
    ar: "تم استلام طلبك!",
    de: "Anfrage Erhalten!",
    fr: "Demande Reçue!",
    es: "¡Solicitud Recibida!",
    it: "Richiesta Ricevuta!",
    ja: "送信が完了しました！",
  };

  const successTexts: Record<string, string> = {
    en: "Thank you for reaching out. Our engineering team will review your details and contact you shortly.",
    tr: "Bizimle iletişime geçtiğiniz için teşekkürler. Mühendislik ekibimiz detayları inceleyip en kısa sürede sizinle iletişime geçecektir.",
    ar: "نشكرك على التواصل معنا. سيقوم فريق الهندسة لدينا بمراجعة التفاصيل والاتصال بك قريباً.",
    de: "Vielen Dank für Ihre Kontaktaufnahme. Unser Engineering-Team wird Ihre Angaben prüfen und sich in Kürze mit Ihnen in Verbindung setzen.",
    fr: "Merci de nous avoir contactés. Notre équipe d'ingénierie examinera vos détails et vous contactera sous peu.",
    es: "Gracias por ponerse en contacto. Nuestro equipo de ingeniería revisará sus detalles y se comunicará con usted en breve.",
    it: "Grazie per averci contattato. Il nostro team di ingegneria esaminerà i tuoi dettagli e ti contatterà al più presto.",
    ja: "お問い合わせいただきありがとうございます。エンジニアリングチームが内容を確認し、追ってご連絡いたします。",
  };

  const successButtons: Record<string, string> = {
    en: "Send another message",
    tr: "Yeni mesaj gönder",
    ar: "إرسال رسالة أخرى",
    de: "Weitere Nachricht senden",
    fr: "Envoyer un autre message",
    es: "Enviar otro mesaj",
    it: "Invia un altro messaggio",
    ja: "別のメッセージを送る",
  };

  const labels = {
    name: { en: "Name*", tr: "İsim*", de: "Name*", fr: "Nom*", es: "Nombre*", it: "Nome*", ar: "الاسم*", ja: "お名前*" },
    email: { en: "Email*", tr: "E-posta*", de: "E-Mail*", fr: "E-mail*", es: "Correo*", it: "Email*", ar: "البريد الإلكتروني*", ja: "メールアドレス*" },
    company: { en: "Company", tr: "Şirket", de: "Unternehmen", fr: "Entreprise", es: "Empresa", it: "Azienda", ar: "الشركة", ja: "会社名" },
    subject: { en: "Reason for Contact", tr: "İletişim Nedeni", de: "Kontaktgrund", fr: "Motif", es: "Motivo", it: "Motivo", ar: "سبب الاتصال", ja: "お問い合わせ件名" },
    message: { en: "How can we help?*", tr: "Nasıl yardımcı olabiliriz?*", de: "Wie können wir helfen?*", fr: "Comment pouvons-nous vous aider?*", es: "¿Cómo podemos ayudarle?*", it: "Come possiamo aiutarti?*", ar: "كيف يمكننا مساعدتك؟*", ja: "お問い合わせ内容*" },
    send: { en: "Send Message", tr: "Mesaj Gönder", de: "Nachricht senden", fr: "Envoyer le message", es: "Enviar mensaje", it: "Invia messaggio", ar: "إرسال الرسالة", ja: "メッセージを送信" },
  };

  const getLabel = (key: keyof typeof labels) => {
    return labels[key][locale as keyof (typeof labels)[typeof key]] || labels[key]["en"];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sourcePage: window.location.pathname,
          locale: locale,
        }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        throw new Error("Failed to submit form");
      }
    } catch (err) {
      console.error(err);
      // Offline fallback saved to localStorage
      try {
        const localLeads = JSON.parse(window.localStorage.getItem("willowsoft-leads-offline") || "[]");
        localLeads.unshift({
          id: `offline-${Date.now()}`,
          status: "new",
          createdAt: new Date().toISOString(),
          sourcePage: window.location.pathname,
          locale: locale,
          ...formData,
        });
        window.localStorage.setItem("willowsoft-leads-offline", JSON.stringify(localLeads));
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }
  };

  if (status === "success") {
    return (
      <div className="form card" style={{ textAlign: "center", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div className="success-icon" style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "grid", placeItems: "center", color: "#10b981", fontSize: "1.8rem", fontWeight: "bold" }}>✓</div>
        <h3 style={{ fontSize: "1.5rem", margin: 0 }}>{successTitles[locale] || successTitles.en}</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.96rem", margin: 0, lineHeight: 1.5, maxWidth: "320px" }}>{successTexts[locale] || successTexts.en}</p>
        <button type="button" className="btn btn-secondary btn-small" onClick={() => setStatus("idle")} style={{ marginTop: "10px" }}>
          {successButtons[locale] || successButtons.en}
        </button>
      </div>
    );
  }

  return (
    <form className="form card" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">{getLabel("name")}</label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="email">{getLabel("email")}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="company">{getLabel("company")}</label>
        <input
          id="company"
          name="company"
          autoComplete="organization"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="subject">{getLabel("subject")}</label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        >
          <option value="General Inquiry">General Inquiry</option>
          <option value="Partnership Opportunity">Partnership Opportunity</option>
          <option value="Careers & Contracting">Careers & Contracting</option>
          <option value="Press & Media">Press & Media</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="message">{getLabel("message")}</label>
        <textarea
          id="message"
          name="message"
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>
      {status === "error" && (
        <p style={{ color: "#ef4444", fontSize: "0.875rem" }}>Something went wrong. Please try again.</p>
      )}
      <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : getLabel("send")}
      </button>
    </form>
  );
}

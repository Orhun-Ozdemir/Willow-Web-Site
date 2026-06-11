"use client";

import { useState } from "react";
import type { Locale } from "@/lib/cms";

interface StartProjectFormProps {
  locale: Locale;
}

export default function StartProjectForm({ locale }: StartProjectFormProps) {
  const [formData, setFormData] = useState({
    message: "",
    projectType: "End-to-End Connected Product",
    currentStatus: "Idea / early planning",
    layers: [] as string[],
    timeline: "Exploring options",
    budgetRange: "Not sure yet",
    name: "",
    email: "",
    company: "",
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
    es: "Enviar otro mensaje",
    it: "Invia un altro messaggio",
    ja: "別のメッセージを送る",
  };

  const labels = {
    formHeader: { en: "Structured brief", tr: "Yapılandırılmış özet", de: "Strukturiertes Briefing", fr: "Brief structuré", es: "Briefing estructurado", it: "Brief strutturato", ar: "ملخص مهيكل", ja: "要件定義書" },
    formSteps: { en: "4 steps, one engineering review", tr: "4 adım, tek mühendislik incelemesi", de: "4 Schritte, eine technische Prüfung", fr: "4 étapes, une révision d'ingénierie", es: "4 pasos, una revisión de ingeniería", it: "4 passaggi, una revisione ingegneristica", ar: "4 خطوات، مراجعة هندسية واحدة", ja: "4ステップ、エンジニアによるレビュー" },
    step1: { en: "Project Concept", tr: "Proje Konsepti", de: "Projektkonzept", fr: "Concept de projet", es: "Concepto del proyecto", it: "Concetto del progetto", ar: "مفهوم المشروع", ja: "プロジェクト概要" },
    step2: { en: "Needed Layers", tr: "Gerekli Katmanlar", de: "Benötigte Ebenen", fr: "Couches nécessaires", es: "Capas necesarias", it: "Livelli necessari", ar: "الطبقات المطلوبة", ja: "必要な技術レイヤー" },
    step3: { en: "Timeline & Budget", tr: "Zaman Planı ve Bütçe", de: "Zeitplan & Budget", fr: "Calendrier et budget", es: "Cronograma y presupuesto", it: "Tempistiche e budget", ar: "الجدول الزمني والميزانية", ja: "スケジュールと予算" },
    step4: { en: "Your Information", tr: "Bilgileriniz", de: "Ihre Informationen", fr: "Vos informations", es: "Su información", it: "Le tue informazioni", ar: "معلوماتك", ja: "ご連絡先情報" },
    message: { en: "What are you building? *", tr: "Ne inşa ediyorsunuz? *", de: "Was bauen Sie? *", fr: "Que construisez-vous? *", es: "¿Qué está construyendo? *", it: "Cosa stai costruendo? *", ar: "ماذا تبني؟ *", ja: "何を作ろうとしていますか？ *" },
    projectType: { en: "Primary Scope", tr: "Birincil Kapsam", de: "Hauptbereich", fr: "Périmètre principal", es: "Alcance principal", it: "Ambito principale", ar: "النطاق الأساسي", ja: "主な開発領域" },
    currentStatus: { en: "Current Status", tr: "Mevcut Durum", de: "Aktueller Status", fr: "Statut actuel", es: "Estado actual", it: "Stato attuale", ar: "الوضع الحالي", ja: "現在の開発フェーズ" },
    layersQuestion: { en: "Which layers does this project require?", tr: "Bu proje hangi katmanları gerektiriyor?", de: "Welche Ebenen erfordert dieses Projekt?", fr: "Quelles couches ce projet nécessite-t-il?", es: "¿Qué capas requiere este proyecto?", it: "Quali livelli richiede questo progetto?", ar: "ما هي الطبقات التي يتطلبها هذا المشروع؟", ja: "このプロジェクトに必要なレイヤーは何ですか？" },
    timeline: { en: "Timeline", tr: "Zaman Planı", de: "Zeitplan", fr: "Calendrier", es: "Cronograma", it: "Tempistiche", ar: "الجدول الزمني", ja: "ご希望の納期" },
    budgetRange: { en: "Budget Range", tr: "Bütçe Aralığı", de: "Budgetbereich", fr: "Gamme de budget", es: "Rango de presupuesto", it: "Fascia di budget", ar: "نطاق الميزانية", ja: "ご予算感" },
    name: { en: "Name *", tr: "İsim *", de: "Name *", fr: "Nom *", es: "Nombre *", it: "Nome *", ar: "الاسم *", ja: "お名前 *" },
    email: { en: "Email *", tr: "E-posta *", de: "E-Mail *", fr: "E-mail *", es: "Correo *", it: "Email *", ar: "البريد الإلكتروني *", ja: "メールアドレス *" },
    company: { en: "Company", tr: "Şirket", de: "Unternehmen", fr: "Entreprise", es: "Empresa", it: "Azienda", ar: "الشركة", ja: "会社名" },
    submit: { en: "Send Project Brief", tr: "Proje Özetini Gönder", de: "Projektbriefing senden", fr: "Envoyer le brief du projet", es: "Enviar brief de proyecto", it: "Invia brief del progetto", ar: "إرسال ملخص المشروع", ja: "要件概要を送信" },
  };

  const getLabel = (key: keyof typeof labels) => {
    return labels[key][locale as keyof (typeof labels)[typeof key]] || labels[key]["en"];
  };

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => {
      const exists = prev.layers.includes(value);
      if (exists) {
        return { ...prev, layers: prev.layers.filter((l) => l !== value) };
      } else {
        return { ...prev, layers: [...prev.layers, value] };
      }
    });
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
        throw new Error("Failed to submit project brief");
      }
    } catch (err) {
      console.error(err);
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
    <form className="project-brief-form" aria-label="Project brief form" onSubmit={handleSubmit}>
      <div className="form-header">
        <span>{getLabel("formHeader")}</span>
        <strong>{getLabel("formSteps")}</strong>
      </div>
      
      <fieldset className="brief-form-group">
        <legend><span>1</span>{getLabel("step1")}</legend>
        <div className="field span-2">
          <label htmlFor="lpMessage">{getLabel("message")}</label>
          <textarea
            id="lpMessage"
            name="message"
            placeholder="Describe your product idea, operational goal, current blocker, or field deployment problem..."
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="lpType">{getLabel("projectType")}</label>
          <select
            id="lpType"
            name="projectType"
            value={formData.projectType}
            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
          >
            <option value="End-to-End Connected Product">End-to-End Connected Product</option>
            <option value="Custom IoT Hardware">Custom IoT Hardware</option>
            <option value="Firmware / Connectivity">Firmware / Connectivity</option>
            <option value="Backend / PostgreSQL / Admin Panel">Backend / PostgreSQL / Admin Panel</option>
            <option value="Mobile App / Web Platform">Mobile App / Web Platform</option>
            <option value="Website Development">Website Development</option>
            <option value="VR / Simulation">VR / Simulation</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="lpStatus">{getLabel("currentStatus")}</label>
          <select
            id="lpStatus"
            name="currentStatus"
            value={formData.currentStatus}
            onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
          >
            <option value="Idea / early planning">Idea / early planning</option>
            <option value="Prototype exists">Prototype exists</option>
            <option value="Hardware exists, software needed">Hardware exists, software needed</option>
            <option value="Software exists, hardware needed">Software exists, hardware needed</option>
            <option value="Existing system needs rebuild">Existing system needs rebuild</option>
            <option value="Ready for production support">Ready for production support</option>
          </select>
        </div>
      </fieldset>

      <fieldset className="brief-form-group">
        <legend><span>2</span>{getLabel("step2")}</legend>
        <div className="field span-2">
          <label>{getLabel("layersQuestion")}</label>
          <div className="option-grid">
            {(["hardware", "firmware", "backend", "postgresql", "web-admin", "mobile", "website", "vr"] as const).map((layer) => (
              <label key={layer}>
                <input
                  type="checkbox"
                  name="layers"
                  value={layer}
                  checked={formData.layers.includes(layer)}
                  onChange={() => handleCheckboxChange(layer)}
                />{" "}
                {layer.charAt(0).toUpperCase() + layer.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="brief-form-group">
        <legend><span>3</span>{getLabel("step3")}</legend>
        <div className="field">
          <label htmlFor="lpTimeline">{getLabel("timeline")}</label>
          <select
            id="lpTimeline"
            name="timeline"
            value={formData.timeline}
            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
          >
            <option value="Exploring options">Exploring options</option>
            <option value="0-3 months">0-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6+ months">6+ months</option>
            <option value="Urgent rescue project">Urgent rescue project</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="lpBudget">{getLabel("budgetRange")}</label>
          <select
            id="lpBudget"
            name="budgetRange"
            value={formData.budgetRange}
            onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
          >
            <option value="Not sure yet">Not sure yet</option>
            <option value="Under $10k">Under $10k</option>
            <option value="$10k - $25k">$10k - $25k</option>
            <option value="$25k - $75k">$25k - $75k</option>
            <option value="$75k+">$75k+</option>
          </select>
        </div>
      </fieldset>

      <fieldset className="brief-form-group">
        <legend><span>4</span>{getLabel("step4")}</legend>
        <div className="field">
          <label htmlFor="lpName">{getLabel("name")}</label>
          <input
            id="lpName"
            name="name"
            autoComplete="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="lpEmail">{getLabel("email")}</label>
          <input
            id="lpEmail"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="field span-2">
          <label htmlFor="lpCompany">{getLabel("company")}</label>
          <input
            id="lpCompany"
            name="company"
            autoComplete="organization"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>
      </fieldset>

      {status === "error" && (
        <p style={{ color: "#ef4444", fontSize: "0.875rem" }}>Something went wrong. Please try again.</p>
      )}
      <button className="btn btn-primary project-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : getLabel("submit")}
      </button>
    </form>
  );
}

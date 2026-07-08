"use client";

import { useState, useEffect } from "react";
import { locales, type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import LocaleTabs from "./LocaleTabs";
import { syncOfficePhonesInFacts } from "@/lib/company-contact";
import { DEFAULT_BRAND_TAGLINE } from "@/lib/brand-tagline";
import { SOCIAL_SVGS } from "@/lib/social-icons";

// ── Known companyFacts fields with human-readable metadata ──────────────────
const KNOWN_FACTS: { key: string; label: string; hint: string; type?: "text" | "textarea" }[] = [
  { key: "productsOnMarket", label: "Teslim Edilen Proje", hint: "Ana sayfa hero, hizmetler ve proje başlat sayfalarında görünür. Örn: 100+" },
  { key: "happyClients",     label: "Kurumsal Müşteri Sayısı", hint: "Ana sayfa hero ve diğer sayfalarda istatistik olarak görünür. Örn: 41+" },
  { key: "founded",          label: "Kuruluş Yılı", hint: "Ana sayfa hero ve hizmetler sayfasında görünür. Örn: 2020" },
  { key: "officesWorldwide", label: "Dünya Geneli Ofis Sayısı", hint: "Hizmetler ve proje başlat sayfalarında görünür (ana sayfa hero'da yok). Örn: 2" },
  { key: "email",            label: "E-posta Adresi",         hint: "İletişim sayfasında ve proje başlatma formunda görünür." },
  { key: "turkeyPhone",      label: "Türkiye Telefon",        hint: "İletişim ve şirket sayfalarında TR ofis telefonu. Örn: +90 850 30 24766" },
  { key: "ukPhone",          label: "İngiltere Telefon",      hint: "İletişim ve şirket sayfalarında UK ofis telefonu. Örn: +44 20 3996 6812" },
  { key: "turkeyOfficeAddress", label: "Türkiye Ofis Adresi", hint: "İletişim sayfasında Türkiye ofis adresi olarak görünür.", type: "textarea" },
  { key: "ukOfficeAddress",  label: "İngiltere Ofis Adresi",  hint: "İletişim sayfasında UK ofis adresi olarak görünür.", type: "textarea" },
];

// ── UI string key labels ─────────────────────────────────────────────────────
const UI_KEY_LABELS: Record<string, string> = {
  requestQuote:        "Teklif İste (buton)",
  downloadDatasheet:   "Veri Sayfasını İndir (buton)",
  contactUs:           "İletişime Geç (buton)",
  learnMore:           "Daha Fazla Bilgi (link)",
  viewAll:             "Tümünü Gör (link)",
  backToList:          "Listeye Dön",
  submitForm:          "Formu Gönder (buton)",
  readMore:            "Devamını Oku (link)",
  ourProducts:         "Ürünlerimiz (başlık)",
  ourSolutions:        "Çözümlerimiz (başlık)",
  latestNews:          "Son Haberler (başlık)",
  ourClients:          "Müşterilerimiz (başlık)",
  faqTitle:            "SSS Başlığı",
  contactTitle:        "İletişim Başlığı",
  startProject:        "Proje Başlat (buton/link)",
  "nav.company":       "Menü: Hakkımızda (navigasyon)",
};

function FactField({
  label, hint, value, onChange, type = "text",
}: { label: string; hint: string; value: string; onChange: (v: string) => void; type?: "text" | "textarea" }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-gray-800">{label}</label>
      <p className="text-xs text-gray-400">{hint}</p>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1aa3c4] resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1aa3c4]"
        />
      )}
    </div>
  );
}

// ── Notification Panel ──────────────────────────────────────────────────────
function NotificationsPanel() {
  const [emails, setEmails] = useState<{ id: string; email: string; label: string }[]>([]);
  const [telegram, setTelegram] = useState<{ id: string; chatId: string; label: string }[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newEmailLabel, setNewEmailLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }

  function loadData() {
    return fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => { setEmails(d.emails || []); setTelegram(d.telegram || []); });
  }

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  async function syncTelegram() {
    setSyncing(true);
    const res = await fetch("/api/notifications/telegram-sync", { method: "POST" });
    const data = await res.json();
    setSyncing(false);
    if (!res.ok) { flash("err", data.error || "Sync başarısız"); return; }
    await loadData();
    flash("ok", data.added.length > 0
      ? `${data.added.length} yeni kişi eklendi: ${data.added.map((a: any) => a.label).join(", ")}`
      : "Yeni kişi bulunamadı — bota mesaj gönderip tekrar deneyin."
    );
  }

  async function removeTelegram(id: string) {
    const res = await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type: "telegram" }),
    });
    if (!res.ok) { flash("err", "Silinemedi"); return; }
    setTelegram((prev) => prev.filter((t) => t.id !== id));
    flash("ok", "Kişi silindi.");
  }

  async function addEmail() {
    if (!newEmail.trim()) return;
    setEmailSaving(true);
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail.trim(), label: newEmailLabel.trim() }),
    });
    const data = await res.json();
    setEmailSaving(false);
    if (!res.ok) { flash("err", data.error || "Eklenemedi"); return; }
    setEmails((prev) => [...prev, data.entry]);
    setNewEmail(""); setNewEmailLabel("");
    flash("ok", "E-posta eklendi.");
  }

  async function removeEmail(id: string) {
    const res = await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type: "email" }),
    });
    if (!res.ok) { flash("err", "Silinemedi"); return; }
    setEmails((prev) => prev.filter((e) => e.id !== id));
    flash("ok", "E-posta silindi.");
  }

  if (loading) return <div className="p-8 text-center text-sm text-gray-400">Yükleniyor…</div>;

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        Siteye <strong>yeni bir lead</strong> geldiğinde aşağıdaki kanallar üzerinden otomatik bildirim gönderilir.
      </div>

      {msg && (
        <div className={`text-sm rounded-xl px-4 py-3 ${msg.type === "ok" ? "bg-green-50 border border-green-100 text-green-700" : "bg-red-50 border border-red-100 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      {/* ── Telegram ── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <span className="text-xl">✈️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Telegram Bildirimleri</p>
            <p className="text-xs text-gray-400">{telegram.length} kişi kayıtlı</p>
          </div>
        </div>

        {/* Nasıl eklenir — adım adım */}
        <div className="px-4 py-3 bg-sky-50 border-b border-sky-100 space-y-2">
          <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide">Nasıl eklenir?</p>
          <div className="flex items-start gap-3 text-sm text-sky-800">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <span>Eklemek istediğin kişi <strong>@willowsoftbot</strong>'a herhangi bir mesaj göndersin</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <span>Aşağıdaki "Yeni Kişileri Tara" butonuna bas — otomatik ekler</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <a
              href="https://t.me/willowsoftbot"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#229ED9] text-white text-xs font-semibold rounded-lg hover:bg-[#1a85b8] transition"
            >
              @willowsoftbot'u Aç ↗
            </a>
            <button
              onClick={syncTelegram}
              disabled={syncing}
              className="px-3 py-1.5 bg-white border border-[#229ED9] text-[#229ED9] text-xs font-semibold rounded-lg hover:bg-sky-50 disabled:opacity-40 transition flex items-center gap-1.5"
            >
              {syncing ? (
                <><span className="animate-spin inline-block">⟳</span> Taranıyor…</>
              ) : (
                <>⟳ Yeni Kişileri Tara</>
              )}
            </button>
          </div>
        </div>

        {/* Kayıtlı kişiler */}
        {telegram.length === 0 ? (
          <div className="p-5 text-center text-sm text-gray-400">Henüz kimse eklenmemiş.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {telegram.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {t.label?.[0]?.toUpperCase() || "?"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{t.label || "İsimsiz"}</p>
                  <p className="text-xs text-gray-400 font-mono">{t.chatId}</p>
                </div>
                <button onClick={() => removeTelegram(t.id)}
                  className="text-red-400 hover:text-red-600 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition">
                  Çıkar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── E-posta ── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <span className="text-lg">📧</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">E-posta Bildirimleri</p>
            <p className="text-xs text-gray-400">{emails.length} adres kayıtlı</p>
          </div>
        </div>

        {emails.length === 0 ? (
          <div className="p-5 text-center text-sm text-gray-400">Henüz bildirim adresi eklenmemiş.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {emails.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{e.email}</p>
                  {e.label && <p className="text-xs text-gray-400 truncate">{e.label}</p>}
                </div>
                <button onClick={() => removeEmail(e.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition">
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="p-4 border-t border-gray-100 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Yeni E-posta Ekle</p>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div className="space-y-2">
              <input type="email" placeholder="ornek@sirket.com" value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEmail()}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1aa3c4]" />
              <input type="text" placeholder="Etiket (opsiyonel, örn: Satış Ekibi)" value={newEmailLabel}
                onChange={(e) => setNewEmailLabel(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1aa3c4]" />
            </div>
            <button onClick={addEmail} disabled={emailSaving || !newEmail.trim()}
              className="self-start px-4 py-2.5 bg-[#132175] text-white text-sm font-semibold rounded-lg hover:bg-[#0e1a5e] disabled:opacity-40 transition">
              {emailSaving ? "…" : "Ekle"}
            </button>
          </div>
        </div>
      </div>

      {/* Gmail SMTP notu */}
      <details className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
        <summary className="p-4 text-sm font-semibold text-amber-800 cursor-pointer select-none">
          Gmail SMTP Kurulum Talimatları
        </summary>
        <div className="px-4 pb-4 text-sm text-amber-900 space-y-2">
          <p>Bildirim maillerinin gönderilmesi için <code>.env</code> dosyasına şu satırları ekleyin:</p>
          <pre className="bg-amber-100 rounded p-3 text-xs font-mono overflow-x-auto">{`SMTP_USER=gmail-adresiniz@gmail.com\nSMTP_PASS=uygulama-sifresi-buraya`}</pre>
          <p className="text-xs">Gmail'de <strong>Uygulama Şifresi</strong> oluşturmak için: Google Hesabı → Güvenlik → 2 Adımlı Doğrulama → Uygulama Şifreleri</p>
        </div>
      </details>
    </div>
  );
}

// ── Social Links Panel ───────────────────────────────────────────────────────
const PRESET_PLATFORMS = [
  { id: "linkedin",  label: "LinkedIn",    placeholder: "https://linkedin.com/company/..." },
  { id: "youtube",   label: "YouTube",     placeholder: "https://youtube.com/@..." },
  { id: "instagram", label: "Instagram",   placeholder: "https://instagram.com/..." },
  { id: "tiktok",    label: "TikTok",      placeholder: "https://tiktok.com/@..." },
  { id: "twitter",   label: "X (Twitter)", placeholder: "https://x.com/..." },
  { id: "medium",    label: "Medium",      placeholder: "https://medium.com/@..." },
  { id: "github",    label: "GitHub",      placeholder: "https://github.com/..." },
  { id: "facebook",  label: "Facebook",    placeholder: "https://facebook.com/..." },
  { id: "discord",   label: "Discord",     placeholder: "https://discord.gg/..." },
];

type SocialLink = { id: string; platform: string; url: string; enabled: boolean };

function SocialLinksPanel() {
  const { content, setContent } = useAdmin();

  const links: SocialLink[] = Array.isArray(content?.companyFacts?.socialLinks)
    ? content.companyFacts.socialLinks
    : [];

  function setLinks(next: SocialLink[]) {
    setContent((c: any) => ({
      ...c,
      companyFacts: { ...c.companyFacts, socialLinks: next },
    }));
  }

  function getLink(id: string): SocialLink | undefined {
    return links.find((l) => l.id === id);
  }

  function togglePreset(preset: typeof PRESET_PLATFORMS[0]) {
    const existing = getLink(preset.id);
    if (existing) {
      // toggle enabled
      setLinks(links.map((l) => l.id === preset.id ? { ...l, enabled: !l.enabled } : l));
    } else {
      setLinks([...links, { id: preset.id, platform: preset.label, url: "", enabled: true }]);
    }
  }

  function setUrl(id: string, url: string) {
    setLinks(links.map((l) => l.id === id ? { ...l, url } : l));
  }

  // Custom platform state
  const [customPlatform, setCustomPlatform] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  function addCustom() {
    if (!customPlatform.trim() || !customUrl.trim()) return;
    const id = customPlatform.toLowerCase().replace(/\s+/g, "-");
    if (links.find((l) => l.id === id)) return;
    setLinks([...links, { id, platform: customPlatform.trim(), url: customUrl.trim(), enabled: true }]);
    setCustomPlatform(""); setCustomUrl("");
  }

  function removeLink(id: string) {
    setLinks(links.filter((l) => l.id !== id));
  }

  const customLinks = links.filter((l) => !PRESET_PLATFORMS.find((p) => p.id === l.id));

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        Aktif edilen sosyal medya hesapları <strong>sitenin footer</strong> alanında otomatik görünür. URL girin ve kaydedin.
      </div>

      {/* Preset platformlar */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">Platformlar</p>
          <p className="text-xs text-gray-400 mt-0.5">Aktif etmek için ikona tıkla, URL gir, kaydet.</p>
        </div>
        <div className="divide-y divide-gray-100">
          {PRESET_PLATFORMS.map((preset) => {
            const link = getLink(preset.id);
            const active = link?.enabled ?? false;
            return (
              <div key={preset.id} className={`flex items-center gap-3 px-4 py-3 transition ${active ? "" : "opacity-50"}`}>
                {/* Toggle butonu */}
                <button
                  onClick={() => togglePreset(preset)}
                  title={active ? `${preset.label} devre dışı bırak` : `${preset.label} aktif et`}
                  className={`w-9 h-9 rounded-xl shrink-0 transition flex items-center justify-center p-2 ${active ? "bg-[#132175] text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                  dangerouslySetInnerHTML={{ __html: SOCIAL_SVGS[preset.id] || preset.label.slice(0, 2) }}
                />
                <span className="w-24 text-sm font-semibold text-gray-700 shrink-0">{preset.label}</span>
                <input
                  type="url"
                  placeholder={active ? preset.placeholder : "Aktif etmek için ikona tıkla"}
                  value={link?.url || ""}
                  disabled={!active}
                  onChange={(e) => setUrl(preset.id, e.target.value)}
                  className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1aa3c4] disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Özel platform ekle */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Özel Platform Ekle</p>
        <div className="flex gap-2">
          <input type="text" placeholder="Platform adı (örn: Behance)"
            value={customPlatform} onChange={(e) => setCustomPlatform(e.target.value)}
            className="w-40 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1aa3c4]" />
          <input type="url" placeholder="https://..."
            value={customUrl} onChange={(e) => setCustomUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1aa3c4]" />
          <button onClick={addCustom} disabled={!customPlatform.trim() || !customUrl.trim()}
            className="px-4 py-2.5 bg-[#132175] text-white text-sm font-semibold rounded-lg hover:bg-[#0e1a5e] disabled:opacity-40 transition">
            Ekle
          </button>
        </div>
      </div>

      {/* Özel platformlar listesi */}
      {customLinks.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Eklenen Özel Platformlar</p>
          </div>
          <ul className="divide-y divide-gray-100">
            {customLinks.map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
                  {l.platform.slice(0, 2)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{l.platform}</p>
                  <p className="text-xs text-gray-400 truncate">{l.url}</p>
                </div>
                <button onClick={() => removeLink(l.id)}
                  className="text-red-400 hover:text-red-600 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition">
                  Sil
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function SettingsPanel() {
  const { content, setContent } = useAdmin();
  const [subTab, setSubTab] = useState<"facts" | "ui" | "notifications" | "social" | "api">("facts");
  const [uiLocale, setUiLocale] = useState<Locale>("tr");
  const [brandLocale, setBrandLocale] = useState<Locale>("tr");

  const facts = content?.companyFacts || {};
  const meta = content?.meta || {};
  const brandTagline = { ...DEFAULT_BRAND_TAGLINE, ...(meta.brandTagline || {}) };
  const translations = content?.translations || {};
  const uiStrings = translations[uiLocale] || {};

  // English reference for context
  const enStrings = translations["en"] || {};

  const knownKeys = KNOWN_FACTS.map((f) => f.key);
  const unknownFactKeys = Object.keys(facts).filter((k) => !knownKeys.includes(k) && k !== "localized" && k !== "socialLinks").sort();

  const updateFact = (key: string, value: string) => {
    setContent((c: any) => {
      const nextFacts = syncOfficePhonesInFacts({ ...(c.companyFacts || {}), [key]: value });
      return { ...c, companyFacts: nextFacts };
    });
  };

  const updateBrandTagline = (locale: Locale, value: string) => {
    setContent((c: any) => ({
      ...c,
      meta: {
        ...(c.meta || {}),
        brandTagline: {
          ...DEFAULT_BRAND_TAGLINE,
          ...(c.meta?.brandTagline || {}),
          [locale]: value,
        },
      },
    }));
  };

  const updateUIString = (key: string, value: string) => {
    setContent((c: any) => {
      const t = { ...c.translations };
      t[uiLocale] = { ...(t[uiLocale] || {}), [key]: value };
      return { ...c, translations: t };
    });
  };

  // All UI string keys sorted: known first, then rest
  const allUiKeys = Object.keys(enStrings).sort();
  const knownUiKeys = allUiKeys.filter((k) => UI_KEY_LABELS[k]);
  const otherUiKeys = allUiKeys.filter((k) => !UI_KEY_LABELS[k]);

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        <button
          onClick={() => setSubTab("facts")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${subTab === "facts" ? "border-[#132175] text-[#132175]" : "border-transparent text-gray-400 hover:text-gray-700"}`}
        >
          📍 İletişim & İstatistikler
        </button>
        <button
          onClick={() => setSubTab("ui")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${subTab === "ui" ? "border-[#132175] text-[#132175]" : "border-transparent text-gray-400 hover:text-gray-700"}`}
        >
          🔤 Buton & Arayüz Metinleri
        </button>
        <button
          onClick={() => setSubTab("notifications")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${subTab === "notifications" ? "border-[#132175] text-[#132175]" : "border-transparent text-gray-400 hover:text-gray-700"}`}
        >
          🔔 Bildirimler
        </button>
        <button
          onClick={() => setSubTab("social")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${subTab === "social" ? "border-[#132175] text-[#132175]" : "border-transparent text-gray-400 hover:text-gray-700"}`}
        >
          🔗 Sosyal Medya
        </button>
        <button
          onClick={() => setSubTab("api")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${subTab === "api" ? "border-[#132175] text-[#132175]" : "border-transparent text-gray-400 hover:text-gray-700"}`}
        >
          🔑 API & Entegrasyon
        </button>
      </div>

      {/* ── Company Facts ── */}
      {subTab === "facts" && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Marka Sloganı (Header)</p>
              <p className="mt-1 text-xs text-gray-400">
                Logo altında görünen <strong>WILLOWSOFT</strong> altı metin. Her dil için ayrı kaydedilir ve Supabase <code className="text-[11px]">site_meta</code> tablosuna yazılır.
              </p>
            </div>
            <LocaleTabs active={brandLocale} onChange={setBrandLocale} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 bg-gray-50 border border-gray-100 rounded text-sm text-gray-400 truncate">
                {DEFAULT_BRAND_TAGLINE.en}
              </div>
              <input
                type="text"
                value={brandTagline[brandLocale] || ""}
                onChange={(e) => updateBrandTagline(brandLocale, e.target.value)}
                placeholder={DEFAULT_BRAND_TAGLINE[brandLocale]}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1aa3c4]"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            Bu alandaki bilgiler sitenin <strong>ana sayfa, iletişim, şirket ve ürünler</strong> sayfalarında otomatik olarak kullanılır. Telefon numaralarını buradan veya Hakkımızda → Ofislerimiz sekmesinden güncelleyebilirsiniz.
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
            {KNOWN_FACTS.map((f) => (
              <FactField
                key={f.key}
                label={f.label}
                hint={f.hint}
                type={f.type}
                value={String(facts[f.key] ?? "")}
                onChange={(v) => updateFact(f.key, v)}
              />
            ))}
          </div>

          {/* Unknown keys — advanced section */}
          {unknownFactKeys.length > 0 && (
            <details className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <summary className="p-4 text-xs font-bold text-gray-400 uppercase cursor-pointer hover:bg-gray-50 select-none">
                Gelişmiş — Diğer Alanlar ({unknownFactKeys.length})
              </summary>
              <div className="p-4 pt-0 space-y-3">
                {unknownFactKeys.map((key) => (
                  <div key={key} className="grid grid-cols-[180px_1fr] gap-3 items-center">
                    <span className="text-[11px] font-mono text-gray-400 truncate" title={key}>{key}</span>
                    <input
                      type="text"
                      value={String(facts[key] ?? "")}
                      onChange={(e) => updateFact(key, e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none focus:border-[#1aa3c4]"
                    />
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* ── Notifications ── */}
      {subTab === "notifications" && <NotificationsPanel />}

      {/* ── Social Media ── */}
      {subTab === "social" && <SocialLinksPanel />}

      {/* ── API & Integration ── */}
      {subTab === "api" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            Sitenin dış servislerle haberleşmesi için gerekli API anahtarlarını buradan yönetebilirsiniz.
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">Google Translate API Key</label>
              <p className="text-xs text-gray-400">Admin sayfasında "Çeviri Sağlığı" modülünün otomatik çeviri yapabilmesi için gereklidir.</p>
              <input
                type="password"
                placeholder="AIzaSyB..."
                value={String(facts.googleTranslateApiKey ?? "")}
                onChange={(e) => updateFact("googleTranslateApiKey", e.target.value)}
                className="w-full mt-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1aa3c4]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── UI Strings ── */}
      {subTab === "ui" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            Sitedeki <strong>butonlar, linkler ve sabit başlıklar</strong> her dil için ayrı ayrı burada düzenlenir. Soldaki metin İngilizce referanstır.
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <LocaleTabs active={uiLocale} onChange={setUiLocale} />

            {/* Known keys with labels */}
            {knownUiKeys.length > 0 && (
              <div className="space-y-3">
                {knownUiKeys.map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-800">{UI_KEY_LABELS[key]}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2 bg-gray-50 border border-gray-100 rounded text-sm text-gray-400 truncate">
                        {enStrings[key] || <span className="italic">—</span>}
                      </div>
                      <input
                        type="text"
                        value={uiStrings[key] || ""}
                        onChange={(e) => updateUIString(key, e.target.value)}
                        placeholder={enStrings[key] || "Çeviri girin..."}
                        className={`w-full p-2 border rounded text-sm outline-none focus:border-[#1aa3c4] ${!uiStrings[key] ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50 text-gray-800"}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Other keys — collapsed */}
            {otherUiKeys.length > 0 && (
              <details className="border-t border-gray-100 pt-4">
                <summary className="text-xs font-bold text-gray-400 uppercase cursor-pointer select-none hover:text-gray-600">
                  Diğer Metinler ({otherUiKeys.length})
                </summary>
                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                  {otherUiKeys.map((key) => (
                    <div key={key} className="grid grid-cols-[1fr_1fr] gap-2 items-center">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-mono text-gray-300 truncate">{key}</p>
                        <p className="text-xs text-gray-400 truncate">{enStrings[key] || "—"}</p>
                      </div>
                      <input
                        type="text"
                        value={uiStrings[key] || ""}
                        onChange={(e) => updateUIString(key, e.target.value)}
                        placeholder={enStrings[key] || ""}
                        className="w-full p-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800 outline-none focus:border-[#1aa3c4]"
                      />
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

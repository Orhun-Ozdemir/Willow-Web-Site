"use client";

import { useState } from "react";
import { locales, type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import LocaleTabs from "./LocaleTabs";

// ── Known companyFacts fields with human-readable metadata ──────────────────
const KNOWN_FACTS: { key: string; label: string; hint: string; type?: "text" | "textarea" }[] = [
  { key: "productsOnMarket", label: "Piyasadaki Ürün Sayısı", hint: "Ana sayfa ve ürünler sayfasında istatistik olarak görünür. Örn: 120+" },
  { key: "happyClients",     label: "Memnun Müşteri Sayısı",  hint: "Ana sayfada istatistik olarak görünür. Örn: 200+" },
  { key: "officesWorldwide", label: "Dünya Geneli Ofis Sayısı", hint: "Ana sayfada istatistik olarak görünür. Örn: 5" },
  { key: "email",            label: "E-posta Adresi",         hint: "İletişim sayfasında ve proje başlatma formunda görünür." },
  { key: "turkeyPhone",      label: "Türkiye Telefon",        hint: "İletişim sayfasında tıklanabilir telefon numarası olarak görünür. Örn: +90 212 000 00 00" },
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

export default function SettingsPanel() {
  const { content, setContent } = useAdmin();
  const [subTab, setSubTab] = useState<"facts" | "ui">("facts");
  const [uiLocale, setUiLocale] = useState<Locale>("tr");

  const facts = content?.companyFacts || {};
  const translations = content?.translations || {};
  const uiStrings = translations[uiLocale] || {};

  // English reference for context
  const enStrings = translations["en"] || {};

  const knownKeys = KNOWN_FACTS.map((f) => f.key);
  const unknownFactKeys = Object.keys(facts).filter((k) => !knownKeys.includes(k) && k !== "localized").sort();

  const updateFact = (key: string, value: string) => {
    setContent((c: any) => ({ ...c, companyFacts: { ...c.companyFacts, [key]: value } }));
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
      </div>

      {/* ── Company Facts ── */}
      {subTab === "facts" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            Bu alandaki bilgiler sitenin <strong>ana sayfa, iletişim ve ürünler</strong> sayfalarında otomatik olarak kullanılır. Değiştirip kaydedin, site güncellensin.
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
                    <div className="grid grid-cols-2 gap-2">
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

"use client";

import { useState } from "react";
import { locales, type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import LocaleTabs from "./LocaleTabs";

export default function SettingsPanel() {
  const { content, setContent } = useAdmin();
  const [subTab, setSubTab] = useState<"facts" | "ui">("facts");
  const [uiLocale, setUiLocale] = useState<Locale>("tr");

  const facts = content?.companyFacts || {};
  const translations = content?.translations || {};
  const uiStrings = translations[uiLocale] || {};
  const uiKeys = Object.keys(uiStrings).sort();

  const updateFact = (key: string, value: string) => {
    setContent((c: any) => ({
      ...c,
      companyFacts: { ...c.companyFacts, [key]: value },
    }));
  };

  const addFact = () => {
    const key = prompt("Yeni alan adı (ör: employees):");
    if (!key?.trim()) return;
    updateFact(key.trim(), "");
  };

  const deleteFact = (key: string) => {
    if (!confirm(`"${key}" alanını silmek istediğinize emin misiniz?`)) return;
    setContent((c: any) => {
      const f = { ...c.companyFacts };
      delete f[key];
      return { ...c, companyFacts: f };
    });
  };

  const updateUIString = (key: string, value: string) => {
    setContent((c: any) => {
      const t = { ...c.translations };
      t[uiLocale] = { ...(t[uiLocale] || {}), [key]: value };
      return { ...c, translations: t };
    });
  };

  const factKeys = Object.keys(facts).sort();

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-gray-200 pb-1">
        <button onClick={() => setSubTab("facts")} className={`px-3 py-1.5 rounded-t text-xs font-bold transition ${subTab === "facts" ? "bg-gray-100 text-[#132175]" : "text-gray-400 hover:text-gray-700"}`}>
          Şirket Bilgileri
        </button>
        <button onClick={() => setSubTab("ui")} className={`px-3 py-1.5 rounded-t text-xs font-bold transition ${subTab === "ui" ? "bg-gray-100 text-[#132175]" : "text-gray-400 hover:text-gray-700"}`}>
          UI Çeviri Metinleri
        </button>
      </div>

      {subTab === "facts" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">Şirket Bilgileri</p>
              <p className="text-xs text-gray-400 mt-0.5">Hakkımızda / Şirket sayfasında görünen istatistikler — kuruluş yılı, çalışan sayısı, proje sayısı vb. Anahtar adı sitenin bu değere nasıl ulaştığını belirler.</p>
            </div>
            <button onClick={addFact} className="px-2 py-1 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-[10px] font-bold shrink-0 ml-4">+ Ekle</button>
          </div>
          <div className="space-y-3">
            {factKeys.map((key) => {
              const val = facts[key];
              const isObject = typeof val === "object" && val !== null;
              return (
                <div key={key} className="grid grid-cols-[200px_1fr_auto] gap-3 items-start">
                  <div className="text-xs font-mono text-gray-500 pt-2 truncate" title={key}>{key}</div>
                  {isObject ? (
                    <textarea
                      value={JSON.stringify(val, null, 2)}
                      onChange={(e) => {
                        try { updateFact(key, JSON.parse(e.target.value)); } catch { /* ignore parse errors while typing */ }
                      }}
                      rows={3}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-xs outline-none focus:border-[#1aa3c4] font-mono"
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(val ?? "")}
                      onChange={(e) => updateFact(key, e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-xs outline-none focus:border-[#1aa3c4]"
                    />
                  )}
                  <button onClick={() => deleteFact(key)} className="p-2 text-red-400 hover:text-red-300 text-xs font-bold">✕</button>
                </div>
              );
            })}
            {factKeys.length === 0 && <p className="text-sm text-gray-400">Henüz şirket bilgisi yok.</p>}
          </div>
        </div>
      )}

      {subTab === "ui" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-800 mb-0.5">UI Çeviri Metinleri</p>
            <p className="text-xs text-gray-400">Sitedeki buton etiketleri, başlıklar ve sabit metinler — "İletişime Geç", "Daha Fazla Oku", "Veri sayfasını indir" gibi. Her dil için ayrı ayrı düzenlenebilir. Bu alanlar sayfa içerikleriyle değil, site arayüzüyle ilgilidir.</p>
          </div>
          <div className="flex items-center justify-between">
            <LocaleTabs active={uiLocale} onChange={setUiLocale} />
            <span className="text-xs text-gray-400">{uiKeys.length} anahtar</span>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {uiKeys.map((key) => (
              <div key={key} className="grid grid-cols-[240px_1fr] gap-3 items-center">
                <div className="text-[11px] font-mono text-gray-400 truncate" title={key}>{key}</div>
                <input
                  type="text"
                  value={uiStrings[key] || ""}
                  onChange={(e) => updateUIString(key, e.target.value)}
                  className="w-full p-1.5 bg-gray-50 border border-gray-200 rounded text-gray-800 text-xs outline-none focus:border-[#1aa3c4]"
                />
              </div>
            ))}
            {uiKeys.length === 0 && <p className="text-sm text-gray-400">Bu dilde UI çeviri metni bulunamadı.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

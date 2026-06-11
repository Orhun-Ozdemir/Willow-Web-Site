"use client";

import { useState } from "react";
import { locales, type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import LocaleTabs from "./LocaleTabs";

const PAGES = [
  { key: "home", label: "Ana Sayfa" },
  { key: "products", label: "Ürünler" },
  { key: "solutions", label: "Çözümler" },
  { key: "services", label: "Hizmetler" },
  { key: "news", label: "Haberler" },
  { key: "company", label: "Hakkımızda" },
  { key: "contact", label: "İletişim" },
  { key: "startProject", label: "Proje Başlat" },
  { key: "glossary", label: "Sözlük" },
];

export default function PageContentPanel() {
  const { content, setContent } = useAdmin();
  const [selectedPage, setSelectedPage] = useState("home");
  const [locale, setLocale] = useState<Locale>("en");
  const sourceLang: Locale = "en";

  const pageContent = content?.pageContent || {};
  const pageData = pageContent[selectedPage] || {};
  const keys = Object.keys(pageData).sort();

  const updateField = (key: string, loc: Locale, value: string) => {
    setContent((c: any) => {
      const pc = { ...c.pageContent };
      const page = { ...pc[selectedPage] };
      const field = { ...page[key], [loc]: value };
      page[key] = field;
      pc[selectedPage] = page;
      return { ...c, pageContent: pc };
    });
  };

  const filledMap: Record<string, boolean> = {};
  for (const l of locales) {
    filledMap[l] = keys.some((k) => (pageData[k]?.[l] || "").trim().length > 0);
  }

  const filledCount = keys.filter((k) => (pageData[k]?.[locale] || "").trim().length > 0).length;

  return (
    <div className="flex gap-6 min-h-[500px]">
      {/* Left: Page list */}
      <div className="w-48 shrink-0 bg-white border border-gray-200 rounded-xl p-3 space-y-1 self-start">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Sayfalar</p>
        {PAGES.map((pg) => {
          const pgData = pageContent[pg.key] || {};
          const pgKeys = Object.keys(pgData);
          const count = pgKeys.length;
          return (
            <button
              key={pg.key}
              onClick={() => setSelectedPage(pg.key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                selectedPage === pg.key ? "bg-gray-100 text-[#132175]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span>{pg.label}</span>
              <span className="text-[10px] text-gray-400">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Fields */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <LocaleTabs active={locale} onChange={setLocale} filledMap={filledMap} />
          <span className="text-xs text-gray-400">{filledCount}/{keys.length} alan dolu</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          {keys.length === 0 && (
            <p className="text-sm text-gray-400">Bu sayfa için içerik alanı bulunamadı.</p>
          )}
          {keys.map((key) => {
            const sourceVal = pageData[key]?.[sourceLang] || "";
            const targetVal = pageData[key]?.[locale] || "";
            const isSource = locale === sourceLang;

            return (
              <div key={key} className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-gray-400">{key}</label>
                {isSource ? (
                  <textarea
                    value={sourceVal}
                    onChange={(e) => updateField(key, sourceLang, e.target.value)}
                    rows={sourceVal.length > 100 ? 3 : 1}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 outline-none focus:border-[#1aa3c4] text-sm"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] text-gray-400 mb-0.5">{sourceLang.toUpperCase()} (kaynak)</p>
                      <div className="p-2 bg-gray-50 border border-gray-200/50 rounded text-gray-400 text-sm min-h-[38px] whitespace-pre-wrap">
                        {sourceVal || "—"}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#132175]/70 mb-0.5">{locale.toUpperCase()} (çeviri)</p>
                      <textarea
                        value={targetVal}
                        onChange={(e) => updateField(key, locale, e.target.value)}
                        rows={sourceVal.length > 100 ? 3 : 1}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 outline-none focus:border-[#1aa3c4] text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

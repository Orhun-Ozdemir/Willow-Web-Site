"use client";

import { useState, useMemo } from "react";
import { locales, type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import LocaleTabs from "./LocaleTabs";
import { calcSEOScore, type SEOScoreResult } from "@/lib/seo-scoring";

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

const SCHEMA_TYPES = [
  { value: "", label: "— Seçiniz —" },
  { value: "WebPage", label: "WebPage" },
  { value: "Organization", label: "Organization" },
  { value: "Product", label: "Product" },
  { value: "Article", label: "Article" },
  { value: "FAQPage", label: "FAQPage" },
  { value: "Service", label: "Service" },
  { value: "ContactPage", label: "ContactPage" },
  { value: "CollectionPage", label: "CollectionPage" },
];

type SubTab = "seo" | "social" | "ai";

export default function SEOCenterPanel() {
  const { content, setContent } = useAdmin();
  const [selectedPage, setSelectedPage] = useState("home");
  const [locale, setLocale] = useState<Locale>("tr");
  const [subTab, setSubTab] = useState<SubTab>("seo");

  const pageSeo = content?.pageSeo || {};
  const seoData = pageSeo[selectedPage]?.[locale] || {};
  const pageContent = content?.pageContent?.[selectedPage] || {};

  const scoreResult: SEOScoreResult = useMemo(
    () => calcSEOScore(seoData, locale, pageSeo, selectedPage, pageContent),
    [seoData, locale, pageSeo, selectedPage, pageContent]
  );

  const updateSEO = (field: string, value: any) => {
    setContent((c: any) => {
      const ps = { ...c.pageSeo };
      const page = { ...ps[selectedPage] };
      page[locale] = { ...(page[locale] || {}), [field]: value };
      ps[selectedPage] = page;
      return { ...c, pageSeo: ps };
    });
  };

  const filledMap: Record<string, boolean> = {};
  for (const l of locales) {
    const d = pageSeo[selectedPage]?.[l];
    filledMap[l] = !!(d?.seoTitle || d?.metaDescription);
  }

  const scoreColor = scoreResult.seoLevel === "good" ? "text-[#132175] border-emerald-500" : scoreResult.seoLevel === "ok" ? "text-amber-400 border-amber-500" : "text-red-400 border-red-500";
  const aiColor = scoreResult.aiLevel === "good" ? "text-[#132175]" : scoreResult.aiLevel === "ok" ? "text-amber-400" : "text-red-400";

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Left: Page list */}
      <div className="w-56 shrink-0 bg-white border border-gray-200 rounded-xl p-3 space-y-1 self-start">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Sayfalar</p>
        {PAGES.map((pg) => {
          const pgSeo = pageSeo[pg.key]?.[locale] || {};
          const pgScore = calcSEOScore(pgSeo, locale, pageSeo, pg.key, content?.pageContent?.[pg.key]);
          const c = pgScore.seoLevel === "good" ? "text-[#132175]" : pgScore.seoLevel === "ok" ? "text-amber-400" : "text-red-400";
          return (
            <button
              key={pg.key}
              onClick={() => setSelectedPage(pg.key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                selectedPage === pg.key ? "bg-gray-100 text-[#132175]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span>{pg.label}</span>
              <span className={`text-[10px] font-bold ${c}`}>{pgScore.seoScore}</span>
            </button>
          );
        })}
      </div>

      {/* Middle: Editor form */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <LocaleTabs active={locale} onChange={setLocale} filledMap={filledMap} />
          <div className="flex items-center gap-3">
            <div className={`text-center px-3 py-1 rounded-lg border ${scoreColor}`}>
              <span className="text-[10px] uppercase font-bold block">SEO</span>
              <span className="text-lg font-extrabold">{scoreResult.seoScore}</span>
            </div>
            <div className={`text-center px-3 py-1 rounded-lg border border-gray-300 ${aiColor}`}>
              <span className="text-[10px] uppercase font-bold block">AI</span>
              <span className="text-lg font-extrabold">{scoreResult.aiScore}</span>
            </div>
          </div>
        </div>

        {/* Sub tabs */}
        <div className="flex gap-1 border-b border-gray-200 pb-1">
          {([["seo", "Genel SEO"], ["social", "Sosyal Medya"], ["ai", "Teknik & AI"]] as [SubTab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSubTab(key)}
              className={`px-3 py-1.5 rounded-t text-xs font-bold transition ${subTab === key ? "bg-gray-100 text-[#132175]" : "text-gray-400 hover:text-gray-700"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          {subTab === "seo" && (
            <>
              <FormField label="SEO Başlığı" value={seoData.seoTitle || ""} onChange={(v) => updateSEO("seoTitle", v)} charTarget={[50, 60]} />
              <FormField label="Meta Açıklama" type="textarea" value={seoData.metaDescription || ""} onChange={(v) => updateSEO("metaDescription", v)} charTarget={[150, 160]} rows={3} />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Odak Anahtar Kelime" value={seoData.focusKeyword || ""} onChange={(v) => updateSEO("focusKeyword", v)} />
                <FormField label="URL Slug" value={seoData.slug || ""} onChange={(v) => updateSEO("slug", v)} hint="Küçük harf, tire, İngilizce karakter" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="H1 Başlık" value={seoData.h1 || ""} onChange={(v) => updateSEO("h1", v)} />
                <FormField label="Canonical URL" value={seoData.canonical || ""} onChange={(v) => updateSEO("canonical", v)} placeholder="https://willowsoft.co/..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Schema Tipi" type="select" value={seoData.schemaType || ""} onChange={(v) => updateSEO("schemaType", v)} options={SCHEMA_TYPES} />
                <FormField label="Noindex" type="select" value={seoData.noindex ? "true" : "false"} onChange={(v) => updateSEO("noindex", v === "true")} options={[{ value: "false", label: "Hayır (indeksle)" }, { value: "true", label: "Evet (indeksleme)" }]} />
                <FormField label="Nofollow" type="select" value={seoData.nofollow ? "true" : "false"} onChange={(v) => updateSEO("nofollow", v === "true")} options={[{ value: "false", label: "Hayır" }, { value: "true", label: "Evet" }]} />
              </div>
            </>
          )}

          {subTab === "social" && (
            <>
              <FormField label="OG Title" value={seoData.ogTitle || ""} onChange={(v) => updateSEO("ogTitle", v)} hint="Boş bırakırsanız SEO başlığı kullanılır" />
              <FormField label="OG Description" value={seoData.ogDescription || ""} onChange={(v) => updateSEO("ogDescription", v)} type="textarea" rows={2} />
              <FormField label="OG Image URL" value={seoData.ogImage || ""} onChange={(v) => updateSEO("ogImage", v)} placeholder="https://willowsoft.co/assets/og/..." />

              {/* SERP Preview */}
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Google Arama Önizleme</p>
                <div className="space-y-1">
                  <p className="text-sky-400 text-base font-medium truncate">{seoData.seoTitle || "Sayfa Başlığı"}</p>
                  <p className="text-emerald-600 text-xs truncate">willowsoft.co/{seoData.slug || selectedPage}</p>
                  <p className="text-gray-500 text-xs line-clamp-2">{seoData.metaDescription || "Meta açıklama burada görünecek..."}</p>
                </div>
              </div>

              {/* OG Preview */}
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Sosyal Medya Kart Önizleme</p>
                <div className="border border-gray-300 rounded-lg overflow-hidden max-w-md">
                  {seoData.ogImage && (
                    <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                      [{seoData.ogImage.split("/").pop()}]
                    </div>
                  )}
                  <div className="p-3 bg-white">
                    <p className="text-xs text-gray-400 uppercase">willowsoft.co</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{seoData.ogTitle || seoData.seoTitle || "Başlık"}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{seoData.ogDescription || seoData.metaDescription || "Açıklama"}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {subTab === "ai" && (
            <>
              <FormField label="AI Kısa Cevap" type="textarea" value={seoData.aiShortAnswer || ""} onChange={(v) => updateSEO("aiShortAnswer", v)} rows={3} hint="Google AI Overview'da direkt gösterilecek kısa cevap (min. 50 karakter)" />
              <FormField label="Nosnippet" type="select" value={seoData.nosnippet ? "true" : "false"} onChange={(v) => updateSEO("nosnippet", v === "true")} options={[{ value: "false", label: "Hayır (snippet göster)" }, { value: "true", label: "Evet (snippet engelle)" }]} />

              {/* AI FAQ */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500 uppercase">AI Soru-Cevap Blokları</p>
                  <button
                    onClick={() => {
                      const faqList = [...(seoData.aiFAQ || []), { q: "", a: "" }];
                      updateSEO("aiFAQ", faqList);
                    }}
                    className="px-2 py-1 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-[10px] font-bold"
                  >
                    + Ekle
                  </button>
                </div>
                {(seoData.aiFAQ || []).map((faq: any, i: number) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                    <input
                      type="text"
                      placeholder="Soru"
                      value={faq.q || ""}
                      onChange={(e) => {
                        const list = [...seoData.aiFAQ];
                        list[i] = { ...list[i], q: e.target.value };
                        updateSEO("aiFAQ", list);
                      }}
                      className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-xs outline-none focus:border-[#1aa3c4]"
                    />
                    <input
                      type="text"
                      placeholder="Cevap"
                      value={faq.a || ""}
                      onChange={(e) => {
                        const list = [...seoData.aiFAQ];
                        list[i] = { ...list[i], a: e.target.value };
                        updateSEO("aiFAQ", list);
                      }}
                      className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-xs outline-none focus:border-[#1aa3c4]"
                    />
                    <button
                      onClick={() => {
                        const list = seoData.aiFAQ.filter((_: any, j: number) => j !== i);
                        updateSEO("aiFAQ", list);
                      }}
                      className="p-2 text-red-400 hover:text-red-300 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* E-E-A-T */}
              <p className="text-xs font-bold text-gray-500 uppercase pt-2">E-E-A-T Sinyalleri</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Yazar" value={seoData.author || ""} onChange={(v) => updateSEO("author", v)} />
                <FormField label="İnceleyen" value={seoData.reviewedBy || ""} onChange={(v) => updateSEO("reviewedBy", v)} />
                <FormField label="Uzmanlık Notu" value={seoData.expertiseNote || ""} onChange={(v) => updateSEO("expertiseNote", v)} />
                <FormField label="Şirket Yetkinliği" value={seoData.companyCompetency || ""} onChange={(v) => updateSEO("companyCompetency", v)} />
              </div>
              <FormField label="Kaynaklar" type="textarea" value={seoData.sources || ""} onChange={(v) => updateSEO("sources", v)} rows={2} hint="Her satıra bir kaynak" />
              <FormField label="Son Güncelleme Tarihi" type="date" value={seoData.lastUpdated || ""} onChange={(v) => updateSEO("lastUpdated", v)} />
            </>
          )}
        </div>
      </div>

      {/* Right: Checklist */}
      <div className="w-64 shrink-0 space-y-4 self-start">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">SEO Kontrol Listesi</p>
          <div className="space-y-1.5">
            {scoreResult.seoChecks.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                <span className={`mt-0.5 shrink-0 ${c.pass ? "text-[#132175]" : c.warn ? "text-amber-400" : "text-red-400"}`}>
                  {c.pass ? "✓" : c.warn ? "⚠" : "✕"}
                </span>
                <span className="text-gray-500">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">AI Overview Kontrol</p>
          <div className="space-y-1.5">
            {scoreResult.aiChecks.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                <span className={`mt-0.5 shrink-0 ${c.pass ? "text-[#132175]" : c.warn ? "text-amber-400" : "text-red-400"}`}>
                  {c.pass ? "✓" : c.warn ? "⚠" : "✕"}
                </span>
                <span className="text-gray-500">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

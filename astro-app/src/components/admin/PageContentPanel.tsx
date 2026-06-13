"use client";

import { useState, useRef, useEffect } from "react";
import { locales, type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import LocaleTabs from "./LocaleTabs";

// ── Page list ────────────────────────────────────────────────────────────────
const PAGES = [
  { key: "home",         label: "Ana Sayfa",   icon: "🏠" },
  { key: "products",     label: "Ürünler",      icon: "📦" },
  { key: "solutions",    label: "Çözümler",     icon: "💡" },
  { key: "services",     label: "Hizmetler",    icon: "⚙️" },
  { key: "news",         label: "Haberler",     icon: "📰" },
  { key: "company",      label: "Hakkımızda",   icon: "🏢" },
  { key: "contact",      label: "İletişim",     icon: "📬" },
  { key: "startProject", label: "Proje Başlat", icon: "🚀" },
  { key: "glossary",     label: "Sözlük",       icon: "📖" },
];

// ── Field metadata: key → { label, section, hint, type } ────────────────────
type FieldType = "short" | "long" | "button";

interface FieldMeta {
  label: string;
  section: string;
  hint: string;
  type: FieldType;
}

const FIELD_META: Record<string, FieldMeta> = {
  // Hero
  heroEyebrow:        { label: "Küçük Üst Etiket",      section: "Hero (Giriş Bölümü)",      hint: "Başlığın üstünde küçük renkli metin. Örn: 'IoT Yazılım Uzmanı'",                   type: "short" },
  heroTitle:          { label: "Ana Başlık",             section: "Hero (Giriş Bölümü)",      hint: "Sayfada en büyük gözüken başlık. HTML destekler (<em>, <span> vb.)",               type: "long"  },
  heroLead:           { label: "Alt Açıklama",           section: "Hero (Giriş Bölümü)",      hint: "Ana başlığın altındaki paragraf metni.",                                             type: "long"  },
  heroCta:            { label: "Buton Metni",            section: "Hero (Giriş Bölümü)",      hint: "Hero'daki ana eylem butonu.",                                                        type: "button"},
  heroCtaSecondary:   { label: "İkincil Buton",          section: "Hero (Giriş Bölümü)",      hint: "Hero'daki ikincil buton (varsa).",                                                   type: "button"},

  // Trust / Stats
  trustEyebrow:       { label: "Küçük Üst Etiket",      section: "Güven / İstatistik Bölümü", hint: "Bu bölümün üst etiketi.",                                                           type: "short" },
  trustTitle:         { label: "Bölüm Başlığı",         section: "Güven / İstatistik Bölümü", hint: "",                                                                                   type: "short" },
  trustLead:          { label: "Bölüm Açıklaması",      section: "Güven / İstatistik Bölümü", hint: "",                                                                                   type: "long"  },

  // Ecosystem
  ecosystemEyebrow:   { label: "Küçük Üst Etiket",      section: "Ekosistem Bölümü",         hint: "",                                                                                   type: "short" },
  ecosystemTitle:     { label: "Bölüm Başlığı",         section: "Ekosistem Bölümü",         hint: "HTML destekler.",                                                                    type: "short" },
  ecosystemLead:      { label: "Bölüm Açıklaması",      section: "Ekosistem Bölümü",         hint: "",                                                                                   type: "long"  },

  // Products section (on home)
  productsEyebrow:    { label: "Küçük Üst Etiket",      section: "Ürünler Bölümü",           hint: "",                                                                                   type: "short" },
  productsTitle:      { label: "Bölüm Başlığı",         section: "Ürünler Bölümü",           hint: "HTML destekler.",                                                                    type: "short" },
  productsLead:       { label: "Bölüm Açıklaması",      section: "Ürünler Bölümü",           hint: "",                                                                                   type: "long"  },

  // Industries
  industriesEyebrow:  { label: "Küçük Üst Etiket",      section: "Sektörler Bölümü",         hint: "",                                                                                   type: "short" },
  industriesTitle:    { label: "Bölüm Başlığı",         section: "Sektörler Bölümü",         hint: "HTML destekler.",                                                                    type: "short" },

  // News section (on home)
  newsEyebrow:        { label: "Küçük Üst Etiket",      section: "Haberler Bölümü",          hint: "",                                                                                   type: "short" },
  newsTitle:          { label: "Bölüm Başlığı",         section: "Haberler Bölümü",          hint: "",                                                                                   type: "short" },

  // CTA
  ctaEyebrow:         { label: "Küçük Üst Etiket",      section: "Eylem (CTA) Bölümü",       hint: "Sayfanın altındaki büyük eylem çağrısı üst etiketi.",                               type: "short" },
  ctaTitle:           { label: "Başlık",                 section: "Eylem (CTA) Bölümü",       hint: "HTML destekler.",                                                                    type: "short" },
  ctaLead:            { label: "Açıklama",               section: "Eylem (CTA) Bölümü",       hint: "",                                                                                   type: "long"  },
  ctaCta:             { label: "Buton Metni",            section: "Eylem (CTA) Bölümü",       hint: "",                                                                                   type: "button"},

  // Solutions
  howEyebrow:         { label: "Küçük Üst Etiket",      section: "Nasıl Çalışır Bölümü",     hint: "",                                                                                   type: "short" },
  howTitle:           { label: "Bölüm Başlığı",         section: "Nasıl Çalışır Bölümü",     hint: "",                                                                                   type: "short" },
  howLead:            { label: "Bölüm Açıklaması",      section: "Nasıl Çalışır Bölümü",     hint: "",                                                                                   type: "long"  },
  whyEyebrow:         { label: "Küçük Üst Etiket",      section: "Neden Biz Bölümü",         hint: "",                                                                                   type: "short" },
  whyTitle:           { label: "Bölüm Başlığı",         section: "Neden Biz Bölümü",         hint: "",                                                                                   type: "short" },
  useCasesTitle:      { label: "Kullanım Alanları Başlığı", section: "Kullanım Alanları",     hint: "",                                                                                   type: "short" },

  // Services
  stackTitle:         { label: "Teknoloji Yığını Başlığı", section: "Teknoloji Bölümü",      hint: "",                                                                                   type: "short" },

  // Start Project
  pathsEyebrow:       { label: "Küçük Üst Etiket",      section: "Yollar Bölümü",            hint: "",                                                                                   type: "short" },
  pathsTitle:         { label: "Bölüm Başlığı",         section: "Yollar Bölümü",            hint: "",                                                                                   type: "short" },
  pathsLead:          { label: "Bölüm Açıklaması",      section: "Yollar Bölümü",            hint: "",                                                                                   type: "long"  },
  realityEyebrow:     { label: "Küçük Üst Etiket",      section: "Gerçek Bölümü",            hint: "",                                                                                   type: "short" },
  realityTitle:       { label: "Bölüm Başlığı",         section: "Gerçek Bölümü",            hint: "",                                                                                   type: "short" },
  afterSubmission:    { label: "Form Sonrası Mesaj",     section: "Form",                     hint: "Form gönderildikten sonra kullanıcıya gösterilen mesaj.",                           type: "long"  },

  // Glossary
  connectivityEyebrow:{ label: "Küçük Üst Etiket",      section: "Bağlantı Bölümü",          hint: "",                                                                                   type: "short" },
  connectivityTitle:  { label: "Bölüm Başlığı",         section: "Bağlantı Bölümü",          hint: "",                                                                                   type: "short" },
  devicesEyebrow:     { label: "Küçük Üst Etiket",      section: "Cihazlar Bölümü",          hint: "",                                                                                   type: "short" },
  devicesTitle:       { label: "Bölüm Başlığı",         section: "Cihazlar Bölümü",          hint: "",                                                                                   type: "short" },
  softwareEyebrow:    { label: "Küçük Üst Etiket",      section: "Yazılım Bölümü",           hint: "",                                                                                   type: "short" },
  softwareTitle:      { label: "Bölüm Başlığı",         section: "Yazılım Bölümü",           hint: "",                                                                                   type: "short" },

  // Catalog (products page)
  catalogEyebrow:     { label: "Küçük Üst Etiket",      section: "Katalog Bölümü",           hint: "",                                                                                   type: "short" },
  catalogTitle:       { label: "Bölüm Başlığı",         section: "Katalog Bölümü",           hint: "",                                                                                   type: "short" },
};

function getMeta(key: string): FieldMeta {
  return FIELD_META[key] ?? { label: key, section: "Diğer Alanlar", hint: "", type: "short" };
}

// ── Preview: render one section's fields as a visual snippet ─────────────────
function PreviewBadge({ type }: { type: FieldType }) {
  if (type === "button") return <span className="inline-block px-2 py-0.5 bg-[#132175] text-white text-[9px] font-bold rounded">BUTON</span>;
  if (type === "long")   return null;
  return null;
}

function PreviewSections({ pageKey, data, locale, activeKey }: {
  pageKey: string; data: Record<string, any>; locale: Locale; activeKey: string | null;
}) {
  const val = (k: string) => (data[k]?.[locale] || data[k]?.en || "").trim();

  // Build unique section list in key order
  const keys = Object.keys(data).sort();
  const sectionOrder: string[] = [];
  const bySection: Record<string, string[]> = {};
  for (const k of keys) {
    const s = getMeta(k).section;
    if (!bySection[s]) { bySection[s] = []; sectionOrder.push(s); }
    bySection[s].push(k);
  }

  return (
    <div className="space-y-3 text-sm">
      {sectionOrder.map((section) => {
        const fields = bySection[section];
        const isActive = fields.some((k) => k === activeKey);
        return (
          <div
            key={section}
            className={`rounded-xl border transition-all duration-150 overflow-hidden ${
              isActive ? "border-[#1aa3c4] shadow-md shadow-[#1aa3c4]/10" : "border-gray-100"
            }`}
          >
            {/* Section header */}
            <div className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider ${isActive ? "bg-[#1aa3c4]/10 text-[#1aa3c4]" : "bg-gray-50 text-gray-300"}`}>
              {section}
            </div>

            {/* Fields rendered as page content */}
            <div className="px-4 py-3 space-y-1.5 bg-white">
              {fields.map((k) => {
                const meta = getMeta(k);
                const v = val(k);
                const highlight = k === activeKey;
                return (
                  <div key={k} className={`rounded transition-colors ${highlight ? "bg-yellow-50 outline outline-2 outline-yellow-300 -mx-1 px-1" : ""}`}>
                    {meta.type === "button" ? (
                      <span className="inline-block px-3 py-1 bg-[#132175] text-white text-xs font-bold rounded-lg">
                        {v || <span className="opacity-40 italic">Buton metni</span>}
                      </span>
                    ) : meta.type === "long" ? (
                      <p className="text-xs text-gray-500 leading-relaxed">{v || <span className="text-gray-200 italic">—</span>}</p>
                    ) : k.toLowerCase().includes("eyebrow") ? (
                      <p className="text-[9px] font-bold text-[#1aa3c4] uppercase tracking-widest">{v || <span className="text-gray-200 italic">—</span>}</p>
                    ) : k.toLowerCase().includes("title") || k.toLowerCase().includes("lead") ? (
                      <p className={`font-extrabold text-gray-800 ${k.toLowerCase().includes("hero") ? "text-base" : "text-sm"}`}
                        dangerouslySetInnerHTML={{ __html: v || `<span style="color:#d1d5db;font-style:italic">—</span>` }} />
                    ) : (
                      <p className="text-xs text-gray-600">{v || <span className="text-gray-200 italic">—</span>}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PageContentPanel() {
  const { content, setContent } = useAdmin();
  const [selectedPage, setSelectedPage] = useState("home");
  const [locale, setLocale] = useState<Locale>("tr");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const sourceLang: Locale = "en";

  const pageContent = content?.pageContent || {};
  const pageData = pageContent[selectedPage] || {};
  const keys = Object.keys(pageData).sort();

  const updateField = (key: string, loc: Locale, value: string) => {
    setContent((c: any) => {
      const pc = { ...c.pageContent };
      const page = { ...pc[selectedPage] };
      page[key] = { ...page[key], [loc]: value };
      pc[selectedPage] = page;
      return { ...c, pageContent: pc };
    });
  };

  // Completion stats
  const filledMap: Record<string, boolean> = {};
  for (const l of locales) {
    filledMap[l] = keys.some((k) => (pageData[k]?.[l] || "").trim().length > 0);
  }
  const filledCount = keys.filter((k) => (pageData[k]?.[locale] || "").trim().length > 0).length;
  const emptyCount = keys.length - filledCount;

  // Group fields by section (for editor)
  const sectionOrder: string[] = [];
  const bySection: Record<string, string[]> = {};
  for (const k of keys) {
    const s = getMeta(k).section;
    if (!bySection[s]) { bySection[s] = []; sectionOrder.push(s); }
    bySection[s].push(k);
  }

  return (
    <div className="flex gap-5 min-h-[600px]">

      {/* ── Left: Page list ── */}
      <div className="w-48 shrink-0 space-y-1 self-start">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Sayfa Seçin</p>
        {PAGES.map((pg) => {
          const pgData = pageContent[pg.key] || {};
          const pgKeys = Object.keys(pgData);
          const pgFilled = pgKeys.filter((k) => (pgData[k]?.[locale] || "").trim()).length;
          const pct = pgKeys.length ? Math.round((pgFilled / pgKeys.length) * 100) : 0;
          const active = selectedPage === pg.key;
          const dotClr = pct === 100 ? "bg-green-400" : pct > 50 ? "bg-amber-400" : "bg-red-400";
          return (
            <button
              key={pg.key}
              onClick={() => { setSelectedPage(pg.key); setActiveKey(null); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-between gap-2 ${
                active ? "bg-[#132175] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-[#132175]/30 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{pg.icon}</span>
                <span>{pg.label}</span>
              </span>
              <span className={`w-2 h-2 rounded-full shrink-0 ${dotClr} ${active ? "opacity-80" : ""}`} />
            </button>
          );
        })}
      </div>

      {/* ── Center: Field editor ── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <LocaleTabs active={locale} onChange={setLocale} filledMap={filledMap} />
          <div className="flex items-center gap-3">
            {emptyCount > 0 && (
              <span className="px-2 py-1 bg-red-50 border border-red-200 text-red-500 text-xs font-bold rounded-lg">
                {emptyCount} alan boş
              </span>
            )}
            <span className="text-xs text-gray-400">{filledCount}/{keys.length} dolu</span>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
          Aşağıdaki alanlar <strong>"{PAGES.find(p => p.key === selectedPage)?.label}" sayfasında</strong> görünen metinlerdir.
          Sol sütun İngilizce orijinal metni gösterir. Sağ sütuna çevirinizi yazın.
        </div>

        {keys.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
            Bu sayfa için henüz içerik alanı eklenmemiş.
          </div>
        )}

        {/* Sections */}
        {sectionOrder.map((section) => {
          const sectionKeys = bySection[section];
          const hasEmpty = sectionKeys.some((k) => !(pageData[k]?.[locale] || "").trim());
          return (
            <div key={section} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Section header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                <p className="text-xs font-bold text-gray-700">{section}</p>
                {hasEmpty && locale !== sourceLang && (
                  <span className="text-[10px] font-bold text-red-400 bg-red-50 px-2 py-0.5 rounded">Eksik çeviri var</span>
                )}
              </div>

              {/* Fields */}
              <div className="divide-y divide-gray-50">
                {sectionKeys.map((key) => {
                  const meta = getMeta(key);
                  const srcVal = pageData[key]?.[sourceLang] || "";
                  const tgtVal = pageData[key]?.[locale] || "";
                  const isEmpty = locale !== sourceLang && !tgtVal.trim();
                  const isActive = activeKey === key;

                  return (
                    <div
                      key={key}
                      className={`px-5 py-4 transition-colors ${isActive ? "bg-blue-50/40" : ""}`}
                    >
                      <div className="flex items-baseline justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-800">{meta.label}</label>
                        {isEmpty && <span className="text-[10px] text-red-400 font-bold">— Çeviri Eksik</span>}
                      </div>
                      {meta.hint && <p className="text-xs text-gray-400 mb-2">{meta.hint}</p>}

                      {locale === sourceLang ? (
                        /* Single edit for source lang */
                        meta.type === "long" ? (
                          <textarea
                            value={srcVal}
                            onChange={(e) => updateField(key, sourceLang, e.target.value)}
                            onFocus={() => setActiveKey(key)}
                            onBlur={() => setActiveKey(null)}
                            rows={3}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1aa3c4] resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={srcVal}
                            onChange={(e) => updateField(key, sourceLang, e.target.value)}
                            onFocus={() => setActiveKey(key)}
                            onBlur={() => setActiveKey(null)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1aa3c4]"
                          />
                        )
                      ) : (
                        /* Source + Target side by side */
                        <div className="grid grid-cols-2 gap-3">
                          {/* Source (read-only) */}
                          <div>
                            <p className="text-[9px] text-gray-300 font-bold uppercase mb-1">İngilizce (orijinal)</p>
                            <div className={`p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-400 min-h-[40px] ${
                              meta.type === "long" ? "whitespace-pre-wrap leading-relaxed" : ""
                            }`}>
                              {srcVal || <span className="italic text-gray-200">—</span>}
                            </div>
                          </div>

                          {/* Target (editable) */}
                          <div>
                            <p className={`text-[9px] font-bold uppercase mb-1 ${locale === "tr" ? "text-red-400" : locale === "de" ? "text-yellow-600" : locale === "fr" ? "text-blue-400" : "text-gray-400"}`}>
                              {locale === "tr" ? "Türkçe" : locale === "de" ? "Almanca" : locale === "fr" ? "Fransızca" : locale.toUpperCase()} (çeviri)
                            </p>
                            {meta.type === "long" ? (
                              <textarea
                                value={tgtVal}
                                onChange={(e) => updateField(key, locale, e.target.value)}
                                onFocus={() => setActiveKey(key)}
                                onBlur={() => setActiveKey(null)}
                                rows={3}
                                placeholder={srcVal ? `Çeviri: ${srcVal.slice(0, 40)}...` : "Çeviri girin..."}
                                className={`w-full p-2.5 border rounded-lg text-sm text-gray-800 outline-none resize-none transition ${
                                  isEmpty ? "border-red-200 bg-red-50 focus:border-red-400" : "border-gray-200 bg-gray-50 focus:border-[#1aa3c4]"
                                }`}
                              />
                            ) : (
                              <input
                                type="text"
                                value={tgtVal}
                                onChange={(e) => updateField(key, locale, e.target.value)}
                                onFocus={() => setActiveKey(key)}
                                onBlur={() => setActiveKey(null)}
                                placeholder={srcVal ? `Çeviri: ${srcVal.slice(0, 40)}` : "Çeviri girin..."}
                                className={`w-full p-2.5 border rounded-lg text-sm text-gray-800 outline-none transition ${
                                  isEmpty ? "border-red-200 bg-red-50 focus:border-red-400" : "border-gray-200 bg-gray-50 focus:border-[#1aa3c4]"
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Right: Live preview ── */}
      <div className="w-64 shrink-0 self-start sticky top-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">
          Canlı Ön İzleme
          <span className="ml-2 font-normal normal-case">({locale.toUpperCase()})</span>
        </p>
        <div
          ref={previewRef}
          className="bg-white border border-gray-200 rounded-xl p-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 180px)" }}
        >
          {keys.length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-4">İçerik alanı yok.</p>
          ) : (
            <PreviewSections
              pageKey={selectedPage}
              data={pageData}
              locale={locale}
              activeKey={activeKey}
            />
          )}
        </div>
        <div className="mt-2 px-1 text-[9px] text-gray-300">
          Bir alana tıklayınca burada sarıyla vurgulanır.
        </div>
      </div>

    </div>
  );
}

"use client";

import { useState, useRef, useCallback } from "react";
import { locales, type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";

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

// ── Locale display info ───────────────────────────────────────────────────────
const LOCALE_INFO: Record<string, { flag: string; name: string }> = {
  en: { flag: "🇬🇧", name: "English" },
  tr: { flag: "🇹🇷", name: "Türkçe" },
  de: { flag: "🇩🇪", name: "Deutsch" },
  fr: { flag: "🇫🇷", name: "Français" },
  es: { flag: "🇪🇸", name: "Español" },
  it: { flag: "🇮🇹", name: "Italiano" },
  ar: { flag: "🇸🇦", name: "العربية" },
  ja: { flag: "🇯🇵", name: "日本語" },
};

// ── Field metadata ────────────────────────────────────────────────────────────
type FieldType = "short" | "long" | "button";
interface FieldMeta { label: string; section: string; hint: string; type: FieldType; }

const FIELD_META: Record<string, FieldMeta> = {
  heroEyebrow:        { label: "Küçük Üst Etiket",           section: "Hero (Giriş Bölümü)",       hint: "Başlığın üstünde küçük renkli metin.",                        type: "short"  },
  heroTitle:          { label: "Ana Başlık",                  section: "Hero (Giriş Bölümü)",       hint: "Sayfada en büyük başlık. HTML destekler (<em>, <span> vb.)",  type: "long"   },
  heroLead:           { label: "Alt Açıklama",                section: "Hero (Giriş Bölümü)",       hint: "Ana başlığın altındaki paragraf.",                             type: "long"   },
  heroCta:            { label: "Buton Metni",                 section: "Hero (Giriş Bölümü)",       hint: "Hero'daki ana eylem butonu.",                                  type: "button" },
  heroCtaSecondary:   { label: "İkincil Buton",               section: "Hero (Giriş Bölümü)",       hint: "Hero'daki ikincil buton (varsa).",                             type: "button" },
  trustEyebrow:       { label: "Küçük Üst Etiket",           section: "Güven / İstatistik Bölümü", hint: "",                                                             type: "short"  },
  trustTitle:         { label: "Bölüm Başlığı",              section: "Güven / İstatistik Bölümü", hint: "",                                                             type: "short"  },
  trustLead:          { label: "Bölüm Açıklaması",           section: "Güven / İstatistik Bölümü", hint: "",                                                             type: "long"   },
  serviceRail_0_title:{ label: "Yetenek 1 — Başlık",         section: "Yetenek Alanları (4 Kart)", hint: "Ana sayfadaki ilk yetenek kartı.",                            type: "short"  },
  serviceRail_0_desc: { label: "Yetenek 1 — Açıklama",       section: "Yetenek Alanları (4 Kart)", hint: "",                                                             type: "long"   },
  serviceRail_1_title:{ label: "Yetenek 2 — Başlık",         section: "Yetenek Alanları (4 Kart)", hint: "",                                                             type: "short"  },
  serviceRail_1_desc: { label: "Yetenek 2 — Açıklama",       section: "Yetenek Alanları (4 Kart)", hint: "",                                                             type: "long"   },
  serviceRail_2_title:{ label: "Yetenek 3 — Başlık",         section: "Yetenek Alanları (4 Kart)", hint: "",                                                             type: "short"  },
  serviceRail_2_desc: { label: "Yetenek 3 — Açıklama",       section: "Yetenek Alanları (4 Kart)", hint: "",                                                             type: "long"   },
  serviceRail_3_title:{ label: "Yetenek 4 — Başlık",         section: "Yetenek Alanları (4 Kart)", hint: "",                                                             type: "short"  },
  serviceRail_3_desc: { label: "Yetenek 4 — Açıklama",       section: "Yetenek Alanları (4 Kart)", hint: "",                                                             type: "long"   },
  ecosystemEyebrow:   { label: "Küçük Üst Etiket",           section: "Ekosistem Bölümü",          hint: "",                                                             type: "short"  },
  ecosystemTitle:     { label: "Bölüm Başlığı",              section: "Ekosistem Bölümü",          hint: "HTML destekler.",                                              type: "short"  },
  ecosystemLead:      { label: "Bölüm Açıklaması",           section: "Ekosistem Bölümü",          hint: "",                                                             type: "long"   },
  productsEyebrow:    { label: "Küçük Üst Etiket",           section: "Ürünler Bölümü",            hint: "",                                                             type: "short"  },
  productsTitle:      { label: "Bölüm Başlığı",              section: "Ürünler Bölümü",            hint: "HTML destekler.",                                              type: "short"  },
  productsLead:       { label: "Bölüm Açıklaması",           section: "Ürünler Bölümü",            hint: "",                                                             type: "long"   },
  industriesEyebrow:  { label: "Küçük Üst Etiket",           section: "Sektörler Bölümü",          hint: "",                                                             type: "short"  },
  industriesTitle:    { label: "Bölüm Başlığı",              section: "Sektörler Bölümü",          hint: "HTML destekler.",                                              type: "short"  },
  newsEyebrow:        { label: "Küçük Üst Etiket",           section: "Haberler Bölümü",           hint: "",                                                             type: "short"  },
  newsTitle:          { label: "Bölüm Başlığı",              section: "Haberler Bölümü",           hint: "",                                                             type: "short"  },
  ctaEyebrow:         { label: "Küçük Üst Etiket",           section: "Eylem (CTA) Bölümü",        hint: "Sayfanın altındaki büyük eylem çağrısı üst etiketi.",          type: "short"  },
  ctaTitle:           { label: "Başlık",                     section: "Eylem (CTA) Bölümü",        hint: "HTML destekler.",                                              type: "short"  },
  ctaLead:            { label: "Açıklama",                   section: "Eylem (CTA) Bölümü",        hint: "",                                                             type: "long"   },
  ctaCta:             { label: "Buton Metni",                section: "Eylem (CTA) Bölümü",        hint: "",                                                             type: "button" },
  howEyebrow:         { label: "Küçük Üst Etiket",           section: "Nasıl Çalışır Bölümü",      hint: "",                                                             type: "short"  },
  howTitle:           { label: "Bölüm Başlığı",              section: "Nasıl Çalışır Bölümü",      hint: "",                                                             type: "short"  },
  howLead:            { label: "Bölüm Açıklaması",           section: "Nasıl Çalışır Bölümü",      hint: "",                                                             type: "long"   },
  whyEyebrow:         { label: "Küçük Üst Etiket",           section: "Neden Biz Bölümü",          hint: "",                                                             type: "short"  },
  whyTitle:           { label: "Bölüm Başlığı",              section: "Neden Biz Bölümü",          hint: "",                                                             type: "short"  },
  useCasesTitle:      { label: "Kullanım Alanları Başlığı",  section: "Kullanım Alanları",         hint: "",                                                             type: "short"  },
  stackTitle:         { label: "Teknoloji Yığını Başlığı",   section: "Teknoloji Bölümü",          hint: "",                                                             type: "short"  },
  pathsEyebrow:       { label: "Küçük Üst Etiket",           section: "Yollar Bölümü",             hint: "",                                                             type: "short"  },
  pathsTitle:         { label: "Bölüm Başlığı",              section: "Yollar Bölümü",             hint: "",                                                             type: "short"  },
  pathsLead:          { label: "Bölüm Açıklaması",           section: "Yollar Bölümü",             hint: "",                                                             type: "long"   },
  realityEyebrow:     { label: "Küçük Üst Etiket",           section: "Gerçek Bölümü",             hint: "",                                                             type: "short"  },
  realityTitle:       { label: "Bölüm Başlığı",              section: "Gerçek Bölümü",             hint: "",                                                             type: "short"  },
  afterSubmission:    { label: "Form Sonrası Mesaj",         section: "Form",                      hint: "Form gönderildikten sonra kullanıcıya gösterilen mesaj.",       type: "long"   },
  connectivityEyebrow:{ label: "Küçük Üst Etiket",           section: "Bağlantı Bölümü",           hint: "",                                                             type: "short"  },
  connectivityTitle:  { label: "Bölüm Başlığı",              section: "Bağlantı Bölümü",           hint: "",                                                             type: "short"  },
  devicesEyebrow:     { label: "Küçük Üst Etiket",           section: "Cihazlar Bölümü",           hint: "",                                                             type: "short"  },
  devicesTitle:       { label: "Bölüm Başlığı",              section: "Cihazlar Bölümü",           hint: "",                                                             type: "short"  },
  softwareEyebrow:    { label: "Küçük Üst Etiket",           section: "Yazılım Bölümü",            hint: "",                                                             type: "short"  },
  softwareTitle:      { label: "Bölüm Başlığı",              section: "Yazılım Bölümü",            hint: "",                                                             type: "short"  },
  catalogEyebrow:     { label: "Küçük Üst Etiket",           section: "Katalog Bölümü",            hint: "",                                                             type: "short"  },
  catalogTitle:       { label: "Bölüm Başlığı",              section: "Katalog Bölümü",            hint: "",                                                             type: "short"  },
};

function getMeta(key: string): FieldMeta {
  return FIELD_META[key] ?? { label: key, section: "Diğer Alanlar", hint: "", type: "short" };
}

// ── Live preview (right panel) ────────────────────────────────────────────────
function PreviewSections({ data, locale, activeKey }: {
  data: Record<string, any>; locale: Locale; activeKey: string | null;
}) {
  const val = (k: string) => (data[k]?.[locale] || data[k]?.en || "").trim();
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
        const sFields = bySection[section];
        const isActive = sFields.some((k) => k === activeKey);
        return (
          <div key={section} className={`rounded-xl border transition-all overflow-hidden ${isActive ? "border-[#1aa3c4] shadow-md shadow-[#1aa3c4]/10" : "border-gray-100"}`}>
            <div className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider ${isActive ? "bg-[#1aa3c4]/10 text-[#1aa3c4]" : "bg-gray-50 text-gray-300"}`}>
              {section}
            </div>
            <div className="px-4 py-3 space-y-1.5 bg-white">
              {sFields.map((k) => {
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
                    ) : (
                      <p className={`font-extrabold text-gray-800 ${k.toLowerCase().includes("hero") ? "text-base" : "text-sm"}`}
                        dangerouslySetInnerHTML={{ __html: v || `<span style="color:#d1d5db;font-style:italic">—</span>` }} />
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
const SOURCE_LANG: Locale = "en";
const TARGET_LOCALES = locales.filter((l) => l !== SOURCE_LANG);

const HOME_SERVICE_RAIL_KEYS = [
  "serviceRail_0_title", "serviceRail_0_desc",
  "serviceRail_1_title", "serviceRail_1_desc",
  "serviceRail_2_title", "serviceRail_2_desc",
  "serviceRail_3_title", "serviceRail_3_desc",
];

export default function PageContentPanel() {
  const { content, setContent } = useAdmin();
  const [selectedPage, setSelectedPage] = useState("home");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [previewLocale, setPreviewLocale] = useState<Locale>("tr");
  // suggestions: locale → translated text (pending accept/reject)
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState<Set<string>>(new Set());
  const [translateError, setTranslateError] = useState<string | null>(null);

  const pageContent = content?.pageContent || {};
  const pageData = pageContent[selectedPage] || {};
  const keys = (
    selectedPage === "home"
      ? [...new Set([...Object.keys(pageData), ...HOME_SERVICE_RAIL_KEYS])]
      : Object.keys(pageData)
  ).sort();

  // Group fields by section
  const sectionOrder: string[] = [];
  const bySection: Record<string, string[]> = {};
  for (const k of keys) {
    const s = getMeta(k).section;
    if (!bySection[s]) { bySection[s] = []; sectionOrder.push(s); }
    bySection[s].push(k);
  }

  const activeField = activeKey ?? keys[0] ?? null;
  const activeMeta = activeField ? getMeta(activeField) : null;

  const updateField = useCallback((key: string, loc: Locale, value: string) => {
    setContent((c: any) => {
      const pc = { ...c.pageContent };
      const page = { ...pc[selectedPage] };
      page[key] = { ...page[key], [loc]: value };
      pc[selectedPage] = page;
      return { ...c, pageContent: pc };
    });
  }, [selectedPage, setContent]);

  const getVal = (key: string, loc: Locale) => (pageData[key]?.[loc] || "").trim();

  // Count missing per locale for current page
  const missingPerLocale = (loc: Locale) =>
    keys.filter((k) => !getVal(k, loc)).length;

  // Field completion: how many locales are filled for this field
  const fieldStatus = (key: string): "all" | "partial" | "empty" => {
    const filled = TARGET_LOCALES.filter((l) => getVal(key, l)).length;
    if (filled === TARGET_LOCALES.length) return "all";
    if (filled > 0) return "partial";
    return "empty";
  };

  // Translate selected field into all empty target locales
  const translateAll = async () => {
    if (!activeField) return;
    const sourceText = getVal(activeField, SOURCE_LANG);
    if (!sourceText) return;

    const emptyLangs = TARGET_LOCALES.filter((l) => !getVal(activeField, l) && !suggestions[l]);
    if (emptyLangs.length === 0) return;

    setTranslateError(null);
    setTranslating(new Set(emptyLangs));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText, targetLangs: emptyLangs }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Çeviri başarısız");
      setSuggestions((prev) => ({ ...prev, ...data.translations }));
      if (data.errors?.length) setTranslateError(data.errors.join(", "));
    } catch (e: any) {
      setTranslateError(e.message);
    } finally {
      setTranslating(new Set());
    }
  };

  // Translate single locale
  const translateOne = async (lang: string) => {
    if (!activeField) return;
    const sourceText = getVal(activeField, SOURCE_LANG);
    if (!sourceText) return;

    setTranslating((prev) => new Set([...prev, lang]));
    setTranslateError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText, targetLangs: [lang] }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Çeviri başarısız");
      setSuggestions((prev) => ({ ...prev, ...data.translations }));
    } catch (e: any) {
      setTranslateError(e.message);
    } finally {
      setTranslating((prev) => { const s = new Set(prev); s.delete(lang); return s; });
    }
  };

  const acceptSuggestion = (lang: string) => {
    if (!activeField || !suggestions[lang]) return;
    updateField(activeField, lang as Locale, suggestions[lang]);
    setSuggestions((prev) => { const n = { ...prev }; delete n[lang]; return n; });
  };

  const rejectSuggestion = (lang: string) => {
    setSuggestions((prev) => { const n = { ...prev }; delete n[lang]; return n; });
  };

  // Clear suggestions when field changes
  const selectField = (key: string) => {
    setActiveKey(key);
    setSuggestions({});
    setTranslateError(null);
  };

  const sourceText = activeField ? getVal(activeField, SOURCE_LANG) : "";
  const emptyTargetCount = activeField
    ? TARGET_LOCALES.filter((l) => !getVal(activeField, l) && !suggestions[l]).length
    : 0;

  return (
    <div className="flex gap-4 min-h-[600px]">

      {/* ── Left: Page list + Field list ─────────────────────────────────── */}
      <div className="w-52 shrink-0 flex flex-col gap-3 self-start sticky top-0">

        {/* Page picker */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-1.5">Sayfa</p>
          <div className="space-y-0.5">
            {PAGES.map((pg) => {
              const pgData = pageContent[pg.key] || {};
              const pgKeys = Object.keys(pgData);
              const pgFilled = pgKeys.filter((k) => (pgData[k]?.tr || "").trim()).length;
              const pct = pgKeys.length ? Math.round((pgFilled / pgKeys.length) * 100) : 0;
              const dotClr = pct === 100 ? "bg-green-400" : pct > 50 ? "bg-amber-400" : "bg-red-400";
              const active = selectedPage === pg.key;
              return (
                <button
                  key={pg.key}
                  onClick={() => { setSelectedPage(pg.key); setActiveKey(null); setSuggestions({}); }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between gap-2 ${
                    active ? "bg-[#132175] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#132175]/30"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><span>{pg.icon}</span><span>{pg.label}</span></span>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClr} ${active ? "opacity-80" : ""}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Field list */}
        {sectionOrder.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-1.5">Alan</p>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {sectionOrder.map((section, si) => (
                <div key={section}>
                  {si > 0 && <div className="h-px bg-gray-100 mx-3" />}
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-300 px-3 pt-2 pb-0.5">{section}</p>
                  {bySection[section].map((k) => {
                    const meta = getMeta(k);
                    const status = fieldStatus(k);
                    const isActive = activeField === k;
                    return (
                      <button
                        key={k}
                        onClick={() => selectField(k)}
                        className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center justify-between gap-1 transition ${
                          isActive ? "bg-[#132175] text-white font-bold" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="truncate">{meta.label}</span>
                        {status === "all"     && <span className="text-[9px] shrink-0">✓</span>}
                        {status === "partial" && <span className={`text-[9px] shrink-0 ${isActive ? "text-amber-200" : "text-amber-400"}`}>⚠</span>}
                        {status === "empty"   && <span className={`text-[9px] shrink-0 ${isActive ? "text-red-300" : "text-red-400"}`}>✗</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Center: All locales for selected field ────────────────────────── */}
      <div className="flex-1 min-w-0">
        {!activeField ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
            Bu sayfa için henüz içerik alanı eklenmemiş.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

            {/* Field header */}
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">{activeMeta?.label}</p>
                <p className="text-[10px] text-gray-400">{activeMeta?.section}
                  {activeMeta?.hint ? ` · ${activeMeta.hint}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {translateError && (
                  <span className="text-[10px] text-red-500">{translateError}</span>
                )}
                {emptyTargetCount > 0 && sourceText && (
                  <button
                    onClick={translateAll}
                    disabled={translating.size > 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#1aa3c4] to-[#0e8aaa] text-white text-[11px] font-bold rounded-lg disabled:opacity-50 transition"
                  >
                    {translating.size > 0 ? (
                      <><span className="animate-spin">⟳</span> Çevriliyor…</>
                    ) : (
                      <>✨ Tümünü Çevir ({emptyTargetCount})</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Locale inputs */}
            <div className="divide-y divide-gray-50">
              {locales.map((loc) => {
                const info = LOCALE_INFO[loc] ?? { flag: "🌐", name: loc };
                const isSource = loc === SOURCE_LANG;
                const rawValue = pageData[activeField]?.[loc] || "";
                const suggestion = !isSource ? suggestions[loc] : undefined;
                const isTranslating = translating.has(loc);
                const isEmpty = !rawValue.trim() && !suggestion;
                const isFilled = !!rawValue.trim();

                return (
                  <div
                    key={loc}
                    className={`px-5 py-3 ${isSource ? "bg-[#f0f4ff]" : ""}`}
                  >
                    {/* Locale label row */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base leading-none">{info.flag}</span>
                        <span className={`text-[11px] font-bold ${
                          isSource ? "text-[#132175]" :
                          isFilled ? "text-green-700" :
                          suggestion ? "text-blue-700" :
                          "text-amber-700"
                        }`}>{info.name}</span>
                        {isSource && <span className="text-[9px] bg-[#132175] text-white px-1.5 py-0.5 rounded font-bold">KAYNAK</span>}
                        {isFilled && <span className="text-[9px] text-green-600">✓</span>}
                        {isEmpty && <span className="text-[9px] text-amber-500 font-bold">BOŞ</span>}
                      </div>
                      {!isSource && !rawValue.trim() && !suggestion && sourceText && (
                        <button
                          onClick={() => translateOne(loc)}
                          disabled={isTranslating || translating.size > 0}
                          className="text-[10px] font-bold px-2 py-0.5 bg-amber-400 text-white rounded disabled:opacity-50 flex items-center gap-1"
                        >
                          {isTranslating ? <span className="animate-spin">⟳</span> : "✨"} Çevir
                        </button>
                      )}
                    </div>

                    {/* Suggestion box */}
                    {suggestion && (
                      <div className="mb-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-blue-800 italic flex-1">«{suggestion}»</p>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => acceptSuggestion(loc)}
                            className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded"
                          >✓ Kabul</button>
                          <button
                            onClick={() => rejectSuggestion(loc)}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-blue-300 text-blue-600 rounded"
                          >✗</button>
                        </div>
                      </div>
                    )}

                    {/* Input */}
                    {activeMeta?.type === "long" ? (
                      <textarea
                        value={rawValue}
                        onChange={(e) => updateField(activeField, loc, e.target.value)}
                        rows={3}
                        placeholder={isSource ? "İngilizce metin..." : `${info.name} çevirisi...`}
                        dir={loc === "ar" ? "rtl" : "ltr"}
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none resize-none transition focus:border-[#1aa3c4] ${
                          isSource
                            ? "bg-white border-[#c7d2fe] text-[#132175] font-semibold"
                            : isFilled
                              ? "bg-gray-50 border-green-200 text-gray-800"
                              : "bg-gray-50 border-amber-200 text-gray-800"
                        }`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={rawValue}
                        onChange={(e) => updateField(activeField, loc, e.target.value)}
                        placeholder={isSource ? "İngilizce metin..." : `${info.name} çevirisi...`}
                        dir={loc === "ar" ? "rtl" : "ltr"}
                        className={`w-full p-2.5 border rounded-lg text-sm outline-none transition focus:border-[#1aa3c4] ${
                          isSource
                            ? "bg-white border-[#c7d2fe] text-[#132175] font-semibold"
                            : isFilled
                              ? "bg-gray-50 border-green-200 text-gray-800"
                              : "bg-gray-50 border-amber-200 text-gray-800"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigate prev/next */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex justify-between items-center">
              <button
                onClick={() => {
                  const idx = keys.indexOf(activeField);
                  if (idx > 0) selectField(keys[idx - 1]);
                }}
                disabled={keys.indexOf(activeField) === 0}
                className="text-xs text-[#132175] font-semibold disabled:opacity-30 hover:underline"
              >← Önceki</button>
              <span className="text-[10px] text-gray-400">
                {keys.indexOf(activeField) + 1} / {keys.length}
              </span>
              <button
                onClick={() => {
                  const idx = keys.indexOf(activeField);
                  if (idx < keys.length - 1) selectField(keys[idx + 1]);
                }}
                disabled={keys.indexOf(activeField) === keys.length - 1}
                className="text-xs text-[#132175] font-semibold disabled:opacity-30 hover:underline"
              >Sonraki →</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Live preview ───────────────────────────────────────────── */}
      <div className="w-60 shrink-0 self-start sticky top-0">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ön İzleme</p>
          <select
            value={previewLocale}
            onChange={(e) => setPreviewLocale(e.target.value as Locale)}
            className="text-[10px] border border-gray-200 rounded px-1 py-0.5 bg-white outline-none text-gray-600"
          >
            {locales.map((l) => (
              <option key={l} value={l}>{LOCALE_INFO[l]?.flag} {l.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div
          className="bg-white border border-gray-200 rounded-xl p-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 180px)" }}
        >
          {keys.length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-4">İçerik alanı yok.</p>
          ) : (
            <PreviewSections data={pageData} locale={previewLocale} activeKey={activeField} />
          )}
        </div>
        <p className="mt-1.5 px-1 text-[9px] text-gray-300">Aktif alan sarıyla vurgulanır.</p>
      </div>

    </div>
  );
}

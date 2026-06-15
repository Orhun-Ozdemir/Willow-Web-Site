"use client";

import { useState, useMemo } from "react";
import { locales, type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import LocaleTabs from "./LocaleTabs";
import { calcSEOScore, type SEOScoreResult } from "@/lib/seo-scoring";

const PAGES = [
  { key: "home",         label: "Ana Sayfa",     icon: "🏠" },
  { key: "products",     label: "Ürünler",        icon: "📦" },
  { key: "solutions",    label: "Çözümler",       icon: "💡" },
  { key: "services",     label: "Hizmetler",      icon: "⚙️" },
  { key: "news",         label: "Haberler",       icon: "📰" },
  { key: "company",      label: "Hakkımızda",     icon: "🏢" },
  { key: "contact",      label: "İletişim",       icon: "📬" },
  { key: "startProject", label: "Proje Başlat",   icon: "🚀" },
  { key: "glossary",     label: "Sözlük",         icon: "📖" },
];

const SCHEMA_TYPES = [
  { value: "",                label: "— Seçiniz —" },
  { value: "WebPage",         label: "Genel Web Sayfası" },
  { value: "Organization",    label: "Şirket / Kuruluş" },
  { value: "Product",         label: "Ürün" },
  { value: "Article",         label: "Makale / Haber" },
  { value: "FAQPage",         label: "Sıkça Sorulan Sorular" },
  { value: "Service",         label: "Hizmet" },
  { value: "ContactPage",     label: "İletişim Sayfası" },
  { value: "CollectionPage",  label: "Koleksiyon / Liste" },
];

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  ar: "Arabic",
  ja: "日本語",
};

const PAGE_PATHS: Record<string, string> = {
  home: "",
  products: "products",
  solutions: "solutions",
  services: "services",
  news: "news",
  company: "company",
  contact: "contact",
  startProject: "start-project",
  glossary: "glossary",
};

type SEOFieldKey = "seoTitle" | "metaDescription" | "focusKeyword" | "h1" | "slug";

const CORE_SEO_FIELDS: SEOFieldKey[] = ["seoTitle", "metaDescription", "focusKeyword", "h1", "slug"];

const SEO_FIELD_META: Record<SEOFieldKey, {
  label: string;
  hint: string;
  type?: "text" | "textarea";
  rows?: number;
  charTarget?: [number, number];
  sharedNote?: string;
}> = {
  seoTitle: {
    label: "Sayfa Başlığı",
    hint: "Google'da mavi link olarak görünür. 50-60 karakter ideal.",
    charTarget: [50, 60],
  },
  metaDescription: {
    label: "Kısa Açıklama",
    hint: "Arama sonucunda başlığın altında gözükür. 150-160 karakter ideal.",
    type: "textarea",
    rows: 3,
    charTarget: [150, 160],
  },
  focusKeyword: {
    label: "Odak Anahtar Kelime",
    hint: "Bu sayfa için hedeflediğin ana kelime. Her dilde yerel arama niyetine göre farklı yazılabilir.",
  },
  h1: {
    label: "H1 Ana Başlık",
    hint: "SEO kontrolü için kullanılan ana başlık. Canlı sayfadaki Hero başlığıyla uyumlu olmalı.",
    sharedNote: "Canlı sayfadaki karşılığı genellikle Sayfa Çevirileri > Hero > Ana Başlık alanıdır.",
  },
  slug: {
    label: "URL Adresi (Slug)",
    hint: "Küçük harf, tire ile ayrılmış, mümkünse kısa ve temiz URL yolu.",
  },
};

type SEOFieldMeta = (typeof SEO_FIELD_META)[SEOFieldKey];

function plainText(value: any): string {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function localizedPageValue(pageContent: any, key: string, locale: Locale): string {
  const value = pageContent?.[key];
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.en || "";
}

function displayPath(pageKey: string, locale: Locale, slug?: string) {
  let cleanSlug = String(slug || PAGE_PATHS[pageKey] || "")
    .replace(/^https?:\/\/(www\.)?willowsoft\.co\/?/i, "")
    .replace(/^\/+|\/+$/g, "");
  if (cleanSlug === locale) cleanSlug = "";
  if (cleanSlug.startsWith(`${locale}/`)) cleanSlug = cleanSlug.slice(locale.length + 1);
  return cleanSlug ? `willowsoft.co/${locale}/${cleanSlug}` : `willowsoft.co/${locale}`;
}

function charState(value: string, target?: [number, number]) {
  if (!target) return null;
  const len = plainText(value).length;
  const [min, max] = target;
  const ok = len >= min && len <= max;
  const warn = len > 0 && !ok;
  return {
    len,
    className: ok ? "text-green-600" : warn ? "text-amber-600" : "text-gray-400",
    label: `${len} karakter`,
  };
}

function ScoreMeter({ score, label, level }: { score: number; label: string; level: string }) {
  const color = level === "good" ? "#22c55e" : level === "ok" ? "#f59e0b" : "#ef4444";
  const bg    = level === "good" ? "bg-green-50 border-green-200" : level === "ok" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${bg}`}>
      <div className="relative w-12 h-12 shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${(score / 100) * 94.2} 94.2`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold" style={{ color }}>{score}</span>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase">{label}</p>
        <p className="text-xs text-gray-400">{level === "good" ? "İyi" : level === "ok" ? "Geliştirilmeli" : "Eksik"}</p>
      </div>
    </div>
  );
}

function LanguageStatusStrip({
  pageSeo,
  pageKey,
  activeLocale,
}: {
  pageSeo: any;
  pageKey: string;
  activeLocale: Locale;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {locales.map((loc) => {
        const data = pageSeo?.[pageKey]?.[loc] || {};
        const missing = CORE_SEO_FIELDS.filter((field) => !String(data[field] || "").trim()).length;
        const filled = CORE_SEO_FIELDS.length - missing;
        const tone = missing === 0 ? "border-green-200 bg-green-50 text-green-700" : filled >= 3 ? "border-amber-200 bg-amber-50 text-amber-700" : "border-red-200 bg-red-50 text-red-600";
        return (
          <div key={loc} className={`rounded-xl border px-3 py-2 ${tone} ${loc === activeLocale ? "ring-2 ring-[#132175]/20" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <strong className="text-xs">{loc.toUpperCase()}</strong>
              <span className="text-[10px] font-black">{filled}/{CORE_SEO_FIELDS.length}</span>
            </div>
            <p className="mt-1 text-[10px] font-semibold opacity-75">
              {missing === 0 ? "Tamam" : `${missing} alan eksik`}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function MultilingualSEOField({
  field,
  meta,
  pageSeo,
  pageKey,
  activeLocale,
  onChange,
}: {
  field: SEOFieldKey;
  meta: SEOFieldMeta;
  pageSeo: any;
  pageKey: string;
  activeLocale: Locale;
  onChange: (locale: Locale, field: string, value: any) => void;
}) {
  const activeValue = pageSeo?.[pageKey]?.[activeLocale]?.[field] || "";
  const activeChar = charState(activeValue, meta.charTarget);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
        <div className="flex items-start justify-between gap-3">
          <div>
            <label className="text-sm font-bold text-gray-800">{meta.label}</label>
            <p className="mt-1 text-xs text-gray-400 leading-relaxed">{meta.hint}</p>
            {meta.sharedNote && <p className="mt-1 text-[11px] font-semibold text-[#132175]/70">{meta.sharedNote}</p>}
          </div>
          {activeChar && <span className={`shrink-0 text-xs font-black ${activeChar.className}`}>{activeChar.label}</span>}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#132175]">
              Aktif dil: {LOCALE_LABELS[activeLocale]} ({activeLocale.toUpperCase()})
            </span>
            {!String(activeValue).trim() && <span className="text-[10px] font-black text-red-500">Eksik</span>}
          </div>
          {meta.type === "textarea" ? (
            <textarea
              value={activeValue}
              onChange={(e) => onChange(activeLocale, field, e.target.value)}
              rows={meta.rows || 3}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1aa3c4] resize-none"
            />
          ) : (
            <input
              type="text"
              value={activeValue}
              onChange={(e) => onChange(activeLocale, field, e.target.value)}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1aa3c4]"
            />
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Diğer dillerde durum ve hızlı düzenleme</p>
            <span className="text-[10px] text-gray-400">Aynı alanı dil değiştirmeden doldurabilirsiniz.</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {locales.map((loc) => {
              const value = pageSeo?.[pageKey]?.[loc]?.[field] || "";
              const missing = !String(value).trim();
              const count = charState(value, meta.charTarget);
              const rowTone = loc === activeLocale
                ? "border-[#132175]/30 bg-white"
                : missing
                  ? "border-red-100 bg-red-50/60"
                  : "border-gray-200 bg-white";
              return (
                <div key={loc} className={`rounded-lg border p-2 ${rowTone}`}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-gray-500">{loc.toUpperCase()} · {LOCALE_LABELS[loc]}</span>
                    <span className={`text-[9px] font-black ${missing ? "text-red-500" : "text-green-600"}`}>
                      {missing ? "Eksik" : "Dolu"}
                    </span>
                  </div>
                  {meta.type === "textarea" ? (
                    <textarea
                      value={value}
                      onChange={(e) => onChange(loc, field, e.target.value)}
                      rows={2}
                      placeholder={`${loc.toUpperCase()} metni`}
                      className="w-full p-2 bg-white border border-gray-200 rounded text-xs text-gray-800 outline-none focus:border-[#1aa3c4] resize-none"
                      dir={loc === "ar" ? "rtl" : "ltr"}
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => onChange(loc, field, e.target.value)}
                      placeholder={`${loc.toUpperCase()} metni`}
                      className="w-full p-2 bg-white border border-gray-200 rounded text-xs text-gray-800 outline-none focus:border-[#1aa3c4]"
                      dir={loc === "ar" ? "rtl" : "ltr"}
                    />
                  )}
                  {count && <p className={`mt-1 text-[9px] font-bold ${count.className}`}>{count.label}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveRelationCard({
  seoData,
  pageContent,
  locale,
  onSeoChange,
  onContentChange,
}: {
  seoData: any;
  pageContent: any;
  locale: Locale;
  onSeoChange: (field: string, value: any) => void;
  onContentChange: (key: string, value: string) => void;
}) {
  const liveHeroTitle = localizedPageValue(pageContent, "heroTitle", locale);
  const liveHeroLead = localizedPageValue(pageContent, "heroLead", locale);
  const seoH1 = seoData.h1 || "";
  const hasLiveTitle = plainText(liveHeroTitle).length > 0;
  const differs = hasLiveTitle && plainText(seoH1) && plainText(liveHeroTitle).toLowerCase() !== plainText(seoH1).toLowerCase();

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#132175]">SEO alanı ile canlı sayfa metni ilişkisi</p>
          <p className="mt-1 text-xs text-blue-700/70 leading-relaxed">
            SEO verisi Google, sosyal paylaşım ve AI sinyalleri içindir. Canlı sayfada görünen başlıklar ise Sayfa Çevirileri alanından gelir.
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${differs ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
          {differs ? "Fark var" : "Uyumlu"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white bg-white/80 p-3">
          <span className="text-[10px] font-black uppercase text-gray-400">SEO H1</span>
          <p className="mt-1 text-sm font-bold text-gray-800">{seoH1 || <span className="text-gray-300 italic">Boş</span>}</p>
        </div>
        <div className="rounded-lg border border-white bg-white/80 p-3">
          <span className="text-[10px] font-black uppercase text-gray-400">Canlı Hero Başlığı</span>
          <p className="mt-1 text-sm font-bold text-gray-800">{plainText(liveHeroTitle) || <span className="text-gray-300 italic">Bu sayfada pageContent heroTitle yok</span>}</p>
        </div>
      </div>

      {liveHeroLead && (
        <div className="rounded-lg border border-white bg-white/70 p-3">
          <span className="text-[10px] font-black uppercase text-gray-400">Canlı Hero Açıklaması</span>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">{plainText(liveHeroLead)}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {hasLiveTitle && (
          <button type="button" onClick={() => onSeoChange("h1", plainText(liveHeroTitle))} className="rounded-lg bg-[#132175] px-3 py-2 text-xs font-bold text-white">
            Canlı başlığı SEO H1'e al
          </button>
        )}
        {seoH1 && (
          <button type="button" onClick={() => onContentChange("heroTitle", seoH1)} className="rounded-lg border border-[#132175]/20 bg-white px-3 py-2 text-xs font-bold text-[#132175]">
            SEO H1'i canlı başlığa yaz
          </button>
        )}
      </div>
    </div>
  );
}

function SitePreview({
  pageLabel,
  pageKey,
  locale,
  seoData,
  pageContent,
}: {
  pageLabel: string;
  pageKey: string;
  locale: Locale;
  seoData: any;
  pageContent: any;
}) {
  const heroEyebrow = localizedPageValue(pageContent, "heroEyebrow", locale) || pageLabel;
  const heroTitle = localizedPageValue(pageContent, "heroTitle", locale) || seoData.h1 || seoData.seoTitle || pageLabel;
  const heroLead = localizedPageValue(pageContent, "heroLead", locale) || seoData.metaDescription || "";
  const googleTitle = seoData.seoTitle || "Sayfa Başlığı";
  const googleDesc = seoData.metaDescription || "Meta açıklama burada görünecek...";
  const ogTitle = seoData.ogTitle || seoData.seoTitle || "Paylaşım başlığı";
  const ogDesc = seoData.ogDescription || seoData.metaDescription || "Paylaşım açıklaması";
  const url = displayPath(pageKey, locale, seoData.slug);
  const isRtl = locale === "ar";

  return (
    <aside className="w-80 shrink-0 self-start sticky top-0 hidden xl:block">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">
        Canlı görünüm
        <span className="ml-2 font-normal normal-case">({locale.toUpperCase()})</span>
      </p>
      <div className="space-y-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
            <span className="ml-2 truncate rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-400">{url}</span>
          </div>
          <div className="rounded-xl bg-[#0f172a] p-4 text-white" dir={isRtl ? "rtl" : "ltr"}>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">{plainText(heroEyebrow)}</p>
            <h3 className="mt-2 text-xl font-black leading-tight" dangerouslySetInnerHTML={{ __html: heroTitle }} />
            {heroLead && <p className="mt-3 text-xs leading-relaxed text-white/70">{plainText(heroLead)}</p>}
          </div>
          <p className="mt-2 text-[10px] text-gray-400">Bu blok canlı sayfadaki Hero metninin yaklaşık görünümüdür.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[10px] font-black uppercase tracking-wide text-gray-300">Google sonucu</p>
          <p className="truncate text-base font-medium text-sky-700">{googleTitle}</p>
          <p className="mt-0.5 truncate text-xs text-green-700">{url}</p>
          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-gray-500">{googleDesc}</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex h-28 items-center justify-center bg-gray-100 text-xs font-bold text-gray-300">
            {seoData.ogImage ? seoData.ogImage.split("/").pop() : "OG görseli"}
          </div>
          <div className="p-3">
            <p className="text-[10px] uppercase text-gray-300">willowsoft.co</p>
            <p className="truncate text-sm font-black text-gray-800">{ogTitle}</p>
            <p className="line-clamp-2 text-xs text-gray-500">{ogDesc}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Section({ title, hint, children, defaultOpen = true }: {
  title: string; hint: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
      >
        <div>
          <p className="text-sm font-bold text-gray-800">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-4 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5 space-y-4 border-t border-gray-100">{children}</div>}
    </div>
  );
}

function CheckItem({ pass, warn, label }: { pass: boolean; warn?: boolean; label: string }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5 border-b border-gray-50 last:border-0">
      <span className={`mt-0.5 w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-[9px] font-black ${
        pass ? "bg-green-100 text-green-600" : warn ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-500"
      }`}>
        {pass ? "✓" : warn ? "!" : "✕"}
      </span>
      <span className="text-xs text-gray-600 leading-relaxed">{label}</span>
    </div>
  );
}

export default function SEOCenterPanel() {
  const { content, setContent } = useAdmin();
  const [selectedPage, setSelectedPage] = useState("home");
  const [locale, setLocale] = useState<Locale>("tr");

  const pageSeo = content?.pageSeo || {};
  const seoData = pageSeo[selectedPage]?.[locale] || {};
  const pageContent = content?.pageContent?.[selectedPage] || {};
  const selectedPageLabel = PAGES.find((p) => p.key === selectedPage)?.label || selectedPage;

  const scoreResult: SEOScoreResult = useMemo(
    () => calcSEOScore(seoData, locale, pageSeo, selectedPage, pageContent),
    [seoData, locale, pageSeo, selectedPage, pageContent]
  );

  const updateSEOForLocale = (targetLocale: Locale, field: string, value: any) => {
    setContent((c: any) => {
      const ps = { ...(c.pageSeo || {}) };
      const page = { ...(ps[selectedPage] || {}) };
      page[targetLocale] = { ...(page[targetLocale] || {}), [field]: value };
      ps[selectedPage] = page;
      return { ...c, pageSeo: ps };
    });
  };

  const updateSEO = (field: string, value: any) => updateSEOForLocale(locale, field, value);

  const updatePageContent = (key: string, value: string) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const page = { ...(pc[selectedPage] || {}) };
      page[key] = { ...(page[key] || {}), [locale]: value };
      pc[selectedPage] = page;
      return { ...c, pageContent: pc };
    });
  };

  const filledMap: Record<string, boolean> = {};
  const missingCountMap: Record<string, number> = {};
  for (const l of locales) {
    const d = pageSeo[selectedPage]?.[l];
    const missing = CORE_SEO_FIELDS.filter((field) => !String(d?.[field] || "").trim()).length;
    missingCountMap[l] = missing;
    filledMap[l] = missing < CORE_SEO_FIELDS.length;
  }

  return (
    <div className="flex gap-5 min-h-[600px]">

      {/* ── Left: Page selector ── */}
      <div className="w-52 shrink-0 space-y-1 self-start">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">Sayfa Seçin</p>
        {PAGES.map((pg) => {
          const pgSeo  = pageSeo[pg.key]?.[locale] || {};
          const pgRes  = calcSEOScore(pgSeo, locale, pageSeo, pg.key, content?.pageContent?.[pg.key]);
          const dotClr = pgRes.seoLevel === "good" ? "bg-green-400" : pgRes.seoLevel === "ok" ? "bg-amber-400" : "bg-red-400";
          const active = selectedPage === pg.key;
          return (
            <button
              key={pg.key}
              onClick={() => setSelectedPage(pg.key)}
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

      {/* ── Right: Editor ── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Header row: locale tabs + scores */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <LocaleTabs active={locale} onChange={setLocale} filledMap={filledMap} missingCountMap={missingCountMap} />
          <div className="flex gap-3">
            <ScoreMeter score={scoreResult.seoScore} label="SEO Puanı" level={scoreResult.seoLevel} />
            <ScoreMeter score={scoreResult.aiScore}  label="AI Puanı"  level={scoreResult.aiLevel}  />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-800">Dil bazlı SEO durumu</p>
              <p className="mt-1 text-xs text-gray-400">
                Her dil için başlık, açıklama, anahtar kelime, H1 ve slug doluluk durumunu buradan takip edin.
              </p>
            </div>
            <span className="rounded-full bg-[#132175]/10 px-3 py-1 text-xs font-black text-[#132175]">{selectedPageLabel}</span>
          </div>
          <LanguageStatusStrip pageSeo={pageSeo} pageKey={selectedPage} activeLocale={locale} />
        </div>

        {/* ── Section 1: Temel Bilgiler ── */}
        <Section title="Temel SEO Bilgileri" hint="Arama motorlarının sayfanı nasıl tanımlayacağını belirler. Her alanı tüm diller için aynı ekranda yönetebilirsiniz.">
          {CORE_SEO_FIELDS.map((field) => (
            <MultilingualSEOField
              key={field}
              field={field}
              meta={SEO_FIELD_META[field]}
              pageSeo={pageSeo}
              pageKey={selectedPage}
              activeLocale={locale}
              onChange={updateSEOForLocale}
            />
          ))}
          <LiveRelationCard
            seoData={seoData}
            pageContent={pageContent}
            locale={locale}
            onSeoChange={updateSEO}
            onContentChange={updatePageContent}
          />
        </Section>

        {/* ── Section 2: Google Önizleme ── */}
        <Section title="Google'da Nasıl Görünür?" hint="Arama sonucundaki görünümün canlı önizlemesi." defaultOpen={false}>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-[10px] text-gray-300 mb-3 uppercase font-bold tracking-wide">Google Arama Sonucu</p>
            <p className="text-sky-600 text-base font-medium truncate">{seoData.seoTitle || "Sayfa Başlığı"}</p>
            <p className="text-green-600 text-xs truncate mt-0.5">{displayPath(selectedPage, locale, seoData.slug)}</p>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2 leading-relaxed">{seoData.metaDescription || "Meta açıklama burada görünecek..."}</p>
          </div>
        </Section>

        {/* ── Section 3: Sosyal Medya ── */}
        <Section title="Sosyal Medya Paylaşımı" hint="WhatsApp, LinkedIn, Twitter gibi platformlarda link paylaşıldığında görünen kart." defaultOpen={false}>
          <FormField label="Başlık" value={seoData.ogTitle || ""} onChange={(v) => updateSEO("ogTitle", v)} hint="Boş bırakırsanız Sayfa Başlığı otomatik kullanılır." />
          <FormField label="Açıklama" type="textarea" rows={2} value={seoData.ogDescription || ""} onChange={(v) => updateSEO("ogDescription", v)} hint="Boş bırakırsanız Kısa Açıklama otomatik kullanılır." />
          <FormField label="Kapak Görseli URL" value={seoData.ogImage || ""} onChange={(v) => updateSEO("ogImage", v)} placeholder="https://willowsoft.co/assets/og/..." hint="1200×630 px önerilir." />
          {(seoData.ogTitle || seoData.seoTitle) && (
            <div className="rounded-xl border border-gray-200 overflow-hidden max-w-sm">
              {seoData.ogImage && (
                <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                  Görsel: {seoData.ogImage.split("/").pop()}
                </div>
              )}
              <div className="p-3 bg-white">
                <p className="text-[10px] text-gray-300 uppercase">willowsoft.co</p>
                <p className="text-sm font-bold text-gray-800 truncate">{seoData.ogTitle || seoData.seoTitle}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{seoData.ogDescription || seoData.metaDescription}</p>
              </div>
            </div>
          )}
        </Section>

        {/* ── Section 4: Yapay Zeka ── */}
        <Section title="Yapay Zeka Optimizasyonu" hint="ChatGPT, Google AI Overview ve benzeri yapay zeka araçlarının bu sayfayı daha iyi anlamasını sağlar." defaultOpen={false}>
          <FormField
            label="Kısa Cevap"
            type="textarea" rows={3}
            value={seoData.aiShortAnswer || ""}
            onChange={(v) => updateSEO("aiShortAnswer", v)}
            hint="Bu sayfa hakkında tek paragrafta net bir özet. Yapay zeka bu metni doğrudan gösterebilir."
          />
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Soru & Cevap</p>
                <p className="text-xs text-gray-400">Bu sayfa hakkında sıkça sorulan sorular ve cevapları — yapay zeka rankingini artırır.</p>
              </div>
              <button
                onClick={() => updateSEO("aiFAQ", [...(seoData.aiFAQ || []), { q: "", a: "" }])}
                className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded-lg text-xs font-bold shrink-0"
              >+ Ekle</button>
            </div>
            {(seoData.aiFAQ || []).length === 0 && (
              <p className="text-xs text-gray-300 italic">Henüz soru eklenmedi.</p>
            )}
            {(seoData.aiFAQ || []).map((faq: any, i: number) => (
              <div key={i} className="space-y-2 p-3 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => updateSEO("aiFAQ", (seoData.aiFAQ || []).filter((_: any, j: number) => j !== i))}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-100 text-red-400 hover:bg-red-200 text-[10px] font-black flex items-center justify-center"
                >✕</button>
                <input
                  type="text" placeholder="Soru"
                  value={faq.q || ""}
                  onChange={(e) => { const l = [...(seoData.aiFAQ || [])]; l[i] = { ...l[i], q: e.target.value }; updateSEO("aiFAQ", l); }}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1aa3c4]"
                />
                <textarea
                  placeholder="Cevap" rows={2}
                  value={faq.a || ""}
                  onChange={(e) => { const l = [...(seoData.aiFAQ || [])]; l[i] = { ...l[i], a: e.target.value }; updateSEO("aiFAQ", l); }}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1aa3c4] resize-none"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section 5: Gelişmiş ── */}
        <Section title="Gelişmiş Ayarlar" hint="Canonical URL, Schema türü, indeksleme kuralları. Emin değilseniz dokunmayın." defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Canonical URL" value={seoData.canonical || ""} onChange={(v) => updateSEO("canonical", v)} placeholder="https://willowsoft.co/..." hint="Aynı içeriğin birden fazla URL'de olduğu durumlar için." />
            <FormField label="Schema Türü" type="select" value={seoData.schemaType || ""} onChange={(v) => updateSEO("schemaType", v)} options={SCHEMA_TYPES} hint="Yapısal veri türü." />
            <FormField label="Arama Motorlarından Gizle (Noindex)" type="select" value={seoData.noindex ? "true" : "false"} onChange={(v) => updateSEO("noindex", v === "true")} options={[{ value: "false", label: "Hayır — Normal indexle" }, { value: "true", label: "Evet — Bu sayfayı gizle" }]} />
            <FormField label="Link Takibini Engelle (Nofollow)" type="select" value={seoData.nofollow ? "true" : "false"} onChange={(v) => updateSEO("nofollow", v === "true")} options={[{ value: "false", label: "Hayır — Normal" }, { value: "true", label: "Evet — Engelle" }]} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Yazar" value={seoData.author || ""} onChange={(v) => updateSEO("author", v)} />
            <FormField label="Son Güncelleme" type="date" value={seoData.lastUpdated || ""} onChange={(v) => updateSEO("lastUpdated", v)} />
          </div>
        </Section>

        {/* ── Checklist ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-bold text-gray-800 mb-3">Kontrol Listesi</p>
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">SEO</p>
              {scoreResult.seoChecks.map((c, i) => (
                <CheckItem key={i} pass={!!c.pass} warn={!!c.warn} label={c.label} />
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Yapay Zeka</p>
              {scoreResult.aiChecks.map((c, i) => (
                <CheckItem key={i} pass={!!c.pass} warn={!!c.warn} label={c.label} />
              ))}
            </div>
          </div>
        </div>

      </div>
      <SitePreview
        pageLabel={selectedPageLabel}
        pageKey={selectedPage}
        locale={locale}
        seoData={seoData}
        pageContent={pageContent}
      />
    </div>
  );
}

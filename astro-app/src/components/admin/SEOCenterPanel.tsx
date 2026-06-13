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
          <LocaleTabs active={locale} onChange={setLocale} filledMap={filledMap} />
          <div className="flex gap-3">
            <ScoreMeter score={scoreResult.seoScore} label="SEO Puanı" level={scoreResult.seoLevel} />
            <ScoreMeter score={scoreResult.aiScore}  label="AI Puanı"  level={scoreResult.aiLevel}  />
          </div>
        </div>

        {/* ── Section 1: Temel Bilgiler ── */}
        <Section title="Temel SEO Bilgileri" hint="Arama motorlarının sayfanı nasıl tanımlayacağını belirler.">
          <FormField
            label="Sayfa Başlığı"
            value={seoData.seoTitle || ""}
            onChange={(v) => updateSEO("seoTitle", v)}
            charTarget={[50, 60]}
            hint="Google'da mavi link olarak görünür. 50-60 karakter ideal."
          />
          <FormField
            label="Kısa Açıklama"
            type="textarea" rows={3}
            value={seoData.metaDescription || ""}
            onChange={(v) => updateSEO("metaDescription", v)}
            charTarget={[150, 160]}
            hint="Arama sonucunda başlığın altında gözükür. 150-160 karakter ideal."
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Odak Anahtar Kelime"
              value={seoData.focusKeyword || ""}
              onChange={(v) => updateSEO("focusKeyword", v)}
              hint="Bu sayfa için hedeflediğin ana kelime."
            />
            <FormField
              label="H1 Ana Başlık"
              value={seoData.h1 || ""}
              onChange={(v) => updateSEO("h1", v)}
              hint="Sayfanın en büyük başlığı. Anahtar kelimeyi içermeli."
            />
          </div>
          <FormField
            label="URL Adresi (Slug)"
            value={seoData.slug || ""}
            onChange={(v) => updateSEO("slug", v)}
            hint="Küçük harf, tire ile ayrılmış, Türkçe karakter olmadan. Örn: urun-izleme-sistemi"
          />
        </Section>

        {/* ── Section 2: Google Önizleme ── */}
        <Section title="Google'da Nasıl Görünür?" hint="Arama sonucundaki görünümün canlı önizlemesi." defaultOpen={false}>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-[10px] text-gray-300 mb-3 uppercase font-bold tracking-wide">Google Arama Sonucu</p>
            <p className="text-sky-600 text-base font-medium truncate">{seoData.seoTitle || "Sayfa Başlığı"}</p>
            <p className="text-green-600 text-xs truncate mt-0.5">willowsoft.co/{seoData.slug || selectedPage}</p>
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
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Canonical URL" value={seoData.canonical || ""} onChange={(v) => updateSEO("canonical", v)} placeholder="https://willowsoft.co/..." hint="Aynı içeriğin birden fazla URL'de olduğu durumlar için." />
            <FormField label="Schema Türü" type="select" value={seoData.schemaType || ""} onChange={(v) => updateSEO("schemaType", v)} options={SCHEMA_TYPES} hint="Yapısal veri türü." />
            <FormField label="Arama Motorlarından Gizle (Noindex)" type="select" value={seoData.noindex ? "true" : "false"} onChange={(v) => updateSEO("noindex", v === "true")} options={[{ value: "false", label: "Hayır — Normal indexle" }, { value: "true", label: "Evet — Bu sayfayı gizle" }]} />
            <FormField label="Link Takibini Engelle (Nofollow)" type="select" value={seoData.nofollow ? "true" : "false"} onChange={(v) => updateSEO("nofollow", v === "true")} options={[{ value: "false", label: "Hayır — Normal" }, { value: "true", label: "Evet — Engelle" }]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
}

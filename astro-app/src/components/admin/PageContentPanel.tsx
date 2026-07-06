"use client";

import { useCallback, useMemo, useState } from "react";
import { locales, type Locale } from "@/lib/cms";
import HomePageMirror, { type MirrorCard } from "./HomePageMirror";
import { useAdmin } from "./AdminContext";

// ── Pages ─────────────────────────────────────────────────────────────────────
const PAGES = [
  { key: "home", label: "Ana Sayfa", icon: "🏠", path: "/tr" },
  { key: "products", label: "Ürünler", icon: "📦", path: "/tr/products" },
  { key: "solutions", label: "Çözümler", icon: "💡", path: "/tr/solutions" },
  { key: "services", label: "Hizmetler", icon: "⚙️", path: "/tr/services" },
  { key: "news", label: "Haberler", icon: "📰", path: "/tr/news" },
  { key: "company", label: "Hakkımızda", icon: "🏢", path: "/tr/company" },
  { key: "contact", label: "İletişim", icon: "📬", path: "/tr/contact" },
  { key: "startProject", label: "Proje Başlat", icon: "🚀", path: "/tr/start-project" },
  { key: "glossary", label: "Sözlük", icon: "📖", path: "/tr/glossary" },
] as const;

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

type FieldType = "short" | "long" | "button";
interface FieldMeta { label: string; section: string; hint: string; type: FieldType; }

const FIELD_META: Record<string, FieldMeta> = {
  heroEyebrow: { label: "Üst Etiket", section: "Hero", hint: "Başlığın üstündeki küçük metin.", type: "short" },
  heroTitle: { label: "Ana Başlık", section: "Hero", hint: "HTML destekler.", type: "long" },
  heroLead: { label: "Alt Açıklama", section: "Hero", hint: "", type: "long" },
  heroCta: { label: "Ana Buton", section: "Hero", hint: "", type: "button" },
  heroCtaSecondary: { label: "İkincil Buton", section: "Hero", hint: "", type: "button" },
  trustEyebrow: { label: "Üst Etiket", section: "Güven", hint: "", type: "short" },
  trustTitle: { label: "Başlık", section: "Güven", hint: "", type: "short" },
  trustLead: { label: "Açıklama", section: "Güven", hint: "", type: "long" },
  serviceRail_0_title: { label: "Başlık", section: "Yetenek Kartları", hint: "", type: "short" },
  serviceRail_0_desc: { label: "Açıklama", section: "Yetenek Kartları", hint: "", type: "long" },
  serviceRail_1_title: { label: "Başlık", section: "Yetenek Kartları", hint: "", type: "short" },
  serviceRail_1_desc: { label: "Açıklama", section: "Yetenek Kartları", hint: "", type: "long" },
  serviceRail_2_title: { label: "Başlık", section: "Yetenek Kartları", hint: "", type: "short" },
  serviceRail_2_desc: { label: "Açıklama", section: "Yetenek Kartları", hint: "", type: "long" },
  serviceRail_3_title: { label: "Başlık", section: "Yetenek Kartları", hint: "", type: "short" },
  serviceRail_3_desc: { label: "Açıklama", section: "Yetenek Kartları", hint: "", type: "long" },
  ecosystemEyebrow: { label: "Üst Etiket", section: "Ekosistem", hint: "", type: "short" },
  ecosystemTitle: { label: "Başlık", section: "Ekosistem", hint: "HTML destekler.", type: "short" },
  ecosystemLead: { label: "Açıklama", section: "Ekosistem", hint: "", type: "long" },
  flowNode_0_title: { label: "Başlık", section: "Ekosistem Kartları", hint: "", type: "short" },
  flowNode_0_desc: { label: "Açıklama", section: "Ekosistem Kartları", hint: "", type: "long" },
  flowNode_1_title: { label: "Başlık", section: "Ekosistem Kartları", hint: "", type: "short" },
  flowNode_1_desc: { label: "Açıklama", section: "Ekosistem Kartları", hint: "", type: "long" },
  flowNode_2_title: { label: "Başlık", section: "Ekosistem Kartları", hint: "", type: "short" },
  flowNode_2_desc: { label: "Açıklama", section: "Ekosistem Kartları", hint: "", type: "long" },
  flowNode_3_title: { label: "Başlık", section: "Ekosistem Kartları", hint: "", type: "short" },
  flowNode_3_desc: { label: "Açıklama", section: "Ekosistem Kartları", hint: "", type: "long" },
  flowNode_4_title: { label: "Başlık", section: "Ekosistem Kartları", hint: "", type: "short" },
  flowNode_4_desc: { label: "Açıklama", section: "Ekosistem Kartları", hint: "", type: "long" },
  productsEyebrow: { label: "Üst Etiket", section: "Ürünler", hint: "", type: "short" },
  productsTitle: { label: "Başlık", section: "Ürünler", hint: "", type: "short" },
  productsLead: { label: "Açıklama", section: "Ürünler", hint: "", type: "long" },
  industriesEyebrow: { label: "Üst Etiket", section: "Sektörler", hint: "", type: "short" },
  industriesTitle: { label: "Başlık", section: "Sektörler", hint: "", type: "short" },
  newsEyebrow: { label: "Üst Etiket", section: "Haberler", hint: "", type: "short" },
  newsTitle: { label: "Başlık", section: "Haberler", hint: "", type: "short" },
  ctaEyebrow: { label: "Üst Etiket", section: "CTA", hint: "", type: "short" },
  ctaTitle: { label: "Başlık", section: "CTA", hint: "", type: "short" },
  ctaLead: { label: "Açıklama", section: "CTA", hint: "", type: "long" },
  ctaCta: { label: "Buton", section: "CTA", hint: "", type: "button" },
  howEyebrow: { label: "Üst Etiket", section: "Nasıl Çalışır", hint: "", type: "short" },
  howTitle: { label: "Başlık", section: "Nasıl Çalışır", hint: "", type: "short" },
  howLead: { label: "Açıklama", section: "Nasıl Çalışır", hint: "", type: "long" },
  whyEyebrow: { label: "Üst Etiket", section: "Neden Biz", hint: "", type: "short" },
  whyTitle: { label: "Başlık", section: "Neden Biz", hint: "", type: "short" },
  useCasesTitle: { label: "Kullanım Alanları", section: "Kullanım Alanları", hint: "", type: "short" },
  stackTitle: { label: "Teknoloji Yığını", section: "Teknoloji", hint: "", type: "short" },
  pathsEyebrow: { label: "Üst Etiket", section: "Yollar", hint: "", type: "short" },
  pathsTitle: { label: "Başlık", section: "Yollar", hint: "", type: "short" },
  pathsLead: { label: "Açıklama", section: "Yollar", hint: "", type: "long" },
  realityEyebrow: { label: "Üst Etiket", section: "Gerçek", hint: "", type: "short" },
  realityTitle: { label: "Başlık", section: "Gerçek", hint: "", type: "short" },
  afterSubmission: { label: "Form Sonrası", section: "Form", hint: "", type: "long" },
  connectivityEyebrow: { label: "Üst Etiket", section: "Bağlantı", hint: "", type: "short" },
  connectivityTitle: { label: "Başlık", section: "Bağlantı", hint: "", type: "short" },
  devicesEyebrow: { label: "Üst Etiket", section: "Cihazlar", hint: "", type: "short" },
  devicesTitle: { label: "Başlık", section: "Cihazlar", hint: "", type: "short" },
  softwareEyebrow: { label: "Üst Etiket", section: "Yazılım", hint: "", type: "short" },
  softwareTitle: { label: "Başlık", section: "Yazılım", hint: "", type: "short" },
  catalogEyebrow: { label: "Üst Etiket", section: "Katalog", hint: "", type: "short" },
  catalogTitle: { label: "Başlık", section: "Katalog", hint: "", type: "short" },
};

function getMeta(key: string): FieldMeta {
  return FIELD_META[key] ?? { label: key, section: "Diğer", hint: "", type: "short" };
}

// ── Home page layout (visual map) ─────────────────────────────────────────────
type CardPair = MirrorCard;

type LayoutBlock = {
  id: string;
  label: string;
  tone: "hero" | "light" | "soft" | "dark" | "cta";
  fields?: string[];
  cards?: CardPair[];
};

const HOME_LAYOUT: LayoutBlock[] = [
  { id: "hero", label: "Hero", tone: "hero", fields: ["heroEyebrow", "heroTitle", "heroLead", "heroCta", "heroCtaSecondary"] },
  { id: "serviceRail", label: "Yetenek Kartları", tone: "soft", cards: [0, 1, 2, 3].map((i) => ({ index: i, titleKey: `serviceRail_${i}_title`, descKey: `serviceRail_${i}_desc` })) },
  { id: "trust", label: "Güven", tone: "light", fields: ["trustEyebrow", "trustTitle", "trustLead"] },
  { id: "ecosystem", label: "Ekosistem", tone: "dark", fields: ["ecosystemEyebrow", "ecosystemTitle", "ecosystemLead"], cards: [0, 1, 2, 3, 4].map((i) => ({ index: i, titleKey: `flowNode_${i}_title`, descKey: `flowNode_${i}_desc` })) },
  { id: "products", label: "Ürünler", tone: "light", fields: ["productsEyebrow", "productsTitle", "productsLead"] },
  { id: "industries", label: "Sektörler", tone: "soft", fields: ["industriesEyebrow", "industriesTitle"] },
  { id: "news", label: "Haberler", tone: "light", fields: ["newsEyebrow", "newsTitle"] },
  { id: "cta", label: "CTA", tone: "cta", fields: ["ctaEyebrow", "ctaTitle", "ctaLead", "ctaCta"] },
];

const HOME_EXTRA_KEYS = [
  ...[0, 1, 2, 3].flatMap((i) => [`serviceRail_${i}_title`, `serviceRail_${i}_desc`]),
  ...[0, 1, 2, 3, 4].flatMap((i) => [`flowNode_${i}_title`, `flowNode_${i}_desc`]),
];

const SOURCE_LANG: Locale = "en";
const TARGET_LOCALES = locales.filter((l) => l !== SOURCE_LANG);

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function cardLabel(data: Record<string, any>, card: CardPair, locale: Locale) {
  const title = (data[card.titleKey]?.[locale] || data[card.titleKey]?.en || "").trim();
  if (title) return stripHtml(title);
  return `Kart ${String(card.index + 1).padStart(2, "0")}`;
}

function cardStatus(data: Record<string, any>, card: CardPair): "all" | "partial" | "empty" {
  const keys = [card.titleKey, card.descKey];
  const filled = TARGET_LOCALES.filter((l) => keys.every((k) => (data[k]?.[l] || "").trim())).length;
  if (filled === TARGET_LOCALES.length) return "all";
  if (filled > 0 || keys.some((k) => (data[k]?.en || "").trim())) return "partial";
  return "empty";
}

function fieldStatus(data: Record<string, any>, key: string): "all" | "partial" | "empty" {
  const filled = TARGET_LOCALES.filter((l) => (data[key]?.[l] || "").trim()).length;
  if (filled === TARGET_LOCALES.length) return "all";
  if (filled > 0) return "partial";
  return "empty";
}

function StatusDot({ status }: { status: "all" | "partial" | "empty" }) {
  if (status === "all") return <span className="ws-pc-status ws-pc-status--ok">✓</span>;
  if (status === "partial") return <span className="ws-pc-status ws-pc-status--warn">◐</span>;
  return <span className="ws-pc-status ws-pc-status--empty">○</span>;
}

// ── Content card picker ───────────────────────────────────────────────────────
function ContentCardGrid({
  cards, data, locale, activeCard, onSelect,
}: {
  cards: CardPair[];
  data: Record<string, any>;
  locale: Locale;
  activeCard: CardPair | null;
  onSelect: (card: CardPair) => void;
}) {
  return (
    <div className="ws-pc-card-grid">
      {cards.map((card) => {
        const title = cardLabel(data, card, locale);
        const desc = stripHtml((data[card.descKey]?.[locale] || data[card.descKey]?.en || "").trim());
        const active = activeCard?.titleKey === card.titleKey;
        const status = cardStatus(data, card);
        return (
          <button
            key={card.titleKey}
            type="button"
            onClick={() => onSelect(card)}
            className={`ws-pc-content-card ${active ? "is-active" : ""}`}
          >
            <span className="ws-pc-content-card-num">{String(card.index + 1).padStart(2, "0")}</span>
            <span className="ws-pc-content-card-title">{title}</span>
            <span className="ws-pc-content-card-desc">{desc || "Açıklama eklenmemiş"}</span>
            <StatusDot status={status} />
          </button>
        );
      })}
    </div>
  );
}

// ── Locale editor (single field) ──────────────────────────────────────────────
function LocaleFieldEditor({
  fieldKey, pageData, updateField, meta,
}: {
  fieldKey: string;
  pageData: Record<string, any>;
  updateField: (key: string, loc: Locale, value: string) => void;
  meta: FieldMeta;
}) {
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState<Set<string>>(new Set());
  const [translateError, setTranslateError] = useState<string | null>(null);

  const getVal = (key: string, loc: Locale) => (pageData[key]?.[loc] || "").trim();
  const sourceText = getVal(fieldKey, SOURCE_LANG);
  const emptyTargetCount = TARGET_LOCALES.filter((l) => !getVal(fieldKey, l) && !suggestions[l]).length;

  const translateAll = async () => {
    if (!sourceText) return;
    const emptyLangs = TARGET_LOCALES.filter((l) => !getVal(fieldKey, l) && !suggestions[l]);
    if (!emptyLangs.length) return;
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
    } catch (e: any) {
      setTranslateError(e.message);
    } finally {
      setTranslating(new Set());
    }
  };

  const translateOne = async (lang: string) => {
    if (!sourceText) return;
    setTranslating((prev) => new Set([...prev, lang]));
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

  return (
    <div className="ws-pc-editor">
      <div className="ws-pc-editor-head">
        <div>
          <p className="ws-pc-editor-title">{meta.label}</p>
          {meta.hint && <p className="ws-pc-editor-hint">{meta.hint}</p>}
        </div>
        <div className="flex items-center gap-2">
          {translateError && <span className="text-[10px] text-red-500">{translateError}</span>}
          {emptyTargetCount > 0 && sourceText && (
            <button type="button" onClick={translateAll} disabled={translating.size > 0} className="ws-pc-translate-btn">
              {translating.size > 0 ? "Çevriliyor…" : `✨ Tümünü Çevir (${emptyTargetCount})`}
            </button>
          )}
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {locales.map((loc) => {
          const info = LOCALE_INFO[loc] ?? { flag: "🌐", name: loc };
          const isSource = loc === SOURCE_LANG;
          const rawValue = pageData[fieldKey]?.[loc] || "";
          const suggestion = !isSource ? suggestions[loc] : undefined;
          const isTranslating = translating.has(loc);
          const isFilled = !!rawValue.trim();
          const inputClass = isSource
            ? "border-[#c7d2fe] bg-white text-[#132175] font-semibold"
            : isFilled ? "border-green-200 bg-gray-50" : "border-amber-200 bg-gray-50";

          return (
            <div key={loc} className={`px-5 py-3 ${isSource ? "bg-[#f0f4ff]" : ""}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span>{info.flag}</span>
                  <span className="text-[11px] font-bold">{info.name}</span>
                  {isSource && <span className="ws-pc-source-badge">KAYNAK</span>}
                </div>
                {!isSource && !rawValue.trim() && !suggestion && sourceText && (
                  <button type="button" onClick={() => translateOne(loc)} disabled={isTranslating} className="ws-pc-translate-one">
                    {isTranslating ? "…" : "✨ Çevir"}
                  </button>
                )}
              </div>
              {suggestion && (
                <div className="mb-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-blue-800 italic flex-1">«{suggestion}»</p>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => { updateField(fieldKey, loc as Locale, suggestion); setSuggestions((p) => { const n = { ...p }; delete n[loc]; return n; }); }} className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded">✓</button>
                    <button type="button" onClick={() => setSuggestions((p) => { const n = { ...p }; delete n[loc]; return n; })} className="text-[10px] font-bold px-2 py-0.5 bg-white border border-blue-300 text-blue-600 rounded">✗</button>
                  </div>
                </div>
              )}
              {meta.type === "long" ? (
                <textarea
                  value={rawValue}
                  onChange={(e) => updateField(fieldKey, loc, e.target.value)}
                  rows={3}
                  dir={loc === "ar" ? "rtl" : "ltr"}
                  className={`w-full p-2.5 border rounded-lg text-sm outline-none resize-none focus:border-[#1aa3c4] ${inputClass}`}
                />
              ) : (
                <input
                  type="text"
                  value={rawValue}
                  onChange={(e) => updateField(fieldKey, loc, e.target.value)}
                  dir={loc === "ar" ? "rtl" : "ltr"}
                  className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:border-[#1aa3c4] ${inputClass}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Card editor (title + desc per locale) ─────────────────────────────────────
function CardLocaleEditor({
  card, pageData, updateField, previewLocale,
}: {
  card: CardPair;
  pageData: Record<string, any>;
  updateField: (key: string, loc: Locale, value: string) => void;
  previewLocale: Locale;
}) {
  const title = cardLabel(pageData, card, previewLocale);

  return (
    <div className="ws-pc-editor">
      <div className="ws-pc-editor-head">
        <div>
          <p className="ws-pc-editor-kicker">İçerik Kartı</p>
          <p className="ws-pc-editor-title">{title}</p>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {locales.map((loc) => {
          const info = LOCALE_INFO[loc] ?? { flag: "🌐", name: loc };
          const isSource = loc === SOURCE_LANG;
          const titleVal = pageData[card.titleKey]?.[loc] || "";
          const descVal = pageData[card.descKey]?.[loc] || "";
          const inputClass = isSource
            ? "border-[#c7d2fe] bg-white text-[#132175] font-semibold"
            : "border-gray-200 bg-gray-50";

          return (
            <div key={loc} className={`px-5 py-4 ${isSource ? "bg-[#f0f4ff]" : ""}`}>
              <div className="flex items-center gap-1.5 mb-3">
                <span>{info.flag}</span>
                <span className="text-[11px] font-bold">{info.name}</span>
                {isSource && <span className="ws-pc-source-badge">KAYNAK</span>}
              </div>
              <label className="ws-pc-field-label">Başlık</label>
              <input
                type="text"
                value={titleVal}
                onChange={(e) => updateField(card.titleKey, loc, e.target.value)}
                dir={loc === "ar" ? "rtl" : "ltr"}
                className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:border-[#1aa3c4] mb-3 ${inputClass}`}
              />
              <label className="ws-pc-field-label">Açıklama</label>
              <textarea
                value={descVal}
                onChange={(e) => updateField(card.descKey, loc, e.target.value)}
                rows={2}
                dir={loc === "ar" ? "rtl" : "ltr"}
                className={`w-full p-2.5 border rounded-lg text-sm outline-none resize-none focus:border-[#1aa3c4] ${inputClass}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Live mini preview ─────────────────────────────────────────────────────────
// ── Main ──────────────────────────────────────────────────────────────────────
export default function PageContentPanel() {
  const { content, setContent } = useAdmin();
  const [selectedPage, setSelectedPage] = useState("home");
  const [activeBlockId, setActiveBlockId] = useState<string | null>("hero");
  const [activeField, setActiveField] = useState<string | null>("heroEyebrow");
  const [activeCard, setActiveCard] = useState<CardPair | null>(null);
  const [previewLocale, setPreviewLocale] = useState<Locale>("tr");

  const pageContent = content?.pageContent || {};
  const pageData = pageContent[selectedPage] || {};

  const isHome = selectedPage === "home";

  const allKeys = useMemo(() => {
    if (isHome) return [...new Set([...Object.keys(pageData), ...HOME_EXTRA_KEYS])].sort();
    return Object.keys(pageData).sort();
  }, [isHome, pageData]);

  const genericSections = useMemo(() => {
    const order: string[] = [];
    const map: Record<string, string[]> = {};
    for (const k of allKeys) {
      const s = getMeta(k).section;
      if (!map[s]) { map[s] = []; order.push(s); }
      map[s].push(k);
    }
    return { order, map };
  }, [allKeys]);

  const activeBlock = isHome ? HOME_LAYOUT.find((b) => b.id === activeBlockId) ?? null : null;

  const updateField = useCallback((key: string, loc: Locale, value: string) => {
    setContent((c: any) => {
      const pc = { ...c.pageContent };
      const page = { ...pc[selectedPage] };
      page[key] = { ...page[key], [loc]: value };
      pc[selectedPage] = page;
      return { ...c, pageContent: pc };
    });
  }, [selectedPage, setContent]);

  const selectPage = (key: string) => {
    setSelectedPage(key);
    if (key === "home") {
      setActiveBlockId("hero");
      setActiveField("heroEyebrow");
      setActiveCard(null);
    } else {
      setActiveBlockId(null);
      const firstKey = Object.keys(pageContent[key] || {})[0] ?? null;
      setActiveField(firstKey);
      setActiveCard(null);
    }
  };

  const selectBlock = (id: string) => {
    const block = HOME_LAYOUT.find((b) => b.id === id);
    if (!block) return;
    setActiveBlockId(id);
    if (block.cards?.length) {
      setActiveCard(block.cards[0]);
      setActiveField(null);
    } else if (block.fields?.length) {
      setActiveField(block.fields[0]);
      setActiveCard(null);
    }
  };

  const selectCard = (blockId: string, card: CardPair) => {
    setActiveBlockId(blockId);
    setActiveCard(card);
    setActiveField(null);
  };

  const selectField = (key: string) => {
    setActiveField(key);
    setActiveCard(null);
  };

  const pageInfo = PAGES.find((p) => p.key === selectedPage);

  return (
    <div className="ws-pc-layout">
      {/* Left: pages + wireframe */}
      <aside className="ws-pc-sidebar">
        <p className="ws-pc-sidebar-label">Sayfalar</p>
        <div className="ws-pc-page-grid">
          {PAGES.map((pg) => {
            const pgData = pageContent[pg.key] || {};
            const pgKeys = pg.key === "home"
              ? [...new Set([...Object.keys(pgData), ...HOME_EXTRA_KEYS])]
              : Object.keys(pgData);
            const filled = pgKeys.filter((k) => (pgData[k]?.tr || "").trim()).length;
            const pct = pgKeys.length ? Math.round((filled / pgKeys.length) * 100) : 0;
            const active = selectedPage === pg.key;
            return (
              <button
                key={pg.key}
                type="button"
                onClick={() => selectPage(pg.key)}
                className={`ws-pc-page-thumb ${active ? "is-active" : ""}`}
              >
                <span className="ws-pc-page-thumb-icon">{pg.icon}</span>
                <span className="ws-pc-page-thumb-label">{pg.label}</span>
                <span className="ws-pc-page-thumb-bar"><span style={{ width: `${pct}%` }} /></span>
              </button>
            );
          })}
        </div>

        {isHome && (
          <div className="ws-pc-map-panel">
            <div className="ws-pc-map-head">
              <p className="ws-pc-wireframe-label">Sayfa haritası</p>
              <select
                value={previewLocale}
                onChange={(e) => setPreviewLocale(e.target.value as Locale)}
                className="ws-pc-locale-select"
              >
                {locales.map((l) => (
                  <option key={l} value={l}>{LOCALE_INFO[l]?.flag} {l.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <HomePageMirror
              data={pageData}
              locale={previewLocale}
              activeBlockId={activeBlockId}
              activeCard={activeCard}
              onSelectBlock={selectBlock}
              onSelectCard={selectCard}
            />
            <p className="ws-pc-preview-hint">Bölüme veya karta tıklayarak düzenleyin.</p>
          </div>
        )}

        {!isHome && genericSections.order.length > 0 && (
          <div className="ws-pc-generic-sections">
            <p className="ws-pc-wireframe-label">Bölümler</p>
            {genericSections.order.map((section) => (
              <div key={section} className="ws-pc-generic-section">
                <p className="ws-pc-generic-section-title">{section}</p>
                {genericSections.map[section].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => selectField(k)}
                    className={`ws-pc-field-chip ${activeField === k ? "is-active" : ""}`}
                  >
                    <span>{getMeta(k).label}</span>
                    <StatusDot status={fieldStatus(pageData, k)} />
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Center: editor */}
      <main className="ws-pc-main">
        {isHome && activeBlock && (
          <div className="ws-pc-block-header">
            <div>
              <p className="ws-pc-block-kicker">{pageInfo?.label}</p>
              <h3 className="ws-pc-block-title">{activeBlock.label}</h3>
            </div>
            {pageInfo?.path && (
              <a href={pageInfo.path} target="_blank" rel="noreferrer" className="ws-pc-live-link">
                Canlı sayfayı aç ↗
              </a>
            )}
          </div>
        )}

        {isHome && activeBlock?.fields && activeBlock.fields.length > 0 && (
          <div className="ws-pc-field-chips">
            {activeBlock.fields.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => selectField(k)}
                className={`ws-pc-field-chip ${activeField === k && !activeCard ? "is-active" : ""}`}
              >
                <span>{getMeta(k).label}</span>
                <StatusDot status={fieldStatus(pageData, k)} />
              </button>
            ))}
          </div>
        )}

        {isHome && activeBlock?.cards && activeBlock.cards.length > 0 && (
          <ContentCardGrid
            cards={activeBlock.cards}
            data={pageData}
            locale={previewLocale}
            activeCard={activeCard}
            onSelect={(card) => { setActiveCard(card); setActiveField(null); }}
          />
        )}

        <div className="ws-pc-editor-wrap">
          {activeCard ? (
            <CardLocaleEditor card={activeCard} pageData={pageData} updateField={updateField} previewLocale={previewLocale} />
          ) : activeField ? (
            <LocaleFieldEditor fieldKey={activeField} pageData={pageData} updateField={updateField} meta={getMeta(activeField)} />
          ) : (
            <div className="ws-pc-empty">Düzenlemek için bir bölüm veya kart seçin.</div>
          )}
        </div>
      </main>

      {/* Right: quick section nav on home */}
      <aside className="ws-pc-preview-panel">
        {isHome ? (
          <>
            <p className="ws-pc-sidebar-label">Bölümler</p>
            <div className="ws-pc-section-nav">
              {HOME_LAYOUT.map((block) => (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => selectBlock(block.id)}
                  className={`ws-pc-section-nav-btn ${activeBlockId === block.id ? "is-active" : ""}`}
                >
                  {block.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="ws-pc-preview-head">
              <p className="ws-pc-sidebar-label">Ön izleme</p>
              <select
                value={previewLocale}
                onChange={(e) => setPreviewLocale(e.target.value as Locale)}
                className="ws-pc-locale-select"
              >
                {locales.map((l) => (
                  <option key={l} value={l}>{LOCALE_INFO[l]?.flag} {l.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="ws-pc-preview-scroll">
              <div className="ws-pc-generic-preview">
                {genericSections.order.map((section) => (
                  <div key={section} className="ws-pc-generic-preview-section">
                    <p className="ws-pc-preview-eyebrow">{section}</p>
                    {genericSections.map[section].map((k) => {
                      const v = stripHtml((pageData[k]?.[previewLocale] || pageData[k]?.en || "").trim());
                      if (!v) return null;
                      return <p key={k} className={`ws-pc-preview-line ${activeField === k ? "is-highlight" : ""}`}>{v}</p>;
                    })}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

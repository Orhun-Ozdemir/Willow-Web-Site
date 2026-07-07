"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { locales, type Locale } from "@/lib/cms";
import HomePageMirror from "./HomePageMirror";
import PageMirror from "./PageMirror";
import type { MirrorCard } from "./mirrorShared";
import { HOME_EXTRA_KEYS, HOME_LAYOUT, firstEditableBlock, layoutForPage } from "./pageLayouts";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";

const SCALAR_PAGE_FIELDS = new Set(["heroImage", "metric1Value", "metric2Value", "metric3Value"]);

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

type FieldType = "short" | "long" | "button" | "image";
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
  industriesTitle: { label: "Başlık", section: "Sektörler", hint: "HTML destekler.", type: "short" },
  industryLane_0_title: { label: "Başlık", section: "Sektör Kartları (4)", hint: "Akıllı Altyapı", type: "short" },
  industryLane_0_desc: { label: "Açıklama", section: "Sektör Kartları (4)", hint: "", type: "long" },
  industryLane_1_title: { label: "Başlık", section: "Sektör Kartları (4)", hint: "Endüstriyel İzleme", type: "short" },
  industryLane_1_desc: { label: "Açıklama", section: "Sektör Kartları (4)", hint: "", type: "long" },
  industryLane_2_title: { label: "Başlık", section: "Sektör Kartları (4)", hint: "MedTech ve Sağlık", type: "short" },
  industryLane_2_desc: { label: "Açıklama", section: "Sektör Kartları (4)", hint: "", type: "long" },
  industryLane_3_title: { label: "Başlık", section: "Sektör Kartları (4)", hint: "Lojistik ve Telekom", type: "short" },
  industryLane_3_desc: { label: "Açıklama", section: "Sektör Kartları (4)", hint: "", type: "long" },
  newsEyebrow: { label: "Üst Etiket", section: "Haberler", hint: "", type: "short" },
  newsTitle: { label: "Başlık", section: "Haberler", hint: "", type: "short" },
  ctaEyebrow: { label: "Üst Etiket", section: "CTA", hint: "", type: "short" },
  ctaTitle: { label: "Başlık", section: "CTA", hint: "", type: "short" },
  ctaLead: { label: "Açıklama", section: "CTA", hint: "", type: "long" },
  ctaChoice_0: { label: "Kart 1", section: "CTA", hint: "Donanım + gömülü yazılım", type: "short" },
  ctaChoice_1: { label: "Kart 2", section: "CTA", hint: "Bulut + veri tabanı", type: "short" },
  ctaChoice_2: { label: "Kart 3", section: "CTA", hint: "Web, mobil, simülasyon", type: "short" },
  ctaCta: { label: "Buton", section: "CTA", hint: "", type: "button" },
  faqEyebrow: { label: "Üst Etiket", section: "SSS", hint: "SSS veya Merak Edilenler", type: "short" },
  faqTitle: { label: "Başlık", section: "SSS", hint: "", type: "short" },
  faqLead: { label: "Açıklama", section: "SSS", hint: "", type: "long" },
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
  featuredEyebrow: { label: "Üst Etiket", section: "Öne Çıkan", hint: "", type: "short" },
  featuredTitle: { label: "Başlık", section: "Öne Çıkan", hint: "", type: "short" },
  useCasesEyebrow: { label: "Üst Etiket", section: "Kullanım Alanları", hint: "", type: "short" },
  useCasesLead: { label: "Açıklama", section: "Kullanım Alanları", hint: "", type: "long" },
  showcaseEyebrow: { label: "Vitrin Etiket", section: "Kullanım Alanları", hint: "", type: "short" },
  showcaseTitle: { label: "Vitrin Başlık", section: "Kullanım Alanları", hint: "", type: "short" },
  showcaseLead: { label: "Vitrin Açıklama", section: "Kullanım Alanları", hint: "", type: "long" },
  selectorEyebrow: { label: "Üst Etiket", section: "Yol Seçici", hint: "", type: "short" },
  selectorTitle: { label: "Başlık", section: "Yol Seçici", hint: "", type: "short" },
  selectorLead: { label: "Açıklama", section: "Yol Seçici", hint: "", type: "long" },
  finalCtaEyebrow: { label: "Üst Etiket", section: "CTA", hint: "", type: "short" },
  finalCtaTitle: { label: "Başlık", section: "CTA", hint: "", type: "short" },
  finalCtaLead: { label: "Açıklama", section: "CTA", hint: "", type: "long" },
  finalCtaButton: { label: "Buton", section: "CTA", hint: "", type: "button" },
  serviceSystemEyebrow: { label: "Üst Etiket", section: "Hizmet Katmanları", hint: "", type: "short" },
  serviceSystemTitle: { label: "Başlık", section: "Hizmet Katmanları", hint: "", type: "short" },
  serviceSystemLead: { label: "Açıklama", section: "Hizmet Katmanları", hint: "", type: "long" },
  deliverablesEyebrow: { label: "Üst Etiket", section: "Teslimatlar", hint: "", type: "short" },
  deliverablesTitle: { label: "Başlık", section: "Teslimatlar", hint: "", type: "short" },
  deliverablesLead: { label: "Açıklama", section: "Teslimatlar", hint: "", type: "long" },
  handoffTitle: { label: "Devir Başlık", section: "Teslimatlar", hint: "", type: "short" },
  handoffDesc: { label: "Devir Açıklama", section: "Teslimatlar", hint: "", type: "long" },
  processEyebrow: { label: "Üst Etiket", section: "Süreç", hint: "", type: "short" },
  processTitle: { label: "Başlık", section: "Süreç", hint: "", type: "short" },
  ctaPrimaryButton: { label: "Ana Buton", section: "CTA", hint: "", type: "button" },
  ctaSecondaryButton: { label: "İkincil Buton", section: "CTA", hint: "", type: "button" },
  latestEyebrow: { label: "Üst Etiket", section: "Arşiv", hint: "", type: "short" },
  latestTitle: { label: "Başlık", section: "Arşiv", hint: "", type: "short" },
  pipelineEyebrow: { label: "Üst Etiket", section: "CTA", hint: "", type: "short" },
  pipelineTitle: { label: "Başlık", section: "CTA", hint: "", type: "short" },
  pipelineLead: { label: "Açıklama", section: "CTA", hint: "", type: "long" },
  introEyebrow: { label: "Üst Etiket", section: "Giriş", hint: "", type: "short" },
  introTitle: { label: "Başlık", section: "Giriş", hint: "", type: "short" },
  introLead: { label: "Açıklama", section: "Giriş", hint: "", type: "long" },
  teamEyebrow: { label: "Üst Etiket", section: "Ekibimiz", hint: "", type: "short" },
  teamTitle: { label: "Başlık", section: "Ekibimiz", hint: "HTML destekler.", type: "long" },
  teamLead: { label: "Açıklama", section: "Ekibimiz", hint: "", type: "long" },
  principlesEyebrow: { label: "Üst Etiket", section: "İlkeler", hint: "", type: "short" },
  principlesTitle: { label: "Başlık", section: "İlkeler", hint: "", type: "short" },
  historyEyebrow: { label: "Üst Etiket", section: "Tarihçe", hint: "", type: "short" },
  historyTitle: { label: "Başlık", section: "Tarihçe", hint: "", type: "short" },
  workWithEyebrow: { label: "Üst Etiket", section: "İş Ortakları", hint: "", type: "short" },
  workWithTitle: { label: "Başlık", section: "İş Ortakları", hint: "", type: "short" },
  directTitle: { label: "Doğrudan Başlık", section: "İletişim", hint: "", type: "short" },
  directLead: { label: "Doğrudan Açıklama", section: "İletişim", hint: "", type: "long" },
  formEyebrow: { label: "Form Etiket", section: "Form", hint: "", type: "short" },
  formTitle: { label: "Form Başlık", section: "Form", hint: "", type: "short" },
  formLead: { label: "Form Açıklama", section: "Form", hint: "", type: "long" },
  heroImage: { label: "Hero Görseli", section: "Hero", hint: "Sayfa üst banner görseli (yol veya URL)", type: "image" },
  metric1Value: { label: "Metrik 1 Değeri", section: "Hero", hint: "Örn. 15+", type: "short" },
  metric2Value: { label: "Metrik 2 Değeri", section: "Hero", hint: "Örn. 2020", type: "short" },
  metric3Value: { label: "Metrik 3 Değeri", section: "Hero", hint: "Örn. 24/7", type: "short" },
  metric1Label: { label: "Metrik 1 Etiketi", section: "Hero", hint: "", type: "short" },
  metric2Label: { label: "Metrik 2 Etiketi", section: "Hero", hint: "", type: "short" },
  metric3Label: { label: "Metrik 3 Etiketi", section: "Hero", hint: "", type: "short" },
};

function getMeta(key: string): FieldMeta {
  return FIELD_META[key] ?? { label: key, section: "Diğer", hint: "", type: "short" };
}

type CardPair = MirrorCard;

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

// ── Scalar field (non-localized page values) ──────────────────────────────────
function ScalarPageFieldEditor({
  fieldKey,
  pageData,
  selectedPage,
  setContent,
  meta,
}: {
  fieldKey: string;
  pageData: Record<string, any>;
  selectedPage: string;
  setContent: (fn: (c: any) => any) => void;
  meta: FieldMeta;
}) {
  const raw = pageData[fieldKey];
  const value = typeof raw === "string" ? raw : raw ? String(raw) : "";

  const update = (val: string) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      pc[selectedPage] = { ...(pc[selectedPage] || {}), [fieldKey]: val };
      return { ...c, pageContent: pc };
    });
  };

  return (
    <div className="ws-pc-editor">
      <div className="ws-pc-editor-head">
        <div>
          <p className="ws-pc-editor-title">{meta.label}</p>
          {meta.hint && <p className="ws-pc-editor-hint">{meta.hint}</p>}
        </div>
      </div>
      <FormField
        label={meta.label}
        type={meta.type === "image" ? "image" : "text"}
        value={value}
        onChange={update}
        hint={meta.hint}
      />
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
      for (const [lang, text] of Object.entries(data.translations || {})) {
        if (typeof text === "string" && text.trim()) {
          updateField(fieldKey, lang as Locale, text);
        }
      }
      setSuggestions({});
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
      for (const [lang, text] of Object.entries(data.translations || {})) {
        if (typeof text === "string" && text.trim()) {
          updateField(fieldKey, lang as Locale, text);
        }
      }
      setSuggestions({});
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
  const { content, setContent, savePageContent, isPageContentDirty, saving, saveMessage } = useAdmin();
  const [selectedPage, setSelectedPage] = useState("home");
  const [activeBlockId, setActiveBlockId] = useState<string | null>("hero");
  const [activeField, setActiveField] = useState<string | null>("heroEyebrow");
  const [activeCard, setActiveCard] = useState<CardPair | null>(null);
  const [previewLocale, setPreviewLocale] = useState<Locale>("tr");

  const pageContent = content?.pageContent || {};
  const pageData = pageContent[selectedPage] || {};
  const pageDirty = isPageContentDirty(selectedPage);

  useEffect(() => {
    if (!pageDirty || saving) return;
    const timer = window.setTimeout(() => {
      void savePageContent(selectedPage);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [pageDirty, saving, selectedPage, pageData, savePageContent]);

  const pageLayout = useMemo(() => layoutForPage(selectedPage), [selectedPage]);
  const hasLayout = pageLayout.length > 0;
  const isHome = selectedPage === "home";

  const allKeys = useMemo(() => {
    if (isHome) return [...new Set([...Object.keys(pageData), ...HOME_EXTRA_KEYS])].sort();
    return Object.keys(pageData).sort();
  }, [isHome, pageData]);

  const activeBlock = pageLayout.find((b) => b.id === activeBlockId) ?? null;

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
    const { blockId, field } = firstEditableBlock(key);
    const layout = layoutForPage(key);
    const block = layout.find((b) => b.id === blockId);
    setActiveBlockId(blockId);
    if (block?.cards?.length) {
      setActiveCard(block.cards[0]);
      setActiveField(null);
    } else {
      setActiveCard(null);
      setActiveField(field);
    }
  };

  const selectBlock = (id: string) => {
    const block = pageLayout.find((b) => b.id === id);
    if (!block || block.static) return;
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

        {hasLayout && (
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
            {isHome ? (
              <HomePageMirror
                data={pageData}
                locale={previewLocale}
                activeBlockId={activeBlockId}
                activeCard={activeCard}
                onSelectBlock={selectBlock}
                onSelectCard={selectCard}
              />
            ) : (
              <PageMirror
                pageKey={selectedPage}
                layout={pageLayout}
                data={pageData}
                locale={previewLocale}
                activeBlockId={activeBlockId}
                activeCard={activeCard}
                onSelectBlock={selectBlock}
                onSelectCard={selectCard}
                extraData={
                  selectedPage === "solutions"
                    ? { solutions: content?.solutions || [] }
                    : selectedPage === "company"
                      ? { companyFacts: content?.companyFacts || {} }
                      : {}
                }
              />
            )}
            <p className="ws-pc-preview-hint">Bölüme veya karta tıklayarak düzenleyin.</p>
          </div>
        )}
      </aside>

      {/* Center: editor */}
      <main className="ws-pc-main">
        {activeBlock && (
          <div className="ws-pc-block-header">
            <div>
              <p className="ws-pc-block-kicker">{pageInfo?.label}</p>
              <h3 className="ws-pc-block-title">{activeBlock.label}</h3>
              {pageDirty && (
                <p className="mt-1 text-xs font-semibold text-amber-700">
                  {saving ? "Kaydediliyor…" : "Kaydedilmemiş değişiklik — 2 sn içinde otomatik kaydedilir"}
                </p>
              )}
              {!pageDirty && saveMessage && (
                <p className="mt-1 text-xs font-semibold text-green-700">{saveMessage}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pageDirty && (
                <button
                  type="button"
                  onClick={() => void savePageContent(selectedPage)}
                  disabled={saving}
                  className="rounded-lg bg-[#132175] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor…" : "Bu Sayfayı Kaydet"}
                </button>
              )}
              {pageInfo?.path && (
                <a href={pageInfo.path} target="_blank" rel="noreferrer" className="ws-pc-live-link">
                  Canlı sayfayı aç ↗
                </a>
              )}
            </div>
          </div>
        )}

        {activeBlock?.fields && activeBlock.fields.length > 0 && (
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

        {activeBlock?.cards && activeBlock.cards.length > 0 && (
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
            SCALAR_PAGE_FIELDS.has(activeField) ? (
              <ScalarPageFieldEditor
                fieldKey={activeField}
                pageData={pageData}
                selectedPage={selectedPage}
                setContent={setContent}
                meta={getMeta(activeField)}
              />
            ) : (
              <LocaleFieldEditor fieldKey={activeField} pageData={pageData} updateField={updateField} meta={getMeta(activeField)} />
            )
          ) : (
            <div className="ws-pc-empty">Düzenlemek için bir bölüm veya kart seçin.</div>
          )}
        </div>
      </main>

      {/* Right: quick section nav on home */}
      <aside className="ws-pc-preview-panel">
        {hasLayout ? (
          <>
            <p className="ws-pc-sidebar-label">Bölümler</p>
            <div className="ws-pc-section-nav">
              {pageLayout.map((block) => (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => selectBlock(block.id)}
                  disabled={block.static}
                  className={`ws-pc-section-nav-btn ${activeBlockId === block.id ? "is-active" : ""} ${block.static ? "is-static" : ""}`}
                >
                  {block.label}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}

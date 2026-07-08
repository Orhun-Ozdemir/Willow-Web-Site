"use client";

import { useState, useEffect, useMemo } from "react";
import { locales, type Locale } from "@/lib/cms";
import {
  fallbackDeliverablesAsCmsItems,
  fallbackProcessStepsAsCmsItems,
  fallbackServiceLayersAsCmsItems,
} from "@/lib/services-page-fallbacks";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import ListEditorField from "./ListEditorField";
import TranslationEditor from "./TranslationEditor";

type SubTab = "catalog" | "layers" | "general" | "caseStudies" | "deliverables" | "process";

const SERVICE_CATALOG_FIELDS = [
  { key: "title", label: "Hizmet Adı" },
  { key: "summary", label: "Özet", type: "textarea" as const, rows: 3 },
  { key: "deliverables", label: "Teslimatlar", type: "array-items" as const, sourceArrayKey: "deliverables" },
];

const SERVICE_LAYER_FIELDS = [
  { key: "title", label: "Başlık" },
  { key: "headline", label: "Alt Başlık" },
  { key: "description", label: "Açıklama", type: "textarea" as const, rows: 3 },
  { key: "output", label: "Tipik Teslimat", type: "textarea" as const, rows: 2 },
];

const CASE_STUDY_FIELDS = [
  { key: "title", label: "Başlık" },
  { key: "subtitle", label: "Alt Başlık" },
  { key: "problem", label: "Sorun & Yaklaşım (HTML destekli)", type: "textarea" as const, rows: 6 },
  { key: "quote", label: "Alıntı", type: "textarea" as const, rows: 3 },
  { key: "quoteAuthor", label: "Alıntı Yazarı" },
];

const DELIVERABLE_FIELDS = [
  { key: "title", label: "Paket Adı" },
  { key: "description", label: "Açıklama", type: "textarea" as const, rows: 2 },
];

const PROCESS_STEP_FIELDS = [
  { key: "title", label: "Aşama Adı" },
  { key: "description", label: "Açıklama", type: "textarea" as const, rows: 2 },
];

const GENERAL_FIELDS = [
  { key: "heroEyebrow", label: "Hero Üst Etiket" },
  { key: "heroTitle", label: "Hero Başlık" },
  { key: "heroLead", label: "Hero Açıklama", type: "textarea" as const, rows: 3 },
  { key: "serviceSystemEyebrow", label: "Hizmet Sistemi Üst Etiket" },
  { key: "serviceSystemTitle", label: "Hizmet Sistemi Başlık" },
  { key: "serviceSystemLead", label: "Hizmet Sistemi Açıklama", type: "textarea" as const, rows: 3 },
  { key: "deliverablesEyebrow", label: "Teslimatlar Üst Etiket" },
  { key: "deliverablesTitle", label: "Teslimatlar Başlık" },
  { key: "deliverablesLead", label: "Teslimatlar Açıklama", type: "textarea" as const, rows: 3 },
  { key: "handoffTitle", label: "Proje Devri Başlığı" },
  { key: "handoffDesc", label: "Proje Devri Açıklaması", type: "textarea" as const, rows: 2 },
  { key: "caseStudiesEyebrow", label: "Vaka Analizleri Üst Etiket" },
  { key: "caseStudiesTitle", label: "Vaka Analizleri Başlık" },
  { key: "caseStudiesLead", label: "Vaka Analizleri Açıklama", type: "textarea" as const, rows: 3 },
  { key: "processEyebrow", label: "Süreç Üst Etiket" },
  { key: "processTitle", label: "Süreç Başlık" },
  { key: "ctaEyebrow", label: "CTA Üst Etiket" },
  { key: "ctaTitle", label: "CTA Başlık" },
  { key: "ctaLead", label: "CTA Açıklama", type: "textarea" as const, rows: 3 },
  { key: "ctaPrimaryButton", label: "CTA Birincil Buton" },
  { key: "ctaSecondaryButton", label: "CTA İkincil Buton" },
  { key: "faqEyebrow", label: "SSS Üst Etiket" },
  { key: "faqTitle", label: "SSS Başlık" },
  { key: "faqLead", label: "SSS Açıklama", type: "textarea" as const, rows: 3 },
];

const getNextSortOrder = (items: any[]) => {
  const maxSortOrder = Math.max(
    0,
    ...(items || [])
      .map((item) => Number(item?.sortOrder))
      .filter((order) => Number.isFinite(order))
  );
  return maxSortOrder + 1;
};

/** pageContent.services stores locale maps on each field; TranslationEditor expects localized.* shape. */
function pageContentToEditorItem(page: Record<string, any>) {
  const item: any = { localized: {} };
  for (const [key, val] of Object.entries(page || {})) {
    if (Array.isArray(val)) continue;
    if (val && typeof val === "object") {
      for (const loc of locales) {
        const text = (val as Record<string, unknown>)[loc];
        if (typeof text === "string" && text.trim()) {
          item.localized[loc] = item.localized[loc] || {};
          item.localized[loc][key] = text;
        }
      }
      if (typeof (val as Record<string, unknown>).en === "string") {
        item[key] = (val as Record<string, string>).en;
      }
    } else if (typeof val === "string") {
      item[key] = val;
    }
  }
  return item;
}

function itemDisplayTitle(item: any, locale: Locale = "tr") {
  return (
    item?.localized?.[locale]?.title ||
    item?.localized?.en?.title ||
    item?.title ||
    item?.headline ||
    "(İsimsiz)"
  );
}

const FALLBACK_IMPORT: Record<string, () => any[]> = {
  serviceLayers: fallbackServiceLayersAsCmsItems,
  deliverables: fallbackDeliverablesAsCmsItems,
  processSteps: fallbackProcessStepsAsCmsItems,
};

export default function ServicesPanel() {
  const {
    content,
    setContent,
    savePageContent,
    saveContent,
    isPageContentDirty,
    dirtyKeys,
    saving,
    saveMessage,
  } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("catalog");
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);

  // Service Layers
  const [editingLayerIdx, setEditingLayerIdx] = useState<number | null>(null);

  // Case Studies
  const [editingCaseIdx, setEditingCaseIdx] = useState<number | null>(null);

  // Deliverables
  const [editingDeliverableIdx, setEditingDeliverableIdx] = useState<number | null>(null);

  // Process Steps
  const [editingProcessIdx, setEditingProcessIdx] = useState<number | null>(null);

  const servicesPage = content?.pageContent?.services || {};
  const serviceCatalog = useMemo(() => {
    return [...(content?.services || [])].sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [content?.services]);
  const serviceLayers = servicesPage.serviceLayers || [];
  const caseStudies = servicesPage.caseStudies || [];
  const deliverables = servicesPage.deliverables || [];
  const processSteps = servicesPage.processSteps || [];
  const pageDirty = isPageContentDirty("services");
  const catalogDirty = dirtyKeys.includes("services");
  const generalEditorItem = useMemo(() => pageContentToEditorItem(servicesPage), [servicesPage]);

  const heroPreview =
    servicesPage.heroTitle?.tr ||
    servicesPage.heroTitle?.en ||
    "Bağlı ürünler için mühendislik hizmetleri.";

  useEffect(() => {
    if (!pageDirty || saving) return;
    const timer = window.setTimeout(() => {
      void savePageContent("services");
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [pageDirty, saving, servicesPage, savePageContent]);

  const importFallbackList = (listKey: string) => {
    const factory = FALLBACK_IMPORT[listKey];
    if (!factory) return;
    if (!confirm("Canlı sitede görünen varsayılan içerik CMS'e yüklenecek. Devam edilsin mi?")) return;
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      pc.services = { ...(pc.services || {}), [listKey]: factory() };
      return { ...c, pageContent: pc };
    });
  };

  const updateCatalogService = (id: string, key: string, val: any) => {
    setContent((c: any) => ({
      ...c,
      services: (c.services || []).map((item: any) => (item.id === id ? { ...item, [key]: val } : item)),
    }));
  };

  const updateCatalogLocalized = (id: string, locale: Locale, key: string, val: any) => {
    setContent((c: any) => ({
      ...c,
      services: (c.services || []).map((item: any) => {
        if (item.id !== id) return item;
        return {
          ...item,
          localized: {
            ...item.localized,
            [locale]: { ...(item.localized?.[locale] || {}), [key]: val },
          },
        };
      }),
    }));
  };

  const addCatalogService = () => {
    const id = `service-${Date.now()}`;
    setContent((c: any) => ({
      ...c,
      services: [
        ...(c.services || []),
        {
          id,
          title: "Yeni Hizmet",
          summary: "",
          deliverables: [],
          sortOrder: getNextSortOrder(c.services || []),
          localized: {},
        },
      ],
    }));
    setEditingCatalogId(id);
  };

  const deleteCatalogService = (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => ({
      ...c,
      services: (c.services || []).filter((item: any) => item.id !== id),
    }));
    setEditingCatalogId(null);
  };

  const resetSubEditors = () => {
    setEditingCatalogId(null);
    setEditingLayerIdx(null);
    setEditingCaseIdx(null);
    setEditingDeliverableIdx(null);
    setEditingProcessIdx(null);
  };

  // ── Generic helpers ──
  const updatePageField = (key: string, value: any) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      pc.services = { ...(pc.services || {}), [key]: value };
      return { ...c, pageContent: pc };
    });
  };

  const updatePageLocalized = (locale: Locale, key: string, value: string) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const svc = { ...(pc.services || {}) };
      svc[key] = { ...(svc[key] || {}), [locale]: value };
      pc.services = svc;
      return { ...c, pageContent: pc };
    });
  };

  // ── Service Layers CRUD ──
  const updateListItem = (listKey: string, idx: number, key: string, val: any) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const svc = { ...(pc.services || {}) };
      const list = [...(svc[listKey] || [])];
      list[idx] = { ...list[idx], [key]: val };
      svc[listKey] = list;
      pc.services = svc;
      return { ...c, pageContent: pc };
    });
  };

  const updateListItemLocalized = (listKey: string, idx: number, locale: Locale, key: string, val: any) => {
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const svc = { ...(pc.services || {}) };
      const list = [...(svc[listKey] || [])];
      const item = { ...list[idx] };
      item.localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [key]: val } };
      list[idx] = item;
      svc[listKey] = list;
      pc.services = svc;
      return { ...c, pageContent: pc };
    });
  };

  const addListItem = (listKey: string, defaults: any, setEditIdx: (i: number) => void) => {
    const id = `${listKey}-${Date.now()}`;
    const items = servicesPage[listKey] || [];
    const newItem = { id, ...defaults, sortOrder: getNextSortOrder(items), localized: {} };
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const svc = { ...(pc.services || {}) };
      svc[listKey] = [...(svc[listKey] || []), newItem];
      pc.services = svc;
      return { ...c, pageContent: pc };
    });
    setEditIdx(items.length);
  };

  const deleteListItem = (listKey: string, id: string, setEditIdx: (i: number | null) => void) => {
    if (!confirm("Bu öğeyi silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const pc = { ...(c.pageContent || {}) };
      const svc = { ...(pc.services || {}) };
      svc[listKey] = (svc[listKey] || []).filter((x: any) => x.id !== id);
      pc.services = svc;
      return { ...c, pageContent: pc };
    });
    setEditIdx(null);
  };

  // ── Render helpers ──
  const renderListEditor = (
    listKey: string,
    items: any[],
    fields: { key: string; label: string; type?: "textarea"; rows?: number }[],
    editIdx: number | null,
    setEditIdx: (i: number | null) => void,
    listLabel: string,
    addLabel: string,
    addDefaults: any,
    extraFields?: (item: any, idx: number) => React.ReactNode,
    previewItems?: any[],
  ) => {
    const preview = previewItems || [];
    const showingPreview = items.length === 0 && preview.length > 0;
    const displayItems = items.length ? items : preview;

    if (editIdx !== null && items[editIdx]) {
      const item = items[editIdx];
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="font-bold text-sm text-[#131b2e]">Düzenle: {item.title || "(İsimsiz)"}</h3>
            <div className="flex gap-2">
              <button onClick={() => deleteListItem(listKey, item.id, setEditIdx)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
              <button onClick={() => setEditIdx(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold">Listeye Dön</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Sıra Numarası" type="number" value={String(item.sortOrder || 0)} onChange={(v) => updateListItem(listKey, editIdx, "sortOrder", parseInt(v) || 0)} />
            {fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" ? "col-span-2" : ""}>
                <FormField
                  label={`${f.label} (EN)`}
                  type={f.type || "text"}
                  value={item[f.key] || ""}
                  onChange={(v) => updateListItem(listKey, editIdx, f.key, v)}
                  rows={f.rows}
                />
              </div>
            ))}
            {extraFields?.(item, editIdx)}
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-xs font-bold text-gray-700 mb-3">Çeviriler</h4>
            <TranslationEditor
              item={item}
              fields={fields}
              onChange={(locale, key, val) => updateListItemLocalized(listKey, editIdx, locale, key, val)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {showingPreview && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">Canlı sitede varsayılan içerik gösteriliyor</p>
            <p className="mt-1 text-xs text-amber-900">
              CMS listesi boş olduğu için ziyaretçiler şablondaki {preview.length} öğeyi görür. Düzenlemek için yükleyin veya sıfırdan ekleyin.
            </p>
            <button
              type="button"
              onClick={() => importFallbackList(listKey)}
              className="mt-3 rounded-lg bg-[#132175] px-3 py-2 text-xs font-bold text-white hover:bg-[#0e1a5e]"
            >
              Varsayılan içeriği CMS&apos;e yükle
            </button>
          </div>
        )}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-sm text-[#131b2e]">{listLabel}</h3>
          <button onClick={() => addListItem(listKey, addDefaults, setEditIdx)} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold">+ {addLabel}</button>
        </div>
        <div className="divide-y divide-gray-100">
          {[...displayItems]
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((item: any) => {
              const originalIndex = items.findIndex((x: any) => x.id === item.id);
              return (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{itemDisplayTitle(item)}</p>
                    <p className="text-xs text-gray-400">
                      {showingPreview ? "Varsayılan (canlıda görünür)" : `Sıra: ${item.sortOrder || 0}`}
                    </p>
                  </div>
                  {showingPreview ? (
                    <button
                      type="button"
                      onClick={() => importFallbackList(listKey)}
                      className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-xs font-semibold rounded transition text-amber-950"
                    >
                      Yükle & düzenle
                    </button>
                  ) : (
                    <button onClick={() => setEditIdx(originalIndex)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition">Düzenle</button>
                  )}
                </div>
              );
            })}
          {displayItems.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500 space-y-2">
              <p>Henüz öğe eklenmemiş.</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                «+ {addLabel}» ile yeni kayıt ekleyebilir veya canlıdaki varsayılan içeriği yükleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">/services sayfası</p>
          <h2 className="mt-1 text-lg font-bold text-[#131b2e]">{heroPreview}</h2>
          <p className="mt-2 text-sm text-gray-500">
            Supabase hizmet kartları: <strong>{serviceCatalog.length}</strong> ·
            Sayfa katmanları: {serviceLayers.length || fallbackServiceLayersAsCmsItems().length}
            {serviceLayers.length === 0 ? " (katman listesi CMS’te boş — canlıda şablon)" : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {(pageDirty || catalogDirty) && (
            <p className="text-xs font-semibold text-amber-700">
              {saving
                ? "Kaydediliyor…"
                : pageDirty
                  ? "Sayfa içeriği — 2 sn içinde otomatik kaydedilir"
                  : "Hizmet kartları — üstte «Değişiklikleri Kaydet» kullanın"}
            </p>
          )}
          {!pageDirty && !catalogDirty && saveMessage && (
            <p className="text-xs font-semibold text-green-700">{saveMessage}</p>
          )}
          {pageDirty && (
            <button
              type="button"
              onClick={() => void savePageContent("services")}
              disabled={saving}
              className="rounded-lg bg-[#132175] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              {saving ? "Kaydediliyor…" : "Sayfa Metinlerini Kaydet"}
            </button>
          )}
          {catalogDirty && (
            <button
              type="button"
              onClick={() => void saveContent()}
              disabled={saving}
              className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              {saving ? "Kaydediliyor…" : "Hizmet Kartlarını Kaydet"}
            </button>
          )}
          <a href="/tr/services" target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#132175] hover:underline">
            Canlı sayfayı aç ↗
          </a>
        </div>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
        <p className="font-semibold">İki ayrı Supabase kaynağı</p>
        <ul className="mt-2 space-y-1 text-blue-900 list-disc pl-5">
          <li><strong>Hizmet Kartları</strong> — <code className="text-xs">services</code> tablosu (Embedded Hardware, Firmware vb.). Buradan mevcut hizmetleri görür ve yeni ekleyebilirsiniz.</li>
          <li><strong>Sayfa Katmanları / Metinler</strong> — <code className="text-xs">page_content</code> içinde <code className="text-xs">services</code> sayfası (/services şablonu).</li>
        </ul>
      </div>
      {/* Sub-tabs header */}
      <div className="flex gap-2 border-b border-gray-200 pb-px overflow-x-auto">
        {[
          { key: "catalog", label: `Hizmet Kartları (${serviceCatalog.length})` },
          { key: "layers", label: "Sayfa Katmanları" },
          { key: "caseStudies", label: "Vaka Analizleri" },
          { key: "deliverables", label: "Teslimatlar" },
          { key: "process", label: "Süreç Adımları" },
          { key: "general", label: "Genel Sayfa Metinleri" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveSubTab(tab.key as SubTab);
              resetSubEditors();
            }}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition -mb-px whitespace-nowrap ${
              activeSubTab === tab.key
                ? "border-[#132175] text-[#132175]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 0. Supabase services catalog */}
      {activeSubTab === "catalog" && (() => {
        const editing = serviceCatalog.find((item: any) => item.id === editingCatalogId);
        if (editing) {
          return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h3 className="font-bold text-sm text-[#131b2e]">
                  Düzenle: {itemDisplayTitle(editing)}
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => deleteCatalogService(editing.id)}
                    className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold"
                  >
                    Sil
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCatalogId(null)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold"
                  >
                    Listeye Dön
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Kayıt ID" value={editing.id} onChange={() => {}} readOnly hint="Sistem kimliği — değiştirilmez." />
                <FormField label="Sıra" type="number" value={String(editing.sortOrder ?? 0)} onChange={(v) => updateCatalogService(editing.id, "sortOrder", parseInt(v, 10) || 0)} />
                <FormField label="Başlık (EN)" value={editing.title || ""} onChange={(v) => updateCatalogService(editing.id, "title", v)} />
                <div className="col-span-2">
                  <FormField label="Özet (EN)" type="textarea" rows={3} value={editing.summary || ""} onChange={(v) => updateCatalogService(editing.id, "summary", v)} />
                </div>
                <div className="col-span-2">
                  <ListEditorField
                    label="Teslimatlar (EN)"
                    value={Array.isArray(editing.deliverables) ? editing.deliverables : []}
                    onChange={(v) => updateCatalogService(editing.id, "deliverables", v)}
                    placeholder="Her satır bir teslimat"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-xs font-bold text-gray-700 mb-3">Çeviriler</h4>
                <TranslationEditor
                  item={editing}
                  fields={SERVICE_CATALOG_FIELDS}
                  onChange={(locale, key, val) => updateCatalogLocalized(editing.id, locale, key, val)}
                />
              </div>
            </div>
          );
        }

        return (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center gap-3">
              <div>
                <h3 className="font-bold text-sm text-[#131b2e]">Supabase Hizmet Kartları</h3>
                <p className="text-xs text-gray-500 mt-1">Kaynak: <code>services</code> tablosu — {serviceCatalog.length} kayıt</p>
              </div>
              <button
                type="button"
                onClick={addCatalogService}
                className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold whitespace-nowrap"
              >
                + Yeni Hizmet Ekle
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {serviceCatalog.map((item: any) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{itemDisplayTitle(item)}</p>
                    <p className="text-xs text-gray-500 truncate">{item.summary || item.localized?.tr?.summary || "—"}</p>
                    <p className="text-xs text-gray-400 mt-1">ID: {item.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingCatalogId(item.id)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition shrink-0"
                  >
                    Düzenle
                  </button>
                </div>
              ))}
              {serviceCatalog.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">
                  Supabase&apos;te hizmet kaydı yok veya henüz yüklenmedi. «+ Yeni Hizmet Ekle» ile başlayın.
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 1. Service Layers */}
      {activeSubTab === "layers" && renderListEditor(
        "serviceLayers",
        serviceLayers,
        SERVICE_LAYER_FIELDS,
        editingLayerIdx,
        setEditingLayerIdx,
        "Hizmet Katmanları",
        "Yeni Katman Ekle",
        { title: "Yeni Hizmet", headline: "", description: "", output: "", tags: "" },
        (item, idx) => (
          <div className="col-span-2" key="tags">
            <FormField
              label="Etiketler / Alt Hizmetler (virgülle ayırın)"
              value={Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || "")}
              onChange={(v) => updateListItem("serviceLayers", idx, "tags", v.split(",").map((t: string) => t.trim()).filter(Boolean))}
              hint="Örn: Embedded Hardware, Firmware, Connectivity"
            />
          </div>
        ),
        fallbackServiceLayersAsCmsItems(),
      )}

      {/* 2. Case Studies */}
      {activeSubTab === "caseStudies" && renderListEditor(
        "caseStudies",
        caseStudies,
        CASE_STUDY_FIELDS,
        editingCaseIdx,
        setEditingCaseIdx,
        "Vaka Analizleri",
        "Yeni Vaka Ekle",
        { title: "Yeni Vaka Analizi", subtitle: "", problem: "", quote: "", quoteAuthor: "" },
        (item, idx) => (
          <>
            <div className="col-span-2" key="logo">
              <FormField
                label="Müşteri Logosu"
                type="image"
                value={item.logo || ""}
                onChange={(v) => updateListItem("caseStudies", idx, "logo", v)}
                placeholder="assets/client-logos/..."
              />
            </div>
            <div key="stat1-val">
              <FormField label="İstatistik 1 Değeri" value={item.stat1Value || ""} onChange={(v) => updateListItem("caseStudies", idx, "stat1Value", v)} placeholder="-32%" />
            </div>
            <div key="stat1-label">
              <FormField label="İstatistik 1 Etiketi" value={item.stat1Label || ""} onChange={(v) => updateListItem("caseStudies", idx, "stat1Label", v)} placeholder="Bakım Maliyetleri" />
            </div>
            <div key="stat2-val">
              <FormField label="İstatistik 2 Değeri" value={item.stat2Value || ""} onChange={(v) => updateListItem("caseStudies", idx, "stat2Value", v)} placeholder="99.6%" />
            </div>
            <div key="stat2-label">
              <FormField label="İstatistik 2 Etiketi" value={item.stat2Label || ""} onChange={(v) => updateListItem("caseStudies", idx, "stat2Label", v)} placeholder="Ağ Çalışma Süresi" />
            </div>
            <div key="stat3-val">
              <FormField label="İstatistik 3 Değeri" value={item.stat3Value || ""} onChange={(v) => updateListItem("caseStudies", idx, "stat3Value", v)} placeholder="<5m" />
            </div>
            <div key="stat3-label">
              <FormField label="İstatistik 3 Etiketi" value={item.stat3Label || ""} onChange={(v) => updateListItem("caseStudies", idx, "stat3Label", v)} placeholder="Hata Uyarıları" />
            </div>
          </>
        ),
      )}

      {/* 3. Deliverables */}
      {activeSubTab === "deliverables" && renderListEditor(
        "deliverables",
        deliverables,
        DELIVERABLE_FIELDS,
        editingDeliverableIdx,
        setEditingDeliverableIdx,
        "Teslimat Paketleri",
        "Yeni Paket Ekle",
        { title: "Yeni Paket", description: "" },
        undefined,
        fallbackDeliverablesAsCmsItems(),
      )}

      {/* 4. Process Steps */}
      {activeSubTab === "process" && renderListEditor(
        "processSteps",
        processSteps,
        PROCESS_STEP_FIELDS,
        editingProcessIdx,
        setEditingProcessIdx,
        "Süreç Adımları",
        "Yeni Adım Ekle",
        { title: "Yeni Aşama", description: "" },
        undefined,
        fallbackProcessStepsAsCmsItems(),
      )}

      {/* 5. General Page Texts */}
      {activeSubTab === "general" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            Hizmetler sayfasındaki genel başlıklar, açıklamalar ve buton metinleri buradan yönetilir.
            Hero ve bölüm metinleri Supabase&apos;te kayıtlı; aşağıda dil dil düzenlenir.
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-xs font-bold text-gray-700 mb-3">Sayfa Metin Çevirileri</h4>
            <TranslationEditor
              item={generalEditorItem}
              fields={GENERAL_FIELDS}
              onChange={(locale, key, val) => updatePageLocalized(locale, key, val)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

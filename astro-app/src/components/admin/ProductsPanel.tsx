"use client";

import { useState, useMemo } from "react";
import { type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import ListEditorField from "./ListEditorField";
import JsonEditorField from "./JsonEditorField";
import DetailBlocksEditor from "./DetailBlocksEditor";
import IconListEditor from "./IconListEditor";
import ProductDocumentsEditor from "./ProductDocumentsEditor";
import TranslationEditor from "./TranslationEditor";
import ProductCategoriesEditor from "./ProductCategoriesEditor";
import { applicationIconForText, canonicalizeProduct, iconKeyForText } from "@/lib/product-model";
import { normalizeProductCategories } from "@/lib/product-categories";

const PRODUCT_FIELDS = [
  { key: "title", label: "Ürün Adı" },
  { key: "shortDescription", label: "Kısa Açıklama", type: "textarea" as const },
  { key: "technicalSummary", label: "Teknik Özet", type: "textarea" as const, rows: 4 },
  { key: "useCases", label: "Kullanım Alanları", type: "textarea" as const, rows: 4 },
  { key: "applications", label: "Applications (her öğe ayrı)", type: "array-items" as const, sourceArrayKey: "applications" },
  { key: "chips", label: "Etiketler / Chips (her öğe ayrı)", type: "array-items" as const, sourceArrayKey: "chips" },
];

const SECTIONS = [
  {
    key: "basics",
    label: "Temel Bilgiler",
    hint: "Başlık, slug, kategori, durum",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    key: "media",
    label: "Görseller & Medya",
    hint: "Kapak görseli, galeri, datasheet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    key: "technical",
    label: "Teknik Özellikler",
    hint: "Tip, pil ömrü, mesafe, JSON specs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    key: "applications",
    label: "Uygulamalar & Parametreler",
    hint: "Applications ikon şeridi, reported parameters",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    key: "blocks",
    label: "İçerik Blokları",
    hint: "Detay sayfası açıklama blokları",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: "translations",
    label: "Çeviriler",
    hint: "Çoklu dil içeriği",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

function ChevronDown() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function ProductsPanel() {
  const { content, setContent } = useAdmin();
  const [editId, setEditId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ basics: true });
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const categories = useMemo(
    () => normalizeProductCategories(content?.meta?.productCategories),
    [content?.meta?.productCategories],
  );
  const categoryOptions = categories.map((category) => ({
    value: category.key,
    label: category.localized?.tr?.title || category.localized?.en?.title || category.key,
  }));

  const products = useMemo(() => {
    const list = content?.products || [];
    return list
      .map((item: any, idx: number) => ({ ...item, id: item.id || `product-${idx}` }))
      .sort((a: any, b: any) => Number(a.sortOrder ?? a.sort_order ?? 0) - Number(b.sortOrder ?? b.sort_order ?? 0));
  }, [content?.products]);

  const heroProductId = String(content?.pageContent?.products?.featuredProductId || "willowbee");
  const heroProduct = products.find((item: any) => item.id === heroProductId) || products[0];

  const updateHeroProduct = (productId: string) => {
    setContent((current: any) => ({
      ...current,
      pageContent: {
        ...(current.pageContent || {}),
        products: {
          ...(current.pageContent?.products || {}),
          featuredProductId: productId,
        },
      },
    }));
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateProduct = (id: string, key: string, val: any) => {
    setContent((c: any) => {
      const list = (c.products || []).map((item: any, idx: number) => {
        const itemId = item.id || `product-${idx}`;
        if (itemId === id) {
          return { ...item, id: itemId, [key]: val };
        }
        return item;
      });
      return { ...c, products: list };
    });
  };

  const updateProductFields = (id: string, fields: Record<string, any>) => {
    setContent((c: any) => {
      const list = (c.products || []).map((item: any, idx: number) => {
        const itemId = item.id || `product-${idx}`;
        if (itemId === id) {
          return { ...item, id: itemId, ...fields };
        }
        return item;
      });
      return { ...c, products: list };
    });
  };

  const updateLocalized = (id: string, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const list = (c.products || []).map((item: any, idx: number) => {
        const itemId = item.id || `product-${idx}`;
        if (itemId === id) {
          const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
          return { ...item, id: itemId, localized };
        }
        return item;
      });
      return { ...c, products: list };
    });
  };

  const addProduct = () => {
    const id = `product-${Date.now()}`;
    const nextSortOrder = products.reduce((max: number, item: any) => Math.max(max, Number(item.sortOrder ?? item.sort_order ?? 0)), 0) + 10;
    setContent((c: any) => ({
      ...c,
      products: [...(c.products || []), canonicalizeProduct({
        id, title: "Yeni Ürün", slug: id, category: categories[0]?.key || "modules",
        featured: false, shortDescription: "", image: "", images: [],
        datasheet: "", datasheet_url: "", visible: true,
        chips: [], applications: [], specifications: {}, detailBlocks: {}, localized: {}, sortOrder: nextSortOrder,
      })],
    }));
    setEditId(id);
    setOpenSections({ basics: true });
  };

  const deleteProduct = (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const list = (c.products || []).filter((item: any, idx: number) => {
        const itemId = item.id || `product-${idx}`;
        return itemId !== id;
      });
      return { ...c, products: list };
    });
    setEditId(null);
  };

  const reorderProduct = (sourceId: string, targetId: string) => {
    if (!sourceId || sourceId === targetId) return;
    setContent((current: any) => {
      const ordered = [...(current.products || [])]
        .sort((a: any, b: any) => Number(a.sortOrder ?? a.sort_order ?? 0) - Number(b.sortOrder ?? b.sort_order ?? 0));
      const sourceIndex = ordered.findIndex((item: any) => item.id === sourceId);
      const targetIndex = ordered.findIndex((item: any) => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const [moved] = ordered.splice(sourceIndex, 1);
      ordered.splice(targetIndex, 0, moved);
      return {
        ...current,
        products: ordered.map((item: any, index: number) => ({
          ...item,
          sortOrder: (index + 1) * 10,
          sort_order: (index + 1) * 10,
        })),
      };
    });
  };

  /* ── EDIT VIEW ── */
  const p = useMemo(() => {
    return products.find((item: any) => item.id === editId) || null;
  }, [editId, products]);

  if (editId !== null && p) {
    const specifications =
      p.specifications && typeof p.specifications === "object" && !Array.isArray(p.specifications)
        ? p.specifications : {};

    const updateSpecificationField = (key: string, value: any) => {
      const next = { ...specifications, [key]: value };
      if (key === "reported_parameters") delete next.reportedParameters;
      updateProduct(p.id, "specifications", next);
    };

    return (
      <div className="ws-prod-page">
        {/* Header */}
        <div className="ws-prod-edit-header">
          <div>
            <button
              type="button"
              onClick={() => setEditId(null)}
              className="ws-back-button"
            >
              ← Ürün listesine dön
            </button>
            <h3>{p.title || "Ürün Düzenle"}</h3>
            <p>Aşağıdaki bölümleri açıp kapayarak düzenleyin.</p>
          </div>
          <div className="ws-prod-edit-actions">
            <a
              href={`/en/products/${p.slug || p.id}`}
              target="_blank"
              rel="noopener"
              className="ws-edit-button"
              style={{ width: "auto", padding: "8px 16px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
            >
              Sitede önizle ↗
            </a>
            <span className={`ws-status ${p.visible !== false ? "ws-status-ready" : "ws-status-missing"}`}>
              {p.visible !== false ? "Yayında" : "Taslak"}
            </span>
            <button
              type="button"
              onClick={() => deleteProduct(p.id)}
              className="ws-delete-button"
            >
              Sil
            </button>
          </div>
        </div>

        {/* Accordion */}
        <div className="ws-prod-accordion">

          {/* ① Temel Bilgiler */}
          <div className="ws-prod-section">
            <button
              type="button"
              className="ws-prod-section-trigger"
              onClick={() => toggleSection("basics")}
            >
              <div className="ws-prod-section-trigger-left">
                <span className="ws-prod-section-icon">{SECTIONS[0].icon}</span>
                <span className="ws-prod-section-label">
                  <strong>{SECTIONS[0].label}</strong>
                  <span>{SECTIONS[0].hint}</span>
                </span>
              </div>
              <span className={`ws-prod-section-chevron ${openSections.basics ? "open" : ""}`}>
                <ChevronDown />
              </span>
            </button>
            {openSections.basics && (
              <div className="ws-prod-section-body">
                <div className="ws-prod-field-row">
                  <div className="ws-prod-readonly">
                    <label>ID (salt okunur)</label>
                    <span title={p.id}>{p.id}</span>
                  </div>
                  <FormField label="Slug" value={p.slug || ""} onChange={(v) => updateProduct(p.id, "slug", v)} />
                </div>
                <div className="ws-prod-field-row">
                  <FormField label="Ürün Adı" value={p.title || ""} onChange={(v) => updateProduct(p.id, "title", v)} />
                  <FormField
                    label="Kategori"
                    type="select"
                    value={p.category || "modules"}
                    onChange={(v) => updateProduct(p.id, "category", v)}
                    options={categoryOptions}
                  />
                </div>
                <div className="ws-prod-field-row">
                  <FormField
                    label="Genel Öne Çıkan (Yedek Seçim)"
                    type="select"
                    value={p.featured ? "true" : "false"}
                    onChange={(v) => updateProduct(p.id, "featured", v === "true")}
                    options={[{ value: "true", label: "Evet" }, { value: "false", label: "Hayır" }]}
                    hint="Hero ürünü ayrıca Ürünler listesinin üstündeki alandan seçilir. Bu ayar yalnızca Hero seçimi bulunamazsa yedek olarak kullanılır."
                  />
                  <FormField
                    label="Sitede Göster (Yayında)"
                    type="select"
                    value={p.visible !== false ? "true" : "false"}
                    onChange={(v) => updateProduct(p.id, "visible", v === "true")}
                    options={[{ value: "true", label: "Evet" }, { value: "false", label: "Hayır" }]}
                  />
                </div>
                <FormField
                  label="Katalog Sırası"
                  type="number"
                  value={String(p.sortOrder ?? p.sort_order ?? 0)}
                  onChange={(v) => updateProductFields(p.id, { sortOrder: parseInt(v) || 0, sort_order: parseInt(v) || 0 })}
                  hint="Düşük değer önce görünür. Liste ekranında kartları sürükleyerek de sıralayabilirsiniz."
                />
                <FormField
                  label="Kısa Açıklama"
                  type="textarea"
                  value={p.shortDescription || ""}
                  onChange={(v) => updateProduct(p.id, "shortDescription", v)}
                  rows={3}
                  placeholder="Ürünü kısaca tanımlayın..."
                />
                <FormField
                  label="Etiketler (virgülle ayırın)"
                  value={(p.chips || []).join(", ")}
                  onChange={(v) => updateProduct(p.id, "chips", v.split(",").map((s: string) => s.trim()).filter(Boolean))}
                  hint="Ör: IoT, SCADA, Modbus"
                />
              </div>
            )}
          </div>

          {/* ② Görseller & Medya */}
          <div className="ws-prod-section">
            <button
              type="button"
              className="ws-prod-section-trigger"
              onClick={() => toggleSection("media")}
            >
              <div className="ws-prod-section-trigger-left">
                <span className="ws-prod-section-icon">{SECTIONS[1].icon}</span>
                <span className="ws-prod-section-label">
                  <strong>{SECTIONS[1].label}</strong>
                  <span>{SECTIONS[1].hint}</span>
                </span>
              </div>
              <span className={`ws-prod-section-chevron ${openSections.media ? "open" : ""}`}>
                <ChevronDown />
              </span>
            </button>
            {openSections.media && (
              <div className="ws-prod-section-body">
                <FormField
                  label="Kapak Görseli"
                  type="image"
                  value={p.image || ""}
                  onChange={(v) => updateProduct(p.id, "image", v)}
                  placeholder="assets/products/..."
                />
                <ListEditorField
                  label="Çoklu Görseller (Galeri)"
                  value={Array.isArray(p.images) ? p.images : []}
                  onChange={(items) => updateProduct(p.id, "images", items)}
                  helper="Bir satıra bir görsel yolu. İlk görsel kapak olur."
                  placeholder="assets/product-cutouts/example.png"
                />
                <ProductDocumentsEditor
                  value={Array.isArray(p.documents) ? p.documents : []}
                  onChange={(docs) => updateProduct(p.id, "documents", docs)}
                  productId={p.id}
                />
                {(p.datasheet_url || p.datasheet) && !(Array.isArray(p.documents) && p.documents.length) && (
                  <p style={{ marginTop: 10, fontSize: 12.5, color: "#9ca3af" }}>
                    Eski tek datasheet bağlantısı mevcut ve detay sayfasında yedek olarak gösteriliyor:{" "}
                    <code style={{ fontSize: 11.5 }}>{p.datasheet_url || p.datasheet}</code>. Yukarıdan bir döküman
                    ekleyip dile atadığınızda yeni sistem devreye girer.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ③ Teknik Özellikler */}
          <div className="ws-prod-section">
            <button
              type="button"
              className="ws-prod-section-trigger"
              onClick={() => toggleSection("technical")}
            >
              <div className="ws-prod-section-trigger-left">
                <span className="ws-prod-section-icon">{SECTIONS[2].icon}</span>
                <span className="ws-prod-section-label">
                  <strong>{SECTIONS[2].label}</strong>
                  <span>{SECTIONS[2].hint}</span>
                </span>
              </div>
              <span className={`ws-prod-section-chevron ${openSections.technical ? "open" : ""}`}>
                <ChevronDown />
              </span>
            </button>
            {openSections.technical && (
              <div className="ws-prod-section-body">
                <p className="ws-prod-group-label">Genel</p>
                <div className="ws-prod-field-row cols-3">
                  <FormField
                    label="Type"
                    value={p.type || ""}
                    onChange={(v) => updateProduct(p.id, "type", v)}
                    placeholder="Outdoor IP67 LoRaWAN..."
                  />
                  <FormField
                    label="Battery Life"
                    value={p.batteryLife || p.battery_life || ""}
                    onChange={(v) => updateProductFields(p.id, { batteryLife: v, battery_life: v })}
                    placeholder="up to 5 years"
                  />
                  <FormField
                    label="Communication Range"
                    value={p.communicationRange || p.communication_range || ""}
                    onChange={(v) => updateProductFields(p.id, { communicationRange: v, communication_range: v })}
                    placeholder="up to 15 km"
                  />
                </div>
                <p className="ws-prod-group-label">Specifications JSON</p>
                <JsonEditorField
                  label=""
                  value={specifications}
                  onChange={(val) => updateProduct(p.id, "specifications", val || {})}
                  helper='Object olarak kaydedilir. Örnek: { "protocol": "LoRaWAN 868/915 MHz" }'
                  rows={10}
                />
              </div>
            )}
          </div>

          {/* ④ Uygulamalar & Parametreler */}
          <div className="ws-prod-section">
            <button
              type="button"
              className="ws-prod-section-trigger"
              onClick={() => toggleSection("applications")}
            >
              <div className="ws-prod-section-trigger-left">
                <span className="ws-prod-section-icon">{SECTIONS[3].icon}</span>
                <span className="ws-prod-section-label">
                  <strong>{SECTIONS[3].label}</strong>
                  <span>{SECTIONS[3].hint}</span>
                </span>
              </div>
              <span className={`ws-prod-section-chevron ${openSections.applications ? "open" : ""}`}>
                <ChevronDown />
              </span>
            </button>
            {openSections.applications && (
              <div className="ws-prod-section-body">
                <IconListEditor
                  label="Applications"
                  value={Array.isArray(p.applications) ? p.applications : []}
                  onChange={(items) => updateProduct(p.id, "applications", items)}
                  inferIcon={applicationIconForText}
                  addLabel="Application"
                  helper="Ürün detayındaki Applications ikon şeridini yönetir."
                  placeholder="Buildings and Infrastructure"
                />
                <IconListEditor
                  label="Reported Parameters"
                  value={
                    Array.isArray(specifications.reported_parameters)
                      ? specifications.reported_parameters
                      : specifications.reportedParameters || []
                  }
                  onChange={(items) => updateSpecificationField("reported_parameters", items)}
                  inferIcon={iconKeyForText}
                  addLabel="Parameter"
                  helper="Ürün detayındaki kompakt Reported Parameters kartını yönetir."
                  placeholder="Sensor temperature"
                />
              </div>
            )}
          </div>

          {/* ⑤ İçerik Blokları */}
          <div className="ws-prod-section">
            <button
              type="button"
              className="ws-prod-section-trigger"
              onClick={() => toggleSection("blocks")}
            >
              <div className="ws-prod-section-trigger-left">
                <span className="ws-prod-section-icon">{SECTIONS[4].icon}</span>
                <span className="ws-prod-section-label">
                  <strong>{SECTIONS[4].label}</strong>
                  <span>{SECTIONS[4].hint}</span>
                </span>
              </div>
              <span className={`ws-prod-section-chevron ${openSections.blocks ? "open" : ""}`}>
                <ChevronDown />
              </span>
            </button>
            {openSections.blocks && (
              <div className="ws-prod-section-body">
                <DetailBlocksEditor
                  value={Array.isArray(p.detailBlocks) ? p.detailBlocks : []}
                  onChange={(val) => updateProduct(p.id, "detailBlocks", val)}
                  helper="Ek açıklama blokları, ikonlu card'lar ve liste blokları için kullan."
                />
              </div>
            )}
          </div>

          {/* ⑥ Çeviriler */}
          <div className="ws-prod-section">
            <button
              type="button"
              className="ws-prod-section-trigger"
              onClick={() => toggleSection("translations")}
            >
              <div className="ws-prod-section-trigger-left">
                <span className="ws-prod-section-icon">{SECTIONS[5].icon}</span>
                <span className="ws-prod-section-label">
                  <strong>{SECTIONS[5].label}</strong>
                  <span>{SECTIONS[5].hint}</span>
                </span>
              </div>
              <span className={`ws-prod-section-chevron ${openSections.translations ? "open" : ""}`}>
                <ChevronDown />
              </span>
            </button>
            {openSections.translations && (
              <div className="ws-prod-section-body">
                <TranslationEditor
                  item={p}
                  fields={PRODUCT_FIELDS}
                  onChange={(locale, key, val) => updateLocalized(p.id, locale, key, val)}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  /* ── LIST VIEW ── */
  const filtered = products.filter((item: any) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [item.title, item.slug, item.category, item.shortDescription].some((v: any) => String(v || "").toLowerCase().includes(q));
  });

  return (
    <div className="ws-prod-page">
      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-700 border border-amber-200">
                Products Hero
              </span>
              <span className="text-xs font-semibold text-gray-400">Öne Çıkan Ürün</span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mb-1">
              Hero'da gösterilecek ürünü seçin
            </h3>
            <p className="text-sm text-gray-500 leading-6">
              Seçilen ürünün görseli, başlığı ve açıklaması Hero alanına gelir. Ürünün
              <strong className="text-gray-700"> Etiketler</strong> alanındaki ilk üç değer özellik baloncuğu olarak gösterilir.
            </p>
            {heroProduct && (
              <p className="mt-2 text-xs font-semibold text-[#132175]">
                Şu anda: {heroProduct.title || heroProduct.id}
                {Array.isArray(heroProduct.chips) && heroProduct.chips.length > 0
                  ? ` · Baloncuklar: ${heroProduct.chips.slice(0, 3).join(" · ")}`
                  : " · Baloncuk etiketi girilmemiş"}
              </p>
            )}
          </div>
          <label className="block w-full lg:w-80 shrink-0">
            <span className="block text-xs font-bold text-gray-700 mb-2">Hero Ürünü</span>
            <select
              value={heroProduct?.id || ""}
              onChange={(event) => updateHeroProduct(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:border-[#132175] focus:ring-2 focus:ring-[#132175]/10"
            >
              {products
                .filter((product: any) => product.visible !== false)
                .map((product: any) => (
                  <option key={product.id} value={product.id}>
                    {product.title || product.id}
                  </option>
                ))}
            </select>
            <span className="mt-2 block text-[11px] leading-5 text-gray-400">
              Değişiklikten sonra sağ üstteki “Değişiklikleri Kaydet” butonuna basın.
            </span>
          </label>
        </div>
      </section>
      <ProductCategoriesEditor />
      <div className="ws-prod-list-header">
        <h3>Ürün Kataloğu</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ürün ara…"
            style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, width: 180 }}
          />
          <button type="button" onClick={addProduct} className="ws-primary-button">
            + Yeni Ürün
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ws-prod-empty">{query ? "Eşleşen ürün yok." : "Katalogda henüz ürün bulunmuyor."}</div>
      ) : (
        <div className="ws-prod-grid">
          {filtered.map((p: any, idx: number) => {
            const previewUrl = p.image
              ? /^(https?:)?\/\//i.test(p.image) || p.image.startsWith("data:")
                ? p.image
                : `${import.meta.env.BASE_URL || "/"}${p.image.replace(/^\/+/, "")}`
              : "";

            return (
              <div
                key={p.id}
                className="ws-prod-card"
                draggable
                onDragStart={() => setDragId(p.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragId) reorderProduct(dragId, p.id);
                  setDragId(null);
                }}
                style={{ opacity: dragId === p.id ? 0.55 : 1, cursor: "grab" }}
                title="Sıralamak için sürükleyin"
              >
                <div className="ws-prod-card-thumb">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={p.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = "/assets/willow-mark-transparent.png";
                        (e.target as HTMLImageElement).style.opacity = "0.2";
                      }}
                    />
                  ) : (
                    <div style={{ color: "#cbd5e1", fontSize: 13 }}>Görsel Yok</div>
                  )}
                  <span className={`ws-prod-card-badge ${p.visible !== false ? "live" : "draft"}`}>
                    {p.visible !== false ? "Yayında" : "Taslak"}
                  </span>
                </div>

                <div className="ws-prod-card-body">
                  {p.id === heroProduct?.id && (
                    <span className="mb-2 inline-flex rounded-full bg-amber-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 border border-amber-200">
                      Hero Ürünü
                    </span>
                  )}
                  <h4>{p.title}</h4>
                  <p>{p.shortDescription || "Açıklama girilmemiş."}</p>
                </div>

                <div className="ws-prod-card-foot">
                  <span className="ws-prod-cat-pill">{p.category || "Genel"}</span>
                  <button
                    type="button"
                    onClick={() => { setEditId(p.id); setOpenSections({ basics: true }); }}
                    className="ws-edit-button"
                    style={{ width: "auto", padding: "8px 16px" }}
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

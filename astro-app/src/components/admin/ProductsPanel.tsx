"use client";

import { useState } from "react";
import { type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import ListEditorField from "./ListEditorField";
import JsonEditorField from "./JsonEditorField";
import DetailBlocksEditor from "./DetailBlocksEditor";
import IconListEditor from "./IconListEditor";
import TranslationEditor from "./TranslationEditor";
import { applicationIconForText, canonicalizeProduct, iconKeyForText } from "@/lib/product-model";

const PRODUCT_FIELDS = [
  { key: "title", label: "Ürün Adı" },
  { key: "category", label: "Kategori" },
  { key: "shortDescription", label: "Kısa Açıklama", type: "textarea" as const },
  { key: "technicalSummary", label: "Teknik Özet", type: "textarea" as const, rows: 4 },
  { key: "useCases", label: "Kullanım Alanları", type: "textarea" as const, rows: 4 },
  { key: "specifications", label: "Teknik Özellikler", type: "textarea" as const, rows: 4 },
  { key: "applications", label: "Applications", type: "textarea" as const, rows: 4 },
];

const CATEGORIES = [
  { value: "modules", label: "Modules" },
  { value: "environment", label: "Environment" },
  { value: "tracking", label: "Tracking" },
  { value: "industrial", label: "Industrial" },
];

export default function ProductsPanel() {
  const { content, setContent } = useAdmin();
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const products = content?.products || [];

  const updateProduct = (idx: number, key: string, val: any) => {
    setContent((c: any) => {
      const list = [...c.products];
      list[idx] = { ...list[idx], [key]: val };
      return { ...c, products: list };
    });
  };

  const updateProductFields = (idx: number, fields: Record<string, any>) => {
    setContent((c: any) => {
      const list = [...c.products];
      list[idx] = { ...list[idx], ...fields };
      return { ...c, products: list };
    });
  };

  const updateLocalized = (idx: number, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const list = [...c.products];
      const item = { ...list[idx] };
      const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
      list[idx] = { ...item, localized };
      return { ...c, products: list };
    });
  };

  const addProduct = () => {
    const id = `product-${Date.now()}`;
    setContent((c: any) => ({
      ...c,
      products: [...(c.products || []), canonicalizeProduct({
        id,
        title: "Yeni Ürün",
        slug: id,
        category: "modules",
        featured: false,
        shortDescription: "",
        image: "",
        images: [],
        datasheet: "",
        datasheet_url: "",
        visible: true,
        chips: [],
        applications: [],
        specifications: {},
        detailBlocks: [],
        localized: {},
      })],
    }));
    setEditIdx(products.length);
  };

  const deleteProduct = (idx: number) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => ({ ...c, products: c.products.filter((_: any, i: number) => i !== idx) }));
    setEditIdx(null);
  };

  if (editIdx !== null && products[editIdx]) {
    const p = products[editIdx];
    const specifications = p.specifications && typeof p.specifications === "object" && !Array.isArray(p.specifications) ? p.specifications : {};
    const updateSpecificationField = (key: string, value: any) => {
      const next = { ...specifications, [key]: value };
      if (key === "reported_parameters") delete next.reportedParameters;
      updateProduct(editIdx, "specifications", next);
    };

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="font-bold">Ürün Düzenle: {p.title}</h3>
          <div className="flex gap-2">
            <button onClick={() => deleteProduct(editIdx)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
            <button onClick={() => setEditIdx(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold">Listeye Dön</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="ID (salt okunur)" value={p.id} onChange={() => {}} readOnly />
          <FormField label="Slug" value={p.slug || ""} onChange={(v) => updateProduct(editIdx, "slug", v)} />
          <FormField label="Ürün Adı" value={p.title || ""} onChange={(v) => updateProduct(editIdx, "title", v)} />
          <FormField label="Kategori" type="select" value={p.category || "modules"} onChange={(v) => updateProduct(editIdx, "category", v)} options={CATEGORIES} />
          <FormField label="Görsel Yolu" value={p.image || ""} onChange={(v) => updateProduct(editIdx, "image", v)} placeholder="/assets/products/..." />
          <div className="col-span-2">
            <ListEditorField
              label="Çoklu Görseller"
              value={Array.isArray(p.images) ? p.images : []}
              onChange={(items) => updateProduct(editIdx, "images", items)}
              helper="Bir satıra bir görsel yolu. İlk görsel kapak olur."
              placeholder="assets/product-cutouts/willowtilt.png"
            />
          </div>
          <FormField label="Datasheet URL" value={p.datasheet_url || p.datasheet || ""} onChange={(v) => updateProductFields(editIdx, { datasheet_url: v, datasheet: v })} placeholder="/assets/datasheets/..." />
          <FormField label="Öne Çıkan" type="select" value={p.featured ? "true" : "false"} onChange={(v) => updateProduct(editIdx, "featured", v === "true")} options={[{ value: "true", label: "Evet" }, { value: "false", label: "Hayır" }]} />
          <FormField label="Sitede Göster (Yayında)" type="select" value={p.visible !== false ? "true" : "false"} onChange={(v) => updateProduct(editIdx, "visible", v === "true")} options={[{ value: "true", label: "Evet" }, { value: "false", label: "Hayır" }]} />
          <div className="col-span-2">
            <FormField label="Kısa Açıklama" type="textarea" value={p.shortDescription || ""} onChange={(v) => updateProduct(editIdx, "shortDescription", v)} rows={2} />
          </div>
          <div className="col-span-2">
            <FormField label="Etiketler (virgülle ayırın)" value={(p.chips || []).join(", ")} onChange={(v) => updateProduct(editIdx, "chips", v.split(",").map((s: string) => s.trim()).filter(Boolean))} hint="Ör: IoT, SCADA, Modbus" />
          </div>
          <FormField label="Type" value={p.type || ""} onChange={(v) => updateProduct(editIdx, "type", v)} placeholder="Outdoor IP67 LoRaWAN Tilt Sensor" />
          <FormField label="Battery Life" value={p.batteryLife || p.battery_life || ""} onChange={(v) => updateProductFields(editIdx, { batteryLife: v, battery_life: v })} placeholder="up to 5 years" />
          <FormField label="Communication Range" value={p.communicationRange || p.communication_range || ""} onChange={(v) => updateProductFields(editIdx, { communicationRange: v, communication_range: v })} placeholder="up to 15 km" />
          <div className="col-span-2">
            <IconListEditor
              label="Applications"
              value={Array.isArray(p.applications) ? p.applications : []}
              onChange={(items) => updateProduct(editIdx, "applications", items)}
              inferIcon={applicationIconForText}
              addLabel="Application"
              helper="Ürün detayındaki Applications ikon şeridini yönetir. Sıralama burada belirlenir."
              placeholder="Buildings and Infrastructure"
            />
          </div>
          <div className="col-span-2">
            <IconListEditor
              label="Reported Parameters"
              value={Array.isArray(specifications.reported_parameters) ? specifications.reported_parameters : specifications.reportedParameters || []}
              onChange={(items) => updateSpecificationField("reported_parameters", items)}
              inferIcon={iconKeyForText}
              addLabel="Parameter"
              helper="Ürün detayındaki kompakt Reported Parameters kartını yönetir."
              placeholder="Sensor temperature"
            />
          </div>
          <div className="col-span-2">
            <JsonEditorField
              label="Specifications (JSON)"
              value={specifications}
              onChange={(val) => updateProduct(editIdx, "specifications", val || {})}
              helper={'Object olarak kaydedilir. Örnek: { "protocol": "LoRaWAN 868/915 MHz" }'}
              rows={10}
            />
          </div>
          <div className="col-span-2">
            <DetailBlocksEditor
              value={Array.isArray(p.detailBlocks) ? p.detailBlocks : []}
              onChange={(val) => updateProduct(editIdx, "detailBlocks", val)}
              helper="Ek açıklama blokları, ikonlu card'lar ve liste blokları için kullan."
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Çeviriler</h4>
          <TranslationEditor
            item={p}
            fields={PRODUCT_FIELDS}
            onChange={(locale, key, val) => updateLocalized(editIdx, locale, key, val)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-sm">Ürün Kataloğu</h3>
        <button onClick={addProduct} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold">+ Yeni Ürün</button>
      </div>
      <div className="divide-y divide-gray-100">
        {products.map((p: any, idx: number) => (
          <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-100/40 transition">
            <div>
              <p className="font-bold text-gray-800">{p.title}</p>
              <p className="text-xs text-gray-400">ID: {p.id} • Kategori: {p.category} {p.featured && "• Öne Çıkan"} {p.visible === false ? "• 🔴 Taslak" : "• 🟢 Yayında"}</p>
            </div>
            <button onClick={() => setEditIdx(idx)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition">Düzenle</button>
          </div>
        ))}
      </div>
    </div>
  );
}

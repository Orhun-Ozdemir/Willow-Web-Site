"use client";

import { useState } from "react";
import { type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import TranslationEditor from "./TranslationEditor";

const PRODUCT_FIELDS = [
  { key: "title", label: "Ürün Adı" },
  { key: "category", label: "Kategori" },
  { key: "shortDescription", label: "Kısa Açıklama", type: "textarea" as const },
  { key: "technicalSummary", label: "Teknik Özet", type: "textarea" as const, rows: 4 },
  { key: "useCases", label: "Kullanım Alanları", type: "textarea" as const, rows: 4 },
  { key: "specifications", label: "Teknik Özellikler", type: "textarea" as const, rows: 4 },
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
      products: [...(c.products || []), { id, title: "Yeni Ürün", slug: id, category: "modules", featured: false, shortDescription: "", localized: {} }],
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
          <FormField label="Öne Çıkan" type="select" value={p.featured ? "true" : "false"} onChange={(v) => updateProduct(editIdx, "featured", v === "true")} options={[{ value: "true", label: "Evet" }, { value: "false", label: "Hayır" }]} />
          <div className="col-span-2">
            <FormField label="Kısa Açıklama" type="textarea" value={p.shortDescription || ""} onChange={(v) => updateProduct(editIdx, "shortDescription", v)} rows={2} />
          </div>
          <div className="col-span-2">
            <FormField label="Etiketler (virgülle ayırın)" value={(p.chips || []).join(", ")} onChange={(v) => updateProduct(editIdx, "chips", v.split(",").map((s: string) => s.trim()).filter(Boolean))} hint="Ör: IoT, SCADA, Modbus" />
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
              <p className="text-xs text-gray-400">ID: {p.id} • Kategori: {p.category} {p.featured && "• Öne Çıkan"}</p>
            </div>
            <button onClick={() => setEditIdx(idx)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition">Düzenle</button>
          </div>
        ))}
      </div>
    </div>
  );
}

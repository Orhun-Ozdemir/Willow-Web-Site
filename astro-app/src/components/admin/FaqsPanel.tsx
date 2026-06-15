"use client";

import { useState, useMemo } from "react";
import { type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import TranslationEditor from "./TranslationEditor";

const FAQ_FIELDS = [
  { key: "question", label: "Soru" },
  { key: "answer", label: "Cevap", type: "textarea" as const, rows: 4 },
];

const PAGE_OPTIONS = [
  { value: "home", label: "Ana Sayfa" },
  { value: "products", label: "Ürünler" },
  { value: "solutions", label: "Çözümler" },
  { value: "services", label: "Hizmetler" },
  { value: "company", label: "Hakkımızda" },
  { value: "contact", label: "İletişim" },
  { value: "glossary", label: "Sözlük" },
];

export default function FaqsPanel() {
  const { content, setContent } = useAdmin();
  const [editId, setEditId] = useState<string | null>(null);

  const faqs = useMemo(() => {
    const list = content?.faqs || [];
    return list.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `faq-${idx}`,
    }));
  }, [content?.faqs]);

  const updateFaq = (id: string, key: string, val: any) => {
    setContent((c: any) => {
      const list = (c.faqs || []).map((item: any, idx: number) => {
        const itemId = item.id || `faq-${idx}`;
        if (itemId === id) {
          return { ...item, id: itemId, [key]: val };
        }
        return item;
      });
      return { ...c, faqs: list };
    });
  };

  const updateLocalized = (id: string, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const list = (c.faqs || []).map((item: any, idx: number) => {
        const itemId = item.id || `faq-${idx}`;
        if (itemId === id) {
          const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
          return { ...item, id: itemId, localized };
        }
        return item;
      });
      return { ...c, faqs: list };
    });
  };

  const addFaq = () => {
    const id = `faq-${Date.now()}`;
    setContent((c: any) => ({
      ...c,
      faqs: [...(c.faqs || []), { id, question: "Yeni Soru", answer: "", page: "home", sortOrder: (c.faqs?.length || 0) + 1, localized: {} }],
    }));
    setEditId(id);
  };

  const deleteFaq = (id: string) => {
    if (!confirm("Bu FAQ'u silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const list = (c.faqs || []).filter((item: any, idx: number) => {
        const itemId = item.id || `faq-${idx}`;
        return itemId !== id;
      });
      return { ...c, faqs: list };
    });
    setEditId(null);
  };

  const f = useMemo(() => {
    return faqs.find((item: any) => item.id === editId) || null;
  }, [editId, faqs]);

  if (editId !== null && f) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setEditId(null)} className="ws-back-button">
          ← Listeye Dön
        </button>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="font-bold">FAQ Düzenle</h3>
          <div className="flex gap-2">
            <button onClick={() => deleteFaq(f.id)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Soru" value={f.question || ""} onChange={(v) => updateFaq(f.id, "question", v)} />
          <FormField label="Sayfa" type="select" value={f.page || "home"} onChange={(v) => updateFaq(f.id, "page", v)} options={PAGE_OPTIONS} />
          <FormField label="Sıra" type="number" value={String(f.sortOrder || 0)} onChange={(v) => updateFaq(f.id, "sortOrder", parseInt(v) || 0)} />
          <div />
          <div className="col-span-2">
            <FormField label="Cevap" type="textarea" value={f.answer || ""} onChange={(v) => updateFaq(f.id, "answer", v)} rows={4} />
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Çeviriler</h4>
          <TranslationEditor item={f} fields={FAQ_FIELDS} onChange={(locale, key, val) => updateLocalized(f.id, locale, key, val)} />
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-sm">SSS Yönetimi</h3>
        <button onClick={addFaq} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold">+ Yeni FAQ</button>
      </div>
      <div className="divide-y divide-gray-100">
        {faqs.map((item: any) => (
          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-100/40 transition">
            <div className="min-w-0 flex-1 mr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-[#132175] uppercase">Sayfa: {item.page}</span>
                <span className="text-[10px] text-gray-400">Sıra: {item.sortOrder}</span>
              </div>
              <p className="text-sm font-bold text-gray-800 truncate">{item.question}</p>
            </div>
            <button onClick={() => setEditId(item.id)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition shrink-0">Düzenle</button>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import TranslationEditor from "./TranslationEditor";

// Translatable fields, shown in the TranslationEditor for every locale.
const GLOSSARY_FIELDS = [
  { key: "term", label: "Terim" },
  { key: "definition", label: "Tanım", type: "textarea" as const, rows: 4 },
  { key: "note", label: "Not", type: "textarea" as const, rows: 2 },
];

// The glossary page renders three category sections in this order.
const CATEGORY_OPTIONS = [
  { value: "connectivity", label: "Bağlantı (Connectivity)" },
  { value: "devices", label: "Cihazlar (Devices)" },
  { value: "software", label: "Yazılım (Software)" },
];

export default function GlossaryPanel() {
  const { content, setContent } = useAdmin();
  const [editId, setEditId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const terms = useMemo(() => {
    const list = content?.glossary || [];
    return list.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `glossary-${idx}`,
    }));
  }, [content?.glossary]);

  const updateTerm = (id: string, key: string, val: any) => {
    setContent((c: any) => {
      const list = (c.glossary || []).map((item: any, idx: number) => {
        const itemId = item.id || `glossary-${idx}`;
        if (itemId === id) {
          return { ...item, id: itemId, [key]: val };
        }
        return item;
      });
      return { ...c, glossary: list };
    });
  };

  const updateLocalized = (id: string, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const list = (c.glossary || []).map((item: any, idx: number) => {
        const itemId = item.id || `glossary-${idx}`;
        if (itemId === id) {
          const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
          return { ...item, id: itemId, localized };
        }
        return item;
      });
      return { ...c, glossary: list };
    });
  };

  const addTerm = () => {
    const id = `glossary-${Date.now()}`;
    setContent((c: any) => ({
      ...c,
      glossary: [
        ...(c.glossary || []),
        { id, term: "Yeni Terim", definition: "", note: "", category: "connectivity", sortOrder: (c.glossary?.length || 0) + 1, localized: {} },
      ],
    }));
    setEditId(id);
  };

  const deleteTerm = (id: string) => {
    if (!confirm("Bu terimi silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const list = (c.glossary || []).filter((item: any, idx: number) => {
        const itemId = item.id || `glossary-${idx}`;
        return itemId !== id;
      });
      return { ...c, glossary: list };
    });
    setEditId(null);
  };

  const t = useMemo(() => terms.find((item: any) => item.id === editId) || null, [editId, terms]);

  const categoryLabel = (value: string) => CATEGORY_OPTIONS.find((o) => o.value === value)?.label || value;

  const filtered = terms.filter((item: any) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [item.term, item.definition, item.category].some((v: any) => String(v || "").toLowerCase().includes(q));
  });

  if (editId !== null && t) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setEditId(null)} className="ws-back-button">
          ← Listeye Dön
        </button>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="font-bold">Terim Düzenle</h3>
            <div className="flex gap-2 items-center">
              <a href={`/en/glossary#${t.id}`} target="_blank" rel="noopener" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-semibold">Sitede önizle ↗</a>
              <button onClick={() => deleteTerm(t.id)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Terim" value={t.term || ""} onChange={(v) => updateTerm(t.id, "term", v)} />
            <FormField label="Kategori" type="select" value={t.category || "connectivity"} onChange={(v) => updateTerm(t.id, "category", v)} options={CATEGORY_OPTIONS} />
            <FormField label="Sıra" type="number" value={String(t.sortOrder || 0)} onChange={(v) => updateTerm(t.id, "sortOrder", parseInt(v) || 0)} />
            <div />
            <div className="col-span-2">
              <FormField label="Tanım" type="textarea" value={t.definition || ""} onChange={(v) => updateTerm(t.id, "definition", v)} rows={4} />
            </div>
            <div className="col-span-2">
              <FormField label="Not (opsiyonel — 'WillowSoft uses it in:')" type="textarea" value={t.note || ""} onChange={(v) => updateTerm(t.id, "note", v)} rows={2} />
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Çeviriler</h4>
            <TranslationEditor item={t} fields={GLOSSARY_FIELDS} onChange={(locale, key, val) => updateLocalized(t.id, locale, key, val)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 justify-between items-center">
        <h3 className="font-bold text-sm">Sözlük Yönetimi</h3>
        <div className="flex items-center gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Terim ara…" className="px-3 py-1.5 border border-gray-200 rounded text-xs w-44 focus:outline-none focus:border-[#132175]" />
          <button onClick={addTerm} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold whitespace-nowrap">+ Yeni Terim</button>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {filtered.length === 0 && (
          <div className="p-6 text-sm text-gray-400">{query ? "Eşleşen terim yok." : "Henüz terim yok. “+ Yeni Terim” ile ekleyin."}</div>
        )}
        {filtered.map((item: any) => (
          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-100/40 transition">
            <div className="min-w-0 flex-1 mr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-[#132175] uppercase">{categoryLabel(item.category)}</span>
                <span className="text-[10px] text-gray-400">Sıra: {item.sortOrder}</span>
              </div>
              <p className="text-sm font-bold text-gray-800 truncate">{item.term}</p>
              <p className="text-xs text-gray-500 truncate">{item.definition}</p>
            </div>
            <button onClick={() => setEditId(item.id)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition shrink-0">Düzenle</button>
          </div>
        ))}
      </div>
    </div>
  );
}

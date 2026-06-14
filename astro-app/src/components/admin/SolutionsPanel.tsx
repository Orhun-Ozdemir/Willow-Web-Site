"use client";

import { useState, useMemo } from "react";
import { type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import TranslationEditor from "./TranslationEditor";

const SOLUTION_FIELDS = [
  { key: "title", label: "Başlık" },
  { key: "category", label: "Kategori" },
  { key: "headline", label: "Başlık Satırı" },
  { key: "summary", label: "Özet", type: "textarea" as const },
  { key: "bullets", label: "Madde İşaretleri (satır başına 1)", type: "textarea" as const, rows: 5 },
];

export default function SolutionsPanel() {
  const { content, setContent } = useAdmin();
  const [editId, setEditId] = useState<string | null>(null);

  const solutions = useMemo(() => {
    const list = content?.solutions || [];
    return list.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `solution-${idx}`,
    }));
  }, [content?.solutions]);

  const updateSolution = (id: string, key: string, val: any) => {
    setContent((c: any) => {
      const list = (c.solutions || []).map((item: any, idx: number) => {
        const itemId = item.id || `solution-${idx}`;
        if (itemId === id) {
          return { ...item, id: itemId, [key]: val };
        }
        return item;
      });
      return { ...c, solutions: list };
    });
  };

  const updateLocalized = (id: string, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const list = (c.solutions || []).map((item: any, idx: number) => {
        const itemId = item.id || `solution-${idx}`;
        if (itemId === id) {
          const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
          return { ...item, id: itemId, localized };
        }
        return item;
      });
      return { ...c, solutions: list };
    });
  };

  const addSolution = () => {
    const id = `solution-${Date.now()}`;
    setContent((c: any) => ({
      ...c,
      solutions: [...(c.solutions || []), { id, title: "Yeni Çözüm", slug: id, category: "", featured: false, headline: "", summary: "", bullets: "", localized: {} }],
    }));
    setEditId(id);
  };

  const deleteSolution = (id: string) => {
    if (!confirm("Bu çözümü silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const list = (c.solutions || []).filter((item: any, idx: number) => {
        const itemId = item.id || `solution-${idx}`;
        return itemId !== id;
      });
      return { ...c, solutions: list };
    });
    setEditId(null);
  };

  const s = useMemo(() => {
    return solutions.find((item: any) => item.id === editId) || null;
  }, [editId, solutions]);

  if (editId !== null && s) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setEditId(null)} className="ws-back-button">
          ← Listeye Dön
        </button>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="font-bold">Çözüm Düzenle: {s.title}</h3>
          <div className="flex gap-2">
            <button onClick={() => deleteSolution(s.id)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Başlık" value={s.title || ""} onChange={(v) => updateSolution(s.id, "title", v)} />
          <FormField label="Slug" value={s.slug || ""} onChange={(v) => updateSolution(s.id, "slug", v)} />
          <FormField label="Kategori" value={s.category || ""} onChange={(v) => updateSolution(s.id, "category", v)} />
          <FormField label="Öne Çıkan" type="select" value={s.featured ? "true" : "false"} onChange={(v) => updateSolution(s.id, "featured", v === "true")} options={[{ value: "true", label: "Evet" }, { value: "false", label: "Hayır" }]} />
          <FormField label="Görsel" value={s.image || ""} onChange={(v) => updateSolution(s.id, "image", v)} placeholder="/assets/solutions/..." />
          <FormField label="Sıra" type="number" value={String(s.sortOrder || 0)} onChange={(v) => updateSolution(s.id, "sortOrder", parseInt(v) || 0)} />
          <div className="col-span-2">
            <FormField label="Başlık Satırı" value={s.headline || ""} onChange={(v) => updateSolution(s.id, "headline", v)} />
          </div>
          <div className="col-span-2">
            <FormField label="Özet" type="textarea" value={s.summary || ""} onChange={(v) => updateSolution(s.id, "summary", v)} rows={3} />
          </div>
          <div className="col-span-2">
            <FormField
              label="Madde İşaretleri (satır başına 1)"
              type="textarea"
              value={Array.isArray(s.bullets) ? s.bullets.join("\n") : (s.bullets || "")}
              onChange={(v) => updateSolution(s.id, "bullets", v)}
              rows={5}
              hint="Her satıra bir madde yazın. Çeviriler sekmesinden diğer dillere çevrilebilir."
            />
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Çeviriler</h4>
          <TranslationEditor item={s} fields={SOLUTION_FIELDS} onChange={(locale, key, val) => updateLocalized(s.id, locale, key, val)} />
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-sm">Çözümler</h3>
        <button onClick={addSolution} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold">+ Yeni Çözüm</button>
      </div>
      <div className="divide-y divide-gray-100">
        {solutions.map((item: any) => (
          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-100/40 transition">
            <div>
              <p className="font-bold text-gray-800">{item.title}</p>
              <p className="text-xs text-gray-400">Slug: {item.slug} • Kategori: {item.category || "—"} {item.featured && "• Öne Çıkan"}</p>
            </div>
            <button onClick={() => setEditId(item.id)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition">Düzenle</button>
          </div>
        ))}
        {solutions.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">Henüz çözüm eklenmemiş.</div>
        )}
      </div>
    </div>
  );
}

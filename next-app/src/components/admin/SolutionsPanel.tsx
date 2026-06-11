"use client";

import { useState } from "react";
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
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const solutions = content?.solutions || [];

  const updateSolution = (idx: number, key: string, val: any) => {
    setContent((c: any) => {
      const list = [...c.solutions];
      list[idx] = { ...list[idx], [key]: val };
      return { ...c, solutions: list };
    });
  };

  const updateLocalized = (idx: number, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const list = [...c.solutions];
      const item = { ...list[idx] };
      const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
      list[idx] = { ...item, localized };
      return { ...c, solutions: list };
    });
  };

  const addSolution = () => {
    const id = `solution-${Date.now()}`;
    setContent((c: any) => ({
      ...c,
      solutions: [...(c.solutions || []), { id, title: "Yeni Çözüm", slug: id, category: "", featured: false, headline: "", summary: "", localized: {} }],
    }));
    setEditIdx(solutions.length);
  };

  const deleteSolution = (idx: number) => {
    if (!confirm("Bu çözümü silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => ({ ...c, solutions: c.solutions.filter((_: any, i: number) => i !== idx) }));
    setEditIdx(null);
  };

  if (editIdx !== null && solutions[editIdx]) {
    const s = solutions[editIdx];
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="font-bold">Çözüm Düzenle: {s.title}</h3>
          <div className="flex gap-2">
            <button onClick={() => deleteSolution(editIdx)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
            <button onClick={() => setEditIdx(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold">Listeye Dön</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Başlık" value={s.title || ""} onChange={(v) => updateSolution(editIdx, "title", v)} />
          <FormField label="Slug" value={s.slug || ""} onChange={(v) => updateSolution(editIdx, "slug", v)} />
          <FormField label="Kategori" value={s.category || ""} onChange={(v) => updateSolution(editIdx, "category", v)} />
          <FormField label="Öne Çıkan" type="select" value={s.featured ? "true" : "false"} onChange={(v) => updateSolution(editIdx, "featured", v === "true")} options={[{ value: "true", label: "Evet" }, { value: "false", label: "Hayır" }]} />
          <FormField label="Görsel" value={s.image || ""} onChange={(v) => updateSolution(editIdx, "image", v)} placeholder="/assets/solutions/..." />
          <FormField label="Sıra" type="number" value={String(s.sortOrder || 0)} onChange={(v) => updateSolution(editIdx, "sortOrder", parseInt(v) || 0)} />
          <div className="col-span-2">
            <FormField label="Başlık Satırı" value={s.headline || ""} onChange={(v) => updateSolution(editIdx, "headline", v)} />
          </div>
          <div className="col-span-2">
            <FormField label="Özet" type="textarea" value={s.summary || ""} onChange={(v) => updateSolution(editIdx, "summary", v)} rows={3} />
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Çeviriler</h4>
          <TranslationEditor item={s} fields={SOLUTION_FIELDS} onChange={(locale, key, val) => updateLocalized(editIdx, locale, key, val)} />
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
        {solutions.map((s: any, idx: number) => (
          <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-100/40 transition">
            <div>
              <p className="font-bold text-gray-800">{s.title}</p>
              <p className="text-xs text-gray-400">Slug: {s.slug} • Kategori: {s.category || "—"} {s.featured && "• Öne Çıkan"}</p>
            </div>
            <button onClick={() => setEditIdx(idx)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition">Düzenle</button>
          </div>
        ))}
        {solutions.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">Henüz çözüm eklenmemiş.</div>
        )}
      </div>
    </div>
  );
}

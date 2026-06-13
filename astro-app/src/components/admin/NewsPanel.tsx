"use client";

import { useState } from "react";
import { type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import TranslationEditor from "./TranslationEditor";

const NEWS_FIELDS = [
  { key: "title", label: "Başlık" },
  { key: "category", label: "Kategori" },
  { key: "excerpt", label: "Özet", type: "textarea" as const },
  { key: "content", label: "İçerik", type: "textarea" as const, rows: 6 },
];

export default function NewsPanel() {
  const { content, setContent } = useAdmin();
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const news = content?.news || [];

  const updateNews = (idx: number, key: string, val: any) => {
    setContent((c: any) => {
      const list = [...c.news];
      list[idx] = { ...list[idx], [key]: val };
      return { ...c, news: list };
    });
  };

  const updateLocalized = (idx: number, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const list = [...c.news];
      const item = { ...list[idx] };
      const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
      list[idx] = { ...item, localized };
      return { ...c, news: list };
    });
  };

  const addNews = () => {
    const id = `news-${Date.now()}`;
    setContent((c: any) => ({
      ...c,
      news: [...(c.news || []), { id, title: "Yeni Haber", slug: id, date: new Date().toISOString().slice(0, 10), excerpt: "", localized: {} }],
    }));
    setEditIdx(news.length);
  };

  const deleteNews = (idx: number) => {
    if (!confirm("Bu haberi silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => ({ ...c, news: c.news.filter((_: any, i: number) => i !== idx) }));
    setEditIdx(null);
  };

  if (editIdx !== null && news[editIdx]) {
    const n = news[editIdx];
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="font-bold">Haber Düzenle: {n.title}</h3>
          <div className="flex gap-2">
            <button onClick={() => deleteNews(editIdx)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
            <button onClick={() => setEditIdx(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold">Listeye Dön</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Başlık" value={n.title || ""} onChange={(v) => updateNews(editIdx, "title", v)} />
          <FormField label="Slug" value={n.slug || ""} onChange={(v) => updateNews(editIdx, "slug", v)} />
          <FormField label="Tarih" type="date" value={n.date || ""} onChange={(v) => updateNews(editIdx, "date", v)} />
          <FormField label="Kategori" value={n.category || ""} onChange={(v) => updateNews(editIdx, "category", v)} placeholder="case-study, update..." />
          <FormField label="Görsel Yolu" type="image" value={n.image || ""} onChange={(v) => updateNews(editIdx, "image", v)} placeholder="assets/news/..." />
          <div />
          <div className="col-span-2">
            <FormField label="Özet" type="textarea" value={n.excerpt || ""} onChange={(v) => updateNews(editIdx, "excerpt", v)} rows={2} />
          </div>
          <div className="col-span-2">
            <FormField label="İçerik (HTML)" type="textarea" value={n.content || ""} onChange={(v) => updateNews(editIdx, "content", v)} rows={6} />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Çeviriler</h4>
          <TranslationEditor
            item={n}
            fields={NEWS_FIELDS}
            onChange={(locale, key, val) => updateLocalized(editIdx, locale, key, val)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-sm">Haberler</h3>
        <button onClick={addNews} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold">+ Yeni Haber</button>
      </div>
      <div className="divide-y divide-gray-100">
        {news.map((n: any, idx: number) => (
          <div key={n.id} className="p-4 flex items-center justify-between hover:bg-gray-100/40 transition">
            <div>
              <p className="font-bold text-gray-800">{n.title}</p>
              <p className="text-xs text-gray-400">Tarih: {n.date} • Slug: {n.slug}</p>
            </div>
            <button onClick={() => setEditIdx(idx)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded transition">Düzenle</button>
          </div>
        ))}
      </div>
    </div>
  );
}

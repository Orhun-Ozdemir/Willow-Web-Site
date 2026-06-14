"use client";

import { useState, useMemo } from "react";
import { type Locale } from "@/lib/cms";
import { useAdmin } from "./AdminContext";
import FormField from "./FormField";
import TranslationEditor from "./TranslationEditor";

const CLIENT_FIELDS = [
  { key: "name", label: "İsim" },
  { key: "industry", label: "Sektör" },
  { key: "country", label: "Ülke" },
];

export default function ClientsPanel() {
  const { content, setContent } = useAdmin();
  const [editId, setEditId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const clients = useMemo(() => {
    const list = content?.clients || [];
    return list.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `client-${idx}`,
    }));
  }, [content?.clients]);

  const updateClient = (id: string, key: string, val: any) => {
    setContent((c: any) => {
      const list = (c.clients || []).map((item: any, idx: number) => {
        const itemId = item.id || `client-${idx}`;
        if (itemId === id) {
          return { ...item, id: itemId, [key]: val };
        }
        return item;
      });
      return { ...c, clients: list };
    });
  };

  const updateLocalized = (id: string, locale: Locale, fieldKey: string, value: string) => {
    setContent((c: any) => {
      const list = (c.clients || []).map((item: any, idx: number) => {
        const itemId = item.id || `client-${idx}`;
        if (itemId === id) {
          const localized = { ...item.localized, [locale]: { ...(item.localized?.[locale] || {}), [fieldKey]: value } };
          return { ...item, id: itemId, localized };
        }
        return item;
      });
      return { ...c, clients: list };
    });
  };

  const addClient = () => {
    const id = `client-${Date.now()}`;
    setContent((c: any) => ({
      ...c,
      clients: [...(c.clients || []), { id, name: "Yeni Müşteri", industry: "", logo: "", localized: {} }],
    }));
    setEditId(id);
  };

  const deleteClient = (id: string) => {
    if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return;
    setContent((c: any) => {
      const list = (c.clients || []).filter((item: any, idx: number) => {
        const itemId = item.id || `client-${idx}`;
        return itemId !== id;
      });
      return { ...c, clients: list };
    });
    setEditId(null);
  };

  const cl = useMemo(() => {
    return clients.find((item: any) => item.id === editId) || null;
  }, [editId, clients]);

  if (editId !== null && cl) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setEditId(null)} className="ws-back-button">
          ← Listeye Dön
        </button>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h3 className="font-bold">Müşteri Düzenle: {cl.name}</h3>
          <div className="flex gap-2">
            <button onClick={() => deleteClient(cl.id)} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 rounded text-xs font-semibold">Sil</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="İsim" value={cl.name || ""} onChange={(v) => updateClient(cl.id, "name", v)} />
          <FormField label="Sektör" value={cl.industry || ""} onChange={(v) => updateClient(cl.id, "industry", v)} />
          <FormField label="Logo Yolu" value={cl.logo || ""} onChange={(v) => updateClient(cl.id, "logo", v)} placeholder="/assets/clients/..." />
          <FormField label="Ülke" value={cl.country || ""} onChange={(v) => updateClient(cl.id, "country", v)} />
        </div>
        {cl.logo && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 overflow-hidden">
              <img src={cl.logo} alt={cl.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
            <span className="text-xs text-gray-500">{cl.logo}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Çeviriler</h4>
          <TranslationEditor item={cl} fields={CLIENT_FIELDS} onChange={(locale, key, val) => updateLocalized(cl.id, locale, key, val)} />
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm">Müşteriler</h3>
        <button onClick={addClient} className="px-3 py-1.5 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold">+ Yeni Müşteri</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {clients.map((item: any) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center hover:border-gray-300 transition cursor-pointer" onClick={() => setEditId(item.id)}>
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
              {item.logo && !imgErrors.has(item.id) ? (
                <img
                  src={item.logo}
                  alt={item.name}
                  className="w-full h-full object-contain p-2"
                  onError={() => setImgErrors((prev) => new Set(prev).add(item.id))}
                />
              ) : (
                <span className="text-2xl font-bold text-gray-400">{item.name?.[0] || "?"}</span>
              )}
            </div>
            <p className="font-bold text-sm text-gray-800">{item.name}</p>
            <p className="text-[10px] text-gray-400">{item.industry || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

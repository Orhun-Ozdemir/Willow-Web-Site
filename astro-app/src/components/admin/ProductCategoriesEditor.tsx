"use client";

import { useMemo, useState } from "react";
import { type Locale } from "@/lib/cms";
import { normalizeProductCategories, type ProductCategory } from "@/lib/product-categories";
import TranslationEditor from "./TranslationEditor";
import { useAdmin } from "./AdminContext";

const CATEGORY_FIELDS = [
  { key: "title", label: "Kategori Adı" },
  { key: "description", label: "Kısa Açıklama", type: "textarea" as const, rows: 3 },
];

export default function ProductCategoriesEditor() {
  const { content, setContent } = useAdmin();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const categories = useMemo(
    () => normalizeProductCategories(content?.meta?.productCategories),
    [content?.meta?.productCategories],
  );

  const store = (next: ProductCategory[], productUpdater?: (products: any[]) => any[]) => {
    setContent((current: any) => ({
      ...current,
      products: productUpdater ? productUpdater(current.products || []) : current.products,
      meta: {
        ...(current.meta || {}),
        productCategories: next.map((item, index) => ({ ...item, sortOrder: (index + 1) * 10 })),
      },
    }));
  };

  const update = (key: string, fields: Partial<ProductCategory>) => {
    store(categories.map((item) => item.key === key ? { ...item, ...fields } : item));
  };

  const updateLocalized = (key: string, locale: Locale, field: string, value: string) => {
    store(categories.map((item) => item.key === key ? {
      ...item,
      localized: {
        ...(item.localized || {}),
        [locale]: { ...(item.localized?.[locale] || {}), [field]: value },
      },
    } : item));
  };

  const addCategory = () => {
    let suffix = categories.length + 1;
    let key = `category-${suffix}`;
    while (categories.some((item) => item.key === key)) key = `category-${++suffix}`;
    const next: ProductCategory = {
      key,
      sortOrder: (categories.length + 1) * 10,
      visible: true,
      localized: {
        en: { title: "New category", description: "" },
        tr: { title: "Yeni kategori", description: "" },
      },
    };
    store([...categories, next]);
    setOpenKey(key);
  };

  const renameKey = (oldKey: string, rawKey: string) => {
    const nextKey = rawKey.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    if (!nextKey || nextKey === oldKey || categories.some((item) => item.key === nextKey)) return;
    store(
      categories.map((item) => item.key === oldKey ? { ...item, key: nextKey } : item),
      (products) => products.map((product) => product.category === oldKey ? { ...product, category: nextKey } : product),
    );
    setOpenKey(nextKey);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    store(next);
  };

  const remove = (key: string) => {
    const used = (content?.products || []).filter((product: any) => product.category === key).length;
    if (used > 0) {
      window.alert(`Bu kategori ${used} ürün tarafından kullanılıyor. Önce ürünleri başka kategoriye taşıyın.`);
      return;
    }
    if (!window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    store(categories.filter((item) => item.key !== key));
    setOpenKey(null);
  };

  return (
    <section className="rounded-2xl border border-[#132175]/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-black text-[#132175]">Ürün kategorileri</h4>
          <p className="mt-1 text-xs text-gray-500">Filtre adı, açıklama, sıra, görünürlük ve sekiz dil tek kaynaktan yönetilir.</p>
        </div>
        <button type="button" onClick={addCategory} className="ws-primary-button">+ Kategori Ekle</button>
      </div>

      <div className="mt-4 space-y-2">
        {categories.map((item, index) => {
          const title = item.localized?.tr?.title || item.localized?.en?.title || item.key;
          const usage = (content?.products || []).filter((product: any) => product.category === item.key).length;
          const open = openKey === item.key;
          return (
            <article key={item.key} className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                <button type="button" onClick={() => setOpenKey(open ? null : item.key)} className="min-w-0 flex-1 text-left">
                  <strong className="block truncate text-sm text-gray-900">{title}</strong>
                  <span className="text-[11px] text-gray-500">{item.key} · {usage} ürün</span>
                </button>
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded border bg-white px-2 py-1 text-xs disabled:opacity-30" aria-label="Yukarı taşı">↑</button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === categories.length - 1} className="rounded border bg-white px-2 py-1 text-xs disabled:opacity-30" aria-label="Aşağı taşı">↓</button>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <input type="checkbox" checked={item.visible !== false} onChange={(event) => update(item.key, { visible: event.target.checked })} />
                  Görünür
                </label>
                <button type="button" onClick={() => remove(item.key)} className="rounded border border-red-200 bg-white px-2 py-1 text-xs font-bold text-red-600">Sil</button>
              </div>

              {open && (
                <div className="border-t border-gray-200 bg-white p-4">
                  <label className="mb-3 block text-xs font-bold text-gray-600">
                    Teknik anahtar
                    <input
                      key={item.key}
                      defaultValue={item.key}
                      onBlur={(event) => renameKey(item.key, event.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-200 p-2 font-mono text-xs"
                    />
                  </label>
                  <TranslationEditor
                    item={item}
                    fields={CATEGORY_FIELDS}
                    onChange={(locale, field, value) => updateLocalized(item.key, locale, field, value)}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

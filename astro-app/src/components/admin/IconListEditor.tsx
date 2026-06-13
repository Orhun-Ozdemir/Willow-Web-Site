"use client";

import { useEffect, useRef, useState } from "react";
import { normalizeProductIconItems, type ProductIconItem } from "@/lib/product-model";
import FormField from "./FormField";
import IconPicker from "./IconPicker";

interface IconListEditorProps {
  label: string;
  value: any[];
  onChange: (value: ProductIconItem[]) => void;
  inferIcon: (label: string) => string;
  addLabel?: string;
  helper?: string;
  placeholder?: string;
}

function createItem(index: number, inferIcon: (label: string) => string): ProductIconItem {
  const label = "";
  return {
    id: `item-${Date.now()}-${index}`,
    label,
    icon: inferIcon(label) || "check",
    description: "",
    visible: true,
  };
}

export default function IconListEditor({
  label,
  value,
  onChange,
  inferIcon,
  addLabel = "Item",
  helper,
  placeholder = "Application area",
}: IconListEditorProps) {
  const [items, setItems] = useState<ProductIconItem[]>(() => normalizeProductIconItems(value, inferIcon, { includeHidden: true }));
  const internalChange = useRef(false);

  useEffect(() => {
    if (internalChange.current) {
      internalChange.current = false;
      return;
    }
    setItems(normalizeProductIconItems(value, inferIcon, { includeHidden: true }));
  }, [value, inferIcon]);

  const commit = (next: ProductIconItem[]) => {
    internalChange.current = true;
    setItems(next);
    onChange(
      next
        .map((item, index) => ({
          id: item.id || `item-${index + 1}`,
          label: String(item.label || "").trim(),
          icon: item.icon || inferIcon(item.label || "") || "check",
          description: String(item.description || "").trim(),
          visible: item.visible !== false,
        }))
        .filter((item) => item.label),
    );
  };

  const setItem = (idx: number, patch: Partial<ProductIconItem>) => {
    commit(items.map((item, index) => (index === idx ? { ...item, ...patch } : item)));
  };

  const moveItem = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    commit(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500">{label}</label>
          {helper && <p className="text-[10px] text-gray-400 mt-1">{helper}</p>}
        </div>
        <button
          type="button"
          onClick={() => commit([...items, createItem(items.length, inferIcon)])}
          className="px-2.5 py-1 rounded bg-[#132175] text-white text-[10px] font-bold"
        >
          + {addLabel}
        </button>
      </div>

      {items.length === 0 && (
        <div className="p-3 rounded border border-dashed border-gray-200 text-sm text-gray-400">
          Henüz kayıt yok. Yeni bir öğe ekleyip ikon seçebilirsin.
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-gray-500">{addLabel} {idx + 1}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => moveItem(idx, -1)} className="px-2 py-1 rounded bg-white border border-gray-200 text-[10px] font-bold">Up</button>
                <button type="button" onClick={() => moveItem(idx, 1)} className="px-2 py-1 rounded bg-white border border-gray-200 text-[10px] font-bold">Down</button>
                <button type="button" onClick={() => commit(items.filter((_, index) => index !== idx))} className="px-2 py-1 rounded bg-red-50 border border-red-200 text-[10px] font-bold text-red-700">Sil</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Label"
                value={item.label || ""}
                onChange={(nextLabel) => {
                  const shouldInfer = !item.icon || item.icon === "check";
                  setItem(idx, { label: nextLabel, icon: shouldInfer ? inferIcon(nextLabel) : item.icon });
                }}
                placeholder={placeholder}
              />
              <div className="space-y-1">
                <IconPicker
                  value={item.icon || inferIcon(item.label || "") || "check"}
                  onChange={(icon) => setItem(idx, { icon })}
                />
                <button
                  type="button"
                  onClick={() => setItem(idx, { icon: inferIcon(item.label || "") || "check" })}
                  className="text-[10px] font-bold text-[#132175] hover:underline"
                >
                  Metne göre otomatik seç
                </button>
              </div>
              <div className="col-span-2">
                <FormField
                  label="Description (optional)"
                  value={item.description || ""}
                  onChange={(description) => setItem(idx, { description })}
                  placeholder="Optional short description"
                />
              </div>
              <FormField
                label="Visible"
                type="select"
                value={item.visible === false ? "false" : "true"}
                onChange={(visible) => setItem(idx, { visible: visible === "true" })}
                options={[
                  { value: "true", label: "Evet" },
                  { value: "false", label: "Hayır" },
                ]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

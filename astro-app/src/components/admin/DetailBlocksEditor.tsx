"use client";

import { useEffect, useState } from "react";
import FormField from "./FormField";
import ListEditorField from "./ListEditorField";
import { type ProductDetailBlock } from "@/lib/product-model";
import IconPicker from "./IconPicker";

interface DetailBlocksEditorProps {
  value: ProductDetailBlock[];
  onChange: (value: ProductDetailBlock[]) => void;
  helper?: string;
}

const BLOCK_TYPES = [
  { value: "note", label: "Note" },
  { value: "list", label: "List" },
  { value: "cards", label: "Cards" },
  { value: "rich", label: "Rich HTML" },
];

function createBlock(index: number): ProductDetailBlock {
  return {
    id: `block-${Date.now()}-${index}`,
    type: "note",
    title: "",
    icon: "stack",
    body: "",
    items: [],
    kicker: "",
    visible: true,
  };
}

export default function DetailBlocksEditor({ value, onChange, helper }: DetailBlocksEditorProps) {
  const [blocks, setBlocks] = useState<ProductDetailBlock[]>(value || []);

  useEffect(() => {
    setBlocks(value || []);
  }, [value]);

  const update = (next: ProductDetailBlock[]) => {
    setBlocks(next);
    onChange(next);
  };

  const setBlock = (idx: number, patch: Partial<ProductDetailBlock>) => {
    update(blocks.map((block, i) => (i === idx ? { ...block, ...patch } : block)));
  };

  const moveBlock = (idx: number, direction: -1 | 1) => {
    const next = [...blocks];
    const target = idx + direction;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    update(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase text-gray-500">Detail Blocks</label>
        <button
          type="button"
          onClick={() => update([...blocks, createBlock(blocks.length)])}
          className="px-2.5 py-1 rounded bg-[#132175] text-white text-[10px] font-bold"
        >
          + Block
        </button>
      </div>

      {blocks.length === 0 && (
        <div className="p-3 rounded border border-dashed border-gray-200 text-sm text-gray-400">
          Henüz block yok. İstersen bu alanı ürün sayfasında ek bir info / card / list alanı olarak kullanabilirsin.
        </div>
      )}

      <div className="space-y-4">
        {blocks.map((block, idx) => (
          <div key={block.id || idx} className="rounded-xl border border-gray-200 p-3 bg-gray-50/60 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Block {idx + 1}</span>
                <span className="text-[10px] text-gray-400">{block.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => moveBlock(idx, -1)} className="px-2 py-1 rounded bg-white border border-gray-200 text-[10px] font-bold">↑</button>
                <button type="button" onClick={() => moveBlock(idx, 1)} className="px-2 py-1 rounded bg-white border border-gray-200 text-[10px] font-bold">↓</button>
                <button type="button" onClick={() => update(blocks.filter((_, i) => i !== idx))} className="px-2 py-1 rounded bg-red-50 border border-red-200 text-[10px] font-bold text-red-700">Sil</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Type"
                type="select"
                value={block.type}
                onChange={(v) => setBlock(idx, { type: v as ProductDetailBlock["type"] })}
                options={BLOCK_TYPES}
              />
              <IconPicker value={block.icon || "stack"} onChange={(icon) => setBlock(idx, { icon })} />
              <FormField
                label="Title"
                value={block.title || ""}
                onChange={(v) => setBlock(idx, { title: v })}
                placeholder="Reported Parameters"
              />
              <FormField
                label="Kicker"
                value={block.kicker || ""}
                onChange={(v) => setBlock(idx, { kicker: v })}
                placeholder="Optional small label"
              />
              <div className="col-span-2">
                <FormField
                  label="Body"
                  type="textarea"
                  value={block.body || ""}
                  onChange={(v) => setBlock(idx, { body: v })}
                  rows={3}
                  placeholder="Use this block to add explanatory text..."
                />
              </div>
              {block.type !== "rich" ? (
                <div className="col-span-2">
                  <ListEditorField
                    label="Items"
                    value={block.items || []}
                    onChange={(items) => setBlock(idx, { items })}
                    helper="Bir satıra bir öğe gir."
                    placeholder="Acceleration on X, Y, Z axes"
                  />
                </div>
              ) : null}
              <FormField
                label="Visible"
                type="select"
                value={block.visible === false ? "false" : "true"}
                onChange={(v) => setBlock(idx, { visible: v === "true" })}
                options={[
                  { value: "true", label: "Evet" },
                  { value: "false", label: "Hayır" },
                ]}
              />
            </div>
          </div>
        ))}
      </div>

      {helper && <p className="text-[10px] text-gray-400">{helper}</p>}
    </div>
  );
}

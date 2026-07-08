"use client";

import { useState, useRef, useEffect } from "react";
import { productIconOptions } from "@/lib/product-model";

interface IconPickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
}

export default function IconPicker({ label = "İkon", value = "check", onChange }: IconPickerProps) {
  const options = productIconOptions();
  const selected = options.find((o) => o.value === value) || options.find((o) => o.value === "check") || options[0];
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()) || o.value.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{label}</label>}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 w-full p-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-[#132175]/40 transition text-left"
      >
        <span
          className="w-8 h-8 shrink-0 grid place-items-center rounded-md bg-white border border-gray-200 text-[#132175]"
          dangerouslySetInnerHTML={{ __html: selected?.svg || "" }}
          aria-hidden="true"
        />
        <span className="flex-1 text-sm text-gray-700 font-medium">{selected?.label || value}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl p-3 space-y-2" role="listbox" aria-label="İkon seçimi">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İkon ara..."
            autoFocus
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#1aa3c4] bg-gray-50"
          />

          <div className="grid grid-cols-5 gap-1.5 max-h-64 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={o.value === value}
                aria-label={o.label}
                onClick={() => handleSelect(o.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition ${
                  o.value === value
                    ? "border-[#132175] bg-[#132175]/8 text-[#132175]"
                    : "border-transparent hover:border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <span
                  className="w-6 h-6 grid place-items-center"
                  dangerouslySetInnerHTML={{ __html: o.svg || "" }}
                  aria-hidden="true"
                />
                <span className="text-[9px] font-medium text-center leading-tight truncate w-full">{o.label}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-5 text-xs text-gray-400 text-center py-4">Sonuç bulunamadı</p>
            )}
          </div>

          <p className="text-[10px] text-gray-300 text-center">
            {options.length} ikon mevcut · Yeni ikon eklemek için geliştirici gerekir
          </p>
        </div>
      )}
    </div>
  );
}

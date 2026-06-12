"use client";

import { productIconOptions } from "@/lib/product-model";

interface IconPickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
}

export default function IconPicker({ label = "Icon", value = "check", onChange }: IconPickerProps) {
  const options = productIconOptions();
  const selected = options.find((option) => option.value === value) || options.find((option) => option.value === "check") || options[0];

  return (
    <div>
      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#132175]/15 bg-white text-[#132175]"
          dangerouslySetInnerHTML={{ __html: selected?.svg || "" }}
        />
        <select
          value={selected?.value || "check"}
          onChange={(event) => onChange(event.target.value)}
          className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 outline-none focus:border-[#1aa3c4]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

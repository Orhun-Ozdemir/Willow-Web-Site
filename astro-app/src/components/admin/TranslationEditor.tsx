"use client";

import { useState } from "react";
import { locales, type Locale } from "@/lib/cms";
import LocaleTabs from "./LocaleTabs";

interface TranslationField {
  key: string;
  label: string;
  type?: "text" | "textarea";
  rows?: number;
}

interface TranslationEditorProps {
  item: any;
  fields: TranslationField[];
  sourceLang?: Locale;
  onChange: (locale: Locale, fieldKey: string, value: string) => void;
}

function fieldValueToText(value: any) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return item.label || item.name || item.title || "";
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return String(value);
}

export default function TranslationEditor({ item, fields, sourceLang = "en", onChange }: TranslationEditorProps) {
  const [activeLang, setActiveLang] = useState<Locale>(sourceLang);

  const filledMap: Record<string, boolean> = {};
  for (const loc of locales) {
    const locData = item?.localized?.[loc];
    filledMap[loc] = locData ? fields.some((f) => fieldValueToText(locData[f.key]).trim().length > 0) : false;
  }

  const sourceData = item?.localized?.[sourceLang] || {};
  const targetData = item?.localized?.[activeLang] || {};

  return (
    <div className="space-y-3">
      <LocaleTabs active={activeLang} onChange={setActiveLang} filledMap={filledMap} />

      {activeLang === sourceLang ? (
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea
                  value={fieldValueToText(sourceData[f.key])}
                  onChange={(e) => onChange(sourceLang, f.key, e.target.value)}
                  rows={f.rows || 3}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 outline-none focus:border-[#1aa3c4]"
                />
              ) : (
                <input
                  type="text"
                  value={fieldValueToText(sourceData[f.key])}
                  onChange={(e) => onChange(sourceLang, f.key, e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 outline-none focus:border-[#1aa3c4]"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.key} className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                  {f.label} ({sourceLang.toUpperCase()} — kaynak)
                </label>
                <div className="p-2 bg-gray-50 border border-gray-200/50 rounded text-gray-400 text-sm min-h-[38px]">
                  {fieldValueToText(sourceData[f.key]) || "—"}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#132175]/70 mb-1">
                  {f.label} ({activeLang.toUpperCase()} — çeviri)
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    value={fieldValueToText(targetData[f.key])}
                    onChange={(e) => onChange(activeLang, f.key, e.target.value)}
                    rows={f.rows || 3}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 outline-none focus:border-[#1aa3c4]"
                  />
                ) : (
                  <input
                    type="text"
                    value={fieldValueToText(targetData[f.key])}
                    onChange={(e) => onChange(activeLang, f.key, e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 outline-none focus:border-[#1aa3c4]"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

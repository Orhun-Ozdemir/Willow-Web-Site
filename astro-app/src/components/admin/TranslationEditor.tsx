"use client";

import { useState } from "react";
import { locales, type Locale } from "@/lib/cms";
import LocaleTabs from "./LocaleTabs";

interface TranslationField {
  key: string;
  label: string;
  type?: "text" | "textarea" | "array-items";
  rows?: number;
  /** For type="array-items": the top-level field on `item` that holds the source array */
  sourceArrayKey?: string;
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

function ArrayItemsField({
  field, item, sourceLang, activeLang, sourceData, targetData, onChange,
}: {
  field: TranslationField; item: any; sourceLang: Locale; activeLang: Locale;
  sourceData: any; targetData: any; onChange: (locale: Locale, key: string, value: string) => void;
}) {
  const sourceArray: any[] = Array.isArray(item[field.sourceArrayKey!]) ? item[field.sourceArrayKey!] : [];
  const translatedArray: string[] = (() => {
    const v = activeLang === sourceLang ? sourceData[field.key] : targetData[field.key];
    if (Array.isArray(v)) return v.map(String);
    if (typeof v === "string" && v) return v.split("\n");
    return [];
  })();

  const updateItem = (idx: number, val: string) => {
    const next = [...translatedArray];
    while (next.length <= idx) next.push("");
    next[idx] = val;
    onChange(activeLang, field.key, next.join("\n"));
  };

  if (sourceArray.length === 0) {
    return (
      <div className="p-2 bg-gray-50 border border-gray-200 rounded text-gray-400 text-xs">
        Önce "Uygulamalar & Parametreler" bölümünden öğe ekleyin.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sourceArray.map((srcItem: any, idx: number) => {
        const srcLabel = typeof srcItem === "string" ? srcItem : (srcItem?.label || srcItem?.name || "");
        return (
          <div key={idx} className={activeLang === sourceLang ? "" : "grid grid-cols-2 gap-2 items-center"}>
            {activeLang !== sourceLang && (
              <div className="p-2 bg-gray-50 border border-gray-200/50 rounded text-gray-400 text-xs truncate" title={srcLabel}>
                {srcLabel || "—"}
              </div>
            )}
            <input
              type="text"
              value={activeLang === sourceLang ? srcLabel : (translatedArray[idx] || "")}
              onChange={(e) => updateItem(idx, e.target.value)}
              readOnly={activeLang === sourceLang}
              placeholder={activeLang === sourceLang ? "" : `${srcLabel} (${activeLang.toUpperCase()})`}
              className={`w-full p-2 border rounded text-sm outline-none focus:border-[#1aa3c4] ${activeLang === sourceLang ? "bg-gray-50 border-gray-200/50 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-800"}`}
            />
          </div>
        );
      })}
    </div>
  );
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

      <div className="space-y-3">
        {fields.map((f) => {
          if (f.type === "array-items") {
            return (
              <div key={f.key}>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  {f.label}
                  {activeLang !== sourceLang && (
                    <span className="ml-2 text-[#132175]/60 normal-case font-normal">
                      ({sourceLang.toUpperCase()} → {activeLang.toUpperCase()})
                    </span>
                  )}
                </label>
                <ArrayItemsField
                  field={f} item={item} sourceLang={sourceLang} activeLang={activeLang}
                  sourceData={sourceData} targetData={targetData} onChange={onChange}
                />
              </div>
            );
          }

          if (activeLang === sourceLang) {
            return (
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
            );
          }

          return (
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
          );
        })}
      </div>
    </div>
  );
}

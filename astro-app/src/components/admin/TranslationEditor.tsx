"use client";

import { useState } from "react";
import { locales, type Locale } from "@/lib/cms";
import LocaleTabs from "./LocaleTabs";

function TextPreview({ text }: { text: string }) {
  if (!text.trim()) return <p className="text-gray-300 italic text-sm">Boş</p>;

  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let bulletBuf: string[] = [];

  const flushBullets = () => {
    if (bulletBuf.length === 0) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="list-disc list-inside space-y-0.5 text-sm text-gray-700 my-1">
        {bulletBuf.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    );
    bulletBuf = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^[-•*]\s+/.test(line)) {
      bulletBuf.push(line.replace(/^[-•*]\s+/, ""));
    } else if (line.trim() === "") {
      flushBullets();
      nodes.push(<div key={`br-${i}`} className="h-2" />);
    } else {
      flushBullets();
      nodes.push(<p key={`p-${i}`} className="text-sm text-gray-700 leading-relaxed">{line}</p>);
    }
  }
  flushBullets();
  return <div className="space-y-0.5">{nodes}</div>;
}

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

function isEmpty(value: any): boolean {
  return fieldValueToText(value).trim().length === 0;
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
        const isMissing = activeLang !== sourceLang && !translatedArray[idx]?.trim();
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
              className={`w-full p-2 border rounded text-sm outline-none focus:border-[#1aa3c4] ${
                activeLang === sourceLang
                  ? "bg-gray-50 border-gray-200/50 text-gray-400"
                  : isMissing
                    ? "bg-red-50 border-red-300 text-gray-800"
                    : "bg-gray-50 border-gray-200 text-gray-800"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

function TextareaWithPreview({
  value, onChange: onChangeProp, rows, placeholder, className, readOnly,
}: {
  value: string; onChange?: (v: string) => void; rows?: number;
  placeholder?: string; className?: string; readOnly?: boolean;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <div>
      <div className="flex gap-1 mb-1">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${!preview ? "bg-[#132175] text-white" : "bg-gray-100 text-gray-400 hover:text-gray-600"}`}
        >Düzenle</button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${preview ? "bg-[#132175] text-white" : "bg-gray-100 text-gray-400 hover:text-gray-600"}`}
        >Önizle</button>
      </div>
      {preview ? (
        <div className={`min-h-[${(rows || 3) * 24}px] p-2 border border-gray-200 rounded bg-white`}>
          <TextPreview text={value} />
        </div>
      ) : readOnly ? (
        <div className={`p-2 border rounded text-sm min-h-[38px] whitespace-pre-wrap ${className}`}>{value || <span className="italic text-gray-300">Boş</span>}</div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChangeProp?.(e.target.value)}
          rows={rows || 3}
          placeholder={placeholder}
          className={className}
        />
      )}
    </div>
  );
}

export default function TranslationEditor({ item, fields, sourceLang = "en", onChange }: TranslationEditorProps) {
  const [activeLang, setActiveLang] = useState<Locale>(sourceLang);

  // Count missing fields per locale (excluding source lang)
  const missingCountMap: Record<string, number> = {};
  const filledMap: Record<string, boolean> = {};
  for (const loc of locales) {
    const locData = item?.localized?.[loc] || {};
    if (loc === sourceLang) {
      filledMap[loc] = fields.some((f) => fieldValueToText(locData[f.key]).trim().length > 0);
      missingCountMap[loc] = 0;
    } else {
      const missing = fields.filter((f) => isEmpty(locData[f.key])).length;
      missingCountMap[loc] = missing;
      filledMap[loc] = missing < fields.length;
    }
  }

  const sourceData = item?.localized?.[sourceLang] || {};
  const targetData = item?.localized?.[activeLang] || {};

  const totalMissing = activeLang !== sourceLang
    ? fields.filter((f) => isEmpty(targetData[f.key])).length
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <LocaleTabs active={activeLang} onChange={setActiveLang} filledMap={filledMap} missingCountMap={missingCountMap} />
        {totalMissing > 0 && (
          <span className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 rounded px-2 py-0.5">
            {totalMissing} alan eksik
          </span>
        )}
      </div>

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

          const isMissing = activeLang !== sourceLang && isEmpty(targetData[f.key]);
          const inputCls = `w-full p-2 border rounded text-sm text-gray-800 outline-none focus:border-[#1aa3c4] ${
            isMissing ? "bg-red-50 border-red-300" : "bg-gray-50 border-gray-200"
          }`;

          if (activeLang === sourceLang) {
            return (
              <div key={f.key}>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{f.label}</label>
                {f.type === "textarea" ? (
                  <TextareaWithPreview
                    value={fieldValueToText(sourceData[f.key])}
                    onChange={(v) => onChange(sourceLang, f.key, v)}
                    rows={f.rows || 3}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 outline-none focus:border-[#1aa3c4]"
                  />
                ) : (
                  <input
                    type="text"
                    value={fieldValueToText(sourceData[f.key])}
                    onChange={(e) => onChange(sourceLang, f.key, e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-800 outline-none focus:border-[#1aa3c4]"
                  />
                )}
              </div>
            );
          }

          return (
            <div key={f.key} className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                  {f.label} <span className="normal-case font-normal text-gray-300">({sourceLang.toUpperCase()} kaynak)</span>
                </label>
                {f.type === "textarea" ? (
                  <TextareaWithPreview
                    value={fieldValueToText(sourceData[f.key])}
                    rows={f.rows || 3}
                    readOnly
                    className="bg-gray-50 border-gray-200/50 text-gray-400"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 border border-gray-200/50 rounded text-gray-400 text-sm min-h-[38px] whitespace-pre-wrap">
                    {fieldValueToText(sourceData[f.key]) || <span className="italic text-gray-300">Boş</span>}
                  </div>
                )}
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase mb-1 ${isMissing ? "text-red-500" : "text-[#132175]/70"}`}>
                  {f.label} <span className="normal-case font-normal">({activeLang.toUpperCase()} çeviri{isMissing ? " — EKSİK" : ""})</span>
                </label>
                {f.type === "textarea" ? (
                  <TextareaWithPreview
                    value={fieldValueToText(targetData[f.key])}
                    onChange={(v) => onChange(activeLang, f.key, v)}
                    rows={f.rows || 3}
                    placeholder={`${sourceLang.toUpperCase()} dilinden çevirin...`}
                    className={inputCls}
                  />
                ) : (
                  <input
                    type="text"
                    value={fieldValueToText(targetData[f.key])}
                    onChange={(e) => onChange(activeLang, f.key, e.target.value)}
                    className={inputCls}
                    placeholder={`${sourceLang.toUpperCase()} dilinden çevirin...`}
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

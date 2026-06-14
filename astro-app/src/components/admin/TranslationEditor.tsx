"use client";

import { useState, useEffect } from "react";
import { locales, type Locale } from "@/lib/cms";
import VisualHtmlEditor from "./VisualHtmlEditor";

// ── Locale display info ───────────────────────────────────────────────────────
const LOCALE_INFO: Record<string, { flag: string; name: string }> = {
  en: { flag: "🇬🇧", name: "English" },
  tr: { flag: "🇹🇷", name: "Türkçe" },
  de: { flag: "🇩🇪", name: "Deutsch" },
  fr: { flag: "🇫🇷", name: "Français" },
  es: { flag: "🇪🇸", name: "Español" },
  it: { flag: "🇮🇹", name: "Italiano" },
  ar: { flag: "🇸🇦", name: "العربية" },
  ja: { flag: "🇯🇵", name: "日本語" },
};

interface TranslationField {
  key: string;
  label: string;
  type?: "text" | "textarea" | "array-items" | "richtext";
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function fieldValueToText(value: any): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((it) => {
        if (typeof it === "string") return it;
        if (it && typeof it === "object") return it.label || it.name || it.title || "";
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return String(value);
}

const cellKey = (fieldKey: string, loc: string) => `${fieldKey}::${loc}`;

export default function TranslationEditor({ item, fields, sourceLang = "en", onChange }: TranslationEditorProps) {
  const targetLocales = locales.filter((l) => l !== sourceLang);

  // suggestions[fieldKey::loc] = translated text awaiting accept/reject
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busyAll, setBusyAll] = useState(false);

  // Reset transient state when switching to a different item
  useEffect(() => {
    setSuggestions({});
    setTranslating(new Set());
    setExpanded(new Set());
    setError(null);
  }, [item?.id]);

  // ── Value getters ──
  const sourceText = (field: TranslationField): string => {
    const loc = item?.localized?.[sourceLang]?.[field.key];
    return fieldValueToText(loc != null && loc !== "" ? loc : item?.[field.key]);
  };
  const targetText = (field: TranslationField, loc: Locale): string =>
    fieldValueToText(item?.localized?.[loc]?.[field.key]);

  const fmtFor = (field: TranslationField): "text" | "html" =>
    field.type === "richtext" ? "html" : "text";

  // ── Status ──
  const isFilled = (field: TranslationField, loc: Locale) => targetText(field, loc).trim().length > 0;
  const fieldFilledCount = (field: TranslationField) =>
    targetLocales.filter((l) => isFilled(field, l)).length;

  const totalCells = fields.length * targetLocales.length;
  const filledCells = fields.reduce((acc, f) => acc + fieldFilledCount(f), 0);
  const pendingCount = Object.keys(suggestions).length;

  // ── Translate calls ──
  async function callTranslate(text: string, langs: string[], format: "text" | "html") {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLangs: langs, format }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Çeviri başarısız");
    return data as { translations: Record<string, string>; errors?: string[] };
  }

  async function translateField(field: TranslationField, onlyLoc?: Locale) {
    const src = sourceText(field);
    if (!src.trim()) return;
    const langs = (onlyLoc ? [onlyLoc] : targetLocales).filter(
      (l) => !isFilled(field, l) && !suggestions[cellKey(field.key, l)]
    );
    if (langs.length === 0) return;

    setError(null);
    setTranslating((prev) => new Set([...prev, ...langs.map((l) => cellKey(field.key, l))]));
    try {
      const { translations, errors } = await callTranslate(src, langs, fmtFor(field));
      setSuggestions((prev) => {
        const next = { ...prev };
        for (const [loc, val] of Object.entries(translations)) next[cellKey(field.key, loc)] = val;
        return next;
      });
      if (errors?.length) setError(errors.join(", "));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTranslating((prev) => {
        const n = new Set(prev);
        langs.forEach((l) => n.delete(cellKey(field.key, l)));
        return n;
      });
    }
  }

  async function translateAll() {
    setBusyAll(true);
    setError(null);
    try {
      for (const field of fields) {
        // expand fields that receive suggestions so user can review
        await translateField(field);
      }
      setExpanded((prev) => {
        const n = new Set(prev);
        fields.forEach((f) => {
          if (targetLocales.some((l) => suggestions[cellKey(f.key, l)] || !isFilled(f, l))) n.add(f.key);
        });
        return n;
      });
    } finally {
      setBusyAll(false);
    }
  }

  // ── Suggestion actions ──
  const accept = (field: TranslationField, loc: Locale) => {
    const key = cellKey(field.key, loc);
    const val = suggestions[key];
    if (val == null) return;
    onChange(loc, field.key, val);
    setSuggestions((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };
  const reject = (field: TranslationField, loc: Locale) => {
    setSuggestions((prev) => {
      const n = { ...prev };
      delete n[cellKey(field.key, loc)];
      return n;
    });
  };
  const acceptAllPending = () => {
    Object.entries(suggestions).forEach(([key, val]) => {
      const [fieldKey, loc] = key.split("::");
      onChange(loc as Locale, fieldKey, val);
    });
    setSuggestions({});
  };

  const toggleExpand = (fieldKey: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(fieldKey) ? n.delete(fieldKey) : n.add(fieldKey);
      return n;
    });

  const hasAnySource = fields.some((f) => sourceText(f).trim().length > 0);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f5f3ff] border border-gray-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={translateAll}
            disabled={busyAll || !hasAnySource}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1aa3c4] to-[#0e8aaa] text-white text-xs font-bold rounded-lg shadow-sm shadow-[#1aa3c4]/20 disabled:opacity-50 transition"
            title={hasAnySource ? "" : "Önce İngilizce alanları doldurun"}
          >
            {busyAll ? <><span className="animate-spin">⟳</span> Çevriliyor…</> : <>🌍 Tümünü Otomatik Çevir</>}
          </button>
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={acceptAllPending}
              className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg"
            >
              ✓ {pendingCount} öneriyi onayla
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all"
              style={{ width: `${totalCells ? Math.round((filledCells / totalCells) * 100) : 0}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-gray-500 tabular-nums">{filledCells}/{totalCells}</span>
        </div>
      </div>

      {error && (
        <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}

      {/* Fields */}
      <div className="space-y-2">
        {fields.map((field) => {
          const src = sourceText(field);
          const filled = fieldFilledCount(field);
          const isOpen = expanded.has(field.key);
          const fieldPending = targetLocales.some((l) => suggestions[cellKey(field.key, l)]);

          return (
            <div
              key={field.key}
              className={`bg-white border rounded-xl overflow-hidden ${fieldPending ? "border-blue-200" : "border-gray-200"}`}
            >
              {/* Source row */}
              <div className="px-4 pt-3 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">{field.label}</label>
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">
                    {LOCALE_INFO[sourceLang]?.flag} Kaynak
                  </span>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 min-h-[36px] whitespace-pre-wrap break-words">
                  {field.type === "richtext" && src
                    ? <span dangerouslySetInnerHTML={{ __html: src }} />
                    : (src || <span className="italic text-gray-300">İngilizce metin boş</span>)}
                </div>
              </div>

              {/* Collapsed summary / expand toggle */}
              <button
                type="button"
                onClick={() => toggleExpand(field.key)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2 border-t border-gray-100 hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
                  <span className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>▸</span>
                  {targetLocales.length} dil
                </span>
                <span className="flex items-center gap-1">
                  {targetLocales.map((l) => {
                    const has = isFilled(field, l);
                    const sug = !!suggestions[cellKey(field.key, l)];
                    return (
                      <span
                        key={l}
                        title={`${LOCALE_INFO[l]?.name}${has ? " ✓" : sug ? " (öneri)" : " (boş)"}`}
                        className={`text-xs leading-none ${has ? "opacity-100" : sug ? "opacity-100" : "opacity-30 grayscale"}`}
                        style={sug && !has ? { filter: "none" } : undefined}
                      >
                        {LOCALE_INFO[l]?.flag}
                        {sug && !has ? <span className="text-[8px] text-blue-500 align-super">✨</span> : ""}
                      </span>
                    );
                  })}
                  <span className={`ml-1 text-[10px] font-bold ${filled === targetLocales.length ? "text-green-500" : filled > 0 ? "text-amber-500" : "text-red-400"}`}>
                    {filled}/{targetLocales.length}
                  </span>
                </span>
              </button>

              {/* Expanded: per-locale editors */}
              {isOpen && (
                <div className="px-4 pb-3 pt-1 space-y-2 border-t border-gray-100 bg-gray-50/40">
                  {targetLocales.map((loc) => {
                    const info = LOCALE_INFO[loc] ?? { flag: "🌐", name: loc };
                    const val = targetText(field, loc);
                    const sug = suggestions[cellKey(field.key, loc)];
                    const isBusy = translating.has(cellKey(field.key, loc));
                    const filledHere = val.trim().length > 0;

                    return (
                      <div key={loc} className="pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1.5 text-[11px] font-bold">
                            <span className="text-sm leading-none">{info.flag}</span>
                            <span className={filledHere ? "text-green-700" : sug ? "text-blue-700" : "text-amber-700"}>{info.name}</span>
                            {filledHere && <span className="text-[9px] text-green-600">✓</span>}
                            {!filledHere && !sug && <span className="text-[9px] text-amber-500 font-bold">BOŞ</span>}
                          </span>
                          {!filledHere && !sug && src.trim() && (
                            <button
                              type="button"
                              onClick={() => translateField(field, loc)}
                              disabled={isBusy}
                              className="text-[10px] font-bold px-2 py-0.5 bg-amber-400 text-white rounded disabled:opacity-50 flex items-center gap-1"
                            >
                              {isBusy ? <span className="animate-spin">⟳</span> : "✨"} Çevir
                            </button>
                          )}
                        </div>

                        {/* Suggestion box */}
                        {sug && (
                          <div className="mb-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-start justify-between gap-3">
                            <p className="text-xs text-blue-800 italic flex-1 whitespace-pre-wrap break-words">«{sug}»</p>
                            <div className="flex gap-1.5 shrink-0">
                              <button type="button" onClick={() => accept(field, loc)} className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded">✓ Kabul</button>
                              <button type="button" onClick={() => reject(field, loc)} className="text-[10px] font-bold px-2 py-0.5 bg-white border border-blue-300 text-blue-600 rounded">✗</button>
                            </div>
                          </div>
                        )}

                        {/* Editable input */}
                        {field.type === "richtext" ? (
                          <VisualHtmlEditor
                            value={val}
                            onChange={(v) => onChange(loc, field.key, v)}
                            placeholder={`${info.name} çevirisi...`}
                          />
                        ) : field.type === "textarea" || field.type === "array-items" ? (
                          <textarea
                            value={val}
                            onChange={(e) => onChange(loc, field.key, e.target.value)}
                            rows={field.rows || (field.type === "array-items" ? 4 : 3)}
                            dir={loc === "ar" ? "rtl" : "ltr"}
                            placeholder={field.type === "array-items" ? "Her satır bir öğe..." : `${info.name} çevirisi...`}
                            className={`w-full p-2.5 border rounded-lg text-sm text-gray-800 outline-none resize-none transition ${
                              filledHere ? "bg-white border-green-200 focus:border-[#1aa3c4]" : "bg-white border-amber-200 focus:border-[#1aa3c4]"
                            }`}
                          />
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => onChange(loc, field.key, e.target.value)}
                            dir={loc === "ar" ? "rtl" : "ltr"}
                            placeholder={`${info.name} çevirisi...`}
                            className={`w-full p-2.5 border rounded-lg text-sm text-gray-800 outline-none transition ${
                              filledHere ? "bg-white border-green-200 focus:border-[#1aa3c4]" : "bg-white border-amber-200 focus:border-[#1aa3c4]"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

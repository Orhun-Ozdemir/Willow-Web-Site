"use client";

import { useEffect, useState } from "react";
import { locales, type Locale } from "@/lib/cms";
import VisualHtmlEditor from "./VisualHtmlEditor";
import {
  LOCALE_INFO,
  SOURCE_LANG,
  TARGET_LOCALES,
  StatusDot,
  fieldTranslationStatus,
  localeInputClass,
} from "./localeEditorShared";

interface TranslationField {
  key: string;
  label: string;
  type?: "text" | "textarea" | "array-items" | "richtext";
  rows?: number;
  hint?: string;
  sourceArrayKey?: string;
}

interface TranslationEditorProps {
  item: any;
  fields: TranslationField[];
  sourceLang?: Locale;
  onChange: (locale: Locale, fieldKey: string, value: string) => void;
  /** Tek alan seçili mod — chip navigasyonu gizlenir */
  singleField?: string;
}

function fieldValueToText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((it) => {
        if (typeof it === "string") return it;
        if (it && typeof it === "object") return (it as Record<string, string>).label || (it as Record<string, string>).name || (it as Record<string, string>).title || "";
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return String(value);
}

/** item.localized[loc][key] veya pageContent tarzı item[key][loc] */
function readLocalizedField(item: any, fieldKey: string, loc: Locale): string {
  const nested = item?.localized?.[loc]?.[fieldKey];
  if (nested != null && nested !== "") return fieldValueToText(nested);

  const raw = item?.[fieldKey];
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const map = raw as Record<string, unknown>;
    if (typeof map[loc] === "string") return fieldValueToText(map[loc]);
    if (loc === SOURCE_LANG && typeof map.en === "string") return map.en;
  }
  if (typeof raw === "string") return loc === SOURCE_LANG ? raw : "";
  return "";
}

export default function TranslationEditor({
  item,
  fields,
  sourceLang = SOURCE_LANG,
  onChange,
  singleField,
}: TranslationEditorProps) {
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(
    singleField ?? fields[0]?.key ?? null,
  );
  const [translating, setTranslating] = useState<Set<string>>(new Set());
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [busyAll, setBusyAll] = useState(false);

  useEffect(() => {
    setTranslateError(null);
    if (singleField) {
      setActiveFieldKey(singleField);
    } else if (fields.length && !fields.some((f) => f.key === activeFieldKey)) {
      setActiveFieldKey(fields[0].key);
    }
  }, [item?.id, singleField, fields, activeFieldKey]);

  const sourceText = (field: TranslationField): string =>
    readLocalizedField(item, field.key, sourceLang);

  const targetText = (field: TranslationField, loc: Locale): string =>
    readLocalizedField(item, field.key, loc);

  const fmtFor = (field: TranslationField): "text" | "html" =>
    field.type === "richtext" ? "html" : "text";

  const totalCells = fields.length * TARGET_LOCALES.length;
  const filledCells = fields.reduce(
    (acc, f) => acc + TARGET_LOCALES.filter((l) => targetText(f, l).trim()).length,
    0,
  );

  async function callTranslate(text: string, langs: string[], format: "text" | "html") {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLangs: langs, format }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Çeviri başarısız");
    return data as { translations: Record<string, string> };
  }

  async function translateField(field: TranslationField, onlyLoc?: Locale) {
    const src = sourceText(field);
    if (!src.trim()) return;
    const langs = (onlyLoc ? [onlyLoc] : TARGET_LOCALES).filter(
      (l) => !targetText(field, l).trim(),
    );
    if (langs.length === 0) return;

    setTranslateError(null);
    setTranslating((prev) => new Set([...prev, ...langs.map((l) => `${field.key}::${l}`)]));
    try {
      const { translations } = await callTranslate(src, langs, fmtFor(field));
      for (const [lang, text] of Object.entries(translations)) {
        if (typeof text === "string" && text.trim()) {
          onChange(lang as Locale, field.key, text);
        }
      }
    } catch (e: unknown) {
      setTranslateError(e instanceof Error ? e.message : "Çeviri başarısız");
    } finally {
      setTranslating((prev) => {
        const next = new Set(prev);
        langs.forEach((l) => next.delete(`${field.key}::${l}`));
        return next;
      });
    }
  }

  async function translateAllFields() {
    setBusyAll(true);
    setTranslateError(null);
    try {
      for (const field of fields) {
        if (sourceText(field).trim()) {
          await translateField(field);
        }
      }
    } finally {
      setBusyAll(false);
    }
  }

  const visibleFields = singleField
    ? fields.filter((f) => f.key === singleField)
    : activeFieldKey
      ? fields.filter((f) => f.key === activeFieldKey)
      : fields;

  const hasAnySource = fields.some((f) => sourceText(f).trim().length > 0);
  const emptyFieldCount = fields.filter((f) => {
    const src = sourceText(f);
    if (!src.trim()) return false;
    return TARGET_LOCALES.some((l) => !targetText(f, l).trim());
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#132175]/10 bg-[#f0f4ff] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {emptyFieldCount > 0 && hasAnySource && (
            <button
              type="button"
              onClick={() => void translateAllFields()}
              disabled={busyAll || translating.size > 0}
              className="ws-pc-translate-btn"
            >
              {busyAll ? "Çevriliyor…" : `✨ Tüm Alanları Çevir (${emptyFieldCount})`}
            </button>
          )}
          {translateError && (
            <span className="text-[10px] font-medium text-red-600">{translateError}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-green-400 transition-all"
              style={{ width: `${totalCells ? Math.round((filledCells / totalCells) * 100) : 0}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold tabular-nums text-gray-500">
            {filledCells}/{totalCells}
          </span>
        </div>
      </div>

      {!singleField && fields.length > 1 && (
        <div className="ws-pc-field-chips">
          {fields.map((field) => {
            const status = fieldTranslationStatus((loc) =>
              loc === SOURCE_LANG ? sourceText(field) : targetText(field, loc),
            );
            return (
              <button
                key={field.key}
                type="button"
                onClick={() => setActiveFieldKey(field.key)}
                className={`ws-pc-field-chip ${activeFieldKey === field.key ? "is-active" : ""}`}
              >
                <span>{field.label}</span>
                <StatusDot status={status} />
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-4">
        {visibleFields.map((field) => {
          const src = sourceText(field);
          const emptyTargetCount = TARGET_LOCALES.filter((l) => !targetText(field, l).trim()).length;
          const fieldBusy = TARGET_LOCALES.some((l) => translating.has(`${field.key}::${l}`));

          return (
            <div key={field.key} className="ws-pc-editor">
              <div className="ws-pc-editor-head">
                <div>
                  <p className="ws-pc-editor-title">{field.label}</p>
                  {field.hint && <p className="ws-pc-editor-hint">{field.hint}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {emptyTargetCount > 0 && src.trim() && (
                    <button
                      type="button"
                      onClick={() => void translateField(field)}
                      disabled={fieldBusy || busyAll}
                      className="ws-pc-translate-btn"
                    >
                      {fieldBusy ? "Çevriliyor…" : `✨ Tümünü Çevir (${emptyTargetCount})`}
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {locales.map((loc) => {
                  const info = LOCALE_INFO[loc] ?? { flag: "🌐", name: loc };
                  const isSource = loc === sourceLang;
                  const val = isSource ? src : targetText(field, loc);
                  const isTranslating = translating.has(`${field.key}::${loc}`);
                  const isFilled = !!val.trim();
                  const inputClass = localeInputClass(isSource, isFilled);

                  return (
                    <div key={loc} className={`px-5 py-3 ${isSource ? "bg-[#f0f4ff]" : ""}`}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span>{info.flag}</span>
                          <span className="text-[11px] font-bold">{info.name}</span>
                          {isSource && <span className="ws-pc-source-badge">KAYNAK</span>}
                        </div>
                        {!isSource && !val.trim() && src.trim() && (
                          <button
                            type="button"
                            onClick={() => void translateField(field, loc)}
                            disabled={isTranslating || busyAll}
                            className="ws-pc-translate-one"
                          >
                            {isTranslating ? "…" : "✨ Çevir"}
                          </button>
                        )}
                      </div>

                      {isSource ? (
                        <div className={`min-h-[40px] whitespace-pre-wrap break-words rounded-lg border px-3 py-2.5 text-sm ${inputClass}`}>
                          {field.type === "richtext" && val ? (
                            <span dangerouslySetInnerHTML={{ __html: val }} />
                          ) : (
                            val || <span className="italic text-gray-400">Kaynak metin boş</span>
                          )}
                        </div>
                      ) : field.type === "richtext" ? (
                        <VisualHtmlEditor
                          value={val}
                          onChange={(v) => onChange(loc, field.key, v)}
                          placeholder={`${info.name} çevirisi…`}
                        />
                      ) : field.type === "textarea" || field.type === "array-items" ? (
                        <textarea
                          value={val}
                          onChange={(e) => onChange(loc, field.key, e.target.value)}
                          rows={field.rows || (field.type === "array-items" ? 4 : 3)}
                          dir={loc === "ar" ? "rtl" : "ltr"}
                          placeholder={
                            field.type === "array-items"
                              ? "Her satır bir öğe…"
                              : `${info.name} çevirisi…`
                          }
                          className={`w-full resize-none rounded-lg border p-2.5 text-sm outline-none focus:border-[#1aa3c4] ${inputClass}`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => onChange(loc, field.key, e.target.value)}
                          dir={loc === "ar" ? "rtl" : "ltr"}
                          placeholder={`${info.name} çevirisi…`}
                          className={`w-full rounded-lg border p-2.5 text-sm outline-none focus:border-[#1aa3c4] ${inputClass}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

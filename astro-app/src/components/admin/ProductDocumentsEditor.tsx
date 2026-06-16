"use client";

import { useRef, useState } from "react";
import { locales } from "@/lib/cms";
import {
  LOCALE_NATIVE_NAMES,
  PRODUCT_DOCUMENT_TYPES,
  productDocumentTypeLabel,
  type ProductDocument,
} from "@/lib/product-model";

interface ProductDocumentsEditorProps {
  value: ProductDocument[];
  onChange: (docs: ProductDocument[]) => void;
  /** Used as the storage subfolder so each product's PDFs stay grouped. */
  productId: string;
}

async function uploadPdf(file: File, productId: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", `datasheets/${productId || "misc"}`);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || "PDF yüklenemedi.");
  return data.url as string;
}

function fileNameFromUrl(url: string): string {
  try {
    return decodeURIComponent(url.split("/").pop() || url);
  } catch {
    return url;
  }
}

export default function ProductDocumentsEditor({ value, onChange, productId }: ProductDocumentsEditorProps) {
  const docs: ProductDocument[] = Array.isArray(value) ? value : [];
  // key = `${docId}:${locale}` while a PDF is uploading
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const update = (next: ProductDocument[]) => onChange(next);

  const addDoc = () => {
    const id = `doc-${Date.now()}`;
    update([...docs, { id, type: "datasheet", files: {} }]);
  };

  const removeDoc = (id: string) => {
    update(docs.filter((d) => d.id !== id));
  };

  const setDocType = (id: string, type: string) => {
    update(docs.map((d) => (d.id === id ? { ...d, type: type as ProductDocument["type"] } : d)));
  };

  const addLanguage = (id: string, locale: string) => {
    if (!locale) return;
    update(docs.map((d) => (d.id === id ? { ...d, files: { ...d.files, [locale]: d.files[locale] || "" } } : d)));
  };

  const removeLanguage = (id: string, locale: string) => {
    update(
      docs.map((d) => {
        if (d.id !== id) return d;
        const files = { ...d.files };
        delete files[locale];
        return { ...d, files };
      }),
    );
  };

  const setFile = (id: string, locale: string, url: string) => {
    update(docs.map((d) => (d.id === id ? { ...d, files: { ...d.files, [locale]: url } } : d)));
  };

  const handleUpload = async (id: string, locale: string, file: File | undefined) => {
    if (!file) return;
    const key = `${id}:${locale}`;
    setUploading((u) => ({ ...u, [key]: true }));
    setError("");
    try {
      const url = await uploadPdf(file, productId);
      setFile(id, locale, url);
    } catch (err: any) {
      setError(err?.message || "Yükleme sırasında hata oluştu.");
    } finally {
      setUploading((u) => ({ ...u, [key]: false }));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#6b7280" }}>
          Dökümanlar (tür + dil)
        </label>
      </div>
      <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#9ca3af" }}>
        Her döküman türü için ayrı dillerde PDF yükleyin. Detay sayfasında ziyaretçi dilini seçip indirebilir; sadece
        yüklediğiniz diller görünür.
      </p>

      {docs.length === 0 && (
        <div style={{ padding: "14px 16px", background: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: 8, fontSize: 13, color: "#9ca3af", marginBottom: 12 }}>
          Henüz döküman eklenmemiş.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {docs.map((doc) => {
          const usedLocales = Object.keys(doc.files);
          const remaining = locales.filter((l) => !usedLocales.includes(l));
          return (
            <div key={doc.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <select
                  value={doc.type}
                  onChange={(e) => setDocType(doc.id, e.target.value)}
                  style={{ flex: 1, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#f9fafb", fontWeight: 600 }}
                >
                  {PRODUCT_DOCUMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {productDocumentTypeLabel(t, "tr")}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeDoc(doc.id)}
                  style={{ padding: "8px 12px", border: "1px solid #fecaca", color: "#b91c1c", background: "#fff", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                >
                  Dökümanı sil
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {usedLocales.length === 0 && (
                  <p style={{ margin: 0, fontSize: 12.5, color: "#9ca3af" }}>Aşağıdan bir dil ekleyin.</p>
                )}
                {usedLocales.map((loc) => {
                  const key = `${doc.id}:${loc}`;
                  const url = doc.files[loc];
                  const isUploading = uploading[key];
                  return (
                    <div key={loc} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#f9fafb", borderRadius: 8 }}>
                      <span style={{ width: 84, fontSize: 12.5, fontWeight: 700, color: "#374151" }}>
                        {LOCALE_NATIVE_NAMES[loc] || loc} <span style={{ color: "#9ca3af", textTransform: "uppercase" }}>({loc})</span>
                      </span>
                      <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: url ? "#16a34a" : "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {isUploading ? "Yükleniyor…" : url ? `📄 ${fileNameFromUrl(url)}` : "PDF yok"}
                      </div>
                      <input
                        ref={(el) => { inputs.current[key] = el; }}
                        type="file"
                        accept="application/pdf"
                        style={{ display: "none" }}
                        onChange={(e) => { handleUpload(doc.id, loc, e.target.files?.[0]); e.target.value = ""; }}
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => inputs.current[key]?.click()}
                        style={{ padding: "6px 12px", border: "1px solid #d1d5db", background: "#fff", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      >
                        {url ? "Değiştir" : "PDF yükle"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLanguage(doc.id, loc)}
                        style={{ padding: "6px 10px", border: "none", background: "transparent", color: "#9ca3af", fontSize: 16, lineHeight: 1, cursor: "pointer" }}
                        aria-label={`${loc} dilini kaldır`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              {remaining.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <select
                    value=""
                    onChange={(e) => { addLanguage(doc.id, e.target.value); e.target.value = ""; }}
                    style={{ padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12.5, color: "#374151", background: "#fff" }}
                  >
                    <option value="">+ Dil ekle…</option>
                    {remaining.map((l) => (
                      <option key={l} value={l}>
                        {LOCALE_NATIVE_NAMES[l] || l} ({l})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p style={{ margin: "10px 0 0", color: "#b91c1c", fontSize: 12.5 }}>{error}</p>}

      <button
        type="button"
        onClick={addDoc}
        style={{ marginTop: 12, padding: "9px 16px", border: "1px solid #c7d2fe", background: "#eef2ff", color: "#3730a3", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
      >
        + Döküman ekle
      </button>
    </div>
  );
}

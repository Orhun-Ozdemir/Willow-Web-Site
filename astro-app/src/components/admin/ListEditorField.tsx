"use client";

import { useState } from "react";

interface ListEditorFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  featuredValue?: string;
  featuredLabel?: string;
  onMakeFeatured?: (value: string) => void;
  helper?: string;
  placeholder?: string;
  rows?: number;
}

function getPreviewUrl(val: string) {
  if (!val) return "";
  if (/^(https?:)?\/\//i.test(val) || val.startsWith("data:")) return val;
  const base = (typeof import.meta !== "undefined" ? import.meta.env?.BASE_URL : "/") || "/";
  return `${base.replace(/\/+$/, "")}/${val.replace(/^\/+/, "")}`;
}

async function uploadFile(file: File): Promise<string> {
  const urlRes = await fetch(
    `/api/upload-url?folder=uploads&filename=${encodeURIComponent(file.name)}`
  );
  const urlData = await urlRes.json();
  if (!urlRes.ok || !urlData.ok) throw new Error(urlData.error || "İmzalı URL alınamadı.");

  const putRes = await fetch(urlData.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!putRes.ok) throw new Error("Dosya yüklenemedi.");

  return urlData.publicUrl as string;
}

export default function ListEditorField({
  label,
  value,
  onChange,
  featuredValue,
  featuredLabel = "Kapak",
  onMakeFeatured,
  helper,
  placeholder,
}: ListEditorFieldProps) {
  const [manualPath, setManualPath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const items: string[] = Array.isArray(value) ? value : [];

  const addPath = () => {
    const trimmed = manualPath.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    if (onMakeFeatured && !featuredValue) onMakeFeatured(trimmed);
    setManualPath("");
  };

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadFile(file);
      if (!items.includes(url)) onChange([...items, url]);
      if (onMakeFeatured && !featuredValue) onMakeFeatured(url);
    } catch (err: any) {
      setUploadError(err.message || "Hata oluştu.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="ws-gallery-field">
      <div className="ws-gallery-field-head">
        <label>{label}</label>
        <span>{items.length} görsel</span>
      </div>

      {/* Thumbnail grid */}
      {items.length > 0 && (
        <div className="ws-gallery-thumbs">
          {items.map((src, idx) => (
            <div key={idx} className="ws-gallery-thumb">
              <img
                src={getPreviewUrl(src)}
                alt={`Görsel ${idx + 1}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/willow-mark-transparent.png";
                  (e.target as HTMLImageElement).style.opacity = "0.2";
                }}
              />
              <button
                type="button"
                className="ws-gallery-thumb-remove"
                onClick={() => remove(idx)}
                title="Kaldır"
              >
                ✕
              </button>
              {onMakeFeatured && (
                <button
                  type="button"
                  className={`ws-gallery-thumb-cover${featuredValue === src ? " is-active" : ""}`}
                  onClick={() => onMakeFeatured(src)}
                  title={featuredValue === src ? `${featuredLabel} görsel` : `${featuredLabel} yap`}
                >
                  {featuredValue === src ? featuredLabel : `${featuredLabel} yap`}
                </button>
              )}
            </div>
          ))}

          {/* Upload more */}
          <label className="ws-gallery-thumb-add" title="Görsel yükle">
            {uploading ? (
              <span style={{ fontSize: 18, opacity: 0.5 }}>…</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>Ekle</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      )}

      {/* First upload (empty state) */}
      {items.length === 0 && (
        <label className="ws-imgfield-preview" style={{ cursor: "pointer" }}>
          <div className="ws-imgfield-empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>{uploading ? "Yükleniyor…" : "Görsel yüklemek için tıklayın"}</span>
          </div>
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="ws-imgfield-file" />
        </label>
      )}

      {/* Manual path input */}
      <div className="ws-gallery-input-row">
        <input
          type="text"
          value={manualPath}
          onChange={(e) => setManualPath(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPath())}
          placeholder={placeholder || "assets/products/example.png"}
        />
        <button type="button" onClick={addPath} disabled={!manualPath.trim()}>
          Ekle
        </button>
      </div>

      {uploadError && <p className="ws-imgfield-error">{uploadError}</p>}
      {helper && <p className="ws-gallery-helper">{helper}</p>}
    </div>
  );
}

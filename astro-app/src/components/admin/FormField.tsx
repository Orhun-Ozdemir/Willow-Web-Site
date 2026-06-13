"use client";

import { useState } from "react";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: "text" | "textarea" | "select" | "date" | "number" | "image";
  options?: { value: string; label: string }[];
  rows?: number;
  readOnly?: boolean;
  hint?: string;
  charTarget?: [number, number];
  placeholder?: string;
  className?: string;
}

export default function FormField({
  label, value, onChange, type = "text", options, rows = 3,
  readOnly, hint, charTarget, placeholder, className = "",
}: FormFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const len = value?.length || 0;
  const charColor = charTarget
    ? len >= charTarget[0] && len <= charTarget[1]
      ? "text-[#132175]"
      : len > 0
        ? "text-amber-400"
        : "text-gray-400"
    : "";

  const inputCls = `w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 outline-none focus:border-[#1aa3c4] ${readOnly ? "text-gray-400" : ""} ${className}`;

  const getPreviewUrl = (val: string) => {
    if (!val) return "";
    if (/^(https?:)?\/\//i.test(val) || val.startsWith("data:")) return val;
    const clean = val.replace(/^\/+/, "");
    // Ensure we handle BASE_URL correctly for relative assets
    const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
    return `${base}/${clean}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    
    // Choose appropriate folder
    const folder = label.toLowerCase().includes("team") || label.toLowerCase().includes("takım") 
      ? "team" 
      : label.toLowerCase().includes("product") || label.toLowerCase().includes("ürün")
      ? "products"
      : "uploads";
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onChange(data.url);
      } else {
        setUploadError(data.error || "Yükleme başarısız.");
      }
    } catch {
      setUploadError("Yükleme sırasında ağ hatası oluştu.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold uppercase text-gray-500">{label}</label>
        {charTarget && (
          <span className={`text-[10px] font-mono ${charColor}`}>
            {len}/{charTarget[0]}-{charTarget[1]}
          </span>
        )}
      </div>

      {type === "image" ? (
        <div className="ws-imgfield">
          {/* Preview area */}
          <div className="ws-imgfield-preview">
            {value ? (
              <img
                src={getPreviewUrl(value)}
                alt="Önizleme"
                className="ws-imgfield-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/willow-mark-transparent.png";
                  (e.target as HTMLImageElement).style.opacity = "0.18";
                }}
              />
            ) : (
              <div className="ws-imgfield-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Görsel yok</span>
              </div>
            )}
            {value && (
              <button
                type="button"
                className="ws-imgfield-clear"
                onClick={() => onChange("")}
                title="Görseli kaldır"
              >
                ✕
              </button>
            )}
          </div>

          {/* Path input + upload button */}
          <div className="ws-imgfield-row">
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || "assets/... veya https://..."}
              className="ws-imgfield-input"
              readOnly={readOnly}
            />
            <label className={`ws-imgfield-btn${uploading ? " loading" : ""}`}>
              {uploading ? (
                <span className="ws-imgfield-spinner" />
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              )}
              {uploading ? "Yükleniyor…" : "Yükle"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading || readOnly}
                className="ws-imgfield-file"
              />
            </label>
          </div>
          {uploadError && <p className="ws-imgfield-error">{uploadError}</p>}
        </div>
      ) : type === "textarea" ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          readOnly={readOnly}
          placeholder={placeholder}
          className={inputCls}
        />
      ) : type === "select" ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        >
          {options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className={inputCls}
        />
      )}
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

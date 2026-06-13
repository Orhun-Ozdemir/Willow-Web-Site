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
        <div className="space-y-2">
          {value && (
            <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
              <img
                src={getPreviewUrl(value)}
                alt="Önizleme"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/willow-mark-transparent.png";
                  (e.target as HTMLImageElement).style.opacity = "0.2";
                }}
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || "Görsel yolu veya URL girin"}
              className={`${inputCls} flex-1`}
              readOnly={readOnly}
            />
            <label className="cursor-pointer px-3 py-2 bg-[#132175] hover:bg-[#0e1a5e] text-white rounded text-xs font-bold select-none shrink-0 transition duration-150">
              {uploading ? "Yükleniyor..." : "Görsel Seç / Yükle"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading || readOnly}
                className="hidden"
              />
            </label>
          </div>
          {uploadError && <p className="text-[10px] text-red-500 font-medium mt-1">{uploadError}</p>}
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

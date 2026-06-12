"use client";

import { useEffect, useState } from "react";

interface JsonEditorFieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  helper?: string;
  rows?: number;
  placeholder?: string;
}

export default function JsonEditorField({ label, value, onChange, helper, rows = 8, placeholder }: JsonEditorFieldProps) {
  const [text, setText] = useState(JSON.stringify(value ?? null, null, 2));
  const [error, setError] = useState("");

  useEffect(() => {
    setText(JSON.stringify(value ?? null, null, 2));
    setError("");
  }, [value]);

  const commit = (next: string) => {
    if (!next.trim()) {
      setError("");
      onChange(null);
      return;
    }
    try {
      const parsed = JSON.parse(next);
      setError("");
      onChange(parsed);
    } catch {
      setError("JSON geçersiz.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold uppercase text-gray-500">{label}</label>
        <span className="text-[10px] text-gray-400 font-mono">{error ? "Hata" : "JSON"}</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError("");
        }}
        onBlur={(e) => commit(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 outline-none focus:border-[#1aa3c4] font-mono text-xs"
      />
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[10px] mt-1 ${error ? "text-red-500" : "text-gray-400"}`}>{error || helper || "Boş bırakılırsa alan temizlenir."}</p>
        <button
          type="button"
          onClick={() => commit(text)}
          className="mt-1 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-gray-700"
        >
          Doğrula
        </button>
      </div>
    </div>
  );
}

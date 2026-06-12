"use client";

import { useEffect, useState } from "react";

interface ListEditorFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  helper?: string;
  placeholder?: string;
  rows?: number;
}

export default function ListEditorField({ label, value, onChange, helper, placeholder, rows = 4 }: ListEditorFieldProps) {
  const [text, setText] = useState((value || []).join("\n"));

  useEffect(() => {
    setText((value || []).join("\n"));
  }, [value]);

  const lines = text.split(/\n+/g).map((item) => item.trim()).filter(Boolean);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold uppercase text-gray-500">{label}</label>
        <span className="text-[10px] text-gray-400 font-mono">{lines.length} öğe</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          onChange(next.split(/\n+/g).map((item) => item.trim()).filter(Boolean));
        }}
        rows={rows}
        placeholder={placeholder}
        className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 outline-none focus:border-[#1aa3c4]"
      />
      {helper && <p className="text-[10px] text-gray-400 mt-1">{helper}</p>}
    </div>
  );
}

"use client";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: "text" | "textarea" | "select" | "date" | "number";
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
  const len = value?.length || 0;
  const charColor = charTarget
    ? len >= charTarget[0] && len <= charTarget[1]
      ? "text-[#132175]"
      : len > 0
        ? "text-amber-400"
        : "text-gray-400"
    : "";

  const inputCls = `w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 outline-none focus:border-[#1aa3c4] ${readOnly ? "text-gray-400" : ""} ${className}`;

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
      {type === "textarea" ? (
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

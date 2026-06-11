"use client";

import { locales, type Locale } from "@/lib/cms";

interface LocaleTabsProps {
  active: Locale;
  onChange: (locale: Locale) => void;
  filledMap?: Record<string, boolean>;
}

const FLAG: Record<string, string> = {
  en: "EN", tr: "TR", de: "DE", fr: "FR", es: "ES", it: "IT", ar: "AR", ja: "JA",
};

export default function LocaleTabs({ active, onChange, filledMap }: LocaleTabsProps) {
  const filledCount = filledMap ? Object.values(filledMap).filter(Boolean).length : 0;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {locales.map((loc) => {
        const isFilled = filledMap?.[loc];
        return (
          <button
            key={loc}
            onClick={() => onChange(loc)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
              active === loc
                ? "bg-[#132175] text-white"
                : isFilled
                  ? "bg-gray-200 text-gray-800"
                  : "bg-gray-100 text-gray-400 hover:text-gray-700"
            }`}
          >
            {FLAG[loc]}
          </button>
        );
      })}
      {filledMap && (
        <span className="text-[10px] text-gray-400 ml-2 font-mono">{filledCount}/{locales.length}</span>
      )}
    </div>
  );
}

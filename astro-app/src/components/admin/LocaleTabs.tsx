"use client";

import { locales, type Locale } from "@/lib/cms";

interface LocaleTabsProps {
  active: Locale;
  onChange: (locale: Locale) => void;
  filledMap?: Record<string, boolean>;
  missingCountMap?: Record<string, number>;
}

const FLAG: Record<string, string> = {
  en: "EN", tr: "TR", de: "DE", fr: "FR", es: "ES", it: "IT", ar: "AR", ja: "JA",
};

export default function LocaleTabs({ active, onChange, filledMap, missingCountMap }: LocaleTabsProps) {
  const filledCount = filledMap ? Object.values(filledMap).filter(Boolean).length : 0;

  return (
    <div className="flex items-center gap-1 flex-wrap" role="tablist" aria-label="Dil sekmeleri">
      {locales.map((loc) => {
        const isFilled = filledMap?.[loc];
        const missing = missingCountMap?.[loc] ?? 0;
        const isActive = active === loc;
        return (
          <button
            key={loc}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(loc)}
            className={`relative px-2.5 py-1 rounded text-[11px] font-bold transition ${
              isActive
                ? "bg-[#132175] text-white"
                : isFilled
                  ? "bg-gray-200 text-gray-800"
                  : "bg-gray-100 text-gray-400 hover:text-gray-700"
            }`}
          >
            {FLAG[loc]}
            {missing > 0 && !isActive && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                {missing}
              </span>
            )}
          </button>
        );
      })}
      {filledMap && (
        <span className="text-[10px] text-gray-400 ml-2 font-mono">{filledCount}/{locales.length}</span>
      )}
    </div>
  );
}

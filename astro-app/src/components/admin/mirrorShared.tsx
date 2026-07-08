"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/cms";

export const MIRROR_SCALE = 0.255;
export const MIRROR_WIDTH = 1180;

export type MirrorCard = { titleKey: string; descKey: string; index: number };

export function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function locVal(data: Record<string, any>, key: string, locale: Locale) {
  return (data[key]?.[locale] || data[key]?.en || "").trim();
}

export function locItem(data: Record<string, any>, item: any, key: string, locale: Locale) {
  const localized = item?.localized?.[locale]?.[key];
  if (localized) return String(localized).trim();
  const direct = locVal({ [key]: item?.[key] }, key, locale);
  if (direct) return direct;
  return String(item?.[key] || "").trim();
}

export function fieldEyebrow(fields: string[] = []) {
  return fields.find((f) => /Eyebrow$/i.test(f));
}

export function fieldTitle(fields: string[] = []) {
  return fields.find((f) => /Title$/i.test(f) && !/Eyebrow/i.test(f));
}

export function fieldLead(fields: string[] = []) {
  return fields.find((f) => /Lead$/i.test(f));
}

export function Hit({
  id, active, onClick, className, children,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`ws-pc-mirror-hit ${active ? "is-active" : ""} ${className || ""}`}
      data-block={id}
    >
      {children}
    </div>
  );
}

/** Bölüm içindeki tekil kart/adım — tıklanınca ilgili liste öğesini açar */
export function ItemHit({
  active,
  onClick,
  className,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
      className={`ws-pc-mirror-item-hit ${active ? "is-active mirror-card-active" : ""} ${className || ""}`}
    >
      {children}
    </div>
  );
}

export function MirrorShell({
  children,
  deps,
  dataPage,
}: {
  children: ReactNode;
  deps?: unknown[];
  dataPage?: string;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [shellHeight, setShellHeight] = useState(0);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const update = () => setShellHeight(el.offsetHeight * MIRROR_SCALE);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, deps ?? [children]);

  return (
    <div className="ws-pc-mirror-viewport">
      <div
        className="ws-pc-mirror-shell"
        style={{ width: MIRROR_WIDTH * MIRROR_SCALE, height: shellHeight || undefined }}
      >
        <div
          ref={innerRef}
          className="ws-pc-mirror"
          data-page={dataPage}
          style={{
            width: MIRROR_WIDTH,
            transform: `scale(${MIRROR_SCALE})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function SectionHead({
  data, locale, fields, center = false, h1 = false,
}: {
  data: Record<string, any>;
  locale: Locale;
  fields?: string[];
  center?: boolean;
  h1?: boolean;
}) {
  const eyebrowKey = fieldEyebrow(fields);
  const titleKey = fieldTitle(fields);
  const leadKey = fieldLead(fields);
  const eyebrow = eyebrowKey ? locVal(data, eyebrowKey, locale) : "";
  const title = titleKey ? locVal(data, titleKey, locale) : "";
  const lead = leadKey ? locVal(data, leadKey, locale) : "";
  const Tag = h1 ? "h1" : "h2";

  return (
    <div className={`section-head ${center ? "center" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && <Tag dangerouslySetInnerHTML={{ __html: title }} />}
      {lead && <p className="section-lead">{lead}</p>}
    </div>
  );
}

export function PlaceholderGrid({ count = 4, columns = 4, tall = false }: { count?: number; columns?: number; tall?: boolean }) {
  const cls = columns === 3 ? "grid grid-3" : columns === 2 ? "grid grid-2" : "grid grid-4";
  return (
    <div className={cls}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`ws-pc-mirror-ph-card ${tall ? "tall" : ""}`} />
      ))}
    </div>
  );
}

export function StaticFaq({
  data,
  locale,
  faqs = [],
  pageKey = "home",
}: {
  data?: Record<string, any>;
  locale?: Locale;
  faqs?: any[];
  pageKey?: string;
}) {
  const eyebrow = data && locale ? locVal(data, "faqEyebrow", locale) : "";
  const title = data && locale ? locVal(data, "faqTitle", locale) : "";
  const lead = data && locale ? locVal(data, "faqLead", locale) : "";

  const items = faqs
    .filter((f) => !f.page || f.page === pageKey)
    .slice(0, 5)
    .map((f) => {
      if (!locale) return { q: "—", a: "" };
      const loc = f.localized?.[locale] || f.localized?.en || {};
      return {
        q: String(loc.question || f.question || "—").trim(),
        a: String(loc.answer || f.answer || "").trim(),
      };
    });

  return (
    <section className="section soft services-faq-section">
      <div className="section-inner">
        <div className="section-head center">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="page-title" dangerouslySetInnerHTML={{ __html: title || "Merak Edilenler" }} />
          {lead && <p className="section-lead">{lead}</p>}
        </div>
        <div className="ws-pc-mirror-faq-list space-y-2">
          {items.length > 0 ? items.map((item, i) => (
            <details key={i} className="ws-pc-mirror-faq-item bg-white border border-gray-100 rounded-lg px-3 py-2 text-[11px]">
              <summary className="font-semibold text-[#132175] cursor-pointer">{item.q}</summary>
              {item.a && <p className="mt-1 text-gray-600 whitespace-pre-wrap">{item.a}</p>}
            </details>
          )) : (
            <div className="ws-pc-mirror-faq">
              <span /><span /><span />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

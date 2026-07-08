"use client";

import { useState } from "react";
import { locales, type Locale } from "@/lib/cms";
import PageMirror from "./PageMirror";
import CompanyPageMirror from "./CompanyPageMirror";
import { layoutForPage } from "./pageLayouts";
import type { MirrorCard } from "./mirrorShared";
import { LOCALE_INFO } from "./localeEditorShared";

export interface SectionNavItem {
  id: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}

interface PageMirrorSidebarProps {
  pageKey: string;
  pageData: Record<string, unknown>;
  extraData?: Record<string, unknown>;
  activeBlockId?: string | null;
  activeItemId?: string | null;
  activeCard?: MirrorCard | null;
  onSelectBlock?: (blockId: string) => void;
  onSelectItem?: (blockId: string, itemId: string) => void;
  onSelectCard?: (blockId: string, card: MirrorCard) => void;
  sectionNav?: SectionNavItem[];
  hint?: string;
}

export default function PageMirrorSidebar({
  pageKey,
  pageData,
  extraData,
  activeBlockId,
  activeItemId,
  activeCard,
  onSelectBlock,
  onSelectItem,
  onSelectCard,
  sectionNav,
  hint = "Bölüme veya karta tıklayarak düzenleyin.",
}: PageMirrorSidebarProps) {
  const [previewLocale, setPreviewLocale] = useState<Locale>("tr");
  const layout = layoutForPage(pageKey);
  const hasLayout = layout.length > 0;

  if (!hasLayout) return null;

  return (
    <aside className="ws-pc-sidebar">
      <div className="ws-pc-map-panel">
        <div className="ws-pc-map-head">
          <p className="ws-pc-wireframe-label">Sayfa haritası</p>
          <select
            value={previewLocale}
            onChange={(e) => setPreviewLocale(e.target.value as Locale)}
            className="ws-pc-locale-select"
            aria-label="Önizleme dili"
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {LOCALE_INFO[l]?.flag} {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        {pageKey === "company" ? (
          <CompanyPageMirror
            pageContent={pageData}
            companyFacts={(extraData?.companyFacts as Record<string, unknown>) || {}}
            locale={previewLocale}
            activeBlockId={activeBlockId ?? null}
            activeItemId={activeItemId}
            onSelectBlock={onSelectBlock || (() => {})}
            onSelectItem={onSelectItem}
          />
        ) : (
          <PageMirror
            pageKey={pageKey}
            layout={layout}
            data={pageData}
            locale={previewLocale}
            activeBlockId={activeBlockId ?? undefined}
            activeItemId={activeItemId ?? undefined}
            activeCard={activeCard ?? undefined}
            onSelectBlock={onSelectBlock || (() => {})}
            onSelectItem={onSelectItem}
            onSelectCard={onSelectCard}
            extraData={extraData}
          />
        )}
        <p className="ws-pc-preview-hint">{hint}</p>
      </div>

      {sectionNav && sectionNav.length > 0 && (
        <>
          <p className="ws-pc-sidebar-label mt-4">Bölümler</p>
          <div className="ws-pc-section-nav">
            {sectionNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`ws-pc-section-nav-btn ${item.active ? "is-active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}

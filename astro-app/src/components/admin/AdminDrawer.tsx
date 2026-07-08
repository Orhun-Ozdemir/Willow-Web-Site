"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useDrawerLock } from "./useDrawerLock";

interface AdminDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Özel header verilirse title/subtitle yok sayılır */
  header?: ReactNode;
  title?: string;
  subtitle?: string;
  /** Custom header için aria-labelledby id */
  labelledById?: string;
  maxWidth?: "md" | "lg" | "xl";
  tabs?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

const MAX_WIDTH: Record<NonNullable<AdminDrawerProps["maxWidth"]>, string> = {
  md: "max-w-lg",
  lg: "max-w-xl",
  xl: "max-w-2xl",
};

export default function AdminDrawer({
  open,
  onClose,
  header,
  title,
  subtitle,
  labelledById = "admin-drawer-title",
  maxWidth = "lg",
  tabs,
  footer,
  children,
}: AdminDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDrawerLock(open, onClose);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  const ariaLabelId = header ? labelledById : title ? "admin-drawer-title" : undefined;

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] cursor-default"
        onClick={onClose}
        aria-label="Paneli kapat"
      />

      <div
        ref={panelRef}
        className={`relative flex h-full w-full ${MAX_WIDTH[maxWidth]} flex-col bg-white shadow-2xl border-l border-gray-200 animate-[adminDrawerSlideIn_220ms_ease-out]`}
        style={{ borderTop: header || title ? "3px solid #132175" : undefined }}
      >
        {(header || title) && (
          <div className="shrink-0 border-b border-gray-100 bg-white px-5 py-4">
            {header ?? (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 id="admin-drawer-title" className="text-sm font-bold text-[#131b2e]">
                    {title}
                  </h4>
                  {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
                <DrawerCloseButton onClose={onClose} />
              </div>
            )}
          </div>
        )}

        {tabs && <div className="shrink-0 border-b border-gray-100 bg-white">{tabs}</div>}

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-[#f7f8fc] p-5">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-gray-200 bg-white/95 px-5 py-4 backdrop-blur-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function DrawerCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition shrink-0"
      aria-label="Kapat"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

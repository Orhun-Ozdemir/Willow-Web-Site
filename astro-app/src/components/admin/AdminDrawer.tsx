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
      className="fixed inset-0 z-[60] flex items-stretch justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0a1020]/70 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Paneli kapat"
      />

      <div
        ref={panelRef}
        className={`relative flex h-dvh max-h-dvh w-full ${MAX_WIDTH[maxWidth]} flex-col overflow-hidden bg-white shadow-[-16px_0_48px_rgba(10,16,40,0.35)] border-l-[3px] border-l-[#132175] animate-[adminDrawerSlideIn_220ms_ease-out]`}
      >
        {(header || title) && (
          <div className="shrink-0 border-b border-[#132175]/12 bg-[#f6f8fd] px-5 py-4 z-10">
            {header ?? (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#132175]/70 mb-1">Detay paneli</p>
                  <h4 id="admin-drawer-title" className="text-base font-bold text-[#0f172a]">
                    {title}
                  </h4>
                  {subtitle && <p className="text-xs text-[#475569] mt-1">{subtitle}</p>}
                </div>
                <DrawerCloseButton onClose={onClose} />
              </div>
            )}
          </div>
        )}

        {tabs && (
          <div className="shrink-0 border-b border-[#132175]/10 bg-white z-10 shadow-[0_1px_0_rgba(19,33,117,0.06)]">
            {tabs}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-[#eef1f8] px-5 py-4">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 z-20 border-t-2 border-[#132175]/20 bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_28px_rgba(19,33,117,0.14)]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#132175]/60 mb-2.5">İşlemler</p>
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
      className="p-2 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-white border border-transparent hover:border-[#132175]/15 transition shrink-0"
      aria-label="Kapat"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

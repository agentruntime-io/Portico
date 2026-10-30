"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Settings2 } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { FontScaleControls } from "@/components/font-scale-controls";
import { LanguageSelector } from "@/components/site-controls";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Header popover for reading preferences: theme, text size, and language.
 * One button instead of four keeps the toolbar for navigation and search.
 */
export function DisplaySettings() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    rootRef.current
      ?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')
      ?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={t("settings.label")}
        title={t("settings.label")}
        onClick={() => setOpen((v) => !v)}
        className="ds-control inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
      >
        <Settings2 className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={t("settings.label")}
          className="ds-shadow-panel absolute right-0 top-full z-[var(--z-modal)] mt-2 w-72 space-y-4 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-3"
        >
          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold text-[var(--text-muted)]">
              {t("theme.label")}
            </p>
            <ThemeToggle variant="segmented" />
          </div>
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              {t("fontScale.group")}
            </p>
            <FontScaleControls compact />
          </div>
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              {t("settings.language")}
            </p>
            <LanguageSelector variant="drawer" compact />
          </div>
        </div>
      ) : null}
    </div>
  );
}

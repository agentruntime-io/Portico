"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { FontScaleControls } from "@/components/font-scale-controls";
import { LanguageSelector } from "@/components/site-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavbarLinks } from "@/components/navbar-cta";
import type { SiteConfig } from "@/lib/site";
import { useSiteUi } from "@/components/site-name-provider";

/**
 * Header popover for reading preferences: theme, text size, and language.
 * One button instead of four keeps the toolbar for navigation and search.
 */
export function DisplaySettings({ navbar }: { navbar?: SiteConfig["navbar"] }) {
  const { t } = useI18n();
  const { appearance } = useSiteUi();
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
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[var(--ink-2)] transition-colors hover:bg-[var(--sunk)] hover:text-[var(--ink)] aria-expanded:bg-[var(--sunk)] aria-expanded:text-[var(--ink)]"
      >
        <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden />
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={t("settings.label")}
          className="absolute right-0 top-full z-[var(--z-modal)] mt-2.5 grid w-[304px] gap-3.5 rounded-2xl border border-[var(--line-2)] bg-[var(--surface)] p-3.5 shadow-[var(--shadow-pop)]"
        >
          {appearance?.strict ? null : (
            <div className="space-y-2">
              <p className="px-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--ink-3)]">
                {t("theme.label")}
              </p>
              <ThemeToggle variant="segmented" />
            </div>
          )}
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--ink-3)]">
              {t("fontScale.group")}
            </p>
            <FontScaleControls compact />
          </div>
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--ink-3)]">
              {t("settings.language")}
            </p>
            <LanguageSelector variant="drawer" compact />
          </div>
          {navbar?.links?.length ? (
            <NavbarLinks
              navbar={navbar}
              className="flex flex-wrap gap-x-3.5 border-t border-[var(--line)] pt-3 text-[12.5px] text-[var(--ink-2)] [&_a]:min-h-0 [&_a]:min-w-0 [&_a]:p-0 [&_a]:font-normal [&_a:hover]:bg-transparent [&_a:hover]:text-[var(--brand-ink)]"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

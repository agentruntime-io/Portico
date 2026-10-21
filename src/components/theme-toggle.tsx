"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { applyTheme, readPreferenceFromDom } from "@/lib/theme-client";
import type { MessageKey } from "@/lib/i18n";
import type { ThemePreference } from "@/lib/theme-tokens";

const OPTIONS: { value: ThemePreference; icon: LucideIcon; labelKey: MessageKey }[] = [
  { value: "light", icon: Sun, labelKey: "theme.light" },
  { value: "dark", icon: Moon, labelKey: "theme.dark" },
  { value: "system", icon: Monitor, labelKey: "theme.system" },
];

function useThemePreference() {
  const [pref, setPrefState] = useState<ThemePreference>("system");

  useEffect(() => {
    setPrefState(readPreferenceFromDom());
  }, []);

  const setPref = useCallback((next: ThemePreference) => {
    setPrefState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem("doc-theme", next);
    } catch {
      /* storage unavailable: the choice still applies for this page view */
    }
  }, []);

  return [pref, setPref] as const;
}

/**
 * Explicit Light / Dark / System choice.
 * - `menu` (header): icon button opening a small radio menu with text labels.
 * - `segmented` (drawer): three labelled radio buttons side by side.
 */
export function ThemeToggle({
  variant = "menu",
}: {
  variant?: "menu" | "segmented";
}) {
  return variant === "segmented" ? <ThemeSegmented /> : <ThemeMenu />;
}

function ThemeMenu() {
  const { t } = useI18n();
  const [pref, setPref] = useThemePreference();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const current = OPTIONS.find((o) => o.value === pref) ?? OPTIONS[2];
  const CurrentIcon = current.icon;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    rootRef.current
      ?.querySelector<HTMLElement>('[role="menuitemradio"][aria-checked="true"]')
      ?.focus();
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function onMenuKeyDown(event: React.KeyboardEvent) {
    const items = [
      ...(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []),
    ];
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      items[(index + delta + items.length) % items.length]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        suppressHydrationWarning
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${t("theme.label")}: ${t(current.labelKey)}`}
        title={`${t("theme.label")}: ${t(current.labelKey)}`}
        onClick={() => setOpen((v) => !v)}
        className="ds-control inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg xl:h-9 xl:w-9"
      >
        <CurrentIcon className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={t("theme.label")}
          onKeyDown={onMenuKeyDown}
          className="ds-shadow-panel absolute right-0 top-full z-[var(--z-modal)] mt-2 w-44 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-1"
        >
          {OPTIONS.map(({ value, icon: Icon, labelKey }) => {
            const checked = value === pref;
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                onClick={() => {
                  setPref(value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm transition-colors hover:bg-emerald-500/10 ${
                  checked ? "font-semibold text-[var(--accent-strong)]" : "text-[var(--text-main)]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="flex-1">{t(labelKey)}</span>
                {checked ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ThemeSegmented() {
  const { t } = useI18n();
  const [pref, setPref] = useThemePreference();
  const groupRef = useRef<HTMLDivElement>(null);

  function onKeyDown(event: React.KeyboardEvent) {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const index = OPTIONS.findIndex((o) => o.value === pref);
    const next = OPTIONS[(index + delta + OPTIONS.length) % OPTIONS.length];
    setPref(next.value);
    groupRef.current
      ?.querySelectorAll<HTMLElement>('[role="radio"]')
      [OPTIONS.indexOf(next)]?.focus();
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={t("theme.label")}
      onKeyDown={onKeyDown}
      className="grid w-full grid-cols-3 gap-1 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-1"
    >
      {OPTIONS.map(({ value, icon: Icon, labelKey }) => {
        const checked = value === pref;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => setPref(value)}
            className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors ${
              checked
                ? "bg-emerald-500/15 text-[var(--accent-strong)]"
                : "text-[var(--text-muted)] hover:bg-emerald-500/10"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{t(labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}

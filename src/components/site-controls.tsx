"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  Globe2,
  Moon,
  Send,
  Sun,
  X,
} from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { useDialog } from "@/lib/a11y/use-dialog";
import { themeTokens, type ThemeName } from "@/lib/theme-tokens";
import { locales, type Locale } from "@/lib/i18n";

const themeVars = themeTokens;

function readThemeFromDom(): ThemeName {
  if (typeof document === "undefined") return "dark";
  const fromDom = document.documentElement.dataset.theme;
  return fromDom === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<ThemeName>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readThemeFromDom());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = theme;
    for (const [name, value] of Object.entries(themeVars[theme])) {
      document.documentElement.style.setProperty(name, value);
    }
    window.localStorage.setItem("doc-theme", theme);
  }, [mounted, theme]);

  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      type="button"
      suppressHydrationWarning
      aria-label={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
      aria-pressed={isDark}
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      className="ds-control inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}

export function LanguageSelector({ variant }: { variant?: "drawer" }) {
  const { locale, setLocale, t } = useI18n();
  const visibility =
    variant === "drawer" ? "inline-flex" : "hidden md:inline-flex";

  return (
    <label
      className={`ds-control h-9 shrink-0 items-center gap-2 rounded-lg px-2 text-xs font-medium ${visibility}`}
    >
      <Globe2 className="h-4 w-4" aria-hidden />
      <select
        aria-label={t("language.label")}
        title={t("language.uiOnlyHint")}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="bg-transparent outline-none"
      >
        {locales.map((item) => (
          <option key={item.code} value={item.code} className="bg-[var(--panel-bg)]">
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AssistantLauncher() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const closeDialog = useCallback(() => setOpen(false), []);

  useDialog(open, closeDialog, dialogRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  const panel =
    open && mounted
      ? createPortal(
          <>
            <button
              type="button"
              aria-label={t("assistant.close")}
              onClick={closeDialog}
              className="fixed inset-0 z-[100] bg-black/40"
            />
            <aside
              ref={dialogRef}
              className="ds-shadow-panel fixed inset-x-3 bottom-3 z-[101] flex max-h-[min(32rem,85vh)] flex-col overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-[4.5rem] sm:max-h-none sm:h-[min(32rem,calc(100vh-5.5rem))] sm:w-[min(420px,calc(100vw-2rem))]"
              role="dialog"
              aria-modal="true"
              aria-label={t("assistant.title")}
            >
              <div className="flex shrink-0 items-center gap-3 border-b border-[var(--panel-border)] px-4 py-3">
                <Bot className="h-5 w-5 text-emerald-400" aria-hidden />
                <p className="font-semibold text-[var(--text-main)]">{t("assistant.title")}</p>
                <button
                  type="button"
                  aria-label={t("assistant.close")}
                  onClick={closeDialog}
                  className="ml-auto rounded-md p-1 text-[var(--text-muted)] hover:bg-emerald-500/10 hover:text-[var(--text-main)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8 text-center text-sm leading-relaxed text-[var(--text-muted)]">
                <Bot className="mb-3 h-8 w-8 text-emerald-500/60" aria-hidden />
                <p className="font-medium text-[var(--text-main)]">{t("assistant.comingSoon")}</p>
                <p className="mt-2 max-w-xs">{t("assistant.body")}</p>
              </div>
              <form
                onSubmit={(event) => event.preventDefault()}
                className="shrink-0 border-t border-[var(--panel-border)] p-4"
              >
                <textarea
                  disabled
                  placeholder={t("assistant.placeholder")}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[var(--panel-border)] bg-[var(--sidebar-bg)] px-3 py-2 text-sm text-[var(--text-muted)] outline-none placeholder:text-[var(--text-muted)]"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled
                    aria-label={t("assistant.send")}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700/40 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </aside>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        aria-label={t("assistant.open")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="ds-control ds-accent-text inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
      >
        <Bot className="h-4 w-4" />
      </button>
      {panel}
    </>
  );
}

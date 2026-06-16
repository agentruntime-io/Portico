"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n-provider";
import { useDialog } from "@/lib/a11y/use-dialog";
import type { MessageKey } from "@/lib/i18n";

type Entry = { url: string; title: string; excerpt: string };

function sectionKey(url: string): MessageKey {
  if (url.startsWith("/reference")) return "search.sectionApiReference";
  if (url.startsWith("/changelog")) return "search.sectionChangelog";
  if (url === "/" || /^\/(es|fr|ja)\/?$/.test(url)) return "search.sectionHome";

  const normalized = url.replace(/^\/(es|fr|ja)(\/|$)/, "/");
  if (normalized.startsWith("/guides")) return "search.sectionGuides";
  if (normalized.startsWith("/integrations")) return "search.sectionIntegrations";
  if (normalized.startsWith("/platform")) return "search.sectionPlatform";
  if (normalized.startsWith("/workflows")) return "search.sectionWorkflows";
  if (normalized.startsWith("/connectors")) return "search.sectionConnectors";
  if (normalized.startsWith("/api")) return "search.sectionApi";
  return "search.sectionDocs";
}

export function SearchControl() {
  const { t, locale } = useI18n();
  const dialogId = useId();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [data, setData] = useState<Entry[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onClose = useCallback(() => {
    setOpen(false);
    setQ("");
    setActiveIndex(0);
  }, []);

  useDialog(open, onClose, dialogRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open || data) return;
    void fetch("/search-index.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData([]));
  }, [open, data]);

  const localeMatches = useCallback(
    (url: string) => {
      if (url.startsWith("/reference") || url.startsWith("/changelog")) {
        return true;
      }
      const first = url.split("/").filter(Boolean)[0];
      if (locale === "en") {
        return !first || !["es", "fr", "ja"].includes(first);
      }
      return url === `/${locale}` || url.startsWith(`/${locale}/`);
    },
    [locale],
  );

  const scopedData = useMemo(
    () => data?.filter((entry) => localeMatches(entry.url)) ?? null,
    [data, localeMatches],
  );

  const results = useMemo(() => {
    if (!scopedData || !q.trim()) return scopedData?.slice(0, 8) ?? [];

    const qq = q.toLowerCase();
    return scopedData
      .map((d) => {
        const title = d.title.toLowerCase();
        const url = d.url.toLowerCase();
        const excerpt = d.excerpt.toLowerCase();
        const score =
          (title.includes(qq) ? 8 : 0) +
          (url.includes(qq) ? 4 : 0) +
          (excerpt.includes(qq) ? 2 : 0) +
          (title.startsWith(qq) ? 4 : 0);
        return { ...d, score };
      })
      .filter((d) => d.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, 24);
  }, [scopedData, q]);

  useEffect(() => {
    setActiveIndex(0);
  }, [q, results.length]);

  const isLoading = open && data === null;
  const hasQuery = q.trim().length > 0;
  const indexEmpty =
    !isLoading && data !== null && (scopedData?.length ?? 0) === 0;
  const showNoResults = !isLoading && hasQuery && results.length === 0;
  const showResults = !isLoading && results.length > 0;
  const showBody = isLoading || indexEmpty || showNoResults || showResults;

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[var(--z-modal)] flex items-start justify-center bg-black/50 p-3 pt-[12vh] sm:p-4 sm:pt-[10vh]"
            onClick={onClose}
          >
            <div
              ref={dialogRef}
              id={dialogId}
              className="search-dialog w-full max-w-lg overflow-hidden rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label={t("search.label")}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`search-dialog-input-row flex min-h-11 items-center gap-2 px-3 ${
                  showBody ? "border-b border-[var(--panel-border)]" : ""
                }`}
              >
                <Search
                  className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
                  aria-hidden
                />
                <input
                  ref={inputRef}
                  autoFocus
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={open}
                  aria-controls={showResults ? "search-results" : undefined}
                  aria-activedescendant={
                    showResults && results[activeIndex]
                      ? `search-result-${activeIndex}`
                      : undefined
                  }
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (!results.length) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter" && results[activeIndex]) {
                      e.preventDefault();
                      window.location.href = results[activeIndex].url;
                      onClose();
                    }
                  }}
                  placeholder={t("search.placeholder")}
                  className="min-h-11 min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm text-[var(--text-main)] shadow-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-[var(--text-muted)]"
                />
                <button
                  type="button"
                  aria-label={t("search.close")}
                  onClick={onClose}
                  className="shrink-0 rounded-md p-2 text-[var(--text-muted)] outline-none ring-0 hover:bg-emerald-500/10 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {isLoading ? (
                <p className="px-4 py-3 text-sm text-[var(--text-muted)]">
                  {t("search.loading")}
                </p>
              ) : null}

              {indexEmpty ? (
                <p role="status" className="px-4 py-4 text-sm text-[var(--text-muted)]">
                  {t("search.indexEmpty")}
                </p>
              ) : null}

              {showNoResults ? (
                <p
                  role="status"
                  aria-live="polite"
                  className="px-4 py-4 text-sm text-[var(--text-muted)]"
                >
                  {t("search.noResults", { query: q })}
                </p>
              ) : null}

              {showResults ? (
                <>
                  {!hasQuery ? (
                    <p className="border-b border-[var(--panel-border)] px-4 py-2 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      {t("search.suggested")}
                    </p>
                  ) : null}
                  <ul
                    id="search-results"
                    role="listbox"
                    aria-label={t("search.label")}
                    className="max-h-[min(20rem,50vh)] overflow-y-auto py-1"
                  >
                    {results.map((r, index) => (
                      <li key={r.url} role="presentation">
                        <a
                          id={`search-result-${index}`}
                          role="option"
                          aria-selected={index === activeIndex}
                          href={r.url}
                          onClick={onClose}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`block px-4 py-2.5 transition-colors ${
                            index === activeIndex
                              ? "bg-emerald-500/10"
                              : "hover:bg-emerald-500/5"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-[var(--sidebar-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--text-muted)]">
                              {t(sectionKey(r.url))}
                            </span>
                            <span className="text-sm font-medium text-[var(--text-main)]">
                              {r.title}
                            </span>
                          </div>
                          {hasQuery ? (
                            <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">
                              {r.excerpt}
                            </p>
                          ) : null}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        aria-label={t("search.label")}
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] hover:bg-emerald-500/10 lg:hidden"
      >
        <Search className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={t("search.label")}
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
        className="hidden h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 text-left text-sm text-[var(--text-muted)] hover:border-[var(--panel-border)] xl:max-w-md lg:inline-flex"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate">{t("search.placeholderShort")}</span>
        <kbd className="hidden rounded border border-[var(--panel-border)] px-1.5 py-0.5 font-mono text-[10px] xl:inline">
          {t("search.shortcut")}
        </kbd>
      </button>
      {modal}
    </>
  );
}

"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n-provider";
import { useDialog } from "@/lib/a11y/use-dialog";
import type { MessageKey } from "@/lib/i18n";
import {
  highlightParts,
  prepareIndex,
  searchIndex,
  tokenize,
  type PreparedEntry,
  type SearchEntry,
  type SearchResult,
} from "@/lib/search";

type Entry = SearchEntry;
const OPEN_SEARCH_EVENT = "docs:open-search";

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

function Highlighted({ text, tokens }: { text: string; tokens: string[] }) {
  return (
    <>
      {highlightParts(text, tokens).map((part, i) =>
        part.match ? (
          <mark key={i} className="search-mark">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function DrawerSearchTrigger({
  onActivate,
}: {
  onActivate?: () => void;
}) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      aria-label={t("search.label")}
      onClick={() => {
        onActivate?.();
        window.setTimeout(() => {
          window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
        }, 0);
      }}
      className="inline-flex min-h-11 w-full items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 text-left text-sm text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate">{t("search.placeholderShort")}</span>
    </button>
  );
}

/** Ask the search dialog to open, optionally prefilled with a query. */
function requestSearch(query?: string) {
  window.dispatchEvent(
    new CustomEvent<{ query?: string }>(OPEN_SEARCH_EVENT, { detail: { query } }),
  );
}

/**
 * Search card for the home hero: opens the same dialog as the header button.
 * Each suggestion renders as a "Try" chip that opens the dialog prefilled with it.
 */
export function HeroSearchTrigger({ suggestions }: { suggestions?: string[] }) {
  const { t } = useI18n();
  const chips = (suggestions ?? []).filter((s) => s.trim().length > 0);

  return (
    <div className="hm-sbox">
      <div className="hm-sbox-card">
        <button
          type="button"
          aria-label={t("search.label")}
          onClick={() => requestSearch()}
          className="hm-sbox-row"
        >
          <Search aria-hidden />
          <span className="hm-sbox-text">{t("search.placeholder")}</span>
          <kbd className="hm-kbd">{t("search.shortcut")}</kbd>
        </button>
        {chips.length ? (
          <div className="hm-sbox-hints">
            <span>{t("search.try")}</span>
            {chips.map((chip) => (
              <button key={chip} type="button" onClick={() => requestSearch(chip)}>
                {chip}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
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
    // The open-search event may carry `detail.query` to prefill the input.
    const onOpenRequest = (e: Event) => {
      const query = (e as CustomEvent<{ query?: string } | undefined>).detail?.query;
      if (typeof query === "string") setQ(query);
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpenRequest);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpenRequest);
    };
  }, []);

  useEffect(() => {
    if (!open || data) return;
    void fetch("/search-index.json")
      .then((r) => r.json())
      .then((entries: Entry[]) => setData(entries))
      .catch(() => setData([]));
  }, [open, data]);

  // Locale-scoped index. Where a locale has no translated page, fall back to the
  // English entry and link to the URL the visitor would actually land on
  // (/fr/<slug> serves the English content with a fallback banner).
  const scopedData = useMemo<PreparedEntry[] | null>(() => {
    if (!data) return null;
    const prefixed = /^\/(es|fr|ja)(\/|$)/;
    const isShared = (url: string) =>
      url.startsWith("/reference") || url.startsWith("/changelog");
    if (locale === "en") {
      return prepareIndex(data.filter((e) => isShared(e.url) || !prefixed.test(e.url)));
    }
    const own = data.filter((e) => e.url === `/${locale}` || e.url.startsWith(`/${locale}/`));
    const ownSlugs = new Set(own.map((e) => e.url.slice(locale.length + 1) || "/"));
    const fallback = data.filter(
      (e) => !isShared(e.url) && !prefixed.test(e.url) && !ownSlugs.has(e.url),
    );
    const shared = data.filter((e) => isShared(e.url));
    const entries = [...own, ...fallback, ...shared];
    return prepareIndex(entries, (e) =>
      own.includes(e) || isShared(e.url)
        ? e.url
        : e.url === "/"
          ? `/${locale}`
          : `/${locale}${e.url}`,
    );
  }, [data, locale]);

  const queryTokens = useMemo(() => tokenize(q), [q]);

  const hasQueryEarly = queryTokens.length > 0;

  const suggestions = useMemo<SearchResult[]>(
    () =>
      (scopedData ?? [])
        .slice(0, 8)
        .map((d) => ({ ...d, score: 0, snippet: d.excerpt })),
    [scopedData],
  );

  const results = useMemo<SearchResult[]>(() => {
    if (!scopedData) return [];
    if (!queryTokens.length) return suggestions;
    return searchIndex(scopedData, q);
  }, [scopedData, q, queryTokens, suggestions]);

  // With no match, offer the same suggested pages as the empty query.
  const shown = results.length || !hasQueryEarly ? results : suggestions;

  useEffect(() => {
    setActiveIndex(0);
  }, [q, shown.length]);

  const isLoading = open && data === null;
  const hasQuery = q.trim().length > 0;
  const indexEmpty =
    !isLoading && data !== null && (scopedData?.length ?? 0) === 0;
  const showNoResults = !isLoading && hasQuery && results.length === 0;
  const showResults = !isLoading && shown.length > 0;
  const showBody = isLoading || indexEmpty || showNoResults || showResults;

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="search-backdrop fixed inset-0 z-[var(--z-modal)] flex items-start justify-center bg-black/55 p-3 pt-[12vh] sm:p-4 sm:pt-[10vh]"
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
                    showResults && shown[activeIndex]
                      ? `search-result-${activeIndex}`
                      : undefined
                  }
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (!shown.length) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveIndex((i) => Math.min(i + 1, shown.length - 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter" && shown[activeIndex]) {
                      e.preventDefault();
                      window.location.href = shown[activeIndex].href;
                      onClose();
                    }
                  }}
                  placeholder={t("search.placeholder")}
                  className="min-h-11 min-w-0 flex-1 border-0 bg-transparent py-2.5 text-base text-[var(--text-main)] md:text-sm shadow-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-[var(--text-muted)]"
                />
                <button
                  type="button"
                  aria-label={t("search.close")}
                  onClick={onClose}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] outline-none ring-0 hover:bg-emerald-500/10 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
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
                  {!hasQuery || results.length === 0 ? (
                    <p className="border-b border-[var(--panel-border)] px-4 py-2 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      {t("search.suggested")}
                    </p>
                  ) : null}
                  <ul
                    id="search-results"
                    role="listbox"
                    aria-label={t("search.label")}
                    className="docs-sidebar-scroll max-h-[min(20rem,50vh)] overflow-y-auto py-1 [scrollbar-width:thin]"
                  >
                    {shown.map((r, index) => (
                      <li key={r.href} role="presentation">
                        <a
                          id={`search-result-${index}`}
                          role="option"
                          aria-selected={index === activeIndex}
                          href={r.href}
                          onClick={onClose}
                          // mousemove, not mouseenter: keyboard scrolling must not be hijacked by a still pointer
                          onMouseMove={() => setActiveIndex((i) => (i === index ? i : index))}
                          className={`block px-4 py-2.5 transition-colors ${
                            index === activeIndex
                              ? "bg-emerald-500/10"
                              : "hover:bg-emerald-500/5"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="shrink-0 whitespace-nowrap rounded bg-[var(--sidebar-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--text-muted)]">
                              {t(sectionKey(r.url))}
                            </span>
                            <span className="min-w-0 truncate text-sm font-medium text-[var(--text-main)]">
                              <Highlighted text={r.title} tokens={queryTokens} />
                            </span>
                          </div>
                          {hasQuery && r.snippet ? (
                            <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">
                              <Highlighted text={r.snippet} tokens={queryTokens} />
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
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-[var(--ink-2)] transition-colors hover:bg-[var(--sunk)] hover:text-[var(--ink)] sm:h-9 sm:w-9 lg:hidden"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>
      <button
        type="button"
        aria-label={t("search.label")}
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
        className="hidden h-9 w-[230px] shrink-0 items-center gap-2 rounded-[10px] border border-[var(--line-2)] bg-[var(--surface)] pl-3 pr-2 text-left text-[13.5px] text-[var(--ink-3)] transition-colors hover:border-[var(--ink-3)] lg:inline-flex"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate">{t("search.placeholderShort")}</span>
        <kbd className="rounded-md border border-b-2 border-[var(--line-2)] px-1.5 font-mono text-[11px] text-[var(--ink-3)]">
          {t("search.shortcut")}
        </kbd>
      </button>
      {modal}
    </>
  );
}

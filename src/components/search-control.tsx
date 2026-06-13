"use client";



import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Search, X } from "lucide-react";

import { createPortal } from "react-dom";

import { useI18n } from "@/components/i18n-provider";

import { useDialog } from "@/lib/a11y/use-dialog";

import type { MessageKey } from "@/lib/i18n";



type Entry = { url: string; title: string; excerpt: string };



function sectionKey(url: string): MessageKey {

  if (url.startsWith("/reference")) return "search.sectionApiReference";

  if (url.startsWith("/changelog")) return "search.sectionChangelog";

  if (url === "/") return "search.sectionHome";

  return "search.sectionHome";

}



export function SearchControl() {

  const { t, locale } = useI18n();

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

    if (!scopedData || !q.trim()) return scopedData?.slice(0, 10) ?? [];

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



  const modal =

    open && mounted

      ? createPortal(

          <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-3 sm:items-start sm:p-4 sm:pt-[10vh]">

            <div

              ref={dialogRef}

              className="flex max-h-[min(85vh,640px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-2xl sm:max-h-none"

              role="dialog"

              aria-modal="true"

              aria-label={t("search.label")}

            >

              <div className="flex items-center gap-2 border-b border-[var(--panel-border)] px-3">

                <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />

                <input

                  ref={inputRef}

                  autoFocus

                  role="combobox"

                  aria-expanded={results.length > 0}

                  aria-controls="search-results"

                  aria-activedescendant={

                    results[activeIndex]

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

                  className="h-12 flex-1 bg-transparent text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)]"

                />

                <button

                  type="button"

                  aria-label={t("search.close")}

                  onClick={onClose}

                  className="rounded-md p-2 text-[var(--text-muted)] hover:bg-emerald-500/10"

                >

                  <X className="h-4 w-4" />

                </button>

              </div>

              <ul

                id="search-results"

                role="listbox"

                aria-label={t("search.label")}

                className="max-h-[min(24rem,60vh)] overflow-y-auto py-2"

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

                      className={`block px-4 py-3 transition-colors ${

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

                      <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">

                        {r.excerpt}

                      </p>

                    </a>

                  </li>

                ))}

                {open && data && !results.length && q.trim() ? (

                  <li

                    role="status"

                    aria-live="polite"

                    className="px-4 py-8 text-center text-sm text-[var(--text-muted)]"

                  >

                    {t("search.noResults", { query: q })}

                  </li>

                ) : null}

              </ul>

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

        onClick={() => setOpen(true)}

        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] hover:bg-emerald-500/10 lg:hidden"

      >

        <Search className="h-4 w-4" />

      </button>

      <button

        type="button"

        aria-label={t("search.label")}

        onClick={() => setOpen(true)}

        className="hidden h-9 min-w-[12rem] max-w-md flex-1 items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 text-left text-sm text-[var(--text-muted)] hover:border-emerald-500/40 lg:inline-flex"

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



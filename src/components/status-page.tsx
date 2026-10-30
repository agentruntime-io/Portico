"use client";

import Link from "next/link";
import { Home, RotateCw } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { DocsBrand } from "@/components/docs-shell";
import { DrawerSearchTrigger, SearchControl } from "@/components/search-control";
import { localizeHref } from "@/lib/locale-routing";

/**
 * Branded 404 / error content. `standalone` adds a minimal header (the error
 * boundary renders outside the docs shell, which needs server-loaded navigation).
 */
export function StatusPage({
  kind,
  siteName,
  standalone = false,
  error,
  reset,
}: {
  kind: "notFound" | "error";
  siteName: string;
  standalone?: boolean;
  error?: Error & { digest?: string };
  reset?: () => void;
}) {
  const { t, locale } = useI18n();
  const title = kind === "notFound" ? t("errors.notFoundTitle") : t("errors.errorTitle");
  const body = kind === "notFound" ? t("errors.notFoundBody") : t("errors.errorBody");
  const code = kind === "notFound" ? "404" : "500";
  const showDetails = kind === "error" && error && process.env.NODE_ENV !== "production";

  const content = (
    <section className="mx-auto flex w-full max-w-xl flex-col items-start gap-5 py-16 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
        {code}
      </p>
      <h1 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-[var(--text-main)] sm:text-4xl">
        {title}
      </h1>
      <p className="text-[1.0625rem] leading-8 text-[var(--text-muted)]">{body}</p>

      <div className="w-full max-w-md">
        <DrawerSearchTrigger />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={localizeHref("/", locale)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--btn)] px-4 text-sm font-semibold text-[var(--on-btn)] hover:bg-[var(--btn-hover)]"
        >
          <Home className="h-4 w-4" aria-hidden />
          {t("errors.backHome")}
        </Link>
        {reset ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--surface-muted)]"
          >
            <RotateCw className="h-4 w-4" aria-hidden />
            {t("errors.tryAgain")}
          </button>
        ) : null}
      </div>

      {showDetails ? (
        <details open className="w-full rounded-lg border border-[var(--panel-border)] bg-[var(--surface-muted)] p-4 text-sm">
          <summary className="cursor-pointer font-semibold">{t("errors.details")}</summary>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-[var(--text-main)]">
            {error.message}
          </pre>
        </details>
      ) : null}
    </section>
  );

  if (!standalone) return content;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[var(--panel-bg)] text-[var(--text-main)]">
      <header className="flex items-center gap-3 border-b border-[var(--panel-border)] px-4 sm:px-8">
        <DocsBrand siteName={siteName} />
        <div className="ml-auto flex items-center gap-2">
          <SearchControl />
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="flex-1 px-5 sm:px-8">
        {content}
      </main>
    </div>
  );
}

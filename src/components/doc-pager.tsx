"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { PageNeighbor } from "@/lib/pager";

export function DocPager({
  prev,
  next,
}: {
  prev?: PageNeighbor;
  next?: PageNeighbor;
}) {
  const { t } = useI18n();
  if (!prev && !next) return null;

  return (
    <nav
      aria-label={t("nav.pageNav")}
      className="mt-12 grid gap-3 border-t border-[var(--panel-border)] pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col gap-1 rounded-xl border border-[var(--panel-border)] p-4 transition hover:border-emerald-500/50"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {t("nav.previous")}
          </span>
          <span className="text-sm font-medium text-[var(--text-main)] group-hover:text-emerald-600">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col items-end gap-1 rounded-xl border border-[var(--panel-border)] p-4 text-right transition hover:border-emerald-500/50 sm:col-start-2"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            {t("nav.next")}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="text-sm font-medium text-[var(--text-main)] group-hover:text-emerald-600">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}

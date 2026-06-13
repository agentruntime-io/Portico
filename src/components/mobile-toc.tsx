"use client";

import { useI18n } from "@/components/i18n-provider";
import type { PageHeading } from "@/lib/headings";
import { ListFilter } from "lucide-react";

export function MobileTableOfContents({
  headings,
}: {
  headings: PageHeading[];
}) {
  const { t } = useI18n();
  if (headings.length < 2) return null;

  return (
    <details className="mb-8 rounded-lg border border-[var(--panel-border)] bg-[var(--sidebar-bg)] lg:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-[var(--text-main)] [&::-webkit-details-marker]:hidden">
        <ListFilter className="h-4 w-4 text-[var(--text-muted)]" aria-hidden />
        {t("toc.title")}
      </summary>
      <nav className="border-t border-[var(--panel-border)] px-2 py-2" aria-label={t("toc.title")}>
        <ul className="space-y-0.5">
          {headings.map((heading, index) => (
            <li key={`${heading.id}-${index}`}>
              <a
                href={`#${heading.id}`}
                className={`block rounded-md py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 ${
                  heading.depth === 3 ? "pl-6 pr-2" : "px-2"
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}

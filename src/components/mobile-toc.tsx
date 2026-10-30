"use client";

import { ChevronDown, List } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { PageHeading } from "@/lib/headings";

/** Inline "On this page" disclosure, shown under 1180px where the desktop rail is hidden. */
export function MobileTableOfContents({
  headings,
}: {
  headings: PageHeading[];
}) {
  const { t } = useI18n();
  if (headings.length < 2) return null;

  return (
    <details className="doc-toc-m">
      <summary>
        <List className="doc-toc-m-icon" aria-hidden />
        {t("toc.title")}
        <ChevronDown className="doc-toc-m-chevron" aria-hidden />
      </summary>
      <nav
        aria-label={t("toc.title")}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) {
            event.currentTarget.closest("details")?.removeAttribute("open");
          }
        }}
      >
        <ul>
          {headings.map((heading, index) => (
            <li key={`${heading.id}-${index}`}>
              <a href={`#${heading.id}`} data-depth={heading.depth}>
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}

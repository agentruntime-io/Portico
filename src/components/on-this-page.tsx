"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { PageHeading } from "@/lib/headings";

/** Desktop "On this page" rail: micro-label plus a guide-line list with scroll-spy. */
export function OnThisPage({ headings }: { headings: PageHeading[] }) {
  const { t } = useI18n();
  const [active, setActive] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 1] },
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label={t("toc.title")} className="doc-toc">
      <p className="doc-toc-label" aria-hidden>
        <List />
        {t("toc.title")}
      </p>
      {headings.length ? (
        <ul className="doc-toc-list">
          {headings.map((heading, index) => (
            <li key={`${heading.id}-${index}`}>
              <a
                href={`#${heading.id}`}
                data-depth={heading.depth}
                aria-current={active === heading.id ? "location" : undefined}
                className="doc-toc-link"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <span className="doc-toc-empty">{t("toc.empty")}</span>
      )}
    </nav>
  );
}

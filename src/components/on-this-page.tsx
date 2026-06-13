"use client";

import { useEffect, useState } from "react";
import { ListFilter } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { PageHeading } from "@/lib/headings";

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
    <nav
      aria-label={t("toc.title")}
      className="sticky top-24 border-l border-[var(--panel-border)] pl-5 text-[13px]"
    >
      <p className="mb-4 flex items-center gap-2 font-semibold text-[var(--text-main)]">
        <ListFilter className="h-3.5 w-3.5" aria-hidden />
        {t("toc.title")}
      </p>
      <div className="space-y-1">
        {headings.length ? (
          headings.map((heading, index) => (
            <a
              key={`${heading.id}-${index}`}
              href={`#${heading.id}`}
              className={`toc-link block border-l py-1.5 leading-5 ${
                heading.depth === 3 ? "-ml-[21px] pl-10" : "-ml-[21px] pl-5"
              } ${
                active === heading.id
                  ? "toc-link-active"
                  : "border-transparent"
              }`}
            >
              {heading.text}
            </a>
          ))
        ) : (
          <span className="text-[var(--text-muted)]">{t("toc.empty")}</span>
        )}
      </div>
    </nav>
  );
}

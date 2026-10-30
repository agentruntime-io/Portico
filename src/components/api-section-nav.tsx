"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import type { ApiDescriptionSection } from "@/lib/openapi/core";

/** Overview link plus one link per `##` heading of the spec's description. */
export function ApiSectionNav({
  specId,
  sections,
}: {
  specId: string;
  sections: ApiDescriptionSection[];
}) {
  const { t } = useI18n();
  const pathname = usePathname() ?? "";
  // Overview has no page of its own: it is active on the spec overview URL.
  const onOverview = pathname.replace(/^\/(es|fr|ja)(?=\/)/, "").replace(/\/$/, "") === `/reference/${specId}`;
  const items = [
    { key: "overview", href: `/reference/${specId}`, label: t("api.sections.overview") },
    ...sections
      .filter((section) => section.id !== "overview")
      .map((section) => ({
        key: section.id,
        href: `/reference/${specId}#${section.id}`,
        label: section.title,
      })),
  ];

  return (
    <nav className="space-y-1 text-sm" aria-label={t("nav.sectionNav")}>
      {items.map((item) => {
        const active = onOverview && item.key === "overview";
        return (
          <a
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`block rounded-md px-2 py-1.5 text-sm ${active ? "nav-active" : "nav-item-muted"}`}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

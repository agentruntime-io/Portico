"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";

const sectionKeys = [
  ["api.sections.overview", "#overview"],
  ["api.sections.authentication", "#authentication"],
  ["api.sections.baseUrl", "#base-url"],
  ["api.sections.requestResponse", "#request--response-format"],
  ["api.sections.asyncModel", "#async-execution-model"],
  ["api.sections.stepTypes", "#step-types"],
  ["api.sections.templateVars", "#template-variables"],
  ["api.sections.errorHandling", "#error-handling"],
  ["api.sections.rateLimits", "#rate-limits"],
] as const;

export function ApiSectionNav({ specId }: { specId: string }) {
  const { t } = useI18n();
  const pathname = usePathname() ?? "";
  // Overview has no page of its own: it is active on the spec overview URL.
  const onOverview = pathname.replace(/^\/(es|fr|ja)(?=\/)/, "").replace(/\/$/, "") === `/reference/${specId}`;

  return (
    <nav className="space-y-1 text-sm" aria-label={t("nav.sectionNav")}>
      {sectionKeys.map(([key, href]) => {
        const active = onOverview && href === "#overview";
        return (
        <a
          key={href}
          href={`/reference/${specId}${href}`}
          aria-current={active ? "page" : undefined}
          className={`block rounded-md px-2 py-1.5 text-sm ${active ? "nav-active" : "nav-item-muted"}`}
        >
          {t(key)}
        </a>
        );
      })}
    </nav>
  );
}

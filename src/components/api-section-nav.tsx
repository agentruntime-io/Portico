"use client";

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

  return (
    <nav className="space-y-1 text-sm" aria-label={t("nav.sectionNav")}>
      {sectionKeys.map(([key, href]) => (
        <a
          key={href}
          href={`/reference/${specId}${href}`}
          className="nav-item-muted block rounded-md px-2 py-1.5 text-sm"
        >
          {t(key)}
        </a>
      ))}
    </nav>
  );
}

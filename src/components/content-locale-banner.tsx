"use client";

import { useI18n } from "@/components/i18n-provider";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";

const localeLabels = Object.fromEntries(
  locales.map((l) => [l.code, l.label]),
) as Record<Locale, string>;

export function ContentLocaleBanner({
  requestedLocale,
  contentLocale,
}: {
  requestedLocale: Locale;
  contentLocale: Locale;
}) {
  const { t } = useI18n();

  return (
    <div
      role="status"
      className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-[var(--text-main)]"
    >
      {t("language.fallbackBanner", {
        requested: localeLabels[requestedLocale],
        available: localeLabels[contentLocale],
      })}
    </div>
  );
}

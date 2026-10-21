"use client";

import { useI18n } from "@/components/i18n-provider";
import type { Locale } from "@/lib/i18n";

/** Language name in the UI language ("anglais", "inglés", "English"). */
function languageName(code: Locale, uiLocale: Locale): string {
  try {
    const name = new Intl.DisplayNames([uiLocale], { type: "language" }).of(code);
    if (name) return name;
  } catch {
    /* Intl.DisplayNames unavailable */
  }
  return code;
}

export function ContentLocaleBanner({
  requestedLocale,
  contentLocale,
}: {
  requestedLocale: Locale;
  contentLocale: Locale;
}) {
  const { t, locale } = useI18n();

  return (
    <div
      role="status"
      className="mb-6 mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-[var(--text-main)] sm:mt-8"
    >
      {t("language.fallbackBanner", {
        requested: languageName(requestedLocale, locale),
        available: languageName(contentLocale, locale),
      })}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/components/i18n-provider";
import { LocaleSync } from "@/components/locale-sync";
import { SkipLink } from "@/components/skip-link";
import type { Locale } from "@/lib/i18n";

export function AppProviders({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  return (
    <I18nProvider initialLocale={locale}>
      <LocaleSync />
      <SkipLink />
      {children}
    </I18nProvider>
  );
}

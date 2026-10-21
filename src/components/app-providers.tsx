"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/components/i18n-provider";
import { LocaleSync } from "@/components/locale-sync";
import { SiteNameProvider } from "@/components/site-name-provider";
import { SkipLink } from "@/components/skip-link";
import type { Locale } from "@/lib/i18n";

export function AppProviders({
  children,
  locale,
  siteName,
}: {
  children: ReactNode;
  locale: Locale;
  siteName: string;
}) {
  return (
    <I18nProvider initialLocale={locale}>
      <LocaleSync />
      <SkipLink />
      <SiteNameProvider siteName={siteName}>{children}</SiteNameProvider>
    </I18nProvider>
  );
}

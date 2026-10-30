"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/components/i18n-provider";
import { LocaleSync } from "@/components/locale-sync";
import { SiteNameProvider } from "@/components/site-name-provider";
import { ThemeSync } from "@/components/theme-sync";
import { SkipLink } from "@/components/skip-link";
import type { Locale } from "@/lib/i18n";
import type { SiteLogo } from "@/lib/site";

export function AppProviders({
  children,
  locale,
  siteName,
  logo,
}: {
  children: ReactNode;
  locale: Locale;
  siteName: string;
  logo?: SiteLogo;
}) {
  return (
    <I18nProvider initialLocale={locale}>
      <LocaleSync />
      <ThemeSync />
      <SkipLink />
      <SiteNameProvider siteName={siteName} logo={logo}>
        {children}
      </SiteNameProvider>
    </I18nProvider>
  );
}

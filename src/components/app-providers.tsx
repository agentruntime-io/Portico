"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/components/i18n-provider";
import { LocaleSync } from "@/components/locale-sync";
import { SkipLink } from "@/components/skip-link";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <LocaleSync />
      <SkipLink />
      {children}
    </I18nProvider>
  );
}

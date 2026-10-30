"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteAppearance, SiteFooter, SiteLogo, SiteSupport } from "@/lib/site";

const SiteNameContext = createContext("Docs");
const SiteLogoContext = createContext<SiteLogo | undefined>(undefined);

/** Site chrome from docs.json / site.yaml that client components render. */
export type SiteUi = { support?: SiteSupport; footer?: SiteFooter; appearance?: SiteAppearance };
const SiteUiContext = createContext<SiteUi>({});

/** Lets client-only surfaces (the error boundary) show the configured site name. */
export function SiteNameProvider({
  siteName,
  logo,
  ui = {},
  children,
}: {
  siteName: string;
  logo?: SiteLogo;
  ui?: SiteUi;
  children: ReactNode;
}) {
  return (
    <SiteNameContext.Provider value={siteName}>
      <SiteLogoContext.Provider value={logo}>
        <SiteUiContext.Provider value={ui}>{children}</SiteUiContext.Provider>
      </SiteLogoContext.Provider>
    </SiteNameContext.Provider>
  );
}

export function useSiteName() {
  return useContext(SiteNameContext);
}

export function useSiteLogo() {
  return useContext(SiteLogoContext);
}

export function useSiteUi() {
  return useContext(SiteUiContext);
}

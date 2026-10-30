"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteLogo } from "@/lib/site";

const SiteNameContext = createContext("Docs");
const SiteLogoContext = createContext<SiteLogo | undefined>(undefined);

/** Lets client-only surfaces (the error boundary) show the configured site name. */
export function SiteNameProvider({
  siteName,
  logo,
  children,
}: {
  siteName: string;
  logo?: SiteLogo;
  children: ReactNode;
}) {
  return (
    <SiteNameContext.Provider value={siteName}>
      <SiteLogoContext.Provider value={logo}>{children}</SiteLogoContext.Provider>
    </SiteNameContext.Provider>
  );
}

export function useSiteName() {
  return useContext(SiteNameContext);
}

export function useSiteLogo() {
  return useContext(SiteLogoContext);
}

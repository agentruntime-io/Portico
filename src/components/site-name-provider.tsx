"use client";

import { createContext, useContext, type ReactNode } from "react";

const SiteNameContext = createContext("Docs");

/** Lets client-only surfaces (the error boundary) show the configured site name. */
export function SiteNameProvider({
  siteName,
  children,
}: {
  siteName: string;
  children: ReactNode;
}) {
  return <SiteNameContext.Provider value={siteName}>{children}</SiteNameContext.Provider>;
}

export function useSiteName() {
  return useContext(SiteNameContext);
}

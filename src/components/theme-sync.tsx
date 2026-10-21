"use client";

import { useLayoutEffect } from "react";
import { applyTheme, readStoredPreference } from "@/lib/theme-client";

/**
 * The inline init script only runs for server-rendered documents. When SSR throws,
 * React client-renders the whole document and no theme is applied — so re-apply the
 * stored preference on mount, and follow the OS while "system" is selected.
 */
export function ThemeSync() {
  // Layout effect: runs before the first paint of a client-rendered document.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.theme) applyTheme(readStoredPreference());
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((root.dataset.themePref ?? "system") === "system") applyTheme("system");
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return null;
}

"use client";

import {
  isThemePreference,
  type ThemeName,
  type ThemePreference,
} from "@/lib/theme-tokens";

export function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem("doc-theme");
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function readPreferenceFromDom(): ThemePreference {
  if (typeof document === "undefined") return "system";
  const fromDom = document.documentElement.dataset.themePref;
  return isThemePreference(fromDom) ? fromDom : readStoredPreference();
}

export function resolveTheme(pref: ThemePreference): ThemeName {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Fired on window after the theme changes, so every theme control can follow. */
export const THEME_CHANGE_EVENT = "docs:theme-change";

export function applyTheme(pref: ThemePreference) {
  const theme = resolveTheme(pref);
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themePref = pref;
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

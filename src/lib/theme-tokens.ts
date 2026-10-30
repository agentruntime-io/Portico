/** Colour tokens live in globals.css under html[data-theme]; this only names the themes. */
export const themeNames = ["light", "dark"] as const;

export type ThemeName = (typeof themeNames)[number];

/** What the user picked; "system" follows prefers-color-scheme (the default). */
export type ThemePreference = ThemeName | "system";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export const fontScaleLevels = [0.9, 1, 1.1, 1.2] as const;

export function themeInitScriptSource(): string {
  return `(() => {
  const fontScaleLevels = ${JSON.stringify(fontScaleLevels)};
  const stored = window.localStorage.getItem("doc-theme");
  const pref = stored === "light" || stored === "dark" ? stored : "system";
  const theme = pref === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : pref;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePref = pref;
  const scaleStored = window.localStorage.getItem("doc-font-scale");
  const parsed = scaleStored ? Number(scaleStored) : 1;
  const scale = fontScaleLevels.includes(parsed) ? parsed : 1;
  document.documentElement.style.setProperty("--doc-font-scale", String(scale));
  const language = window.localStorage.getItem("doc-language");
  if (language) document.documentElement.lang = language;
  else {
    const fromPath = document.documentElement.getAttribute("data-doc-locale");
    if (fromPath) document.documentElement.lang = fromPath;
  }
})();`;
}

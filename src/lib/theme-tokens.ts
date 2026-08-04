export const themeTokens = {
  light: {
    "--background": "#fbfcfa",
    "--foreground": "#1a211d",
    "--app-bg": "#f4f7f5",
    "--panel-bg": "#ffffff",
    "--sidebar-bg": "#f7f9f7",
    "--panel-border": "#dce5df",
    "--text-main": "#18201c",
    "--text-muted": "#53615a",
    "--surface-muted": "#f3f6f4",
    "--accent": "#0f8a5f",
    "--accent-strong": "#08734f",
  },
  dark: {
    "--background": "#0b0f0e",
    "--foreground": "#f2f5f3",
    "--app-bg": "#0b0f0e",
    "--panel-bg": "#101613",
    "--sidebar-bg": "#0d1210",
    "--panel-border": "#28332e",
    "--text-main": "#f2f5f3",
    "--text-muted": "#aeb9b3",
    "--surface-muted": "#141b17",
    "--accent": "#34d399",
    "--accent-strong": "#6ee7b7",
  },
} as const;

export type ThemeName = keyof typeof themeTokens;

export const fontScaleLevels = [0.9, 1, 1.1, 1.2] as const;

export function themeInitScriptSource(): string {
  return `(() => {
  const themes = ${JSON.stringify(themeTokens)};
  const fontScaleLevels = ${JSON.stringify(fontScaleLevels)};
  const stored = window.localStorage.getItem("doc-theme");
  const theme = stored === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  for (const [name, value] of Object.entries(themes[theme])) {
    document.documentElement.style.setProperty(name, value);
  }
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

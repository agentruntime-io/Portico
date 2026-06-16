export const themeTokens = {
  light: {
    "--background": "#f3f6f4",
    "--foreground": "#171717",
    "--app-bg": "#eef3f0",
    "--panel-bg": "#fbfcfb",
    "--sidebar-bg": "#f5f8f6",
    "--panel-border": "#cfd8d3",
    "--text-main": "#18181b",
    "--text-muted": "#4b5563",
  },
  dark: {
    "--background": "#0a0a0a",
    "--foreground": "#ededed",
    "--app-bg": "#080b0a",
    "--panel-bg": "#0b100e",
    "--sidebar-bg": "#080b0a",
    "--panel-border": "#27272a",
    "--text-main": "#f4f4f5",
    "--text-muted": "#a1a1aa",
  },
} as const;

export type ThemeName = keyof typeof themeTokens;

export const fontScaleLevels = [0.9, 1, 1.1, 1.2] as const;

export function themeInitScriptSource(): string {
  return `(() => {
  const themes = ${JSON.stringify(themeTokens)};
  const fontScaleLevels = ${JSON.stringify(fontScaleLevels)};
  const stored = window.localStorage.getItem("doc-theme");
  const theme = stored === "light" ? "light" : "dark";
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

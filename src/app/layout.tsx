import type { Metadata } from "next";
import { headers } from "next/headers";
import { AppProviders } from "@/components/app-providers";
import { StructuredData } from "@/components/structured-data";
import { buildSiteRootMetadata, webSiteJsonLd } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site";
import "./globals.css";

const themeInitScript = `
(() => {
  const themes = {
    light: {
      "--background": "#f3f6f4",
      "--foreground": "#171717",
      "--app-bg": "#eef3f0",
      "--panel-bg": "#fbfcfb",
      "--sidebar-bg": "#f5f8f6",
      "--panel-border": "#cfd8d3",
      "--text-main": "#18181b",
      "--text-muted": "#4b5563"
    },
    dark: {
      "--background": "#0a0a0a",
      "--foreground": "#ededed",
      "--app-bg": "#080b0a",
      "--panel-bg": "#0b100e",
      "--sidebar-bg": "#080b0a",
      "--panel-border": "#27272a",
      "--text-main": "#f4f4f5",
      "--text-muted": "#a1a1aa"
    }
  };
  const stored = window.localStorage.getItem("doc-theme");
  const theme = stored === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  for (const [name, value] of Object.entries(themes[theme])) {
    document.documentElement.style.setProperty(name, value);
  }
  const language = window.localStorage.getItem("doc-language");
  if (language) document.documentElement.lang = language;
  else {
    const fromPath = document.documentElement.getAttribute("data-doc-locale");
    if (fromPath) document.documentElement.lang = fromPath;
  }
})();
`;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return buildSiteRootMetadata(site);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [site, requestHeaders] = await Promise.all([getSiteConfig(), headers()]);
  const lang = requestHeaders.get("x-doc-locale") ?? "en";

  return (
    <html
      lang={lang}
      data-doc-locale={lang}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <StructuredData data={webSiteJsonLd(site)} />
      </head>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

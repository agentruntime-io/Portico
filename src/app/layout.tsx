import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { AppProviders } from "@/components/app-providers";
import { isLocale, type Locale } from "@/lib/i18n";
import { buildSiteRootMetadata, webSiteJsonLd } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site";
import { themeInitScriptSource } from "@/lib/theme-tokens";
import "./globals.css";

// Portico's default type; a site's docs.json `fonts` override it (site-theme.ts).
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});


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
  const headerLocale = requestHeaders.get("x-doc-locale") ?? "";
  const lang: Locale = isLocale(headerLocale) ? headerLocale : "en";
  const themeInitScript = themeInitScriptSource(site.appearance);

  return (
    <html
      lang={lang}
      data-doc-locale={lang}
      className={`${instrumentSans.variable} ${bricolage.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {site.theme.fontStylesheet ? (
          <link rel="stylesheet" href={site.theme.fontStylesheet} />
        ) : null}
        {site.theme.css ? <style dangerouslySetInnerHTML={{ __html: site.theme.css }} /> : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteJsonLd(site)),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AppProviders
          locale={lang}
          siteName={site.name}
          logo={site.logo}
          ui={{ support: site.support, footer: site.footer, appearance: site.appearance }}
        >{children}</AppProviders>
      </body>
    </html>
  );
}

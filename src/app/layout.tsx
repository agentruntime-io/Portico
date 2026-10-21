import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { AppProviders } from "@/components/app-providers";
import { isLocale, type Locale } from "@/lib/i18n";
import { buildSiteRootMetadata, webSiteJsonLd } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site";
import { themeInitScriptSource } from "@/lib/theme-tokens";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const themeInitScript = themeInitScriptSource();

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

  return (
    <html
      lang={lang}
      data-doc-locale={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteJsonLd(site)),
          }}
        />
      </head>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <AppProviders locale={lang}>{children}</AppProviders>
      </body>
    </html>
  );
}

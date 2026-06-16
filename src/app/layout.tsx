import type { Metadata } from "next";
import { headers } from "next/headers";
import { AppProviders } from "@/components/app-providers";
import { buildSiteRootMetadata, webSiteJsonLd } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site";
import { themeInitScriptSource } from "@/lib/theme-tokens";
import "./globals.css";

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteJsonLd(site)),
          }}
        />
      </head>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

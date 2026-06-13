import type { Metadata } from "next";

import type { Locale } from "@/lib/i18n";
import { pagePathToHref } from "@/lib/locale-routing";
import type { SiteConfig, SiteVerification } from "@/lib/site";

export function excerptFromBody(body: string, maxLen = 160): string {
  const text = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  if (text.length <= maxLen) return text;

  const cut = text.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function resolveAbsoluteUrl(pathOrUrl: string, siteUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = siteUrl.replace(/\/$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

export function resolveOgImageUrl(
  site: SiteConfig,
  pageOgImage?: string,
): string | undefined {
  const candidate = pageOgImage ?? site.ogImage;
  if (!candidate) return undefined;
  return resolveAbsoluteUrl(candidate, site.url);
}

export function pageRobots(meta: {
  draft?: boolean;
  noindex?: boolean;
}): Metadata["robots"] | undefined {
  if (meta.draft || meta.noindex) {
    return { index: false, follow: true };
  }
  return undefined;
}

export function buildAlternatesLanguages(
  pagePath: string,
  alternateLocales: Locale[],
  siteUrl: string,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const alt of alternateLocales) {
    languages[alt] = new URL(
      pagePathToHref(pagePath, alt),
      siteUrl,
    ).toString();
  }
  return languages;
}

export function buildPageMetadata(args: {
  site: SiteConfig;
  title: string;
  description?: string;
  canonicalPath: string;
  pagePath?: string;
  alternateLocales?: Locale[];
  ogImage?: string;
  draft?: boolean;
  noindex?: boolean;
}): Metadata {
  const canonical = new URL(args.canonicalPath, args.site.url).toString();
  const ogImageUrl = resolveOgImageUrl(args.site, args.ogImage);
  const images = ogImageUrl
    ? [{ url: ogImageUrl, alt: args.title }]
    : undefined;

  return {
    title: args.title,
    description: args.description,
    alternates: {
      canonical,
      ...(args.pagePath && args.alternateLocales?.length
        ? {
            languages: buildAlternatesLanguages(
              args.pagePath,
              args.alternateLocales,
              args.site.url,
            ),
          }
        : {}),
    },
    openGraph: {
      title: args.title,
      description: args.description,
      url: canonical,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
      description: args.description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
    robots: pageRobots(args),
  };
}

function verificationMetadata(
  verification?: SiteVerification,
): Metadata["verification"] | undefined {
  if (!verification) return undefined;

  const other = verification.other?.reduce<Record<string, string>>(
    (acc, entry) => {
      acc[entry.name] = entry.content;
      return acc;
    },
    {},
  );

  return {
    google: verification.google,
    yandex: verification.yandex,
    yahoo: verification.yahoo,
    ...(other && Object.keys(other).length ? { other } : {}),
  };
}

export function buildSiteRootMetadata(site: SiteConfig): Metadata {
  const ogImageUrl = resolveOgImageUrl(site);
  const images = ogImageUrl ? [{ url: ogImageUrl, alt: site.name }] : undefined;

  return {
    metadataBase: new URL(site.url),
    title: {
      default: site.name,
      template: `%s - ${site.name}`,
    },
    description: site.description,
    verification: verificationMetadata(site.verification),
    openGraph: {
      title: site.name,
      description: site.description,
      siteName: site.name,
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: site.description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
  };
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function breadcrumbItemsForPage(
  pagePath: string,
  title: string,
  locale: Locale,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "Home", path: pagePathToHref("index", locale) },
  ];

  if (pagePath === "index") return items;

  const parts = pagePath.split("/").filter(Boolean);
  let acc = "";

  for (let index = 0; index < parts.length; index++) {
    acc = acc ? `${acc}/${parts[index]}` : parts[index];
    const isLast = index === parts.length - 1;
    items.push({
      name: isLast
        ? title
        : parts[index].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      path: pagePathToHref(acc, locale),
    });
  }

  return items;
}

export function webSiteJsonLd(site: SiteConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    description: site.description,
    url: site.url.replace(/\/$/, ""),
  };
}

export function techArticleJsonLd(args: {
  site: SiteConfig;
  title: string;
  description?: string;
  canonicalPath: string;
  locale: Locale;
}) {
  const url = new URL(args.canonicalPath, args.site.url).toString();
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: args.title,
    description: args.description,
    url,
    inLanguage: args.locale,
    isPartOf: {
      "@type": "WebSite",
      name: args.site.name,
      url: args.site.url.replace(/\/$/, ""),
    },
  };
}

export function breadcrumbJsonLd(
  site: SiteConfig,
  items: BreadcrumbItem[],
) {
  const base = site.url.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}

export function webPageJsonLd(args: {
  site: SiteConfig;
  title: string;
  description?: string;
  canonicalPath: string;
}) {
  const url = new URL(args.canonicalPath, args.site.url).toString();
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: args.title,
    description: args.description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: args.site.name,
      url: args.site.url.replace(/\/$/, ""),
    },
  };
}

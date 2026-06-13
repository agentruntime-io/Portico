import type { MetadataRoute } from "next";

import { listAllDocPagePaths } from "@/lib/docs-config";
import { defaultLocale, locales } from "@/lib/i18n";
import { hasLocalizedMdx } from "@/lib/locale-content";
import { pagePathToHref } from "@/lib/locale-routing";
import { isPageIndexable, loadPageSeoMeta } from "@/lib/page-meta";
import { getSiteConfig } from "@/lib/site";
import {
  flattenOperations,
  groupOperationsByTag,
  loadBundledSpec,
  slugifyTag,
} from "@/lib/openapi/core";

async function isIndexablePage(
  pagePath: string,
  locale: typeof defaultLocale,
): Promise<boolean> {
  const meta = await loadPageSeoMeta(pagePath, locale);
  if (!meta) return false;
  return isPageIndexable(meta);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteConfig();
  const base = site.url.replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [];
  const pagePaths = await listAllDocPagePaths();

  const docLanguages = async (pagePath: string) => {
    const languages: Record<string, string> = {};

    for (const { code } of locales) {
      if (code !== defaultLocale && !hasLocalizedMdx(pagePath, code)) continue;
      if (!(await isIndexablePage(pagePath, code))) continue;
      languages[code] = `${base}${pagePathToHref(pagePath, code)}`;
    }

    return languages;
  };

  if (await isIndexablePage("index", defaultLocale)) {
    entries.push({
      url: `${base}/`,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: await docLanguages("index") },
    });
  }

  for (const pagePath of pagePaths) {
    const href = pagePathToHref(pagePath, defaultLocale);
    if (href === "/") continue;
    if (!(await isIndexablePage(pagePath, defaultLocale))) continue;

    entries.push({
      url: `${base}${href}`,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: { languages: await docLanguages(pagePath) },
    });
  }

  if (site.openapi.specs.length) {
    entries.push({
      url: `${base}/reference`,
      changeFrequency: "weekly",
      priority: 0.85,
    });

    for (const spec of site.openapi.specs) {
      entries.push({
        url: `${base}/reference/${spec.id}`,
        changeFrequency: "weekly",
        priority: 0.85,
      });

      const doc = await loadBundledSpec(spec.file);
      const ops = flattenOperations(spec.id, doc);

      for (const tag of groupOperationsByTag(ops).keys()) {
        entries.push({
          url: `${base}/reference/${spec.id}/${slugifyTag(tag)}`,
          changeFrequency: "monthly",
          priority: 0.65,
        });
      }
    }
  }

  entries.push({
    url: `${base}/changelog`,
    changeFrequency: "weekly",
    priority: 0.7,
  });

  return entries;
}

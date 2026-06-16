import fs from "fs/promises";

import matter from "gray-matter";

import {

  flattenPagePaths,

  loadDocsJson,

  mdxFileForPagePath,

  type DocsPageGroup,

} from "@/lib/docs-config";

import { defaultLocale, type Locale } from "@/lib/i18n";

import { pagePathToHref } from "@/lib/locale-routing";
import { isPageIndexable, loadPageSeoMeta } from "@/lib/page-meta";



export type NavItem = {

  title: string;

  href: string;

};



export type NavGroup = {

  label: string;

  icon?: string;

  items: NavItem[];

  defaultExpanded?: boolean;

};



export type NavFile = {

  groups: NavGroup[];

  globalAnchors?: { label: string; href: string; icon?: string }[];

};



const cached = new Map<Locale, NavFile>();



async function titleForPagePath(

  pagePath: string,

  locale: Locale,

): Promise<string> {

  try {

    const raw = await fs.readFile(mdxFileForPagePath(pagePath, locale), "utf8");

    const { data } = matter(raw);

    if (data.sidebarTitle) return String(data.sidebarTitle);

    if (data.title) return String(data.title);

  } catch {

    /* fallback */

  }

  const last = pagePath.split("/").pop() ?? pagePath;

  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

}



async function groupToNav(

  group: DocsPageGroup,

  locale: Locale,

): Promise<NavGroup> {

  const pagePaths = flattenPagePaths(group.pages ?? []);

  const items: NavItem[] = [];

  for (const pagePath of pagePaths) {
    const meta = await loadPageSeoMeta(pagePath, locale);
    if (meta && !isPageIndexable(meta)) continue;

    items.push({

      title: await titleForPagePath(pagePath, locale),

      href: pagePathToHref(pagePath, locale),

    });

  }

  return {

    label: group.group,

    icon: group.icon,

    items,

    defaultExpanded: group.expanded ?? true,

  };

}



export async function getNavigation(

  locale: Locale = defaultLocale,

): Promise<NavFile> {

  const hit = cached.get(locale);

  if (hit) return hit;



  const config = await loadDocsJson();

  const groups: NavGroup[] = [];

  for (const g of config.navigation.groups ?? []) {

    groups.push(await groupToNav(g, locale));

  }

  const nav: NavFile = {

    groups,

    globalAnchors: config.navigation.global?.anchors?.map((a) => ({

      label: a.anchor,

      href: a.href,

      icon: a.icon,

    })),

  };

  cached.set(locale, nav);

  return nav;

}



/** Bust cache in dev when content changes (optional). */

export function clearNavCache() {

  cached.clear();

}



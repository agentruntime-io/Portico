import fs from "fs/promises";
import path from "path";
import { assertContentRoot } from "@/lib/content-root";
import { defaultLocale, type Locale } from "@/lib/i18n";
import { resolveMdxFilePath } from "@/lib/locale-content";

export { pagePathToHref } from "@/lib/locale-routing";

export type DocsPageEntry = string | DocsPageGroup;

export type DocsPageGroup = {
  group: string;
  pages: DocsPageEntry[];
  icon?: string;
  expanded?: boolean;
};

export type DocsJsonConfig = {
  name: string;
  description?: string;
  navigation: {
    global?: {
      anchors?: { anchor: string; href: string; icon?: string }[];
    };
    groups: DocsPageGroup[];
  };
  navbar?: {
    links?: { label: string; href: string }[];
    primary?: { type: string; label: string; href: string };
  };
  colors?: { primary?: string; light?: string; dark?: string };
};

let cached: DocsJsonConfig | null = null;

export async function loadDocsJson(): Promise<DocsJsonConfig> {
  if (cached) return cached;
  const root = assertContentRoot();
  const raw = await fs.readFile(path.join(root, "docs.json"), "utf8");
  cached = JSON.parse(raw) as DocsJsonConfig;
  return cached;
}

export function flattenPagePaths(entries: DocsPageEntry[]): string[] {
  const out: string[] = [];
  for (const entry of entries) {
    if (typeof entry === "string") {
      out.push(entry);
    } else if (entry && typeof entry === "object" && "pages" in entry) {
      out.push(...flattenPagePaths(entry.pages));
    }
  }
  return out;
}

export async function listAllDocPagePaths(): Promise<string[]> {
  const config = await loadDocsJson();
  const paths = new Set<string>();
  for (const group of config.navigation.groups ?? []) {
    for (const p of flattenPagePaths(group.pages ?? [])) {
      paths.add(p);
    }
  }
  return [...paths].sort();
}

export function hrefToSlugSegments(href: string): string[] {
  const clean = href.replace(/^\//, "").replace(/\/$/, "");
  return clean ? clean.split("/") : [];
}

export function slugSegmentsToPagePath(slug: string[]): string {
  return slug.length === 0 ? "index" : slug.join("/");
}

export function mdxFileForPagePath(
  pagePath: string,
  locale: Locale = defaultLocale,
): string {
  return resolveMdxFilePath(pagePath, locale).filePath;
}

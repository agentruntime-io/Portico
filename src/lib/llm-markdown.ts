import { flattenPagePaths, loadDocsJson } from "@/lib/docs-config";
import { defaultLocale, type Locale } from "@/lib/i18n";
import { localeFromSlug } from "@/lib/locale-routing";
import { isPageIndexable } from "@/lib/page-meta";
import { loadMdxPage } from "@/lib/mdx-pages";

/**
 * Markdown views of docs pages for LLMs and agents: `/<page>.md`, `/llms-full.txt`
 * and the docs MCP server all render pages through this module. Only pages a
 * visitor could find (not `draft`, not `noindex`) are exposed.
 */

export type MarkdownPage = {
  title: string;
  /** Frontmatter description only; there is no body-excerpt fallback here. */
  description?: string;
  /** MDX body with frontmatter removed. Components are left in the text. */
  body: string;
  pagePath: string;
  /** Site-relative URL of the HTML page, e.g. `/workflows/studio` or `/es/workflows/studio`. */
  href: string;
  locale: Locale;
};

/** Slug segments must be plain names: no empty parts, dot segments or separators. */
function isSafeSegment(segment: string): boolean {
  return (
    segment.length > 0 &&
    segment !== "." &&
    segment !== ".." &&
    !/[\/\0]/.test(segment)
  );
}

/**
 * Load a page as Markdown. `slug` is the URL path split into segments, optionally
 * starting with a locale code (`["es", "workflows", "studio"]`); an empty slug is
 * the home page. Returns null for unknown, draft and noindex pages.
 */
export async function loadMarkdownPage(
  slug: string[],
): Promise<MarkdownPage | null> {
  if (!slug.every(isSafeSegment)) return null;
  const { locale, contentSlug } = localeFromSlug(slug);
  return loadMarkdownPageFor(contentSlug, locale);
}

export async function loadMarkdownPageFor(
  contentSlug: string[],
  locale: Locale = defaultLocale,
): Promise<MarkdownPage | null> {
  if (!contentSlug.every(isSafeSegment)) return null;
  const page = await loadMdxPage(contentSlug, locale);
  if (!page || !isPageIndexable(page)) return null;
  return {
    title: page.title,
    description: page.frontmatterDescription?.trim() || undefined,
    body: page.rawBody.trim(),
    pagePath: page.pagePath,
    href: page.href,
    locale: page.locale,
  };
}

/** The page as served at `/<page>.md`: `# Title`, the description, then the body. */
export function renderPageMarkdown(page: MarkdownPage): string {
  return [`# ${page.title}`, page.description, page.body]
    .filter((part): part is string => Boolean(part))
    .join("\n\n")
    .concat("\n");
}

export type NavPageEntry = { pagePath: string; group?: string };

/**
 * Every page listed in docs.json, in navigation order, each once (a page under two
 * groups keeps the first). The home page comes first when the navigation omits it.
 */
export async function listNavPages(): Promise<NavPageEntry[]> {
  const config = await loadDocsJson();
  const seen = new Set<string>();
  const out: NavPageEntry[] = [];
  const add = (pagePath: string, group?: string) => {
    if (seen.has(pagePath)) return;
    seen.add(pagePath);
    out.push({ pagePath, group });
  };

  for (const group of config.navigation.groups ?? []) {
    for (const pagePath of flattenPagePaths(group.pages ?? [])) {
      add(pagePath, group.group);
    }
  }
  if (!seen.has("index")) out.unshift({ pagePath: "index" });
  return out;
}

export function pagePathToSlug(pagePath: string): string[] {
  return pagePath === "index" ? [] : pagePath.split("/").filter(Boolean);
}

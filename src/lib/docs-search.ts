import { textEntry } from "../../scripts/search-text.mjs";
import {
  listNavPages,
  loadMarkdownPage,
  pagePathToSlug,
} from "@/lib/llm-markdown";
import {
  prepareIndex,
  searchIndex,
  type PreparedEntry,
  type SearchEntry,
} from "@/lib/search";

/**
 * Server-side docs search for the MCP server.
 *
 * The browser search reads `public/search-index.json`, but a serverless route cannot
 * rely on `public/` being inside its bundle (on Vercel it is served from the CDN).
 * So the index is built here from the content loader, once per server process, with
 * the same text pipeline (`scripts/search-text.mjs`) and the same ranking
 * (`searchIndex` in `src/lib/search.ts`) as the browser. Every hit is a docs page,
 * so each one can be opened with `get_page`.
 */

export type DocsHit = {
  title: string;
  /** Site-relative page URL, e.g. `/workflows/studio`. */
  href: string;
  group?: string;
  snippet: string;
};

let cached: Promise<PreparedEntry[]> | null = null;

async function buildIndex(): Promise<PreparedEntry[]> {
  const entries: SearchEntry[] = [];
  for (const { pagePath, group } of await listNavPages()) {
    const page = await loadMarkdownPage(pagePathToSlug(pagePath));
    if (!page) continue;
    const entry: SearchEntry = textEntry(page.href, page.title, page.body);
    if (group) entry.group = group;
    entries.push(entry);
  }
  return prepareIndex(entries);
}

function getIndex(): Promise<PreparedEntry[]> {
  // In dev the content changes under the server, so skip the cache there.
  if (process.env.NODE_ENV !== "production") return buildIndex();
  cached ??= buildIndex().catch((error) => {
    cached = null;
    throw error;
  });
  return cached;
}

export async function searchDocs(query: string, limit: number): Promise<DocsHit[]> {
  const index = await getIndex();
  return searchIndex(index, query, limit).map((hit) => ({
    title: hit.title,
    href: hit.href,
    group: hit.group,
    snippet: hit.snippet.replace(/\s+/g, " ").trim(),
  }));
}

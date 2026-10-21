export type SearchEntry = {
  url: string;
  title: string;
  headings?: string[];
  excerpt: string;
  body?: string;
};

export type PreparedEntry = SearchEntry & {
  /** Lower-cased, hyphen/underscore→space normalised search fields. */
  n: { title: string; headings: string; body: string; url: string };
};

export type SearchResult = PreparedEntry & {
  score: number;
  snippet: string;
};

/** Hyphens, underscores, slashes and punctuation all count as word breaks. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function tokenize(query: string): string[] {
  const all = Array.from(new Set(normalize(query).split(" ").filter(Boolean)));
  // Single letters ("a", "i") match everywhere; ignore them unless they're all there is.
  const meaningful = all.filter((t) => t.length > 1);
  return meaningful.length ? meaningful : all;
}

export function prepareIndex(entries: SearchEntry[]): PreparedEntry[] {
  return entries.map((e) => ({
    ...e,
    n: {
      title: normalize(e.title),
      headings: normalize((e.headings ?? []).join(" \n ")),
      body: normalize(e.body ?? e.excerpt),
      url: normalize(e.url),
    },
  }));
}

function wordStart(haystack: string, token: string): boolean {
  return haystack.startsWith(token) || haystack.includes(` ${token}`);
}

const SNIPPET_RADIUS = 90;

/** Raw-text snippet around the first matching token (falls back to the excerpt). */
function buildSnippet(entry: PreparedEntry, tokens: string[]): string {
  const text = entry.body ?? entry.excerpt;
  if (!text) return entry.excerpt;
  const lower = text.toLowerCase();
  let at = -1;
  for (const token of tokens) {
    const hit = lower.indexOf(token);
    if (hit !== -1 && (at === -1 || hit < at)) at = hit;
  }
  if (at === -1) return entry.excerpt;
  const start = Math.max(0, at - SNIPPET_RADIUS / 2);
  const end = Math.min(text.length, at + SNIPPET_RADIUS * 1.5);
  const slice = text.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${slice}${end < text.length ? "…" : ""}`;
}

/**
 * AND search: every query token must appear in the title, headings, URL or body.
 * Title and heading hits rank above body hits.
 */
export function searchIndex(
  index: PreparedEntry[],
  query: string,
  limit = 24,
): SearchResult[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const phrase = tokens.join(" ");

  const results: SearchResult[] = [];
  for (const entry of index) {
    const { title, headings, body, url } = entry.n;
    let score = 0;
    let ok = true;
    for (const token of tokens) {
      let s = 0;
      if (title.includes(token)) s += wordStart(title, token) ? 12 : 8;
      if (headings.includes(token)) s += wordStart(headings, token) ? 6 : 4;
      if (url.includes(token)) s += 3;
      if (body.includes(token)) s += 1;
      if (s === 0) {
        ok = false;
        break;
      }
      score += s;
    }
    if (!ok) continue;
    if (tokens.length > 1) {
      if (title.includes(phrase)) score += 10;
      if (headings.includes(phrase)) score += 5;
      if (body.includes(phrase)) score += 2;
    }
    if (title.startsWith(phrase)) score += 4;
    results.push({ ...entry, score, snippet: buildSnippet(entry, tokens) });
  }

  return results
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

/**
 * Split `text` into plain/highlighted parts for the query tokens. Matching treats
 * hyphens like spaces, so "dry run" highlights "Dry-run".
 */
export function highlightParts(
  text: string,
  tokens: string[],
): { text: string; match: boolean }[] {
  if (!tokens.length || !text) return [{ text, match: false }];
  const pattern = tokens
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "[\\s_-]+"))
    .sort((a, b) => b.length - a.length)
    .join("|");
  const re = new RegExp(pattern, "giu");
  const parts: { text: string; match: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index === undefined || m[0] === "") continue;
    if (m.index > last) parts.push({ text: text.slice(last, m.index), match: false });
    parts.push({ text: m[0], match: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), match: false });
  return parts.length ? parts : [{ text, match: false }];
}

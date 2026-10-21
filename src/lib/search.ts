export type SearchEntry = {
  url: string;
  title: string;
  headings?: string[];
  excerpt: string;
  body?: string;
  /** Fenced code text: searchable but low-weight, never shown in snippets. */
  code?: string;
};

export type PreparedEntry = SearchEntry & {
  /** Where a visitor actually lands (differs from `url` for locale fallbacks). */
  href: string;
  n: {
    /** Lower-cased, punctuation→space, padded with a leading space for word-start tests. */
    title: string;
    headings: string;
    body: string;
    code: string;
    url: string;
    bodyWords: string[];
    titleWords: string[];
  };
  avgBodyWords: number;
};

export type SearchResult = PreparedEntry & {
  score: number;
  snippet: string;
};

const STOP_WORDS = new Set([
  "a", "an", "the", "to", "of", "in", "on", "for", "and", "or", "how", "do", "i",
  "with", "is", "it", "my", "your", "you", "can", "we", "at", "by", "be",
]);

/** Hyphens, underscores, slashes and punctuation all count as word breaks. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function tokenize(query: string): string[] {
  const all = Array.from(new Set(normalize(query).split(" ").filter(Boolean)));
  // Stop-words and single letters match everywhere; ignore them unless that's all there is.
  const meaningful = all.filter((t) => t.length > 1 && !STOP_WORDS.has(t));
  return meaningful.length ? meaningful : all;
}

export function prepareIndex(
  entries: SearchEntry[],
  hrefFor: (entry: SearchEntry) => string = (e) => e.url,
): PreparedEntry[] {
  const prepared = entries.map((e) => {
    const title = normalize(e.title);
    const body = normalize(e.body ?? e.excerpt);
    return {
      ...e,
      href: hrefFor(e),
      n: {
        title: ` ${title}`,
        headings: ` ${normalize((e.headings ?? []).join(" \n "))}`,
        body: ` ${body}`,
        code: ` ${normalize(e.code ?? "")}`,
        url: ` ${normalize(e.url)}`,
        bodyWords: body.split(" "),
        titleWords: title.split(" "),
      },
      avgBodyWords: 0,
    };
  });
  const avg =
    prepared.reduce((sum, e) => sum + e.n.bodyWords.length, 0) / Math.max(prepared.length, 1);
  for (const e of prepared) e.avgBodyWords = avg || 1;
  return prepared;
}

function hasWord(haystack: string, token: string): boolean {
  return haystack.includes(` ${token}`);
}

function countWord(haystack: string, token: string): number {
  const needle = ` ${token}`;
  let count = 0;
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) return count;
    count++;
    from = at + needle.length;
  }
}

/** Smallest window (in words) containing a word-start match for every token. */
function minSpan(words: string[], tokens: string[]): number {
  if (tokens.length < 2) return 0;
  const positions = tokens.map((token) => {
    const list: number[] = [];
    for (let i = 0; i < words.length && list.length < 200; i++) {
      if (words[i].startsWith(token)) list.push(i);
    }
    return list;
  });
  if (positions.some((p) => p.length === 0)) return Infinity;
  let best = Infinity;
  for (const start of positions[0]) {
    let lo = start;
    let hi = start;
    for (let t = 1; t < positions.length; t++) {
      let nearest = positions[t][0];
      for (const p of positions[t]) {
        if (Math.abs(p - start) < Math.abs(nearest - start)) nearest = p;
      }
      lo = Math.min(lo, nearest);
      hi = Math.max(hi, nearest);
    }
    best = Math.min(best, hi - lo);
  }
  return best;
}

/** Tokens appear in query order, separated only by stop-words ("create a workspace"). */
function hasPhrase(words: string[], tokens: string[]): boolean {
  if (tokens.length < 2) return false;
  for (let i = 0; i < words.length; i++) {
    if (!words[i].startsWith(tokens[0])) continue;
    let pos = i;
    let matched = 1;
    while (matched < tokens.length) {
      let next = pos + 1;
      let skipped = 0;
      while (skipped < 2 && words[next] !== undefined && STOP_WORDS.has(words[next])) {
        next++;
        skipped++;
      }
      if (words[next] === undefined || !words[next].startsWith(tokens[matched])) break;
      pos = next;
      matched++;
    }
    if (matched === tokens.length) return true;
  }
  return false;
}

const SNIPPET_RADIUS = 90;
const BM25_K = 1.2;

/** Raw-text snippet around the best match in the prose body (falls back to the excerpt). */
function buildSnippet(entry: PreparedEntry, tokens: string[]): string {
  const text = entry.body ?? entry.excerpt;
  if (!text) return entry.excerpt;
  const lower = text.toLowerCase();
  let at = -1;
  for (const token of tokens) {
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "u");
    const m = re.exec(lower);
    if (m) {
      const hit = m.index + m[1].length;
      if (at === -1 || hit < at) at = hit;
    }
  }
  if (at === -1) return entry.excerpt;
  const start = Math.max(0, at - SNIPPET_RADIUS / 2);
  const end = Math.min(text.length, at + SNIPPET_RADIUS * 1.5);
  const slice = text.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${slice}${end < text.length ? "…" : ""}`;
}

/**
 * AND search over word starts: every query token must start a word in the title,
 * headings, URL, body or code. Title and heading hits rank above body hits; body
 * hits use a BM25-style term-frequency score, and tokens that appear close
 * together (stop-words ignored) earn a proximity bonus.
 */
export function searchIndex(
  index: PreparedEntry[],
  query: string,
  limit = 24,
): SearchResult[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];

  const results: SearchResult[] = [];
  for (const entry of index) {
    const { title, headings, body, code, url, bodyWords, titleWords } = entry.n;
    let score = 0;
    let ok = true;
    for (const token of tokens) {
      let s = 0;
      if (hasWord(title, token)) s += 14;
      if (hasWord(headings, token)) s += 7;
      if (hasWord(url, token)) s += 3;
      const tf = countWord(body, token);
      if (tf > 0) {
        const lengthNorm = 0.25 + 0.75 * (bodyWords.length / entry.avgBodyWords);
        s += 5 * ((tf * (BM25_K + 1)) / (tf + BM25_K * lengthNorm));
      } else if (hasWord(code, token)) {
        s += 0.75;
      }
      if (s === 0) {
        ok = false;
        break;
      }
      score += s;
    }
    if (!ok) continue;

    if (tokens.length > 1) {
      const titleSpan = minSpan(titleWords, tokens);
      if (hasPhrase(titleWords, tokens)) score += 20;
      else if (titleSpan <= tokens.length) score += 8;
      const bodySpan = minSpan(bodyWords, tokens);
      // Adjacent words ("create a workspace") are a far better answer than the
      // same words scattered across a page.
      if (hasPhrase(bodyWords, tokens)) {
        score += 30;
        // A page that leads with the phrase is usually the one that answers it.
        if (hasPhrase(bodyWords.slice(0, 60), tokens)) score += 12;
      }
      else if (bodySpan <= tokens.length + 1) score += 8;
      else if (bodySpan <= tokens.length * 3) score += 3;
    }
    if (title.startsWith(` ${tokens.join(" ")}`)) score += 4;
    results.push({ ...entry, score, snippet: buildSnippet(entry, tokens) });
  }

  return results
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

/**
 * Split `text` into plain/highlighted parts for the query tokens. Matching treats
 * hyphens like spaces and only highlights at word starts, so "dry run" highlights
 * "Dry-run" but "a" does not light up the middle of "Quickstart".
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
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${pattern})`, "giu");
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

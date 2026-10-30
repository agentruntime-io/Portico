export type SearchEntry = {
  url: string;
  title: string;
  headings?: string[];
  excerpt: string;
  body?: string;
  /** Fenced code text: searchable but low-weight, never shown in snippets. */
  code?: string;
  /** docs.json navigation group the page sits under ("Get started", "Platform"…). */
  group?: string;
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
    headingWords: string[][];
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

/**
 * Minimal singular/plural stemmer: "webhooks"→"webhook", "policies"→"policy",
 * "access"/"status"/"analysis" are left alone.
 */
export function stem(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (/(ss|us|is|ous)$/.test(word)) return word;
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
}

/** Hyphens, underscores, slashes and punctuation all count as word breaks; words are stemmed. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(" ")
    .map(stem)
    .join(" ");
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
        headingWords: (e.headings ?? []).map((h) => normalize(h).split(" ")),
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

/** Operation pages (/reference/<spec>/<tag>/<op>) are noise for generic queries. */
const OPERATION_URL = /^\/reference\/[^/]+\/[^/]+\/[^/]+/;
const API_QUERY_WORDS = new Set(["get", "post", "put", "patch", "delete", "endpoint", "operation", "v1"]);

type Scored = { entry: PreparedEntry; score: number; matched: number };

const idfCache = new WeakMap<PreparedEntry[], Map<string, number>>();

/** Rare terms ("invite") should outweigh ubiquitous ones ("workspace", "team"). ~1 at 10% df. */
function idfWeight(index: PreparedEntry[], token: string): number {
  let cache = idfCache.get(index);
  if (!cache) {
    cache = new Map();
    idfCache.set(index, cache);
  }
  const hit = cache.get(token);
  if (hit !== undefined) return hit;
  let df = 0;
  for (const e of index) {
    if (hasWord(e.n.title, token) || hasWord(e.n.headings, token) || hasWord(e.n.body, token)) df++;
  }
  const weight = Math.log(1 + index.length / Math.max(df, 1)) / Math.log(11);
  cache.set(token, weight);
  return weight;
}

function scoreEntry(index: PreparedEntry[], entry: PreparedEntry, tokens: string[]): Scored {
  const { title, headings, body, code, url, bodyWords, titleWords, headingWords } = entry.n;
  let score = 0;
  let matched = 0;
  let inTitle = 0;
  for (const token of tokens) {
    // Title and URL hits are decisive as-is; heading/body evidence is weighted by how
    // rare the term is, so "invite" outweighs "team" without hurting title matches.
    let direct = 0;
    let evidence = 0;
    if (hasWord(title, token)) {
      direct += 14;
      inTitle++;
    }
    if (hasWord(url, token)) direct += 3;
    if (hasWord(headings, token)) evidence += 7;
    const tf = countWord(body, token);
    if (tf >= 3 && hasWord(headings, token)) evidence += 4; // a section about it, not a mention
    if (tf > 0) {
      const lengthNorm = 0.25 + 0.75 * (bodyWords.length / entry.avgBodyWords);
      evidence += 5 * ((tf * (BM25_K + 1)) / (tf + BM25_K * lengthNorm));
    } else if (hasWord(code, token)) {
      evidence += 0.75;
    }
    if (direct + evidence > 0) matched++;
    score += direct + evidence * idfWeight(index, token);
  }

  if (tokens.length > 1 && matched === tokens.length) {
    const titleSpan = minSpan(titleWords, tokens);
    if (hasPhrase(titleWords, tokens)) score += 20;
    else if (titleSpan <= tokens.length) score += 8;
    const bodySpan = minSpan(bodyWords, tokens);
    if (hasPhrase(bodyWords, tokens)) {
      score += 30;
      // A page that leads with the phrase is usually the one that answers it.
      if (hasPhrase(bodyWords.slice(0, 60), tokens)) score += 12;
    } else if (bodySpan <= tokens.length + 1) score += 8;
    else if (bodySpan <= tokens.length * 3) score += 3;
  }
  if (tokens.length > 1 && matched === tokens.length) {
    // A heading that is (or starts with) the phrase: "Personal access tokens (PATs)".
    if (headingWords.some((w) => hasPhrase(w, tokens))) score += 18;
    if (headingWords.some((w) => hasPhrase(w.slice(0, tokens.length + 1), tokens))) score += 6;
  }
  if (title.startsWith(` ${tokens.join(" ")}`)) score += 4;

  // Exact title, or a short title that contains every term ("Inbound webhooks" for "webhook").
  if (inTitle === tokens.length) {
    if (titleWords.join(" ") === tokens.join(" ")) score += 40;
    else score += Math.max(0, 22 - 3 * (titleWords.length - tokens.length));
  }
  return { entry, score, matched };
}

/**
 * Word-start search. Every query token must start a word in the title, headings, URL,
 * body or code (singular/plural folded). Title and heading hits rank above body hits;
 * body hits use a BM25-style term-frequency score; adjacent terms (stop-words ignored)
 * and short exact titles get bonuses. When fewer than ~5 pages match every term, pages
 * matching all but one term are appended, down-ranked, so near-miss queries still land.
 */
export function searchIndex(
  index: PreparedEntry[],
  query: string,
  limit = 24,
): SearchResult[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];

  const generic = !tokens.some((t) => API_QUERY_WORDS.has(t)) && !query.includes("/");
  // Generic queries should find guides, not reference pages: damp operations hard, other
  // /reference pages lightly.
  const penalise = (entry: PreparedEntry, score: number) => {
    if (!generic) return score;
    if (OPERATION_URL.test(entry.url)) return score * 0.55;
    if (entry.url.startsWith("/reference")) return score * 0.8;
    return score;
  };

  const strict: Scored[] = [];
  const relaxed: Scored[] = [];
  for (const entry of index) {
    const scored = scoreEntry(index, entry, tokens);
    if (scored.matched === tokens.length) {
      strict.push({ ...scored, score: penalise(entry, scored.score) });
    } else if (tokens.length >= 2 && scored.matched === tokens.length - 1) {
      relaxed.push({ ...scored, score: penalise(entry, scored.score) * 0.95 });
    }
  }

  const byScore = (a: Scored, b: Scored) =>
    b.score - a.score || a.entry.title.localeCompare(b.entry.title);
  strict.sort(byScore);
  relaxed.sort(byScore);

  const merged =
    strict.length >= 5 ? strict : [...strict, ...relaxed].sort(byScore);

  return merged.slice(0, limit).map(({ entry, score }) => ({
    ...entry,
    score,
    snippet: buildSnippet(entry, tokens),
  }));
}

/**
 * Split `text` into plain/highlighted parts. Whole words are highlighted when their
 * stem starts with a query token, so "workspaces" lights up for "workspace" and
 * "Dry-run" for "dry run" — never half a word.
 */
export function highlightParts(
  text: string,
  tokens: string[],
): { text: string; match: boolean }[] {
  if (!tokens.length || !text) return [{ text, match: false }];
  const parts: { text: string; match: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(/[\p{L}\p{N}]+/gu)) {
    if (m.index === undefined) continue;
    const word = stem(m[0].toLowerCase());
    if (!tokens.some((t) => word.startsWith(t))) continue;
    if (m.index > last) parts.push({ text: text.slice(last, m.index), match: false });
    parts.push({ text: m[0], match: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), match: false });
  return parts.length ? parts : [{ text, match: false }];
}

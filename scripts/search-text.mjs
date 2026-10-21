/**
 * Markdown/MDX → plain text helpers for the search index.
 */

/** Max body characters indexed per page (keeps public/search-index.json small). */
export const MAX_BODY_CHARS = 20000;

/** Markdown/MDX → plain searchable text. */
export function stripMarkdown(src) {
  return String(src ?? "")
    .replace(/^[ \t]{0,3}(`{3,}|~{3,})[^\n]*$/gm, " ") // fence markers (keep code text)
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images → alt text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → text
    .replace(/<[^>]+>/g, " ") // JSX / HTML tags
    .replace(/\{#[\w-]+\}/g, " ") // custom heading ids
    .replace(/^#{1,6}[ \t]+/gm, "")
    .replace(/^[ \t]*>+[ \t]?/gm, "")
    .replace(/^[ \t]*([-*+]|\d+\.)[ \t]+/gm, "")
    .replace(/^[ \t]*\|?[ \t]*:?-{2,}:?[ \t]*(\|[ \t]*:?-{2,}:?[ \t]*)*\|?[ \t]*$/gm, " ") // table rules
    .replace(/\|/g, " ")
    .replace(/(\*\*|__|~~)/g, "")
    .replace(/(^|[^\w])[*_]+([^*_\n]+)[*_]+(?=[^\w]|$)/g, "$1$2")
    .replace(/`+/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Plain-text h1–h4 headings (skipping fenced code). */
export function extractHeadingTexts(content) {
  const out = [];
  let fence = null;
  for (const line of String(content ?? "").split(/\r?\n/)) {
    const f = /^[ \t]{0,3}(`{3,}|~{3,})/.exec(line);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      continue;
    }
    if (fence) continue;
    const m = /^#{1,4}[ \t]+(.+?)[ \t]*#*$/.exec(line);
    if (m) out.push(stripMarkdown(m[1]));
  }
  return out.filter(Boolean);
}

/** Split Markdown into prose and fenced code (Mermaid fences are dropped entirely). */
export function splitProseAndCode(markdown) {
  const prose = [];
  const code = [];
  let fence = null;
  let lang = "";
  for (const line of String(markdown ?? "").split(/\r?\n/)) {
    const f = /^[ \t]{0,3}(`{3,}|~{3,})[ \t]*([\w-]*)/.exec(line);
    if (f) {
      if (!fence) {
        fence = f[1][0];
        lang = f[2].toLowerCase();
      } else if (f[1][0] === fence) {
        fence = null;
        lang = "";
      }
      continue;
    }
    if (fence) {
      if (lang !== "mermaid") code.push(line);
    } else {
      prose.push(line);
    }
  }
  return { prose: prose.join("\n"), code: code.join("\n") };
}

/** Build one index entry from Markdown source. */
export function textEntry(url, title, markdown, { excerptLength = 200 } = {}) {
  const { prose, code } = splitProseAndCode(markdown);
  const body = stripMarkdown(prose);
  return {
    url,
    title,
    headings: extractHeadingTexts(markdown),
    excerpt: body.slice(0, excerptLength),
    body: body.slice(0, MAX_BODY_CHARS),
    // Searchable, but never used for snippets and scored low.
    code: stripMarkdown(code).slice(0, 4000),
  };
}

/**
 * Mintlify/kramdown-style custom heading ids: `## Title {#custom-id}`.
 *
 * MDX parses `{…}` as a JS expression while tokenising, so a remark plugin would
 * run too late — the page fails to compile first. We rewrite the source instead:
 * the id moves into a valid MDX comment expression, an empty JS block comment holding `#custom-id`,
 * which `rehypeCustomHeadingIds` (rehype-pipeline.ts) turns into the heading's id
 * before rehype-slug runs (it keeps existing ids). Fenced code is skipped.
 */

const CUSTOM_ID_RE = /^(#{1,6})[ \t]+(.+?)[ \t]*\{#([A-Za-z][\w-]*)\}[ \t]*#*[ \t]*$/;
const FENCE_RE = /^[ \t]{0,3}(`{3,}|~{3,})/;

export const HEADING_CUSTOM_ID_TEST = /^#{1,6}[ \t]+.+\{#[A-Za-z][\w-]*\}[ \t]*$/m;

export function transformHeadingIds(source) {
  if (!source.includes("{#")) return source;
  let fence = null;
  return source
    .split(/(\r?\n)/)
    .map((part) => {
      const fenceMatch = FENCE_RE.exec(part);
      if (fenceMatch) {
        const marker = fenceMatch[1];
        if (!fence) fence = marker[0];
        else if (marker[0] === fence) fence = null;
        return part;
      }
      if (fence) return part;
      const m = CUSTOM_ID_RE.exec(part);
      if (!m) return part;
      return `${m[1]} ${m[2]} {/*#${m[3]}*/}`;
    })
    .join("");
}

/** Parse a heading line's trailing `{#id}` (for TOC extraction). */
export function splitHeadingCustomId(text) {
  const m = /^(.*?)\s*\{#([A-Za-z][\w-]*)\}\s*$/.exec(text);
  return m ? { text: m[1], id: m[2] } : { text };
}

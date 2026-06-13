export type PageHeading = {
  id: string;
  text: string;
  depth: 2 | 3;
};

export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractHeadings(markdown: string): PageHeading[] {
  const headings: PageHeading[] = [];
  const used = new Map<string, number>();

  for (const line of markdown.split(/\r?\n/)) {
    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;

    const text = match[2].replace(/\[(.*?)\]\(.*?\)/g, "$1").trim();
    const base = slugifyHeading(text);
    if (!base) continue;

    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    headings.push({
      id: seen ? `${base}-${seen}` : base,
      text,
      depth: match[1].length as 2 | 3,
    });
  }

  return headings;
}

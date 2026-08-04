import fs from "fs/promises";
import path from "path";

import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeSanitize from "rehype-sanitize";

import { assertContentRoot } from "@/lib/content-root";
import { rehypeSanitizeSchema } from "@/lib/rehype-pipeline";

export const CHANGELOG_SECTIONS = [
  "added",
  "changed",
  "deprecated",
  "removed",
  "fixed",
  "security",
] as const;

export type ChangelogSectionKey = (typeof CHANGELOG_SECTIONS)[number];

export type ChangelogRelease = {
  slug: string;
  title: string;
  date: string;
  version?: string;
  areas: string[];
  summary?: string;
  sections: Partial<Record<ChangelogSectionKey, string[]>>;
  bodyMarkdown: string;
  bodyHtml: string;
  href: string;
};

const SECTION_HEADING = /^##\s+(Added|Changed|Deprecated|Removed|Fixed|Security)\s*$/im;

function slugFromFilename(filename: string): string {
  return filename.replace(/\.(mdx?|markdown)$/i, "");
}

function isReleaseFile(name: string): boolean {
  if (!/\.(mdx?|markdown)$/i.test(name)) return false;
  const base = slugFromFilename(name).toLowerCase();
  return base !== "readme" && base !== "_template" && base !== "index";
}

function normalizeStringList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-*]\s+/, "").trim())
      .filter(Boolean);
  }
  return [];
}

function sectionsFromFrontmatter(
  data: Record<string, unknown>,
): Partial<Record<ChangelogSectionKey, string[]>> {
  const sections: Partial<Record<ChangelogSectionKey, string[]>> = {};
  for (const key of CHANGELOG_SECTIONS) {
    const items = normalizeStringList(data[key]);
    if (items.length) sections[key] = items;
  }
  return sections;
}

function sectionsFromBody(
  body: string,
): {
  sections: Partial<Record<ChangelogSectionKey, string[]>>;
  remainder: string;
} {
  const sections: Partial<Record<ChangelogSectionKey, string[]>> = {};
  const parts = body.split(SECTION_HEADING);
  if (parts.length === 1) {
    return { sections, remainder: body.trim() };
  }

  const remainder = parts[0]?.trim() ?? "";
  for (let index = 1; index < parts.length; index += 2) {
    const heading = parts[index]?.trim().toLowerCase() as ChangelogSectionKey;
    const block = parts[index + 1] ?? "";
    if (!CHANGELOG_SECTIONS.includes(heading)) continue;
    const items = block
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^[-*]\s+/.test(line))
      .map((line) => line.replace(/^[-*]\s+/, "").trim())
      .filter(Boolean);
    if (items.length) sections[heading] = items;
  }

  return { sections, remainder };
}

function mergeSections(
  a: Partial<Record<ChangelogSectionKey, string[]>>,
  b: Partial<Record<ChangelogSectionKey, string[]>>,
): Partial<Record<ChangelogSectionKey, string[]>> {
  const merged: Partial<Record<ChangelogSectionKey, string[]>> = { ...a };
  for (const key of CHANGELOG_SECTIONS) {
    const fromB = b[key];
    if (!fromB?.length) continue;
    merged[key] = [...(merged[key] ?? []), ...fromB];
  }
  return merged;
}

async function changelogMarkdownToHtml(markdown: string): Promise<string> {
  if (!markdown.trim()) return "";
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeSanitize, rehypeSanitizeSchema)
    .use(rehypeStringify);

  const file = await processor.process(markdown);
  return String(file);
}

async function loadReleaseFile(
  changelogDir: string,
  filename: string,
): Promise<ChangelogRelease | null> {
  const slug = slugFromFilename(filename);
  const filePath = path.join(changelogDir, filename);
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);

  const dateRaw = data.date ?? data.released ?? slug;
  const date = String(dateRaw).slice(0, 10);

  const fromBody = sectionsFromBody(content);
  const sections = mergeSections(sectionsFromFrontmatter(data), fromBody.sections);

  const bodyMarkdown = fromBody.remainder;
  const bodyHtml = await changelogMarkdownToHtml(bodyMarkdown);

  return {
    slug,
    title: String(data.title ?? `Release ${date}`),
    date,
    version: data.version ? String(data.version) : undefined,
    areas: normalizeStringList(data.areas ?? data.tags ?? data.products),
    summary: data.summary ? String(data.summary) : data.description ? String(data.description) : undefined,
    sections,
    bodyMarkdown,
    bodyHtml,
    href: `/changelog/${slug}`,
  };
}

export async function listChangelogReleases(): Promise<ChangelogRelease[]> {
  const root = assertContentRoot();
  const changelogDir = path.join(root, "changelog");

  try {
    await fs.access(changelogDir);
  } catch {
    return [];
  }

  const entries = await fs.readdir(changelogDir);
  const releases: ChangelogRelease[] = [];

  for (const name of entries) {
    if (!isReleaseFile(name)) continue;
    const release = await loadReleaseFile(changelogDir, name);
    if (release) releases.push(release);
  }

  return releases.sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

export async function getChangelogRelease(
  slug: string,
): Promise<ChangelogRelease | null> {
  const releases = await listChangelogReleases();
  return releases.find((release) => release.slug === slug) ?? null;
}

export async function listChangelogSlugs(): Promise<string[]> {
  const releases = await listChangelogReleases();
  return releases.map((release) => release.slug);
}

export function collectChangelogFilters(releases: ChangelogRelease[]) {
  const areas = new Set<string>();
  const versions = new Set<string>();

  for (const release of releases) {
    for (const area of release.areas) areas.add(area);
    if (release.version) versions.add(release.version);
  }

  return {
    areas: [...areas].sort(),
    versions: [...versions].sort((a, b) => b.localeCompare(a, undefined, { numeric: true })),
  };
}

export function filterChangelogReleases(
  releases: ChangelogRelease[],
  filters: { area?: string; version?: string },
): ChangelogRelease[] {
  return releases.filter((release) => {
    if (filters.area && !release.areas.includes(filters.area)) return false;
    if (filters.version && release.version !== filters.version) return false;
    return true;
  });
}

export function changelogNeighbors(
  releases: ChangelogRelease[],
  slug: string,
): { prev?: ChangelogRelease; next?: ChangelogRelease } {
  const index = releases.findIndex((release) => release.slug === slug);
  if (index === -1) return {};
  return {
    prev: releases[index - 1],
    next: releases[index + 1],
  };
}

export function releaseExcerpt(release: ChangelogRelease, maxLen = 200): string {
  if (release.summary) return release.summary;
  for (const key of CHANGELOG_SECTIONS) {
    const items = release.sections[key];
    if (items?.[0]) return items[0].slice(0, maxLen);
  }
  return release.bodyMarkdown.replace(/\s+/g, " ").trim().slice(0, maxLen);
}

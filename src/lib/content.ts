import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export type ContentSection = "docs" | "guides";

export type LoadedPage = {
  slugSegments: string[];
  section: ContentSection;
  title: string;
  description?: string;
  markdownBody: string;
  filePath: string;
};

async function walkSlugs(dir: string, parts: string[]): Promise<string[][]> {
  const out: string[][] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walkSlugs(full, [...parts, ent.name])));
    } else if (ent.name.endsWith(".md")) {
      const base = ent.name.replace(/\.md$/, "");
      if (base === "index") {
        out.push(parts);
      } else {
        out.push([...parts, base]);
      }
    }
  }
  return out;
}

export async function listContentSlugs(
  section: ContentSection,
): Promise<string[][]> {
  const root = path.join(process.cwd(), "content", section);
  return walkSlugs(root, []);
}

async function readLoadedPage(
  section: ContentSection,
  baseDir: string,
  filePath: string,
  slugSegments: string[],
): Promise<LoadedPage> {
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    slugSegments,
    section,
    title: String(data.title ?? slugSegments.at(-1) ?? "Untitled"),
    description: data.description ? String(data.description) : undefined,
    markdownBody: content,
    filePath,
  };
}

export async function loadContentPage(
  section: ContentSection,
  slugSegments: string[],
): Promise<LoadedPage | null> {
  const baseDir = path.join(process.cwd(), "content", section);

  if (slugSegments.length === 0) {
    const p = path.join(baseDir, "index.md");
    try {
      await fs.access(p);
      return readLoadedPage(section, baseDir, p, []);
    } catch {
      return null;
    }
  }

  const asFile = path.join(baseDir, ...slugSegments) + ".md";
  const asDirIndex = path.join(baseDir, ...slugSegments, "index.md");

  let filePath: string | null = null;
  try {
    await fs.access(asFile);
    filePath = asFile;
  } catch {
    /* try dir index */
  }
  if (!filePath) {
    try {
      await fs.access(asDirIndex);
      filePath = asDirIndex;
    } catch {
      return null;
    }
  }

  return readLoadedPage(section, baseDir, filePath!, slugSegments);
}

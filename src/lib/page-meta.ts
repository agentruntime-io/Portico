import fs from "fs/promises";

import matter from "gray-matter";

import { defaultLocale, type Locale } from "@/lib/i18n";
import { resolveMdxFilePath } from "@/lib/locale-content";
import { excerptFromBody } from "@/lib/seo";

export type PageSeoMeta = {
  title?: string;
  sidebarTitle?: string;
  description?: string;
  draft: boolean;
  noindex: boolean;
  ogImage?: string;
};

function parseOgImage(data: Record<string, unknown>): string | undefined {
  const raw = data.ogImage ?? data.image ?? data["og:image"];
  return raw != null && String(raw).trim() ? String(raw).trim() : undefined;
}

function parsePageSeoFields(
  data: Record<string, unknown>,
  body: string,
): PageSeoMeta {
  const draft = data.draft === true;
  const noindex = data.noindex === true || draft;

  return {
    title: data.title != null ? String(data.title) : undefined,
    sidebarTitle:
      data.sidebarTitle != null ? String(data.sidebarTitle) : undefined,
    description:
      data.description != null
        ? String(data.description)
        : excerptFromBody(body) || undefined,
    draft,
    noindex,
    ogImage: parseOgImage(data),
  };
}

export function isPageIndexable(meta: Pick<PageSeoMeta, "draft" | "noindex">): boolean {
  return !meta.draft && !meta.noindex;
}

export async function loadPageSeoMeta(
  pagePath: string,
  locale: Locale = defaultLocale,
): Promise<PageSeoMeta | null> {
  const { filePath } = resolveMdxFilePath(pagePath, locale);

  try {
    await fs.access(filePath);
  } catch {
    return null;
  }

  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  return parsePageSeoFields(data, content);
}

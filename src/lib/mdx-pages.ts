import fs from "fs/promises";

import type { ReactElement } from "react";

import matter from "gray-matter";

import { compileMDX } from "next-mdx-remote/rsc";

import remarkGfm from "remark-gfm";

import { createRscMdxComponents } from "@/lib/mdx-rsc-components";

import { rehypeMdxPlugins } from "@/lib/rehype-pipeline";

import { markdownToHtml } from "@/lib/markdown";

import { slugSegmentsToPagePath } from "@/lib/docs-config";

import { defaultLocale, locales, type Locale } from "@/lib/i18n";

import { hasLocalizedMdx, resolveMdxFilePath } from "@/lib/locale-content";
import { pagePathToHref } from "@/lib/locale-routing";
import { excerptFromBody } from "@/lib/seo";



export type LoadedMdxPage = {

  slugSegments: string[];

  pagePath: string;

  href: string;

  locale: Locale;

  contentLocale: Locale;

  isContentFallback: boolean;

  alternateLocales: Locale[];

  title: string;

  sidebarTitle?: string;

  description?: string;

  draft: boolean;

  noindex: boolean;

  ogImage?: string;

  rawBody: string;

  filePath: string;

  usesMdxComponents: boolean;

};



/** Home / marketing-style pages with Card grids and raw JSX layout. */

export function bodyUsesMdxComponents(body: string): boolean {

  return /<(Card|CardGroup)\b/.test(body) || /data-product-guide-index/.test(body);

}

export function isMarketingHomePage(body: string): boolean {
  return /data-product-guide-index/.test(body);
}

export function mdxNeedsProseEnhancements(body: string): boolean {
  return (
    bodyUsesMdxComponents(body) &&
    !isMarketingHomePage(body) &&
    (/```mermaid/.test(body) || /```[a-z]/i.test(body))
  );
}



/** Turn docs.json MDX shortcodes into GFM the Markdown pipeline understands. */

export function transformMdxShortcodes(source: string): string {

  let out = source;



  out = out.replace(/<Note>\s*([\s\S]*?)\s*<\/Note>/g, (_, body) => {

    const text = body.trim();

    return `\n\n> **Note**\n>\n> ${text.replace(/\n/g, "\n> ")}\n\n`;

  });



  out = out.replace(/<Warning>\s*([\s\S]*?)\s*<\/Warning>/g, (_, body) => {

    const text = body.trim();

    return `\n\n> **Warning**\n>\n> ${text.replace(/\n/g, "\n> ")}\n\n`;

  });



  out = out.replace(/<Info>\s*([\s\S]*?)\s*<\/Info>/g, (_, body) => {

    const text = body.trim();

    return `\n\n> **Info**\n>\n> ${text.replace(/\n/g, "\n> ")}\n\n`;

  });



  out = out.replace(/<Steps>\s*([\s\S]*?)\s*<\/Steps>/g, (_, block) => {

    const steps = [

      ...block.matchAll(/<Step title="([^"]*)">\s*([\s\S]*?)\s*<\/Step>/g),

    ];

    if (!steps.length) return block;

    return (

      "\n\n" +

      steps

        .map(([, title, body], index) => {

          return `${index + 1}. **${title}**\n\n${body.trim()}\n`;

        })

        .join("\n") +

      "\n"

    );

  });



  return out;

}



function alternateLocalesForPage(pagePath: string): Locale[] {

  const available: Locale[] = [defaultLocale];

  for (const { code } of locales) {

    if (code === defaultLocale) continue;

    if (hasLocalizedMdx(pagePath, code)) available.push(code);

  }

  return available;

}



export async function listMdxSlugSegments(): Promise<string[][]> {

  const { listLocalizedSlugSegments } = await import("@/lib/locale-content");

  return listLocalizedSlugSegments();

}



export async function loadMdxPage(

  contentSlug: string[],

  locale: Locale = defaultLocale,

): Promise<LoadedMdxPage | null> {

  const pagePath = slugSegmentsToPagePath(contentSlug);

  const { filePath, contentLocale } = resolveMdxFilePath(pagePath, locale);



  try {

    await fs.access(filePath);

  } catch {

    return null;

  }



  const raw = await fs.readFile(filePath, "utf8");

  const { data, content } = matter(raw);

  const draft = data.draft === true;
  const noindex = data.noindex === true || draft;
  const ogImageRaw = data.ogImage ?? data.image ?? data["og:image"];
  const ogImage =
    ogImageRaw != null && String(ogImageRaw).trim()
      ? String(ogImageRaw).trim()
      : undefined;

  return {

    slugSegments: contentSlug,

    pagePath,

    href: pagePathToHref(pagePath, locale),

    locale,

    contentLocale,

    isContentFallback: locale !== contentLocale,

    alternateLocales: alternateLocalesForPage(pagePath),

    title: String(data.title ?? pagePath.split("/").pop() ?? "Untitled"),

    sidebarTitle: data.sidebarTitle

      ? String(data.sidebarTitle)

      : undefined,

    description: data.description
      ? String(data.description)
      : excerptFromBody(content) || undefined,

    draft,

    noindex,

    ogImage,

    rawBody: content,

    filePath,

    usesMdxComponents: bodyUsesMdxComponents(content),

  };

}



export async function loadIndexMdxPage(

  locale: Locale = defaultLocale,

): Promise<LoadedMdxPage | null> {

  return loadMdxPage([], locale);

}



export type CompiledPage =

  | { kind: "mdx"; content: ReactElement }

  | { kind: "html"; html: string };



export async function compileMdxPage(

  page: LoadedMdxPage,

): Promise<CompiledPage> {

  if (page.usesMdxComponents) {

    const { content } = await compileMDX({

      source: page.rawBody,

      components: createRscMdxComponents(page.locale),

      options: {

        parseFrontmatter: false,

        mdxOptions: {

          remarkPlugins: [remarkGfm],

          rehypePlugins: rehypeMdxPlugins as import("unified").Pluggable[],

        },

      },

    });

    return { kind: "mdx", content };

  }



  const markdown = transformMdxShortcodes(page.rawBody);

  return { kind: "html", html: await markdownToHtml(markdown) };

}



import fs from "fs";

import path from "path";

import { assertContentRoot } from "@/lib/content-root";

import {

  defaultLocale,

  locales,

  type Locale,

} from "@/lib/i18n";



export function localizedMdxRelativePath(

  pagePath: string,

  locale: Locale,

): string {

  const file = pagePath === "index" ? "index.mdx" : `${pagePath}.mdx`;

  if (locale === defaultLocale) return file;

  return path.join("i18n", locale, file);

}



export function resolveMdxFilePath(

  pagePath: string,

  locale: Locale,

): { filePath: string; contentLocale: Locale } {

  const root = assertContentRoot();



  if (locale !== defaultLocale) {

    const localized = path.join(

      root,

      localizedMdxRelativePath(pagePath, locale),

    );

    if (fs.existsSync(localized)) {

      return { filePath: localized, contentLocale: locale };

    }

  }



  const defaultFile = path.join(

    root,

    pagePath === "index" ? "index.mdx" : `${pagePath}.mdx`,

  );

  return { filePath: defaultFile, contentLocale: defaultLocale };

}



export function hasLocalizedMdx(pagePath: string, locale: Locale): boolean {

  if (locale === defaultLocale) return true;

  const root = assertContentRoot();

  const localized = path.join(

    root,

    localizedMdxRelativePath(pagePath, locale),

  );

  return fs.existsSync(localized);

}



export async function listLocalizedSlugSegments(): Promise<string[][]> {

  const { listAllDocPagePaths } = await import("@/lib/docs-config");

  const pagePaths = await listAllDocPagePaths();

  const slugs = new Set<string>();



  const add = (segments: string[]) => {

    slugs.add(JSON.stringify(segments));

  };



  for (const pagePath of pagePaths) {

    const contentSlug =

      pagePath === "index" ? [] : pagePath.split("/").filter(Boolean);

    add(contentSlug);



    for (const { code } of locales) {

      if (code === defaultLocale) continue;

      if (hasLocalizedMdx(pagePath, code)) {

        add([code, ...contentSlug]);

      }

    }

  }



  return [...slugs].map((s) => JSON.parse(s) as string[]);

}



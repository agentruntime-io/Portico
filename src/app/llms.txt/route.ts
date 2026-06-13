import { listAllDocPagePaths, pagePathToHref } from "@/lib/docs-config";
import { defaultLocale, locales } from "@/lib/i18n";
import { hasLocalizedMdx } from "@/lib/locale-content";
import { isPageIndexable, loadPageSeoMeta } from "@/lib/page-meta";
import { getNavigation } from "@/lib/nav";
import { getSiteConfig } from "@/lib/site";

export async function GET() {
  const site = await getSiteConfig();
  const nav = await getNavigation();
  const pagePaths = await listAllDocPagePaths();

  const base = site.url.replace(/\/$/, "");
  const lines: string[] = [
    `# ${site.name}`,
    ``,
    `> ${site.description}`,
    ``,
    `## Pages`,
    ``,
  ];

  if (await shouldIncludePage("index", defaultLocale)) {
    lines.push(`- ${base}/`);
  }

  for (const pagePath of pagePaths) {
    const href = pagePathToHref(pagePath);
    if (href === "/") continue;

    if (await shouldIncludePage(pagePath, defaultLocale)) {
      lines.push(`- ${base}${href}`);
    }

    for (const { code } of locales) {
      if (code === defaultLocale || !hasLocalizedMdx(pagePath, code)) continue;
      if (!(await shouldIncludePage(pagePath, code))) continue;
      lines.push(`- ${base}${pagePathToHref(pagePath, code)}`);
    }
  }

  if (site.openapi.specs.length) {
    lines.push(`- ${base}/reference`);
  }

  lines.push(``, `## Navigation`, ``);
  for (const group of nav.groups) {
    lines.push(`### ${group.label}`);
    for (const item of group.items) {
      lines.push(`- [${item.title}](${base}${item.href})`);
    }
    lines.push(``);
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

async function shouldIncludePage(pagePath: string, locale: typeof defaultLocale) {
  const meta = await loadPageSeoMeta(pagePath, locale);
  if (!meta) return false;
  return isPageIndexable(meta);
}

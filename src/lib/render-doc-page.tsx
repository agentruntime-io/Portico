import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DocsShell } from "@/components/docs-shell";
import { ContentLocaleBanner } from "@/components/content-locale-banner";
import { ProsePageLayout } from "@/components/prose-page-layout";
import { StructuredData } from "@/components/structured-data";
import { extractHeadings } from "@/lib/headings";
import { defaultLocale, type Locale } from "@/lib/i18n";
import { pagePathToHref } from "@/lib/locale-routing";
import { compileMdxPage, loadMdxPage, isMarketingHomePage, mdxNeedsProseEnhancements } from "@/lib/mdx-pages";
import { getNavigation, type NavFile } from "@/lib/nav";
import { githubEditUrl } from "@/lib/edit-url";
import { getPageNeighbors } from "@/lib/pager";
import { resolveMainNav } from "@/lib/main-nav";
import {
  breadcrumbItemsForPage,
  breadcrumbJsonLd,
  buildPageMetadata,
  techArticleJsonLd,
} from "@/lib/seo";
import { getSiteConfig } from "@/lib/site";

/** Nav group (docs.json) that contains the page, used as the breadcrumb prefix. */
function navGroupLabel(nav: NavFile, href: string): string | undefined {
  return nav.groups.find((group) => group.items.some((item) => item.href === href))
    ?.label;
}

/** `owner/repo` from a git host edit URL (GitHub, GitLab, ...); undefined if unparseable. */
function repoLabelFromEditUrl(editUrl: string | undefined): string | undefined {
  if (!editUrl) return undefined;
  try {
    const match = /^\/([^/]+)\/([^/]+)\/(?:-\/)?(?:edit|blob|tree)\//.exec(
      new URL(editUrl).pathname,
    );
    return match ? `${match[1]}/${match[2]}` : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Untranslated locale pages serve the English content; point them at the English URL
 * and keep them out of the index so they are not duplicate content.
 */
function seoTarget(page: { isContentFallback: boolean; pagePath: string; href: string; noindex: boolean }) {
  return page.isContentFallback
    ? { canonicalPath: pagePathToHref(page.pagePath, defaultLocale), noindex: true }
    : { canonicalPath: page.href, noindex: page.noindex };
}

export async function docPageMetadata(
  contentSlug: string[],
  locale: Locale,
): Promise<Metadata> {
  const page = await loadMdxPage(contentSlug, locale);
  if (!page) return {};
  const site = await getSiteConfig();

  return buildPageMetadata({
    site,
    title: page.title,
    description: page.description,
    canonicalPath: seoTarget(page).canonicalPath,
    pagePath: page.pagePath,
    alternateLocales: page.alternateLocales,
    ogImage: page.ogImage,
    draft: page.draft,
    noindex: seoTarget(page).noindex,
  });
}

export async function RenderDocPage({
  locale,
  contentSlug,
}: {
  locale: Locale;
  contentSlug: string[];
}) {
  const page = await loadMdxPage(contentSlug, locale);
  if (!page) notFound();

  const [site, nav, compiled] = await Promise.all([
    getSiteConfig(),
    getNavigation(locale),
    compileMdxPage(page),
  ]);

  const headings = extractHeadings(page.rawBody);
  const neighbors = getPageNeighbors(nav, page.href);
  const editUrl = githubEditUrl(
    site.githubEditBase,
    page.pagePath,
    page.contentLocale,
  );
  const breadcrumbs = breadcrumbItemsForPage(page.pagePath, page.title, locale);
  const mainNav = resolveMainNav(nav, site);
  const structuredData = [
    techArticleJsonLd({
      site,
      title: page.title,
      description: page.description,
      canonicalPath: seoTarget(page).canonicalPath,
      locale: page.contentLocale,
    }),
    breadcrumbJsonLd(site, breadcrumbs),
  ];

  return (
    <>
      <StructuredData data={structuredData} />
      <DocsShell
        siteName={site.name}
        nav={nav}
        activePath={page.href}
        navbar={site.navbar}
        mainNav={mainNav}
      >
        {page.isContentFallback ? (
        <ContentLocaleBanner
          requestedLocale={page.locale}
          contentLocale={page.contentLocale}
        />
      ) : null}
      <ProsePageLayout
        groupLabel={navGroupLabel(nav, page.href)}
        repoLabel={repoLabelFromEditUrl(editUrl)}
        title={page.title}
        description={page.description}
        mdx={compiled.kind === "mdx" ? compiled.content : undefined}
        html={compiled.kind === "html" ? compiled.html : undefined}
        headings={headings}
        prev={neighbors.prev}
        next={neighbors.next}
        editUrl={editUrl}
        bareMdx={compiled.kind === "mdx" && page.usesMdxComponents}
        hideChrome={isMarketingHomePage(page.rawBody)}
        enhanceMdx={mdxNeedsProseEnhancements(page.rawBody)}
        bodyClassName={
          compiled.kind === "mdx" && page.usesMdxComponents
            ? "[&_[data-product-guide-index]]:max-w-none [&_[data-product-guide-index]]:px-0"
            : undefined
        }
      />
    </DocsShell>
    </>
  );
}


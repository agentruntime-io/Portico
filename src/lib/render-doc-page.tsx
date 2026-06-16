import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DocsShell } from "@/components/docs-shell";
import { ContentLocaleBanner } from "@/components/content-locale-banner";
import { ProsePageLayout } from "@/components/prose-page-layout";
import { StructuredData } from "@/components/structured-data";
import { extractHeadings } from "@/lib/headings";
import type { Locale } from "@/lib/i18n";
import { compileMdxPage, loadMdxPage, isMarketingHomePage, mdxNeedsProseEnhancements } from "@/lib/mdx-pages";
import { getNavigation } from "@/lib/nav";
import { githubEditUrl } from "@/lib/edit-url";
import { getPageNeighbors } from "@/lib/pager";
import {
  breadcrumbItemsForPage,
  breadcrumbJsonLd,
  buildPageMetadata,
  techArticleJsonLd,
} from "@/lib/seo";
import { getSiteConfig } from "@/lib/site";
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
    canonicalPath: page.href,
    pagePath: page.pagePath,
    alternateLocales: page.alternateLocales,
    ogImage: page.ogImage,
    draft: page.draft,
    noindex: page.noindex,
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
  const structuredData = [
    techArticleJsonLd({
      site,
      title: page.title,
      description: page.description,
      canonicalPath: page.href,
      locale: page.locale,
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
      >
        {page.isContentFallback ? (
        <ContentLocaleBanner
          requestedLocale={page.locale}
          contentLocale={page.contentLocale}
        />
      ) : null}
      <ProsePageLayout
        eyebrow={
          page.pagePath === "index"
            ? "Documentation"
            : (page.pagePath.split("/")[0]?.replace(/-/g, " ") ?? "Docs")
        }
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


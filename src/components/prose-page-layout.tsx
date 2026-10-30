import { PageCrumbs } from "@/components/page-actions";
import { DocPager } from "@/components/doc-pager";
import { DocProse } from "@/components/doc-prose";
import { MdxProseEnhancer } from "@/components/mdx-prose-enhancer";
import { docProseClasses, MarkdownBody } from "@/components/markdown-body";
import { MobileTableOfContents } from "@/components/mobile-toc";
import { OnThisPage } from "@/components/on-this-page";
import type { PageHeading } from "@/lib/headings";
import type { PageNeighbor } from "@/lib/pager";
import type { ReactNode } from "react";

export function ProsePageLayout({
  groupLabel,
  repoLabel,
  title,
  description,
  html,
  mdx,
  headings,
  prev,
  next,
  editUrl,
  bareMdx = false,
  hideChrome = false,
  enhanceMdx = false,
  bodyClassName,
}: {
  /** docs.json nav group that contains this page (breadcrumb). */
  groupLabel?: string;
  /** Muted `owner/repo` label beside the edit link, derived from the edit URL. */
  repoLabel?: string;
  title: string;
  description?: string;
  html?: string;
  mdx?: ReactNode;
  headings: PageHeading[];
  prev?: PageNeighbor;
  next?: PageNeighbor;
  editUrl?: string;
  bareMdx?: boolean;
  hideChrome?: boolean;
  enhanceMdx?: boolean;
  bodyClassName?: string;
}) {
  // Chrome-less pages (the marketing home) have no layout title, so the authored
  // <h1> in the MDX is the page title and must stay visible.
  const baseProse = hideChrome
    ? docProseClasses.replace("prose-h1:hidden", "")
    : docProseClasses;
  const proseClass = bodyClassName ? `${baseProse} ${bodyClassName}` : baseProse;
  const hasToc = headings.length > 0 && !hideChrome;
  // The TOC column sits in the main area's right padding (48px from 820px), so the
  // grid pulls itself out by that amount and the article keeps the padding as a gutter.
  const layoutClass = hideChrome
    ? "mx-auto w-full max-w-6xl"
    : hasToc
      ? "min-[1180px]:-mr-12 min-[1180px]:grid min-[1180px]:grid-cols-[minmax(0,1fr)_208px]"
      : "";

  function renderMdxBody() {
    if (!mdx) return null;
    if (bareMdx) {
      return enhanceMdx || !hideChrome ? (
        <MdxProseEnhancer className={proseClass}>{mdx}</MdxProseEnhancer>
      ) : (
        <div className={proseClass}>{mdx}</div>
      );
    }
    return <DocProse className={proseClass}>{mdx}</DocProse>;
  }

  const body = (
    <article className={hideChrome ? "min-w-0" : "doc-article min-w-0"}>
      {hideChrome ? null : (
        <header>
          <PageCrumbs groupLabel={groupLabel} title={title} />
          <h1 className="doc-title">{title}</h1>
          {description ? <p className="doc-desc">{description}</p> : null}
          <MobileTableOfContents headings={headings} />
        </header>
      )}
      <div className={hideChrome ? undefined : "doc-body"}>
        {mdx ? renderMdxBody() : html ? <MarkdownBody html={html} /> : null}
      </div>
      <DocPager
        prev={prev}
        next={next}
        editUrl={hideChrome ? undefined : editUrl}
        repoLabel={repoLabel}
      />
    </article>
  );

  if (hideChrome) return <div className={layoutClass}>{body}</div>;

  return (
    <div className={layoutClass}>
      <div className={hasToc ? "min-w-0 min-[1180px]:pr-12" : "min-w-0"}>{body}</div>
      {hasToc ? (
        <aside className="doc-toc-col">
          <OnThisPage headings={headings} />
        </aside>
      ) : null}
    </div>
  );
}

import { PageActions } from "@/components/page-actions";
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
  eyebrow,
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
  eyebrow: string;
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
  const proseClass = bodyClassName
    ? `${docProseClasses} ${bodyClassName}`
    : docProseClasses;
  const hasToc = headings.length > 0;
  const layoutClass = hideChrome
    ? "mx-auto w-full max-w-6xl"
    : hasToc
      ? "mx-auto grid w-full max-w-[68rem] grid-cols-1 gap-10 xl:grid-cols-[minmax(0,46rem)_220px] xl:gap-16"
      : "mx-auto grid w-full max-w-[46rem] grid-cols-1";

  function renderMdxBody() {
    if (!mdx) return null;
    if (bareMdx) {
      const inner = <div className={proseClass}>{mdx}</div>;
      return enhanceMdx ? (
        <MdxProseEnhancer className={proseClass}>{mdx}</MdxProseEnhancer>
      ) : (
        inner
      );
    }
    return <DocProse className={proseClass}>{mdx}</DocProse>;
  }

  return (
    <div className={layoutClass}>
      <article
        className={
          hideChrome ? "min-w-0" : "min-w-0 pt-8 sm:pt-10 lg:pt-14"
        }
      >
        {hideChrome ? null : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[var(--text-main)] sm:text-4xl sm:leading-[1.15]">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-[42rem] text-[1.0625rem] leading-8 text-[var(--text-muted)] sm:mt-5 sm:text-lg">
                {description}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col gap-5 sm:mt-7 sm:gap-6">
              <PageActions editUrl={editUrl} />
              <MobileTableOfContents headings={headings} />
            </div>
          </>
        )}
        <div className={hideChrome ? undefined : "mt-10 sm:mt-14"}>
          {mdx ? renderMdxBody() : html ? <MarkdownBody html={html} /> : null}
        </div>
        <DocPager prev={prev} next={next} />
      </article>

      {hasToc && !hideChrome ? (
        <aside className="hidden pt-14 xl:block">
          <OnThisPage headings={headings} />
        </aside>
      ) : null}
    </div>
  );
}

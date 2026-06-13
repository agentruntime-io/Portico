import { PageActions } from "@/components/page-actions";
import { DocPager } from "@/components/doc-pager";
import { DocProse } from "@/components/doc-prose";
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
}) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-10">
      <article className="min-w-0 pt-6 sm:pt-8 lg:pt-14">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] sm:text-sm sm:normal-case sm:tracking-normal">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text-main)] sm:mt-4 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-muted)] sm:mt-4 sm:text-lg">
            {description}
          </p>
        ) : null}
        <div className="mt-4 sm:mt-6">
          <PageActions editUrl={editUrl} />
        </div>
        <MobileTableOfContents headings={headings} />
        <div className="mt-8 sm:mt-12">
          {mdx ? (
            <DocProse className={docProseClasses}>{mdx}</DocProse>
          ) : html ? (
            <MarkdownBody html={html} />
          ) : null}
        </div>
        <DocPager prev={prev} next={next} />
      </article>

      <aside className="hidden pt-14 lg:block">
        <OnThisPage headings={headings} />
      </aside>
    </div>
  );
}

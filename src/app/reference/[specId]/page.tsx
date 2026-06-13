import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ApiMobileRightRail,
  ApiReferenceShell,
  ApiRightRail,
} from "@/components/api-reference-shell";
import { DocPager } from "@/components/doc-pager";
import { getApiOverviewNeighbors } from "@/lib/api-pager";
import { MarkdownBody } from "@/components/markdown-body";
import { StructuredData } from "@/components/structured-data";
import { getSiteConfig } from "@/lib/site";
import { getNavigation } from "@/lib/nav";
import { markdownToHtml } from "@/lib/markdown";
import { buildPageMetadata, excerptFromBody, webPageJsonLd } from "@/lib/seo";
import { flattenOperations, loadBundledSpec } from "@/lib/openapi/core";

type Props = { params: Promise<{ specId: string }> };

export async function generateStaticParams() {
  const site = await getSiteConfig();
  return site.openapi.specs.map((s) => ({ specId: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { specId } = await params;
  const site = await getSiteConfig();
  const spec = site.openapi.specs.find((s) => s.id === specId);
  if (!spec) return {};

  const doc = await loadBundledSpec(spec.file);
  const description = excerptFromBody(doc.info?.description ?? "");

  return buildPageMetadata({
    site,
    title: spec.title,
    description: description || undefined,
    canonicalPath: `/reference/${specId}`,
  });
}

export default async function SpecOverviewPage({ params }: Props) {
  const { specId } = await params;
  const site = await getSiteConfig();
  const meta = site.openapi.specs.find((s) => s.id === specId);
  if (!meta) notFound();

  const [nav, doc] = await Promise.all([
    getNavigation(),
    loadBundledSpec(meta.file),
  ]);
  const ops = flattenOperations(specId, doc);
  const descriptionHtml = await markdownToHtml(doc.info?.description ?? "");
  const neighbors = getApiOverviewNeighbors(nav, specId, ops);
  const title = doc.info?.title ?? meta.title;
  const description = excerptFromBody(doc.info?.description ?? "");

  return (
    <ApiReferenceShell
      specId={specId}
      siteName={site.name}
      nav={nav}
      navbar={site.navbar}
      doc={doc}
      operations={ops}
      rightRail={<ApiRightRail doc={doc} />}
    >
      <StructuredData
        data={webPageJsonLd({
          site,
          title,
          description: description || undefined,
          canonicalPath: `/reference/${specId}`,
        })}
      />
      <article className="max-w-3xl">
        <div className="mb-8 flex flex-wrap gap-2">
          <span className="api-soft api-muted rounded-full px-2.5 py-1 text-xs">
            v{doc.info?.version ?? "1.0.0"}
          </span>
          <span className="api-soft api-muted rounded-full px-2.5 py-1 text-xs">
            OAS {doc.openapi ?? "3.x"}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">
          {doc.info?.title ?? meta.title}
        </h1>
        <a
          href="/openapi/agentruntime.yaml"
          className="ds-link ds-accent-text mt-4 inline-flex items-center border-b border-current text-base font-semibold"
        >
          Download OpenAPI Document
          <span className="ds-badge ml-2 px-1.5 py-0.5 text-xs font-bold">
            yaml
          </span>
        </a>
        <div className="mt-12">
          <MarkdownBody html={descriptionHtml} />
        </div>
        <ApiMobileRightRail doc={doc} />
        <DocPager prev={neighbors.prev} next={neighbors.next} />
      </article>
    </ApiReferenceShell>
  );
}

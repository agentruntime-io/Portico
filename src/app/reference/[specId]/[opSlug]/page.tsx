import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  ApiMobileRightRail,
  ApiReferenceShell,
  ApiRightRail,
} from "@/components/api-reference-shell";
import { DocPager } from "@/components/doc-pager";
import { getApiTagNeighbors } from "@/lib/api-pager";
import { MarkdownBody } from "@/components/markdown-body";
import { OperationDocView } from "@/components/operation-doc";
import { StructuredData } from "@/components/structured-data";
import { getSiteConfig } from "@/lib/site";
import { getNavigation } from "@/lib/nav";
import { markdownToHtml } from "@/lib/markdown";
import { buildPageMetadata, webPageJsonLd } from "@/lib/seo";
import {
  flattenOperations,
  getTagDescription,
  groupOperationsByTag,
  loadBundledSpec,
  slugifyTag,
  tagSlugForOperation,
} from "@/lib/openapi/core";

type Props = { params: Promise<{ specId: string; opSlug: string }> };

export async function generateStaticParams() {
  const site = await getSiteConfig();
  const out: { specId: string; opSlug: string }[] = [];
  for (const spec of site.openapi.specs) {
    const doc = await loadBundledSpec(spec.file);
    const ops = flattenOperations(spec.id, doc);
    for (const tag of groupOperationsByTag(ops).keys()) {
      out.push({ specId: spec.id, opSlug: slugifyTag(tag) });
    }
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { specId, opSlug } = await params;
  const site = await getSiteConfig();
  const meta = site.openapi.specs.find((s) => s.id === specId);
  if (!meta) return {};
  const doc = await loadBundledSpec(meta.file);
  const ops = flattenOperations(specId, doc);
  const grouped = groupOperationsByTag(ops);
  const tag = [...grouped.keys()].find((name) => slugifyTag(name) === opSlug);
  if (!tag) return {};

  const description =
    getTagDescription(doc, tag) ?? `${tag} endpoints in ${meta.title}.`;

  return buildPageMetadata({
    site,
    title: `${tag} - ${meta.title}`,
    description,
    canonicalPath: `/reference/${specId}/${opSlug}`,
  });
}

export default async function ApiTagPage({ params }: Props) {
  const { specId, opSlug } = await params;
  const site = await getSiteConfig();
  const meta = site.openapi.specs.find((s) => s.id === specId);
  if (!meta) notFound();

  const [nav, doc] = await Promise.all([
    getNavigation(),
    loadBundledSpec(meta.file),
  ]);
  const ops = flattenOperations(specId, doc);
  const grouped = groupOperationsByTag(ops);
  const tag = [...grouped.keys()].find((name) => slugifyTag(name) === opSlug);

  if (!tag) {
    const operation = ops.find((op) => op.slug === opSlug);
    if (operation) {
      redirect(
        `/reference/${specId}/${tagSlugForOperation(operation)}#${operation.slug}`,
      );
    }
    notFound();
  }

  const tagOps = grouped.get(tag) ?? [];
  const description = getTagDescription(doc, tag) ?? "";
  const descriptionHtml = await markdownToHtml(description);
  const neighbors = getApiTagNeighbors(specId, ops, opSlug);

  return (
    <ApiReferenceShell
      specId={specId}
      siteName={site.name}
      nav={nav}
      navbar={site.navbar}
      doc={doc}
      operations={ops}
      activeTag={opSlug}
      rightRail={<ApiRightRail doc={doc} operation={tagOps[0]} />}
    >
      <StructuredData
        data={webPageJsonLd({
          site,
          title: `${tag} - ${meta.title}`,
          description: description || undefined,
          canonicalPath: `/reference/${specId}/${opSlug}`,
        })}
      />
      <article className="max-w-4xl">
        <div className="mb-10">
          <p className="api-faint text-sm font-medium">
            {doc.info?.title ?? meta.title}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {tag}
          </h1>
          {descriptionHtml ? (
            <div className="mt-4">
              <MarkdownBody html={descriptionHtml} />
            </div>
          ) : null}
        </div>

        <div className="space-y-16">
          {tagOps.map((op) => (
            <section
              key={op.slug}
              className="api-divider border-t pt-12 first:border-t-0 first:pt-0"
            >
              <OperationDocView op={op} doc={doc} id={op.slug} />
            </section>
          ))}
        </div>
        <ApiMobileRightRail doc={doc} operation={tagOps[0]} />
        <DocPager prev={neighbors.prev} next={neighbors.next} />
      </article>
    </ApiReferenceShell>
  );
}

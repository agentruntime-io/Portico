import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ApiReferenceShell } from "@/components/api-reference-shell";
import { DocPager } from "@/components/doc-pager";
import { LegacyOperationHashRedirect } from "@/components/legacy-operation-hash-redirect";
import { MarkdownBody } from "@/components/markdown-body";
import { OperationIndexList } from "@/components/operation-index-list";
import { StructuredData } from "@/components/structured-data";
import { getApiTagNeighbors } from "@/lib/api-pager";
import { getNavigation } from "@/lib/nav";
import { resolveMainNav } from "@/lib/main-nav";
import { markdownToHtml } from "@/lib/markdown";
import {
  apiOperationHref,
  findTagBySlug,
  flattenOperations,
  getTagDescription,
  groupOperationsByTag,
  loadBundledSpec,
  slugifyTag,
} from "@/lib/openapi/core";
import { buildPageMetadata, webPageJsonLd } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site";

type Props = { params: Promise<{ specId: string; tagSlug: string }> };

export async function generateStaticParams() {
  const site = await getSiteConfig();
  const output: { specId: string; tagSlug: string }[] = [];

  for (const spec of site.openapi.specs) {
    const doc = await loadBundledSpec(spec.file);
    const operations = flattenOperations(spec.id, doc);
    const segments = new Set([
      ...[...groupOperationsByTag(operations).keys()].map(slugifyTag),
      ...operations.map((operation) => operation.slug),
    ]);
    for (const tagSlug of segments) output.push({ specId: spec.id, tagSlug });
  }

  return output;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { specId, tagSlug } = await params;
  const site = await getSiteConfig();
  const spec = site.openapi.specs.find((item) => item.id === specId);
  if (!spec) return {};

  const doc = await loadBundledSpec(spec.file);
  const operations = flattenOperations(specId, doc);
  const grouped = groupOperationsByTag(operations);
  const tag = findTagBySlug(grouped, tagSlug);

  if (tag) {
    return buildPageMetadata({
      site,
      title: `${tag} - ${spec.title}`,
      description:
        getTagDescription(doc, tag) ?? `${tag} endpoints in ${spec.title}.`,
      canonicalPath: `/reference/${specId}/${tagSlug}`,
    });
  }

  const legacyOperation = operations.find(
    (operation) => operation.slug === tagSlug,
  );
  if (!legacyOperation) return {};

  return buildPageMetadata({
    site,
    title:
      legacyOperation.summary ??
      `${legacyOperation.method.toUpperCase()} ${legacyOperation.path}`,
    description: legacyOperation.description,
    canonicalPath: apiOperationHref(specId, legacyOperation),
  });
}

export default async function ApiTagPage({ params }: Props) {
  const { specId, tagSlug } = await params;
  const site = await getSiteConfig();
  const spec = site.openapi.specs.find((item) => item.id === specId);
  if (!spec) notFound();

  const [nav, doc] = await Promise.all([
    getNavigation(),
    loadBundledSpec(spec.file),
  ]);
  const operations = flattenOperations(specId, doc);
  const grouped = groupOperationsByTag(operations);
  const tag = findTagBySlug(grouped, tagSlug);

  if (!tag) {
    const legacyOperation = operations.find(
      (operation) => operation.slug === tagSlug,
    );
    if (legacyOperation) redirect(apiOperationHref(specId, legacyOperation));
    notFound();
  }

  const tagOperations = grouped.get(tag) ?? [];
  const description = getTagDescription(doc, tag) ?? "";
  const descriptionHtml = description
    ? await markdownToHtml(description)
    : "";
  const neighbors = getApiTagNeighbors(specId, operations, tagSlug);
  const mainNav = resolveMainNav(nav, site);
  const hrefBySlug = Object.fromEntries(
    tagOperations.map((operation) => [
      operation.slug,
      apiOperationHref(specId, operation),
    ]),
  );

  return (
    <>
      <StructuredData
        data={webPageJsonLd({
          site,
          title: `${tag} - ${spec.title}`,
          description: description || undefined,
          canonicalPath: `/reference/${specId}/${tagSlug}`,
        })}
      />
      <ApiReferenceShell
        specId={specId}
        siteName={site.name}
        nav={nav}
        navbar={site.navbar}
        mainNav={mainNav}
        openApiFile={spec.file}
        operations={operations}
        activeTag={tagSlug}
      >
        <LegacyOperationHashRedirect hrefBySlug={hrefBySlug} />
        <article className="mx-auto max-w-4xl">
          <div className="mb-10">
            <p className="api-faint text-sm font-medium">
              {doc.info?.title ?? spec.title}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {tag}
            </h1>
            {descriptionHtml ? (
              <div className="mt-4">
                <MarkdownBody html={descriptionHtml} />
              </div>
            ) : null}
            <p className="api-muted mt-5 text-sm">
              {tagOperations.length}{" "}
              {tagOperations.length === 1 ? "endpoint" : "endpoints"}
            </p>
          </div>

          <OperationIndexList
            specId={specId}
            operations={tagOperations}
          />
          <DocPager prev={neighbors.prev} next={neighbors.next} />
        </article>
      </ApiReferenceShell>
    </>
  );
}

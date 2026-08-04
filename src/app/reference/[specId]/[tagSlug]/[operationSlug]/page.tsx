import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ApiMobileRightRail,
  ApiReferenceShell,
  ApiRightRail,
} from "@/components/api-reference-shell";
import { DocPager } from "@/components/doc-pager";
import { OperationDocView } from "@/components/operation-doc";
import { StructuredData } from "@/components/structured-data";
import { getApiOperationNeighbors } from "@/lib/api-pager";
import { resolveMainNav } from "@/lib/main-nav";
import { getNavigation } from "@/lib/nav";
import {
  apiOperationHref,
  apiTagHref,
  findTagBySlug,
  flattenOperations,
  groupOperationsByTag,
  loadBundledSpec,
  tagSlugForOperation,
} from "@/lib/openapi/core";
import { buildPageMetadata, webPageJsonLd } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site";

type Props = {
  params: Promise<{
    specId: string;
    tagSlug: string;
    operationSlug: string;
  }>;
};

export async function generateStaticParams() {
  const site = await getSiteConfig();
  const output: {
    specId: string;
    tagSlug: string;
    operationSlug: string;
  }[] = [];

  for (const spec of site.openapi.specs) {
    const doc = await loadBundledSpec(spec.file);
    for (const operation of flattenOperations(spec.id, doc)) {
      output.push({
        specId: spec.id,
        tagSlug: tagSlugForOperation(operation),
        operationSlug: operation.slug,
      });
    }
  }

  return output;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { specId, operationSlug } = await params;
  const site = await getSiteConfig();
  const spec = site.openapi.specs.find((item) => item.id === specId);
  if (!spec) return {};

  const doc = await loadBundledSpec(spec.file);
  const operation = flattenOperations(specId, doc).find(
    (item) => item.slug === operationSlug,
  );
  if (!operation) return {};

  return buildPageMetadata({
    site,
    title:
      operation.summary ??
      `${operation.method.toUpperCase()} ${operation.path}`,
    description: operation.description,
    canonicalPath: apiOperationHref(specId, operation),
  });
}

export default async function ApiOperationPage({ params }: Props) {
  const { specId, tagSlug, operationSlug } = await params;
  const site = await getSiteConfig();
  const spec = site.openapi.specs.find((item) => item.id === specId);
  if (!spec) notFound();

  const [nav, doc] = await Promise.all([
    getNavigation(),
    loadBundledSpec(spec.file),
  ]);
  const operations = flattenOperations(specId, doc);
  const operation = operations.find((item) => item.slug === operationSlug);
  if (!operation) notFound();

  const canonicalTagSlug = tagSlugForOperation(operation);
  if (tagSlug !== canonicalTagSlug) {
    redirect(apiOperationHref(specId, operation));
  }

  const grouped = groupOperationsByTag(operations);
  const tag = findTagBySlug(grouped, tagSlug);
  if (!tag || !(grouped.get(tag) ?? []).some((item) => item.slug === operationSlug)) {
    notFound();
  }

  const title =
    operation.summary ??
    `${operation.method.toUpperCase()} ${operation.path}`;
  const neighbors = getApiOperationNeighbors(
    specId,
    operations,
    tagSlug,
    operationSlug,
  );
  const mainNav = resolveMainNav(nav, site);

  return (
    <>
      <StructuredData
        data={webPageJsonLd({
          site,
          title,
          description: operation.description,
          canonicalPath: apiOperationHref(specId, operation),
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
        activeSlug={operation.slug}
        rightRail={<ApiRightRail doc={doc} operation={operation} />}
      >
        <article className="min-w-0">
          <Link
            href={apiTagHref(specId, tag)}
            className="api-faint mb-6 inline-flex min-h-11 items-center text-sm font-medium transition-colors hover:text-[var(--accent-strong)]"
          >
            {tag}
          </Link>
          <OperationDocView
            op={operation}
            doc={doc}
            id={operation.slug}
            mobileTester={
              <ApiMobileRightRail
                doc={doc}
                operation={operation}
                className="mt-2"
              />
            }
          />
          <DocPager prev={neighbors.prev} next={neighbors.next} />
        </article>
      </ApiReferenceShell>
    </>
  );
}

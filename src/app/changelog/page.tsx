import type { Metadata } from "next";
import { Suspense } from "react";
import { DocsShell } from "@/components/docs-shell";
import { ChangelogTimeline } from "@/components/changelog/changelog-timeline";
import { ChangelogToolbar } from "@/components/changelog/changelog-toolbar";
import { StructuredData } from "@/components/structured-data";
import {
  collectChangelogFilters,
  filterChangelogReleases,
  listChangelogReleases,
} from "@/lib/changelog";
import { getNavigation } from "@/lib/nav";
import { resolveMainNav } from "@/lib/main-nav";
import { buildPageMetadata, webPageJsonLd } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site";
import { getMessages } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ area?: string; version?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return buildPageMetadata({
    site,
    title: "Changelog",
    description:
      "Product release notes for AgentRuntime — workflows, integrations, API, and platform updates.",
    canonicalPath: "/changelog",
  });
}

export default async function ChangelogPage({ searchParams }: Props) {
  const params = await searchParams;
  const [site, nav, allReleases] = await Promise.all([
    getSiteConfig(),
    getNavigation(),
    listChangelogReleases(),
  ]);
  const messages = getMessages("en");
  const filters = collectChangelogFilters(allReleases);
  const releases = filterChangelogReleases(allReleases, {
    area: params.area,
    version: params.version,
  });
  const hasActiveFilters = Boolean(params.area || params.version);
  const mainNav = resolveMainNav(nav, site);
  const emptyMessage =
    allReleases.length === 0
      ? messages.changelog.emptyNoReleases
      : hasActiveFilters
        ? messages.changelog.emptyFiltered
        : messages.changelog.emptyNoReleases;

  return (
    <>
      <StructuredData
        data={webPageJsonLd({
          site,
          title: "Changelog",
          description:
            "Product release notes for AgentRuntime — workflows, integrations, API, and platform updates.",
          canonicalPath: "/changelog",
        })}
      />
      <DocsShell
        siteName={site.name}
        nav={nav}
        activePath="/changelog"
        navbar={site.navbar}
        mainNav={mainNav}
      >
        <div className="changelog-index mx-auto max-w-3xl px-2 pt-8 sm:px-0 sm:pt-12 lg:pt-14">
          <header className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] sm:text-sm sm:normal-case sm:tracking-normal">
              {messages.changelog.eyebrow}
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text-main)] sm:text-3xl">
              {messages.changelog.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
              {messages.changelog.description}
            </p>
          </header>

          <div className="mt-8">
            <Suspense fallback={null}>
              <ChangelogToolbar areas={filters.areas} versions={filters.versions} />
            </Suspense>
          </div>

          <div className="mt-8">
            <ChangelogTimeline
              releases={releases}
              emptyMessage={emptyMessage}
              readMoreLabel={messages.changelog.readRelease}
            />
          </div>
        </div>
      </DocsShell>
    </>
  );
}

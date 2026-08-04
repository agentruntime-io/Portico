import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsShell } from "@/components/docs-shell";
import { ChangelogReleaseView } from "@/components/changelog/changelog-release-view";
import { StructuredData } from "@/components/structured-data";
import {
  changelogNeighbors,
  getChangelogRelease,
  listChangelogReleases,
  listChangelogSlugs,
  releaseExcerpt,
} from "@/lib/changelog";
import { getNavigation } from "@/lib/nav";
import { resolveMainNav } from "@/lib/main-nav";
import { buildPageMetadata, webPageJsonLd } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site";
import { getMessages } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await listChangelogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = await getChangelogRelease(slug);
  if (!release) return {};
  const site = await getSiteConfig();
  return buildPageMetadata({
    site,
    title: release.title,
    description: release.summary ?? releaseExcerpt(release),
    canonicalPath: release.href,
  });
}

export default async function ChangelogReleasePage({ params }: Props) {
  const { slug } = await params;
  const [site, nav, release, allReleases] = await Promise.all([
    getSiteConfig(),
    getNavigation(),
    getChangelogRelease(slug),
    listChangelogReleases(),
  ]);

  if (!release) notFound();

  const neighbors = changelogNeighbors(allReleases, slug);
  const messages = getMessages("en");
  const mainNav = resolveMainNav(nav, site);

  return (
    <>
      <StructuredData
        data={webPageJsonLd({
          site,
          title: release.title,
          description: release.summary ?? releaseExcerpt(release),
          canonicalPath: release.href,
        })}
      />
      <DocsShell
        siteName={site.name}
        nav={nav}
        activePath="/changelog"
        navbar={site.navbar}
        mainNav={mainNav}
      >
        <div className="px-2 sm:px-0">
          <ChangelogReleaseView
            release={release}
            prev={neighbors.prev}
            next={neighbors.next}
            labels={{
              back: messages.changelog.backToIndex,
              previous: messages.changelog.newerRelease,
              next: messages.changelog.olderRelease,
            }}
          />
        </div>
      </DocsShell>
    </>
  );
}

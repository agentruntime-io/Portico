import type { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { DocsShell } from "@/components/docs-shell";
import { ProsePageLayout } from "@/components/prose-page-layout";
import { StructuredData } from "@/components/structured-data";
import { getSiteConfig } from "@/lib/site";
import { getNavigation } from "@/lib/nav";
import { extractHeadings } from "@/lib/headings";
import { markdownToHtml } from "@/lib/markdown";
import { buildPageMetadata, excerptFromBody, webPageJsonLd } from "@/lib/seo";

async function loadChangelogPage() {
  const p = path.join(process.cwd(), "content", "changelog", "index.md");
  const raw = await fs.readFile(p, "utf8");
  const { data, content } = matter(raw);
  return {
    title: String(data.title ?? "Changelog"),
    description: data.description
      ? String(data.description)
      : excerptFromBody(content) || undefined,
    body: content,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadChangelogPage();
  const site = await getSiteConfig();
  return buildPageMetadata({
    site,
    title: page.title,
    description: page.description,
    canonicalPath: "/changelog",
  });
}

export default async function ChangelogPage() {
  const [site, nav, ch] = await Promise.all([
    getSiteConfig(),
    getNavigation(),
    loadChangelogPage(),
  ]);
  const html = await markdownToHtml(ch.body);
  const headings = extractHeadings(ch.body);

  return (
    <>
      <StructuredData
        data={webPageJsonLd({
          site,
          title: ch.title,
          description: ch.description,
          canonicalPath: "/changelog",
        })}
      />
      <DocsShell
        siteName={site.name}
        nav={nav}
        activePath="/changelog"
        navbar={site.navbar}
      >
        <ProsePageLayout
        eyebrow="Project"
        title={ch.title}
        description={ch.description}
        html={html}
        headings={headings}
      />
      </DocsShell>
    </>
  );
}

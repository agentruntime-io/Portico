import { getSiteConfig } from "@/lib/site";
import {
  listChangelogReleases,
  releaseExcerpt,
} from "@/lib/changelog";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET() {
  const site = await getSiteConfig();
  const releases = await listChangelogReleases();
  const base = site.url.replace(/\/$/, "");

  const items = releases.map((release) => {
    const link = `${base}${release.href}`;
    return `<item>
      <title>${escapeXml(release.version ? `${release.title} (v${release.version})` : release.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(`${release.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(releaseExcerpt(release))}</description>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(`${site.name} Changelog`)}</title>
    <link>${base}/changelog</link>
    <description>${escapeXml("Product release notes for AgentRuntime.")}</description>
    ${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

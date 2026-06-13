import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { getSiteConfig } from "@/lib/site";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET() {
  const site = await getSiteConfig();
  const raw = await fs.readFile(
    path.join(process.cwd(), "content", "changelog", "index.md"),
    "utf8",
  );
  const parsed = matter(raw);
  const title = String(parsed.data.title ?? "Changelog");
  const description = String(parsed.data.description ?? site.description);
  const base = site.url.replace(/\/$/, "");
  const sections = parsed.content.split(/^##\s+/m).slice(1);
  const items = sections.map((section) => {
    const [heading = "Release", ...body] = section.split(/\r?\n/);
    const cleanHeading = heading.trim();
    return `<item>
      <title>${escapeXml(cleanHeading)}</title>
      <link>${base}/changelog#${encodeURIComponent(cleanHeading.toLowerCase())}</link>
      <description>${escapeXml(body.join("\n").trim())}</description>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${base}/changelog</link>
    <description>${escapeXml(description)}</description>
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

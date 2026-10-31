import {
  listNavPages,
  loadMarkdownPage,
  pagePathToSlug,
} from "@/lib/llm-markdown";
import { getSiteConfig } from "@/lib/site";

/** Every docs page as one plain-text file, in docs.json navigation order. */
export async function GET() {
  const site = await getSiteConfig();
  const base = site.url.replace(/\/$/, "");

  const sections: string[] = [];
  for (const { pagePath } of await listNavPages()) {
    const page = await loadMarkdownPage(pagePathToSlug(pagePath));
    if (!page) continue;

    const url = page.href === "/" ? `${base}/` : `${base}${page.href}`;
    const head = `# ${page.title}\nSource: ${url}`;
    sections.push(
      [head, page.description, page.body]
        .filter((part): part is string => Boolean(part))
        .join("\n\n"),
    );
  }

  return new Response(sections.join("\n\n---\n\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

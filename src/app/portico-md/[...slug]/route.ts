import { loadMarkdownPage, renderPageMarkdown } from "@/lib/llm-markdown";

/**
 * Serves `/<page>.md`. Not requested directly: next.config.ts rewrites
 * `/<page>.md` to `/portico-md/<page>.md` (an `app/` folder starting with `_`
 * is private and cannot be routed, hence the plain name).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const last = slug[slug.length - 1] ?? "";
  if (!last.endsWith(".md")) return notFound();

  const segments = [...slug.slice(0, -1), last.slice(0, -".md".length)];
  // `/index.md` resolves to the home page: its page path is "index".
  const page = await loadMarkdownPage(segments);
  if (!page) return notFound();

  return new Response(renderPageMarkdown(page), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function notFound() {
  return new Response("Not found\n", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

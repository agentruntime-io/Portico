import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { applyRehypePlugins } from "@/lib/rehype-pipeline";

export async function markdownToHtml(markdown: string): Promise<string> {
  const processor = applyRehypePlugins(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: false }),
  ).use(rehypeStringify);

  const file = await processor.process(markdown);

  return String(file)
    .replace(/<table>/g, '<div class="doc-table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

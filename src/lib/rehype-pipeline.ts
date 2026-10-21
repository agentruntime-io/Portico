import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";
import { rehypeMermaid } from "@/lib/rehype-mermaid";

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

/** Applies the id markers written by transformHeadingIds as heading ids. */
export function rehypeCustomHeadingIds() {
  return (tree: HastNode) => {
    visit(tree, "element", (node: HastNode) => {
      if (!node.tagName || !/^h[1-6]$/.test(node.tagName) || !node.children) return;
      const idx = node.children.findIndex(
        (c) => c.type === "mdxTextExpression" && /^\/\*#[\w-]+\*\/$/.test(c.value ?? ""),
      );
      if (idx === -1) return;
      const id = (node.children[idx].value ?? "").slice(3, -2);
      node.children.splice(idx, 1);
      // trim whitespace left before the removed marker
      const prev = node.children[idx - 1];
      if (prev?.type === "text" && prev.value) prev.value = prev.value.replace(/\s+$/, "");
      node.properties = { ...node.properties, id };
    });
  };
}

export const rehypeSanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: "",
  tagNames: [...(defaultSchema.tagNames ?? []), "figure"],
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      "className",
      "class",
      "dataLanguage",
      "dataLineNumbers",
    ],
    pre: [
      ...(defaultSchema.attributes?.pre ?? []),
      "className",
      "class",
      "dataTheme",
      "tabIndex",
    ],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      "className",
      "class",
      "style",
      "dataLine",
    ],
    figure: [
      ...(defaultSchema.attributes?.figure ?? []),
      "className",
      "class",
      "dataRehypePrettyCodeFigure",
      "dataRehypePrettyCodeTitle",
    ],
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      "className",
      "class",
      "dataMermaid",
    ],
    a: [...(defaultSchema.attributes?.a ?? []), "className", "class"],
  },
};

export const rehypePlugins = [
  rehypeSlug,
  rehypeMermaid,
  [
    rehypePrettyCode,
    {
      theme: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
      keepBackground: false,
    },
  ],
  [
    rehypeAutolinkHeadings,
    {
      behavior: "wrap" as const,
      properties: { className: ["anchor-heading-link"] },
    },
  ],
  [rehypeSanitize, rehypeSanitizeSchema],
];

/** Rehype plugins for RSC MDX pages (Cards/JSX) — no sanitize to preserve custom attrs. */
export const rehypeMdxPlugins = [
  rehypeCustomHeadingIds,
  rehypeSlug,
  rehypeMermaid,
  [
    rehypePrettyCode,
    {
      theme: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
      keepBackground: false,
    },
  ],
  [
    rehypeAutolinkHeadings,
    {
      behavior: "wrap" as const,
      properties: { className: ["anchor-heading-link"] },
    },
  ],
];

export function applyRehypePlugins<T extends { use: (...args: never[]) => T }>(
  processor: T,
): T {
  for (const plugin of rehypePlugins) {
    if (Array.isArray(plugin)) {
      // unified accepts [plugin, options] tuples at runtime
      (processor.use as (...args: unknown[]) => T)(...plugin);
    } else {
      processor.use(plugin as never);
    }
  }
  return processor;
}

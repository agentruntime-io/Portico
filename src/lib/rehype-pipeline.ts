import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { rehypeMermaid } from "@/lib/rehype-mermaid";

export const rehypeSanitizeSchema = {
  ...defaultSchema,
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
  rehypeSlug,
  rehypeMermaid,
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

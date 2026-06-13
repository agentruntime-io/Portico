import { toText } from "hast-util-to-text";
import type { Root } from "hast";
import { visit } from "unist-util-visit";

/** Turn ```mermaid fenced blocks into client-hydrated mount points. */
export function rehypeMermaid() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (
        parent == null ||
        index == null ||
        node.tagName !== "pre" ||
        node.children.length !== 1
      ) {
        return;
      }
      const code = node.children[0];
      if (code.type !== "element" || code.tagName !== "code") return;

      const className = code.properties?.className;
      const classes = Array.isArray(className)
        ? className.map(String)
        : className
          ? [String(className)]
          : [];

      if (!classes.some((c) => c.includes("language-mermaid"))) return;

      const source = toText(code, { whitespace: "pre" }).trim();
      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["mermaid-diagram-mount"],
          dataMermaid: source,
        },
        children: [],
      };
    });
  };
}

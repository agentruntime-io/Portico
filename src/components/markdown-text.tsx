import type { ReactNode } from "react";

/**
 * Small, client-safe Markdown renderer for OpenAPI descriptions (paragraphs,
 * lists, fenced code, `code`, **bold**, *italic*, [links](…)). It builds React
 * elements — never raw HTML — so descriptions stay XSS-safe. The full MDX pipeline
 * (shiki, etc.) is server-only and can't run inside the client-side API reference.
 */

const INLINE_RE =
  /(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)|\*\*([^*]+)\*\*|__([^_]+)__|\[([^\]]+)\]\(([^)\s]+)\)|(?<![*\w])\*([^*\n]+)\*(?!\*)|(?<![_\w])_([^_\n]+)_(?![_\w])/g;

function safeHref(href: string): string | null {
  return /^(https?:|mailto:|\/|#)/i.test(href) ? href : null;
}

function renderInline(text: string, keyPrefix = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const key = `${keyPrefix}${n++}`;
    if (m[2] !== undefined) {
      out.push(<code key={key}>{m[2].trim()}</code>);
    } else if (m[3] !== undefined || m[4] !== undefined) {
      out.push(<strong key={key}>{renderInline(m[3] ?? m[4], `${key}-`)}</strong>);
    } else if (m[5] !== undefined) {
      const href = safeHref(m[6]);
      out.push(
        href ? (
          <a key={key} href={href}>
            {m[5]}
          </a>
        ) : (
          m[5]
        ),
      );
    } else {
      out.push(<em key={key}>{renderInline(m[7] ?? m[8], `${key}-`)}</em>);
    }
    last = idx + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "code"; text: string };

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: "p", text: para.join(" ").trim() });
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fence) {
      flush();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith(fence[1])) {
        code.push(lines[i]);
        i++;
      }
      blocks.push({ kind: "code", text: code.join("\n") });
      continue;
    }
    const li = /^\s*([-*+]|\d+[.)])\s+(.*)$/.exec(line);
    if (li) {
      flush();
      const kind = /\d/.test(li[1]) ? "ol" : "ul";
      const last = blocks[blocks.length - 1];
      if (last && last.kind === kind) last.items.push(li[2]);
      else blocks.push({ kind, items: [li[2]] });
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    // continuation of the previous list item
    const prev = blocks[blocks.length - 1];
    if (!para.length && prev && (prev.kind === "ul" || prev.kind === "ol") && /^\s+\S/.test(line)) {
      prev.items[prev.items.length - 1] += ` ${line.trim()}`;
      continue;
    }
    para.push(line.trim());
  }
  flush();
  return blocks;
}

const BASE =
  "[&_code]:before:content-none [&_code]:after:content-none [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5";

export function MarkdownText({
  text,
  inline = false,
  className,
}: {
  text: string | undefined | null;
  /** Render without block wrappers (for table cells and one-line summaries). */
  inline?: boolean;
  className?: string;
}) {
  if (!text) return null;

  if (inline) {
    return <span className={`${BASE} ${className ?? ""}`}>{renderInline(text.replace(/\s*\n\s*/g, " "))}</span>;
  }

  return (
    <div className={`${BASE} ${className ?? ""}`}>
      {parseBlocks(text).map((b, i) => {
        if (b.kind === "p") return <p key={i}>{renderInline(b.text)}</p>;
        if (b.kind === "code")
          return (
            <pre key={i}>
              <code>{b.text}</code>
            </pre>
          );
        const Tag = b.kind;
        return (
          <Tag key={i}>
            {b.items.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </Tag>
        );
      })}
    </div>
  );
}

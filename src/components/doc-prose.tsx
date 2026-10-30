"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { CodeCopyButton } from "@/components/code-copy-button";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { useScrollRegions } from "@/lib/use-scroll-regions";

function extractCodeText(pre: HTMLElement): string {
  return pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
}

function MermaidMount({ source }: { source: string }) {
  return <MermaidDiagram chart={source} />;
}

type CopyTarget = { id: string; pre: HTMLElement; slot: HTMLElement };

/**
 * Builds the header row (title or language label, Copy slot) for a code container.
 * Idempotent: returns the existing slot when the header is already there.
 */
function ensureCodeHeader(container: HTMLElement, pre: HTMLElement): HTMLElement {
  const existing = container.querySelector<HTMLElement>(
    ":scope > .code-head .code-copy-slot",
  );
  if (existing) return existing;

  const lang = pre.getAttribute("data-language") ?? "";
  const title = container
    .querySelector(":scope > figcaption[data-rehype-pretty-code-title]")
    ?.textContent?.trim();

  const head = document.createElement("div");
  head.className = "code-head";

  const label = title || lang;
  if (label) {
    const left = document.createElement("span");
    left.className = title ? "code-label code-label-title" : "code-label code-lang";
    left.textContent = label;
    head.appendChild(left);
  }

  const end = document.createElement("div");
  end.className = "code-head-end";
  if (title && lang) {
    const right = document.createElement("span");
    right.className = "code-lang";
    right.textContent = lang;
    end.appendChild(right);
  }
  const slot = document.createElement("span");
  slot.className = "code-copy-slot";
  end.appendChild(slot);
  head.appendChild(end);

  container.insertBefore(head, container.firstChild);
  return slot;
}

/**
 * Gives every standalone code block a header row with its language and a Copy button.
 * Blocks inside a `CodeGroup` already render their own header and are skipped.
 * Returns the portals that mount the Copy buttons.
 */
export function useCodeBlocks(
  rootRef: RefObject<HTMLElement | null>,
  deps: ReactNode,
): ReactNode {
  const [targets, setTargets] = useState<CopyTarget[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const next: CopyTarget[] = [];
    let index = 0;
    const add = (container: HTMLElement, pre: HTMLElement) => {
      next.push({
        id: `code-copy-${index++}`,
        pre,
        slot: ensureCodeHeader(container, pre),
      });
    };

    root
      .querySelectorAll<HTMLElement>("figure[data-rehype-pretty-code-figure]")
      .forEach((figure) => {
        if (figure.closest("[data-code-group]")) return;
        const pre = figure.querySelector<HTMLElement>("pre");
        if (pre) add(figure, pre);
      });

    root.querySelectorAll<HTMLElement>("pre").forEach((pre) => {
      if (pre.closest("figure[data-rehype-pretty-code-figure]")) return;
      if (pre.closest("[data-code-group]")) return;
      let wrap = pre.closest<HTMLElement>(".doc-code-bare");
      if (!wrap) {
        wrap = document.createElement("div");
        wrap.className = "doc-code-bare";
        pre.parentNode?.insertBefore(wrap, pre);
        wrap.appendChild(pre);
      }
      add(wrap, pre);
    });

    setTargets(next);
  }, [rootRef, deps]);

  return targets.map(({ id, pre, slot }) =>
    createPortal(<CodeCopyButton code={() => extractCodeText(pre)} />, slot, id),
  );
}

export function DocProse({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mermaidMounts, setMermaidMounts] = useState<
    { id: string; source: string; el: HTMLElement }[]
  >([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mounts: { id: string; source: string; el: HTMLElement }[] = [];
    root.querySelectorAll<HTMLElement>("[data-mermaid]").forEach((el, index) => {
      const source = el.getAttribute("data-mermaid");
      if (!source) return;
      const id = `mermaid-mount-${index}`;
      el.setAttribute("data-mermaid-id", id);
      el.replaceChildren();
      mounts.push({ id, source, el });
    });
    setMermaidMounts(mounts);
  }, [children]);

  const copyPortals = useCodeBlocks(rootRef, children);
  useScrollRegions(rootRef, children);

  return (
    <div ref={rootRef} className={className}>
      {children}
      {mermaidMounts.map(({ id, source, el }) =>
        createPortal(<MermaidMount source={source} />, el, id),
      )}
      {copyPortals}
    </div>
  );
}

/** Extract Tab panels from CodeGroup children. */
export function collectTabPanels(children: ReactNode): { title: string; body: ReactNode }[] {
  const panels: { title: string; body: ReactNode }[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as { title?: string; children?: ReactNode };
    if (typeof props.title === "string") {
      panels.push({ title: props.title, body: props.children });
    }
  });
  return panels;
}

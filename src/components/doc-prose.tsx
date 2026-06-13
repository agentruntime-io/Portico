"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CodeCopyButton } from "@/components/code-copy-button";
import { MermaidDiagram } from "@/components/mermaid-diagram";

function extractCodeText(pre: HTMLPreElement): string {
  return pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
}

function MermaidMount({ source }: { source: string }) {
  return <MermaidDiagram chart={source} />;
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

    root.querySelectorAll("figure[data-rehype-pretty-code-figure]").forEach(
      (figure) => {
        const pre = figure.querySelector("pre");
        if (!pre || figure.querySelector(".code-copy-wrap")) return;

        const wrap = document.createElement("div");
        wrap.className = "code-copy-wrap relative";
        pre.parentNode?.insertBefore(wrap, pre);
        wrap.appendChild(pre);
      },
    );

    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.closest("figure[data-rehype-pretty-code-figure]")) return;
      if (pre.closest(".code-copy-wrap")) return;
      if (pre.closest(".ds-code-panel")) return;

      const wrap = document.createElement("div");
      wrap.className = "code-copy-wrap relative";
      pre.parentNode?.insertBefore(wrap, pre);
      wrap.appendChild(pre);
    });
  }, [children]);

  const copyTargets = useCopyTargets(rootRef, children);

  return (
    <div ref={rootRef} className={className}>
      {children}
      {mermaidMounts.map(({ id, source, el }) =>
        createPortal(<MermaidMount source={source} />, el, id),
      )}
      {copyTargets.map(({ id, code, el }) =>
        createPortal(<CodeCopyButton code={code} />, el, id),
      )}
    </div>
  );
}

function useCopyTargets(
  rootRef: React.RefObject<HTMLDivElement | null>,
  children: ReactNode,
) {
  const [targets, setTargets] = useState<
    { id: string; code: string; el: HTMLElement }[]
  >([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const next: { id: string; code: string; el: HTMLElement }[] = [];
    root.querySelectorAll(".code-copy-wrap").forEach((wrap, index) => {
      const pre = wrap.querySelector("pre");
      if (!pre) return;
      const id = `code-copy-${index}`;
      wrap.setAttribute("data-copy-id", id);
      const slot = document.createElement("div");
      slot.className = "code-copy-slot";
      wrap.insertBefore(slot, pre);
      next.push({ id, code: extractCodeText(pre), el: slot });
    });
    setTargets(next);
  }, [rootRef, children]);

  return targets;
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

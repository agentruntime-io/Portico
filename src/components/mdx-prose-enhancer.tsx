"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MermaidDiagram } from "@/components/mermaid-diagram";

function MermaidMount({ source }: { source: string }) {
  return <MermaidDiagram chart={source} />;
}

/** Client hydration for mermaid blocks in RSC-compiled MDX pages. */
export function MdxProseEnhancer({
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
      const id = `mdx-mermaid-mount-${index}`;
      el.setAttribute("data-mermaid-id", id);
      el.replaceChildren();
      mounts.push({ id, source, el });
    });
    setMermaidMounts(mounts);
  }, [children]);

  return (
    <div ref={rootRef} className={className}>
      {children}
      {mermaidMounts.map(({ id, source, el }) =>
        createPortal(<MermaidMount source={source} />, el, id),
      )}
    </div>
  );
}

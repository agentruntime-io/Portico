"use client";

import { useEffect, useId, useRef, useState } from "react";

function readTheme(): "light" | "dark" {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function MermaidDiagram({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setTheme(readTheme());
    const observer = new MutationObserver(() => {
      setTheme(readTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === "light" ? "neutral" : "dark",
          securityLevel: "strict",
          fontFamily: "inherit",
        });
        const { svg: rendered } = await mermaid.render(
          `mermaid-${id}-${theme}`,
          chart.trim(),
        );
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to render diagram",
          );
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [chart, id, theme]);

  if (error) {
    return (
      <div className="ds-callout ds-callout-warning my-6 text-sm">
        <p className="font-semibold">Mermaid diagram error</p>
        <pre className="mt-2 overflow-x-auto text-xs">{error}</pre>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="mermaid-diagram my-6 flex justify-center overflow-x-auto rounded-xl border border-[var(--panel-border)] bg-[var(--sidebar-bg)] p-4"
      {...(svg
        ? { dangerouslySetInnerHTML: { __html: svg } }
        : { "aria-busy": true, children: null })}
    />
  );
}

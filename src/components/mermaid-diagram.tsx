"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { useDialog } from "@/lib/a11y/use-dialog";

function readTheme(): "light" | "dark" {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/**
 * Mermaid sizes SVGs to `width="100%"; max-width: <natural>`, which shrinks wide
 * diagrams until the labels are unreadable. Pin the SVG to its natural pixel width
 * instead; the container scrolls horizontally and the expand dialog shows it whole.
 */
function pinNaturalSize(svg: string): string {
  const tag = /<svg\b[^>]*>/.exec(svg)?.[0];
  if (!tag) return svg;
  const viewBox = /viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/.exec(tag);
  if (!viewBox) return svg;
  const width = Math.ceil(Number(viewBox[1]));
  const pinned = tag
    .replace(/\swidth="[^"]*"/, "")
    .replace(/\sstyle="[^"]*"/, "")
    .replace(/^<svg/, `<svg width="${width}" style="max-width:none;height:auto"`);
  return svg.replace(tag, pinned);
}

export function MermaidDiagram({ chart }: { chart: string }) {
  const { t } = useI18n();
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialog(expanded, () => setExpanded(false), dialogRef);

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
    // Keep the previous SVG while re-rendering for a theme change (no layout jump).

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
          setSvg(pinNaturalSize(rendered));
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
        <p className="font-semibold">{t("diagram.error")}</p>
        <pre className="mt-2 overflow-x-auto text-xs">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div
        aria-busy="true"
        className="mermaid-diagram mermaid-diagram-skeleton my-6 flex items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[var(--sidebar-bg)] p-4 text-sm text-[var(--text-muted)]"
      >
        {t("diagram.rendering")}
      </div>
    );
  }

  return (
    <div className="mermaid-diagram group relative my-6 rounded-xl border border-[var(--panel-border)] bg-[var(--sidebar-bg)]">
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={t("diagram.expand")}
        title={t("diagram.expand")}
        className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
      >
        <Maximize2 className="h-4 w-4" aria-hidden />
      </button>
      <div
        className="overflow-x-auto p-4 pr-12 [scrollbar-width:thin]"
        tabIndex={0}
        role="region"
        aria-label={t("diagram.region")}
      >
        <div className="mx-auto w-fit" dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
      {expanded
        ? createPortal(
            <div
              className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/60 p-3 sm:p-6"
              onClick={() => setExpanded(false)}
            >
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={t("diagram.expand")}
                className="relative max-h-full max-w-full overflow-auto rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 pt-12"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label={t("diagram.close")}
                  className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--panel-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
                <div className="mermaid-diagram mx-auto w-fit" dangerouslySetInnerHTML={{ __html: svg }} />
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

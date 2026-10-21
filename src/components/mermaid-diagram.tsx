"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minus, Plus, ScanLine, X, type LucideIcon } from "lucide-react";
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

function ToolButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--panel-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] sm:h-9 sm:w-9"
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}

export function MermaidDiagram({ chart }: { chart: string }) {
  const { t } = useI18n();
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [overflowing, setOverflowing] = useState(false);
  const naturalWidth = Number(/<svg[^>]*\swidth="(\d+)"/.exec(svg ?? "")?.[1] ?? 0);
  const viewBox = /viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/.exec(svg ?? "");
  const naturalHeight = viewBox ? Number(viewBox[2]) : 0;

  const fit = () => {
    const available = viewportRef.current?.clientWidth ?? 0;
    if (available && naturalWidth) setScale(Math.min(3, Math.max(0.2, (available - 32) / naturalWidth)));
  };

  // Open at the largest legible scale rather than 1:1.
  // Desktop: fit to width, but never below 0.6. Phones: fit to height (flat diagrams
  // then fill the screen at a readable size and pan sideways), clamped to 0.6–1.
  useLayoutEffect(() => {
    if (!expanded) return;
    const viewport = viewportRef.current;
    if (!viewport || !naturalWidth || !naturalHeight) return;
    const desktop = window.matchMedia("(min-width: 640px)").matches;
    const fitW = (viewport.clientWidth - 48) / naturalWidth;
    const fitH = (viewport.clientHeight - 48) / naturalHeight;
    const next = desktop
      ? Math.max(0.6, Math.min(1.5, fitW))
      : Math.max(0.6, Math.min(1, fitH));
    setScale(Math.round(next * 100) / 100);
  }, [expanded, naturalWidth, naturalHeight]);

  // Show the pan hint only when there is something to pan.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!expanded || !viewport) return;
    setOverflowing(
      viewport.scrollWidth > viewport.clientWidth + 1 ||
        viewport.scrollHeight > viewport.clientHeight + 1,
    );
  }, [expanded, scale]);

  // Mouse drag-to-pan (touch uses native scrolling and pinch).
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = e.currentTarget;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    e.currentTarget.scrollLeft = d.left - (e.clientX - d.x);
    e.currentTarget.scrollTop = d.top - (e.clientY - d.y);
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const zoom = (factor: number) =>
    setScale((s) => Math.min(3, Math.max(0.2, Math.round(s * factor * 100) / 100)));

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
        className="absolute right-2 top-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-md border sm:h-9 sm:w-9 border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
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
              className="fixed inset-0 z-[var(--z-modal)] flex items-stretch justify-center bg-black/60 sm:items-center sm:p-6"
              onClick={() => setExpanded(false)}
            >
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={t("diagram.expand")}
                className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--panel-bg)] sm:h-auto sm:max-h-[90vh] sm:min-h-[50vh] sm:w-[min(96vw,1700px)] sm:rounded-xl sm:border sm:border-[var(--panel-border)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex shrink-0 items-center justify-end gap-1 border-b border-[var(--panel-border)] p-2">
                  {overflowing ? (
                    <p className="mr-auto min-w-0 truncate pl-2 text-xs text-[var(--text-muted)]">
                      {t("diagram.panHint")}
                    </p>
                  ) : null}
                  <ToolButton label={t("diagram.zoomOut")} icon={Minus} onClick={() => zoom(0.8)} />
                  <ToolButton label={t("diagram.zoomIn")} icon={Plus} onClick={() => zoom(1.25)} />
                  <ToolButton label={t("diagram.fit")} icon={ScanLine} onClick={() => fit()} />
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    aria-label={t("diagram.close")}
                    title={t("diagram.close")}
                    className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--panel-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] sm:h-9 sm:w-9"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div
                  ref={viewportRef}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  className={`min-h-0 flex-1 overflow-auto p-4 [touch-action:pan-x_pan-y_pinch-zoom] sm:p-6 ${
                    overflowing ? "cursor-grab active:cursor-grabbing" : ""
                  }`}
                >
                  <div className="flex min-h-full min-w-full items-center">
                    <div
                      className="mermaid-diagram mx-auto w-fit"
                      style={{ zoom: scale }}
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

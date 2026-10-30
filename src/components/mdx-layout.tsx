"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { CodeCopyButton } from "@/components/code-copy-button";
import { collectTabPanels } from "@/components/doc-prose";

export function Tab({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
  icon?: string;
}) {
  return (
    <div data-tab-title={title} className="ds-tab-panel">
      {children}
    </div>
  );
}

/**
 * Tabs with roving tabindex: Left/Right (and Home/End) move focus and select.
 * `variant="code"` renders a code-block shell: tab strip, language label and Copy.
 */
function TabsView({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "default" | "code";
}) {
  const baseId = useId();
  const panels = collectTabPanels(children);
  const [active, setActive] = useState(0);
  const [lang, setLang] = useState("");
  const panelsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isCode = variant === "code";

  useEffect(() => {
    if (!isCode) return;
    const pre = panelsRef.current?.querySelector<HTMLElement>(
      '[role="tabpanel"]:not([hidden]) pre[data-language]',
    );
    setLang(pre?.getAttribute("data-language") ?? "");
  }, [isCode, active]);

  if (!panels.length) return <>{children}</>;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = panels.length - 1;
    let next = active;
    if (event.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (event.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function activeCode() {
    const pre = panelsRef.current?.querySelector<HTMLElement>(
      '[role="tabpanel"]:not([hidden]) pre',
    );
    return pre?.querySelector("code")?.textContent ?? pre?.textContent ?? "";
  }

  const tablist = (
    <div
      role="tablist"
      aria-label="Content tabs"
      className="doc-tablist"
      onKeyDown={onKeyDown}
    >
      {panels.map((panel, index) => (
        <button
          key={panel.title}
          ref={(el) => {
            tabRefs.current[index] = el;
          }}
          type="button"
          role="tab"
          id={`${baseId}-tab-${index}`}
          aria-selected={active === index}
          aria-controls={`${baseId}-panel-${index}`}
          tabIndex={active === index ? 0 : -1}
          onClick={() => setActive(index)}
          className="doc-tab"
        >
          {panel.title}
        </button>
      ))}
    </div>
  );

  const panelEls = (
    <div ref={panelsRef} className="doc-tabpanels">
      {panels.map((panel, index) => (
        <div
          key={panel.title}
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={active !== index}
          className="doc-tabpanel"
        >
          {panel.body}
        </div>
      ))}
    </div>
  );

  if (isCode) {
    return (
      <div className="ds-tabs doc-code-group" data-code-group>
        <div className="code-head">
          {tablist}
          <div className="code-head-end">
            {lang ? <span className="code-lang">{lang}</span> : null}
            <CodeCopyButton code={activeCode} />
          </div>
        </div>
        {panelEls}
      </div>
    );
  }

  return (
    <div className="ds-tabs doc-tabs">
      {tablist}
      {panelEls}
    </div>
  );
}

export function Tabs({ children }: { children: ReactNode }) {
  return <TabsView variant="default">{children}</TabsView>;
}

export function CodeGroup({ children }: { children: ReactNode }) {
  return <TabsView variant="code">{children}</TabsView>;
}

export function Accordion({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const panelId = useId();

  return (
    <div className="ds-accordion border-b border-[var(--panel-border)] last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-[var(--text-main)]"
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="pb-4 text-sm leading-relaxed text-[var(--text-muted)] [&>p:first-child]:mt-0"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function AccordionGroup({ children }: { children: ReactNode }) {
  return (
    <div className="ds-accordion-group my-6 rounded-xl border border-[var(--panel-border)] px-4">
      {children}
    </div>
  );
}

export function Frame({
  children,
  caption,
}: {
  children: ReactNode;
  caption?: string;
}) {
  return (
    <figure className="ds-frame my-6">
      <div className="overflow-hidden rounded-xl border border-[var(--panel-border)] bg-[var(--sidebar-bg)] p-2">
        {children}
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-[var(--text-muted)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Expandable alias for a single accordion */
export function Expandable({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <AccordionGroup>
      <Accordion title={title}>{children}</Accordion>
    </AccordionGroup>
  );
}

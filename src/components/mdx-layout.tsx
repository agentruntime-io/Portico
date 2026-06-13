"use client";

import {
  useId,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
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

export function Tabs({
  children,
}: {
  children: ReactNode;
}) {
  const baseId = useId();
  const panels = collectTabPanels(children);
  const [active, setActive] = useState(0);

  if (!panels.length) return <>{children}</>;

  return (
    <div className="ds-tabs my-6">
      <div
        role="tablist"
        aria-label="Content tabs"
        className="flex flex-wrap gap-1 border-b border-[var(--panel-border)]"
      >
        {panels.map((panel, index) => (
          <button
            key={panel.title}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={active === index}
            aria-controls={`${baseId}-panel-${index}`}
            onClick={() => setActive(index)}
            className={`rounded-t-md px-3 py-2 text-sm font-medium transition ${
              active === index
                ? "border-b-2 border-emerald-500 text-[var(--text-main)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            {panel.title}
          </button>
        ))}
      </div>
      {panels.map((panel, index) => (
        <div
          key={panel.title}
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={active !== index}
          className="pt-4"
        >
          {panel.body}
        </div>
      ))}
    </div>
  );
}

export function CodeGroup({ children }: { children: ReactNode }) {
  return <Tabs>{children}</Tabs>;
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

"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { createElement, useId, useState } from "react";
import type { NavGroup } from "@/lib/nav";
import { navIcon } from "@/lib/nav-icons";

const COLLAPSE_THRESHOLD = 4;

export function SidebarNavGroup({
  group,
  isActiveItem,
  onNavigate,
  variant = "sidebar",
}: {
  group: NavGroup;
  isActiveItem: (href: string) => boolean;
  onNavigate?: () => void;
  variant?: "sidebar" | "drawer";
}) {
  const listId = useId();
  const hasActiveItem = group.items.some((item) => isActiveItem(item.href));
  const collapsible = group.items.length >= COLLAPSE_THRESHOLD;
  const [expanded, setExpanded] = useState(group.defaultExpanded !== false);
  const open = !collapsible || hasActiveItem || expanded;
  const toggleable = collapsible && !hasActiveItem;

  const groupHeaderClass =
    variant === "drawer"
      ? "docs-nav-label flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
      : "docs-nav-label flex min-h-7 w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]";

  const itemClass = (active: boolean) =>
    variant === "drawer"
      ? `docs-nav-row flex min-h-11 items-center rounded-lg px-2.5 py-2 ${
          active ? "docs-nav-active font-medium" : "docs-nav-item"
        }`
      : `docs-nav-row flex min-h-8 items-center rounded-lg px-2.5 py-1.5 transition-colors ${
          active ? "docs-nav-active font-medium" : "docs-nav-item"
        }`;
  const headerContent = (
    <>
      {createElement(navIcon(group.icon), {
        className:
          variant === "drawer"
            ? "h-4 w-4 shrink-0"
            : "h-3.5 w-3.5 shrink-0",
        "aria-hidden": true,
      })}
      <span className="flex-1">{group.label}</span>
      {toggleable ? (
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
          aria-hidden
        />
      ) : null}
    </>
  );

  return (
    <div className={variant === "drawer" ? "mb-2" : undefined}>
      {toggleable ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setExpanded((value) => !value)}
          className={`${groupHeaderClass} transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-main)]`}
        >
          {headerContent}
        </button>
      ) : (
        <div className={groupHeaderClass}>{headerContent}</div>
      )}
      {open ? (
        <ul
          id={listId}
          className={variant === "drawer" ? "mt-0.5" : "mt-1 space-y-0.5"}
        >
          {group.items.map((item) => {
            const active = isActiveItem(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={itemClass(active)}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

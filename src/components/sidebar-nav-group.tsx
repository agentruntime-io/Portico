"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useId, useState } from "react";
import type { NavGroup } from "@/lib/nav";

/**
 * One docs.json navigation group: a toggle row (label, page count, chevron) over a
 * tree-lined list. The current page gets a 2px brand rule on the guide line instead
 * of a filled row; the group holding it is always open.
 */
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
  const [expanded, setExpanded] = useState(group.defaultExpanded !== false);
  const open = hasActiveItem || expanded;
  const drawer = variant === "drawer";

  return (
    <div data-nav-group data-active-group={hasActiveItem ? "true" : undefined} className="mb-0.5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        disabled={hasActiveItem}
        onClick={() => setExpanded((value) => !value)}
        className={`flex w-full items-center gap-2 rounded-lg px-2 text-left text-[13.5px] font-semibold text-[var(--ink)] transition-colors enabled:hover:bg-[var(--sunk)] disabled:cursor-default ${
          drawer ? "min-h-11" : "min-h-8 py-1.5"
        }`}
      >
        <span className="min-w-0 flex-1 truncate">{group.label}</span>
        <span className="font-mono text-[10.5px] font-normal text-[var(--ink-3)]">{group.items.length}</span>
        <ChevronRight
          className={`h-3.5 w-3.5 shrink-0 text-[var(--ink-3)] transition-transform duration-150 ${open ? "rotate-90" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <ul id={listId} className="mb-2 ml-[15px] mt-0.5 border-l border-[var(--line)]">
          {group.items.map((item) => {
            const active = isActiveItem(item.href);
            return (
              <li key={item.href}>
                <Link
                  prefetch={false}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`-ml-px block border-l-2 pl-3.5 pr-2.5 text-[13.5px] leading-[1.4] transition-colors ${
                    drawer ? "py-2.5" : "py-[5px]"
                  } ${
                    active
                      ? "border-[var(--brand)] font-semibold text-[var(--brand-ink)]"
                      : "border-transparent text-[var(--ink-2)] hover:text-[var(--ink)]"
                  }`}
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

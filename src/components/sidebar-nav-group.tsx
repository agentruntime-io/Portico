"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import type { NavGroup } from "@/lib/nav";
import { navIcon } from "@/lib/nav-icons";

const CONNECTORS_CATALOG_HREF = "/integrations/connector-catalog";
const COLLAPSE_THRESHOLD = 8;

function isCollapsibleGroup(group: NavGroup) {
  return (
    group.defaultExpanded === false && group.items.length >= COLLAPSE_THRESHOLD
  );
}

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
  const { t } = useI18n();
  const collapsible = isCollapsibleGroup(group);
  const startCollapsed = collapsible;
  const [expanded, setExpanded] = useState(!startCollapsed);

  const Icon = navIcon(group.icon);
  const catalogItem = group.items.find(
    (item) => item.href === CONNECTORS_CATALOG_HREF,
  );
  const visibleItems =
    collapsible && !expanded
      ? catalogItem
        ? [catalogItem]
        : group.items.length > 0
          ? [group.items[0]!]
          : []
      : group.items;

  const groupHeaderClass =
    variant === "drawer"
      ? "mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]"
      : "mb-2 flex items-center gap-3 px-2 text-sm font-semibold text-[var(--text-main)]";

  const itemClass = (active: boolean) =>
    variant === "drawer"
      ? `block rounded-md px-2 py-2 text-sm ${
          active ? "docs-nav-active font-medium" : "docs-nav-item"
        }`
      : `block rounded-md px-2 py-1.5 text-sm transition-colors ${
          active ? "docs-nav-active font-medium" : "docs-nav-item"
        }`;

  return (
    <div className={variant === "drawer" ? "mb-6" : undefined}>
      <div className={groupHeaderClass}>
        <Icon className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
        <span className="flex-1">{group.label}</span>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)] transition hover:bg-emerald-500/10 hover:text-[var(--text-main)]"
          >
            <span className="sr-only">
              {expanded ? t("nav.hideConnectors") : t("nav.showConnectors")}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
      <ul className="space-y-0.5">
        {visibleItems.map((item) => {
          const active = isActiveItem(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={itemClass(active)}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
      {collapsible && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1.5 w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-emerald-600 transition hover:bg-emerald-500/10"
        >
          {t("nav.showAllConnectors", { count: String(group.items.length) })}
        </button>
      ) : null}
    </div>
  );
}

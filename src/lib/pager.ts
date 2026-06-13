import type { NavFile, NavItem } from "@/lib/nav";

export type PageNeighbor = {
  title: string;
  href: string;
};

export function flattenNavItems(nav: NavFile): NavItem[] {
  const items: NavItem[] = [];
  for (const group of nav.groups) {
    for (const item of group.items) {
      items.push(item);
    }
  }
  return items;
}

export function getPageNeighbors(
  nav: NavFile,
  activeHref: string,
): { prev?: PageNeighbor; next?: PageNeighbor } {
  const flat = flattenNavItems(nav);
  const idx = flat.findIndex((item) => item.href === activeHref);
  if (idx < 0) return {};

  const prev = idx > 0 ? flat[idx - 1] : undefined;
  const next = idx < flat.length - 1 ? flat[idx + 1] : undefined;

  return {
    prev: prev ? { title: prev.title, href: prev.href } : undefined,
    next: next ? { title: next.title, href: next.href } : undefined,
  };
}

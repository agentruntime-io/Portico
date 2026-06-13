import {
  groupOperationsByTag,
  slugifyTag,
  type ResolvedOperation,
} from "@/lib/openapi/core";
import type { NavFile } from "@/lib/nav";
import type { PageNeighbor } from "@/lib/pager";

export function getApiTagNeighbors(
  specId: string,
  operations: ResolvedOperation[],
  activeTagSlug?: string,
): { prev?: PageNeighbor; next?: PageNeighbor } {
  const tags = [...groupOperationsByTag(operations).keys()];
  const items: PageNeighbor[] = tags.map((tag) => ({
    title: tag,
    href: `/reference/${specId}/${slugifyTag(tag)}`,
  }));

  if (!activeTagSlug) {
    return {
      next: items[0],
    };
  }

  const idx = items.findIndex(
    (item) => item.href.split("/").pop() === activeTagSlug,
  );
  if (idx < 0) return {};

  return {
    prev:
      idx > 0
        ? items[idx - 1]
        : { title: "API overview", href: `/reference/${specId}` },
    next: idx < items.length - 1 ? items[idx + 1] : undefined,
  };
}

export function getApiOverviewNeighbors(
  nav: NavFile,
  specId: string,
  operations: ResolvedOperation[],
): { prev?: PageNeighbor; next?: PageNeighbor } {
  const apiGroup = nav.groups.find((group) => group.label === "API");
  const lastGuide = apiGroup?.items[apiGroup.items.length - 1];
  return {
    prev: lastGuide
      ? { title: lastGuide.title, href: lastGuide.href }
      : undefined,
    next: getApiTagNeighbors(specId, operations).next,
  };
}

import {
  apiOperationHref,
  apiTagHref,
  findTagBySlug,
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

export function getApiOperationNeighbors(
  specId: string,
  operations: ResolvedOperation[],
  activeTagSlug: string,
  activeOperationSlug: string,
): { prev?: PageNeighbor; next?: PageNeighbor } {
  const grouped = groupOperationsByTag(operations);
  const activeTag = findTagBySlug(grouped, activeTagSlug);
  if (!activeTag) return {};

  const tagOperations = grouped.get(activeTag) ?? [];
  const operationIndex = tagOperations.findIndex(
    (operation) => operation.slug === activeOperationSlug,
  );
  if (operationIndex < 0) return {};

  const neighborForOperation = (
    operation: ResolvedOperation,
  ): PageNeighbor => ({
    title:
      operation.summary ??
      `${operation.method.toUpperCase()} ${operation.path}`,
    href: apiOperationHref(specId, operation),
  });

  const tags = [...grouped.keys()];
  const tagIndex = tags.indexOf(activeTag);
  const nextTag = tagIndex >= 0 ? tags[tagIndex + 1] : undefined;

  return {
    prev:
      operationIndex > 0
        ? neighborForOperation(tagOperations[operationIndex - 1]!)
        : { title: `${activeTag} overview`, href: apiTagHref(specId, activeTag) },
    next:
      operationIndex < tagOperations.length - 1
        ? neighborForOperation(tagOperations[operationIndex + 1]!)
        : nextTag
          ? { title: nextTag, href: apiTagHref(specId, nextTag) }
          : undefined,
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

import type { NavFile } from "@/lib/nav";
import type { SiteConfig } from "@/lib/site";

export type ApiSpecNavEntry = {
  id: string;
  title: string;
  href: string;
  file: string;
};

export type MainNavTargets = {
  docsHomeHref: string;
  apiSpecs: ApiSpecNavEntry[];
};

export function resolveMainNav(nav: NavFile, site: SiteConfig): MainNavTargets {
  const docsHomeHref =
    nav.groups.find((group) => group.items.length)?.items[0]?.href ?? "/";
  const apiSpecs = site.openapi.specs.map((spec) => ({
    id: spec.id,
    title: spec.title,
    href: `/reference/${spec.id}`,
    file: spec.file,
  }));
  return { docsHomeHref, apiSpecs };
}

export function isApiReferencePath(path: string) {
  return path === "/reference" || path.startsWith("/reference/");
}

export function isDocumentationPath(path: string) {
  return !isApiReferencePath(path);
}

export function activeApiSpecId(
  path: string,
  specs: ApiSpecNavEntry[],
): string | undefined {
  if (!isApiReferencePath(path) || path === "/reference") return undefined;
  const match = specs.find(
    (spec) => path === spec.href || path.startsWith(`${spec.href}/`),
  );
  return match?.id;
}

/** Raw spec download, served by src/app/openapi/[file]/route.ts. */
export function openApiDownloadUrl(specId: string, file: string) {
  const ext = /\.[a-z0-9]+$/i.exec(file)?.[0].toLowerCase() ?? ".yaml";
  return `/openapi/${specId}${ext}`;
}

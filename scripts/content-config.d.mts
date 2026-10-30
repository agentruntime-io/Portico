export type SiteYaml = Record<string, unknown> & {
  url?: string;
  openapi?: { specs?: { id: string; title?: string; file: string }[] };
};
export type Redirect = { source: string; destination: string; permanent: boolean };
export function loadSiteYaml(root?: string): SiteYaml;
export function resolveSiteUrl(siteYaml?: SiteYaml): string;
export function loadRedirects(root?: string): Redirect[];
export function resolveContentFile(rel: string, root?: string): string | null;
export function loadOpenApiSpecs(
  siteYaml?: SiteYaml,
  root?: string,
): { id: string; title: string; file: string }[];

import fs from "fs/promises";
import path from "path";
import { assertContentRoot } from "@/lib/content-root";
import {
  loadOpenApiSpecs,
  loadSiteYaml,
  resolveSiteUrl,
  type OpenApiSpecEntry,
  type SiteYaml,
} from "@/lib/content-config";
import { loadDocsJson, type DocsJsonConfig } from "@/lib/docs-config";
import { siteTheme, type SiteTheme } from "@/lib/site-theme";

export type { OpenApiSpecEntry };

export type SiteVerification = {
  google?: string;
  yandex?: string;
  yahoo?: string;
  other?: { name: string; content: string }[];
};

/** Logo images as data URIs, so content-repo files need no asset route. */
export type SiteLogo = {
  light: string;
  dark: string;
  /** Where the logo links to (docs.json `logo.href`); the UI falls back to the docs home. */
  href?: string;
};

/** Favicon images as data URIs (light and dark may be the same image). */
export type SiteFavicon = { light: string; dark: string };

export type SiteFooterLinkGroup = {
  header?: string;
  items: { label: string; href: string }[];
};

export type SiteFooter = {
  /** Social network key (`x`, `github`, `linkedin`…) → profile URL, as in Mintlify. */
  socials?: Record<string, string>;
  links?: SiteFooterLinkGroup[];
};

export type SiteAppearance = {
  /** Theme to start with; `system` follows the visitor's OS. */
  default?: "system" | "light" | "dark";
  /** Hide the theme toggle and always use `default`. */
  strict?: boolean;
};

/** Contact for the Help link. The UI should show Help only when this is set. */
export type SiteSupport = { label?: string; href: string };

export type SiteConfig = {
  name: string;
  logo?: SiteLogo;
  /** docs.json `colors` and `fonts` as CSS overrides. */
  theme: SiteTheme;
  favicon?: SiteFavicon;
  description: string;
  url: string;
  ogImage?: string;
  githubEditBase?: string;
  support?: SiteSupport;
  footer?: SiteFooter;
  appearance?: SiteAppearance;
  verification?: SiteVerification;
  openapi: {
    specs: OpenApiSpecEntry[];
  };
  navbar?: {
    links?: { label: string; href: string }[];
    primary?: { type: "button" | "github"; label: string; href: string };
  };
};

let cached: SiteConfig | null = null;

/**
 * GitHub repo URL for edit links: explicit CONTENT_REPO_URL, or derived from
 * CONTENT_GIT_REPO (no .git). Undefined when neither is set.
 */
export function resolveContentRepoUrl(): string | undefined {
  const explicit = process.env.CONTENT_REPO_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const gitRepo = process.env.CONTENT_GIT_REPO?.trim();
  if (gitRepo) {
    return gitRepo.replace(/\.git\/?$/i, "").replace(/\/$/, "");
  }

  return undefined;
}

/** Docs content branch — used for clone (prepare-content) and GitHub edit links. */
export function resolveContentGitBranch(): string {
  return process.env.CONTENT_GIT_BRANCH?.trim() || "main";
}

export function buildGithubEditBase(repoUrl: string, branch: string): string {
  const base = repoUrl.replace(/\/$/, "");
  const cleanBranch = branch.replace(/^\/+|\/+$/g, "");
  return `${base}/blob/${cleanBranch}`;
}

const IMAGE_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
};
const FAVICON_TYPES: Record<string, string> = {
  ...IMAGE_TYPES,
  ".ico": "image/x-icon",
};
const MAX_LOGO_BYTES = 200 * 1024;
const MAX_FAVICON_BYTES = 64 * 1024;

async function readImageFile(
  file: string | undefined,
  types: Record<string, string>,
  maxBytes: number,
): Promise<string | undefined> {
  if (!file) return undefined;
  const root = assertContentRoot();
  const full = path.resolve(root, file.replace(/^\/+/, ""));
  const type = types[path.extname(full).toLowerCase()];
  if (!type || !full.startsWith(path.resolve(root) + path.sep)) return undefined;
  try {
    const data = await fs.readFile(full);
    if (data.byteLength > maxBytes) return undefined;
    return `data:${type};base64,${data.toString("base64")}`;
  } catch {
    return undefined;
  }
}

/** One file, or a light/dark pair; a missing side reuses the other. */
async function loadImagePair(
  value: string | { light?: string; dark?: string } | undefined,
  types: Record<string, string>,
  maxBytes: number,
): Promise<SiteFavicon | undefined> {
  const files = typeof value === "string" ? { light: value, dark: value } : value;
  if (!files) return undefined;
  const [light, dark] = await Promise.all([
    readImageFile(files.light ?? files.dark, types, maxBytes),
    readImageFile(files.dark ?? files.light, types, maxBytes),
  ]);
  return light && dark ? { light, dark } : undefined;
}

async function loadLogo(logo: DocsJsonConfig["logo"]): Promise<SiteLogo | undefined> {
  const images = await loadImagePair(logo, IMAGE_TYPES, MAX_LOGO_BYTES);
  if (!images) return undefined;
  const href = typeof logo === "object" ? logo.href?.trim() : undefined;
  return href ? { ...images, href } : images;
}

function loadFavicon(favicon: DocsJsonConfig["favicon"]) {
  return loadImagePair(favicon, FAVICON_TYPES, MAX_FAVICON_BYTES);
}

function mergeVerification(
  fromYaml?: SiteVerification,
): SiteVerification | undefined {
  const google =
    process.env.GOOGLE_SITE_VERIFICATION?.trim() ||
    fromYaml?.google?.trim() ||
    undefined;

  const merged: SiteVerification = {
    ...fromYaml,
    ...(google ? { google } : {}),
  };

  const hasValue =
    merged.google ||
    merged.yahoo ||
    merged.yandex ||
    (merged.other?.length ?? 0) > 0;

  return hasValue ? merged : undefined;
}

function nonEmpty(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeFooter(footer: DocsJsonConfig["footer"]): SiteFooter | undefined {
  if (!footer) return undefined;

  const socials: Record<string, string> = {};
  for (const [key, value] of Object.entries(footer.socials ?? {})) {
    const href = nonEmpty(value);
    if (href) socials[key.toLowerCase()] = href;
  }

  const links: SiteFooterLinkGroup[] = [];
  for (const group of footer.links ?? []) {
    const items = (group?.items ?? []).flatMap((item) => {
      const label = nonEmpty(item?.label);
      const href = nonEmpty(item?.href);
      return label && href ? [{ label, href }] : [];
    });
    if (items.length) links.push({ header: nonEmpty(group.header), items });
  }

  if (!Object.keys(socials).length && !links.length) return undefined;
  return {
    ...(Object.keys(socials).length ? { socials } : {}),
    ...(links.length ? { links } : {}),
  };
}

function normalizeAppearance(
  appearance: DocsJsonConfig["appearance"],
): SiteAppearance | undefined {
  if (!appearance) return undefined;
  const mode = appearance.default;
  const out: SiteAppearance = {
    ...(mode === "system" || mode === "light" || mode === "dark"
      ? { default: mode }
      : {}),
    ...(typeof appearance.strict === "boolean" ? { strict: appearance.strict } : {}),
  };
  return Object.keys(out).length ? out : undefined;
}

/** A bare address becomes a mailto: link; anything else is used as given. */
function supportHref(value: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("/")) return value;
  return value.includes("@") ? `mailto:${value}` : value;
}

const SUPPORT_LABEL = /\b(support|help|contact)\b/i;

function resolveSupport(
  fromYaml: SiteYaml["support"],
  docsJson: DocsJsonConfig,
): SiteSupport | undefined {
  const raw = typeof fromYaml === "string" ? { href: fromYaml } : fromYaml;
  const yamlHref = nonEmpty(raw?.href);
  if (yamlHref) {
    return { label: nonEmpty((raw as { label?: string }).label), href: supportHref(yamlHref) };
  }

  const candidates: { label?: string; href?: string }[] = [
    ...(docsJson.navbar?.links ?? []),
    ...(docsJson.navigation.global?.anchors ?? []).map((a) => ({
      label: a.anchor,
      href: a.href,
    })),
    ...(docsJson.footer?.links ?? []).flatMap((group) => group.items ?? []),
  ];
  for (const candidate of candidates) {
    const label = nonEmpty(candidate?.label);
    const href = nonEmpty(candidate?.href);
    if (label && href && SUPPORT_LABEL.test(label)) {
      return { label, href: supportHref(href) };
    }
  }
  return undefined;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  if (cached) return cached;

  const docsJson = await loadDocsJson();
  const siteYaml = loadSiteYaml();
  const [logo, favicon] = await Promise.all([
    loadLogo(docsJson.logo),
    loadFavicon(docsJson.favicon),
  ]);

  const contentRepo = resolveContentRepoUrl();
  const primary = docsJson.navbar?.primary;

  cached = {
    name: docsJson.name,
    logo,
    theme: siteTheme(docsJson.colors, docsJson.fonts),
    favicon,
    description: docsJson.description ?? `Documentation for ${docsJson.name}.`,
    url: resolveSiteUrl(siteYaml),
    ogImage:
      siteYaml.ogImage ?? process.env.SITE_OG_IMAGE ?? "/opengraph-image",
    githubEditBase:
      siteYaml.githubEditBase ??
      (contentRepo
        ? buildGithubEditBase(contentRepo, resolveContentGitBranch())
        : undefined),
    support: resolveSupport(siteYaml.support, docsJson),
    footer: normalizeFooter(docsJson.footer),
    appearance: normalizeAppearance(docsJson.appearance),
    verification: mergeVerification(siteYaml.verification),
    openapi: { specs: loadOpenApiSpecs(siteYaml) },
    navbar: docsJson.navbar
      ? {
          links: docsJson.navbar.links,
          primary: primary
            ? {
                type: primary.type === "github" ? "github" : "button",
                label: primary.label,
                href: primary.href,
              }
            : undefined,
        }
      : undefined,
  };

  return cached;
}

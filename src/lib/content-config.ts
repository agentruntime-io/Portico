import fs from "fs";
import path from "path";
import yaml from "js-yaml";
// Relative import: next.config.ts loads this file without the @/ alias.
import { assertContentRoot } from "./content-root";

/**
 * Renderer config that lives in the content repository.
 * Keep in sync with scripts/content-config.mjs
 *
 * Everything is read from the content root, never from Portico's own folder.
 */

export type SiteYaml = {
  url?: string;
  ogImage?: string;
  githubEditBase?: string;
  support?: string | { label?: string; href?: string };
  verification?: {
    google?: string;
    yandex?: string;
    yahoo?: string;
    other?: { name: string; content: string }[];
  };
  openapi?: { specs?: { id: string; title?: string; file: string }[] };
};

export type OpenApiSpecEntry = { id: string; title: string; file: string };

function readText(file: string): string | null {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

export function loadSiteYaml(root = assertContentRoot()): SiteYaml {
  const raw =
    readText(path.join(root, "site.yaml")) ??
    readText(path.join(root, "site.yml"));
  if (raw === null) return {};
  const parsed = yaml.load(raw);
  return parsed && typeof parsed === "object" ? (parsed as SiteYaml) : {};
}

/** Site origin: SITE_URL env, then site.yaml `url`, then a local-dev fallback. */
export function resolveSiteUrl(siteYaml: SiteYaml = loadSiteYaml()): string {
  const fromEnv = process.env.SITE_URL?.trim();
  const fromYaml = typeof siteYaml.url === "string" ? siteYaml.url.trim() : "";
  return (fromEnv || fromYaml || "http://localhost:3004").replace(/\/$/, "");
}

export type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

function normalizeRedirect(
  entry: unknown,
  defaultPermanent: boolean,
): Redirect | null {
  if (!entry || typeof entry !== "object") return null;
  const e = entry as Record<string, unknown>;
  const source = e.source ?? e.from;
  const destination = e.destination ?? e.to;
  if (typeof source !== "string" || typeof destination !== "string") return null;
  if (!source || !destination) return null;
  return {
    source,
    destination,
    permanent: typeof e.permanent === "boolean" ? e.permanent : defaultPermanent,
  };
}

/** Redirects from redirects.yaml and docs.json (`permanent` defaults to true there, as in Mintlify). */
export function loadRedirects(root = assertContentRoot()): Redirect[] {
  const out: Redirect[] = [];
  const rawYaml =
    readText(path.join(root, "redirects.yaml")) ??
    readText(path.join(root, "redirects.yml"));
  const yamlList = rawYaml === null ? null : yaml.load(rawYaml);
  if (Array.isArray(yamlList)) {
    for (const entry of yamlList) {
      const r = normalizeRedirect(entry, false);
      if (r) out.push(r);
    }
  }
  const rawDocs = readText(path.join(root, "docs.json"));
  if (rawDocs !== null) {
    try {
      const list = (JSON.parse(rawDocs) as { redirects?: unknown }).redirects;
      if (Array.isArray(list)) {
        for (const entry of list) {
          const r = normalizeRedirect(entry, true);
          if (r) out.push(r);
        }
      }
    } catch {
      /* docs.json errors surface elsewhere */
    }
  }
  return out;
}

const SPEC_EXT = /\.(ya?ml|json)$/i;

function slugifyId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Resolve a content-relative file, refusing paths that escape the content root. */
export function resolveContentFile(
  rel: string,
  root = assertContentRoot(),
): string | null {
  const base = path.resolve(root);
  const full = path.resolve(base, rel.replace(/^\/+/, ""));
  return full.startsWith(base + path.sep) ? full : null;
}

/** OpenAPI specs: site.yaml `openapi.specs`, else every file in `<contentRoot>/openapi/`. */
export function loadOpenApiSpecs(
  siteYaml: SiteYaml = loadSiteYaml(),
  root = assertContentRoot(),
): OpenApiSpecEntry[] {
  const listed = siteYaml.openapi?.specs;
  if (Array.isArray(listed)) {
    return listed
      .filter((s) => s && typeof s.file === "string" && typeof s.id === "string")
      .map((s) => ({ id: s.id, title: String(s.title ?? s.id), file: s.file }));
  }

  const dir = path.join(root, "openapi");
  let names: string[] = [];
  try {
    names = fs.readdirSync(dir).filter((n) => SPEC_EXT.test(n)).sort();
  } catch {
    return [];
  }
  return names.map((name) => {
    const id = slugifyId(name.replace(SPEC_EXT, "")) || "api";
    let title = id;
    try {
      const doc = yaml.load(fs.readFileSync(path.join(dir, name), "utf8")) as {
        info?: { title?: unknown };
      } | null;
      if (typeof doc?.info?.title === "string") title = doc.info.title;
    } catch {
      /* the spec validator reports unreadable files */
    }
    return { id, title, file: `openapi/${name}` };
  });
}

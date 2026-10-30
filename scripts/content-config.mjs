/**
 * Renderer config that lives in the content repository (Node .mjs).
 * Keep in sync with src/lib/content-config.ts
 *
 * - site.yaml        site URL, edit-link base, support contact, OpenAPI specs, verification
 * - redirects.yaml   `[{ from, to, permanent }]`, plus docs.json `redirects` (Mintlify format)
 * - openapi/         specs picked up automatically when site.yaml lists none
 *
 * Everything is read from the content root, never from Portico's own folder.
 */
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { assertContentRoot } from "./content-root.mjs";

function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

export function loadSiteYaml(root = assertContentRoot()) {
  const raw =
    readText(path.join(root, "site.yaml")) ??
    readText(path.join(root, "site.yml"));
  if (raw === null) return {};
  const parsed = yaml.load(raw);
  return parsed && typeof parsed === "object" ? parsed : {};
}

/** Site origin: SITE_URL env, then site.yaml `url`, then a local-dev fallback. */
export function resolveSiteUrl(siteYaml = loadSiteYaml()) {
  const fromEnv = process.env.SITE_URL?.trim();
  const fromYaml = typeof siteYaml.url === "string" ? siteYaml.url.trim() : "";
  return (fromEnv || fromYaml || "http://localhost:3004").replace(/\/$/, "");
}

function normalizeRedirect(entry, defaultPermanent) {
  if (!entry || typeof entry !== "object") return null;
  const source = entry.source ?? entry.from;
  const destination = entry.destination ?? entry.to;
  if (typeof source !== "string" || typeof destination !== "string") return null;
  if (!source || !destination) return null;
  return {
    source,
    destination,
    permanent:
      typeof entry.permanent === "boolean" ? entry.permanent : defaultPermanent,
  };
}

/** Redirects from redirects.yaml and docs.json (`permanent` defaults to true there, as in Mintlify). */
export function loadRedirects(root = assertContentRoot()) {
  const out = [];
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
      const list = JSON.parse(rawDocs).redirects;
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

function slugifyId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Resolve a content-relative file, refusing paths that escape the content root. */
export function resolveContentFile(rel, root = assertContentRoot()) {
  const base = path.resolve(root);
  const full = path.resolve(base, String(rel).replace(/^\/+/, ""));
  return full.startsWith(base + path.sep) ? full : null;
}

/** OpenAPI specs: site.yaml `openapi.specs`, else every file in `<contentRoot>/openapi/`. */
export function loadOpenApiSpecs(siteYaml = loadSiteYaml(), root = assertContentRoot()) {
  const listed = siteYaml.openapi?.specs;
  if (Array.isArray(listed)) {
    return listed
      .filter((s) => s && typeof s.file === "string" && typeof s.id === "string")
      .map((s) => ({ id: s.id, title: String(s.title ?? s.id), file: s.file }));
  }

  const dir = path.join(root, "openapi");
  let names = [];
  try {
    names = fs.readdirSync(dir).filter((n) => SPEC_EXT.test(n)).sort();
  } catch {
    return [];
  }
  return names.map((name) => {
    const id = slugifyId(name.replace(SPEC_EXT, "")) || "api";
    let title = id;
    try {
      const doc = yaml.load(fs.readFileSync(path.join(dir, name), "utf8"));
      if (typeof doc?.info?.title === "string") title = doc.info.title;
    } catch {
      /* the spec validator reports unreadable files */
    }
    return { id, title, file: `openapi/${name}` };
  });
}

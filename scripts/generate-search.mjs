/**
 * Generates public/search-index.json for client-side search.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import yaml from "js-yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { assertContentRoot } from "./content-root.mjs";
import { stripMarkdown, textEntry } from "./search-text.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
process.chdir(root);

const HTTP_METHODS = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
];

function slugifyOperationId(operationId) {
  return operationId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugifyTag(tagName) {
  return tagName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fallbackSlug(method, p) {
  const tail = p
    .replace(/^\//, "")
    .replace(/[{}/]/g, "")
    .replace(/\//g, "-")
    .replace(/--+/g, "-")
    .toLowerCase();
  return `${method.toLowerCase()}-${tail}`.replace(/-$/, "");
}

function operationSlug(method, pathKey, operationId) {
  if (operationId) return slugifyOperationId(operationId);
  return fallbackSlug(method, pathKey);
}

function flattenOperations(specId, doc) {
  const list = [];
  const used = new Set();
  for (const [p, pathItem] of Object.entries(doc.paths ?? {})) {
    for (const m of HTTP_METHODS) {
      const op = pathItem[m];
      if (!op || typeof op !== "object") continue;
      let slug = operationSlug(m, p, op.operationId);
      if (used.has(slug)) slug = `${slug}-${list.length}`;
      used.add(slug);
      list.push({
        specId,
        slug,
        method: m,
        path: p,
        operationId: op.operationId,
        summary: op.summary,
        description: op.description,
        tags: Array.isArray(op.tags) ? op.tags : [],
      });
    }
  }
  return list;
}

function groupOperationsByTag(ops) {
  const map = new Map();
  for (const op of ops) {
    const tags = op.tags.length ? op.tags : ["default"];
    for (const tag of tags) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag).push(op);
    }
  }
  return map;
}

function flattenPages(entries) {
  const out = [];
  for (const entry of entries ?? []) {
    if (typeof entry === "string") out.push(entry);
    else if (entry?.pages) out.push(...flattenPages(entry.pages));
  }
  return out;
}

const LOCALES = ["en", "es", "fr", "ja"];
const DEFAULT_LOCALE = "en";

function pagePathToHref(pagePath, locale = DEFAULT_LOCALE) {
  const clean = pagePath === "index" || !pagePath ? "" : pagePath.replace(/^\//, "");
  if (locale === DEFAULT_LOCALE) return clean ? `/${clean}` : "/";
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}

function localizedMdxPath(contentRoot, pagePath, locale) {
  const file = pagePath === "index" ? "index.mdx" : `${pagePath}.mdx`;
  if (locale === DEFAULT_LOCALE) return path.join(contentRoot, file);
  return path.join(contentRoot, "i18n", locale, file);
}

async function hasLocalizedMdx(contentRoot, pagePath, locale) {
  if (locale === DEFAULT_LOCALE) return true;
  try {
    await fs.access(localizedMdxPath(contentRoot, pagePath, locale));
    return true;
  } catch {
    return false;
  }
}

async function indexMdxPage(contentRoot, pagePath, locale, origin) {
  const localized = localizedMdxPath(contentRoot, pagePath, locale);
  let file = localized;
  try {
    await fs.access(file);
  } catch {
    if (locale !== DEFAULT_LOCALE) return null;
    file =
      pagePath === "index"
        ? path.join(contentRoot, "index.mdx")
        : path.join(contentRoot, `${pagePath}.mdx`);
  }

  const raw = await fs.readFile(file, "utf8");
  const { data, content } = matter(raw);
  if (data.draft === true || data.noindex === true) return null;

  const href = pagePathToHref(pagePath, locale);
  return textEntry(
    `${origin}${href}`,
    String(data.sidebarTitle ?? data.title ?? pagePath),
    content,
  );
}

async function main() {
  const contentRoot = assertContentRoot();
  const docsJson = JSON.parse(
    await fs.readFile(path.join(contentRoot, "docs.json"), "utf8"),
  );

  const siteRaw = await fs.readFile(
    path.join(root, "content", "site.yaml"),
    "utf8",
  );
  const site = yaml.load(siteRaw);
  const origin = (process.env.SITE_URL ?? site.url).replace(/\/$/, "");

  const all = [];

  const pagePaths = new Set(["index"]);
  for (const group of docsJson.navigation?.groups ?? []) {
    for (const p of flattenPages(group.pages)) {
      pagePaths.add(p);
    }
  }

  for (const pagePath of pagePaths) {
    for (const locale of LOCALES) {
      if (locale !== DEFAULT_LOCALE) {
        const exists = await hasLocalizedMdx(contentRoot, pagePath, locale);
        if (!exists) continue;
      }
      const entry = await indexMdxPage(contentRoot, pagePath, locale, origin);
      if (entry) all.push(entry);
    }
  }

  const changelogDir = path.join(contentRoot, "changelog");
  try {
    const changelogFiles = await fs.readdir(changelogDir);
    all.push(textEntry(`${origin}/changelog`, "Changelog", "Product release notes"));
    for (const name of changelogFiles) {
      if (!/\.mdx?$/i.test(name)) continue;
      const base = name.replace(/\.(mdx?|markdown)$/i, "");
      if (["readme", "_template", "index"].includes(base.toLowerCase())) continue;
      const raw = await fs.readFile(path.join(changelogDir, name), "utf8");
      const { data, content } = matter(raw);
      const title = String(data.title ?? `Release ${base}`);
      const lead = data.summary ?? data.description;
      const entry = textEntry(`${origin}/changelog/${base}`, title, content);
      if (lead) entry.excerpt = stripMarkdown(String(lead)).slice(0, 200);
      all.push(entry);
    }
  } catch {
    /* no changelog directory */
  }

  if (site.openapi?.specs?.length) {
    all.push(textEntry(`${origin}/reference`, "API reference", "OpenAPI reference overview"));
    for (const spec of site.openapi.specs) {
      const full = path.join(root, "content", spec.file);
      const doc = await SwaggerParser.validate(full);
      all.push(
        textEntry(
          `${origin}/reference/${spec.id}`,
          `${spec.title} - overview`,
          (doc.info && doc.info.description) || "OpenAPI reference",
        ),
      );
      const ops = flattenOperations(spec.id, doc);
      for (const [tag, tagOps] of groupOperationsByTag(ops)) {
        const tagSlug = slugifyTag(tag);
        all.push(
          textEntry(
            `${origin}/reference/${spec.id}/${tagSlug}`,
            `${spec.title} - ${tag}`,
            doc.tags?.find((t) => t.name === tag)?.description || `${tag} API operations`,
          ),
        );
        for (const op of tagOps) {
          const opText = [op.summary, op.description, op.operationId]
            .filter(Boolean)
            .join("\n\n");
          const entry = textEntry(
            `${origin}/reference/${spec.id}/${tagSlug}/${op.slug}`,
            `${op.method.toUpperCase()} ${op.path}`,
            opText || "API operation",
          );
          entry.excerpt = stripMarkdown(op.summary || op.description || "API operation").slice(0, 200);
          all.push(entry);
        }
      }
    }
  }

  await fs.mkdir(path.join(root, "public"), { recursive: true });
  const outPath = path.join(root, "public", "search-index.json");
  const forClient = all.map((e) => ({
    url: new URL(e.url).pathname + new URL(e.url).hash,
    title: e.title,
    headings: e.headings,
    excerpt: e.excerpt,
    body: e.body,
    code: e.code || undefined,
  }));
  await fs.writeFile(outPath, JSON.stringify(forClient), "utf8");
  console.log(
    `Wrote ${forClient.length} search entries to public/search-index.json`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

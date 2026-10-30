/**
 * Validates agentruntime-docs content + portal OpenAPI bundles.
 *
 * Checks: docs.json nav, every MDX page compiles (same remark plugins as the app),
 * only registered JSX components are used, internal links resolve, GFM tables are
 * not split by blank lines, OpenAPI specs parse, changelog frontmatter.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import matter from "gray-matter";
import SwaggerParser from "@apidevtools/swagger-parser";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { assertContentRoot } from "./content-root.mjs";
import { transformHeadingIds } from "../src/lib/mdx-heading-ids.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portalRoot = path.join(__dirname, "..");

/** Keep in sync with createRscMdxComponents (src/lib/mdx-rsc-components.tsx). */
const KNOWN_COMPONENTS = new Set([
  "Steps",
  "Step",
  "Note",
  "Warning",
  "Info",
  "Tip",
  "Check",
  "Danger",
  "Tab",
  "Tabs",
  "CodeGroup",
  "Accordion",
  "AccordionGroup",
  "Frame",
  "Expandable",
  "Card",
  "CardGroup",
  "Icon",
  "Hero",
  "HeroAction",
  "HeroAside",
  "HomePage",
  "Section",
  "Band",
  "TaskList",
  "Task",
]);

/** Route prefixes rendered by the app rather than from an MDX file. */
const APP_ROUTE_PREFIXES = ["/reference", "/changelog"];

const LOCALES = ["es", "fr", "ja"];

function flattenPages(entries) {
  const out = [];
  for (const entry of entries ?? []) {
    if (typeof entry === "string") out.push(entry);
    else if (entry?.pages) out.push(...flattenPages(entry.pages));
  }
  return out;
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function listMdx(dir, base = dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listMdx(full, base)));
    else if (/\.mdx$/i.test(entry.name)) out.push(path.relative(base, full));
  }
  return out;
}

/** Lines outside fenced code blocks, with 1-based numbers. */
function proseLines(body) {
  const out = [];
  let fence = null;
  body.split(/\r?\n/).forEach((text, i) => {
    const m = /^[ \t]{0,3}(`{3,}|~{3,})/.exec(text);
    if (m) {
      if (!fence) fence = m[1][0];
      else if (m[1][0] === fence) fence = null;
      return;
    }
    if (!fence) out.push({ text, line: i + 1 });
  });
  return out;
}

/** Blank line(s) between two `|` rows split a GFM table into plain paragraphs. */
function findSplitTables(body) {
  const lines = proseLines(body);
  const hits = [];
  const isRow = (t) => /^\s*\|.*\|\s*$/.test(t);
  for (let i = 1; i + 1 < lines.length; i++) {
    if (
      lines[i].text.trim() === "" &&
      lines[i].line === lines[i - 1].line + 1 &&
      lines[i + 1].line === lines[i].line + 1 &&
      isRow(lines[i - 1].text) &&
      isRow(lines[i + 1].text)
    ) {
      hits.push(lines[i].line);
    }
  }
  return hits;
}

function normalizeLink(href) {
  let target = href.split("#")[0].split("?")[0];
  if (!target.startsWith("/") || target.startsWith("//")) return null;
  target = target.replace(/\/+$/, "") || "/";
  const first = target.split("/")[1];
  if (LOCALES.includes(first)) target = target.slice(first.length + 1) || "/";
  return target;
}

async function main() {
  const problems = [];
  const warnings = [];
  const contentRoot = assertContentRoot();
  console.log(`Validating content root: ${contentRoot}`);
  if (path.relative(portalRoot, contentRoot).startsWith("examples")) {
    console.log("  (bundled demo content — set CONTENT_ROOT in .env.local for your docs)");
  }
  const docsJsonPath = path.join(contentRoot, "docs.json");

  if (!(await exists(docsJsonPath))) {
    console.error(`Missing docs.json at ${contentRoot}`);
    console.error("Set CONTENT_ROOT to your agentruntime-docs clone.");
    process.exit(1);
  }

  const docsJson = JSON.parse(await fs.readFile(docsJsonPath, "utf8"));

  if (!(await exists(path.join(contentRoot, "index.mdx")))) {
    problems.push("Missing index.mdx at content root");
  }

  const seen = new Set();
  for (const group of docsJson.navigation?.groups ?? []) {
    for (const pagePath of flattenPages(group.pages)) {
      const href = `/${pagePath}`;
      if (seen.has(href)) problems.push(`Duplicate nav page: ${pagePath}`);
      seen.add(href);
      const mdx = path.join(contentRoot, `${pagePath}.mdx`);
      if (!(await exists(mdx))) {
        problems.push(`Missing MDX for nav entry ${pagePath}: ${mdx}`);
      }
    }
  }

  // Route set used for internal-link resolution.
  const mdxFiles = (await listMdx(contentRoot)).filter(
    (f) => !f.split(path.sep)[0].match(/^i18n$/),
  );
  const routes = new Set(["/"]);
  for (const file of mdxFiles) {
    const route = "/" + file.replace(/\\/g, "/").replace(/\.mdx$/i, "");
    routes.add(route === "/index" ? "/" : route.replace(/\/index$/, ""));
  }
  const redirectsFile = path.join(portalRoot, "content", "redirects.yaml");
  if (await exists(redirectsFile)) {
    for (const r of yaml.load(await fs.readFile(redirectsFile, "utf8")) ?? []) {
      if (r?.from) routes.add(String(r.from).replace(/\/+$/, "") || "/");
    }
  }

  // Per-page MDX checks.
  for (const rel of await listMdx(contentRoot)) {
    const file = path.join(contentRoot, rel);
    const label = rel.replace(/\\/g, "/");
    const raw = await fs.readFile(file, "utf8");
    const { content } = matter(raw);
    const offset = raw.slice(0, raw.length - content.length).split("\n").length - 1;
    const at = (line) => `${label}:${line + offset}`;

    const source = transformHeadingIds(content);
    let tree;
    try {
      tree = unified().use(remarkParse).use(remarkMdx).use(remarkGfm).parse(source);
      await compile(source, { remarkPlugins: [remarkGfm] });
    } catch (error) {
      const line = error.line ?? error.place?.line ?? error.place?.start?.line;
      const reason = String(error.reason ?? error.message).split("\n")[0];
      problems.push(`${line ? at(line) : label}: MDX compile error — ${reason}`);
      continue;
    }

    visit(tree, (node) => {
      if (
        (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
        node.name &&
        /^[A-Z]/.test(node.name) &&
        !KNOWN_COMPONENTS.has(node.name)
      ) {
        problems.push(
          `${at(node.position?.start.line ?? 1)}: unknown component <${node.name}> (not registered in createRscMdxComponents)`,
        );
      }

      const hrefs = [];
      if (node.type === "link") hrefs.push(node.url);
      if (
        (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
        ["Card", "a"].includes(node.name)
      ) {
        for (const attr of node.attributes ?? []) {
          if (attr.name === "href" && typeof attr.value === "string") hrefs.push(attr.value);
        }
      }
      for (const href of hrefs) {
        const target = normalizeLink(href);
        if (!target) continue;
        if (routes.has(target)) continue;
        if (APP_ROUTE_PREFIXES.some((p) => target === p || target.startsWith(`${p}/`))) continue;
        if (target.startsWith("/_next") || /\.[a-z0-9]{2,5}$/i.test(target)) continue;
        problems.push(
          `${at(node.position?.start.line ?? 1)}: broken internal link ${href} (no such page)`,
        );
      }
    });

    // The layout renders frontmatter `title` as the page h1 (the home page is chrome-less and authors its own).
    if (rel !== "index.mdx") {
      for (const { text, line } of proseLines(content)) {
        if (/^#[ \t]+\S/.test(text)) {
          problems.push(
            `${at(line)}: second h1 ("${text.slice(0, 40)}") — the frontmatter title already renders as the h1; use ## for sections`,
          );
        }
      }
    }

    for (const line of findSplitTables(content)) {
      problems.push(
        `${at(line)}: blank line between table rows — the table will render as raw text (is the file double-spaced?)`,
      );
    }
  }

  const siteYaml = yaml.load(
    await fs.readFile(path.join(portalRoot, "content", "site.yaml"), "utf8"),
  );

  for (const spec of siteYaml.openapi?.specs ?? []) {
    const file = path.join(portalRoot, "content", spec.file);
    if (!(await exists(file))) problems.push(`Missing OpenAPI file: ${file}`);
    else await SwaggerParser.validate(file);
  }

  const changelogDir = path.join(contentRoot, "changelog");
  if (await exists(changelogDir)) {
    const entries = await fs.readdir(changelogDir);
    for (const name of entries) {
      if (!/\.mdx?$/i.test(name)) continue;
      const base = name.replace(/\.(mdx?|markdown)$/i, "");
      if (["readme", "_template", "index"].includes(base.toLowerCase())) continue;
      const raw = await fs.readFile(path.join(changelogDir, name), "utf8");
      const { data } = matter(raw);
      if (!data.date) {
        problems.push(`Changelog ${name} is missing required frontmatter: date`);
      } else {
        // YAML turns an unquoted 2026-09-30 into a Date, which is fine; anything else must be ISO.
        const iso =
          data.date instanceof Date
            ? !Number.isNaN(data.date.getTime())
            : /^\d{4}-\d{2}-\d{2}$/.test(String(data.date).trim());
        if (!iso) {
          problems.push(
            `Changelog ${name}: date "${data.date}" is not an ISO date (YYYY-MM-DD)`,
          );
        }
      }
    }
  }

  for (const w of warnings) console.warn(`warning: ${w}`);
  if (problems.length) {
    console.error(problems.join("\n"));
    console.error(`\nContent validation FAILED: ${problems.length} problem(s) in ${contentRoot}`);
    process.exit(1);
  }

  console.log(`Content validation passed (${contentRoot})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

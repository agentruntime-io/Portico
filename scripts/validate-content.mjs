/**
 * Validates agentruntime-docs content + portal OpenAPI bundles.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { assertContentRoot } from "./content-root.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portalRoot = path.join(__dirname, "..");

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

async function main() {
  const problems = [];
  const contentRoot = assertContentRoot();
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

  const siteYaml = yaml.load(
    await fs.readFile(path.join(portalRoot, "content", "site.yaml"), "utf8"),
  );

  for (const spec of siteYaml.openapi?.specs ?? []) {
    const file = path.join(portalRoot, "content", spec.file);
    if (!(await exists(file))) problems.push(`Missing OpenAPI file: ${file}`);
    else await SwaggerParser.validate(file);
  }

  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }

  console.log(`Content validation passed (${contentRoot})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

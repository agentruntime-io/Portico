/**
 * Shared content root resolution for build scripts (Node .mjs).
 * Keep in sync with src/lib/content-root.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const portalRoot = path.join(__dirname, "..");

/**
 * Load `.env.local` (then `.env`) without overriding real environment variables, so
 * `npm run validate` / generate-search see the same CONTENT_ROOT as `next dev`.
 */
export function loadEnvFiles(cwd = portalRoot) {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(cwd, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      if (line.trimStart().startsWith("#")) continue;
      const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
      if (!m) continue;
      let value = m[2];
      if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
      if (process.env[m[1]] === undefined) process.env[m[1]] = value;
    }
  }
}

export function getContentRoot(cwd = portalRoot) {
  loadEnvFiles(cwd);
  const fromEnv = process.env.CONTENT_ROOT?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }

  const pointerFile = path.join(cwd, ".content-root");
  const cloneAtBuild = process.env.CONTENT_GIT_REPO?.trim();
  if (cloneAtBuild && fs.existsSync(pointerFile)) {
    const pointed = fs.readFileSync(pointerFile, "utf8").trim();
    if (pointed && fs.existsSync(path.join(pointed, "docs.json"))) {
      return pointed;
    }
  }

  return path.join(cwd, "examples", "demo-docs");
}

export function assertContentRoot(cwd = portalRoot) {
  const root = getContentRoot(cwd);
  const marker = path.join(root, "docs.json");
  if (!fs.existsSync(marker)) {
    throw new Error(
      `Content root not found or missing docs.json: ${root}\n` +
        "Set CONTENT_ROOT to a folder containing docs.json, set CONTENT_GIT_REPO to clone one at build time, or restore examples/demo-docs.",
    );
  }
  return root;
}

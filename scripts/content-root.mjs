/**
 * Shared content root resolution for build scripts (Node .mjs).
 * Keep in sync with src/lib/content-root.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const portalRoot = path.join(__dirname, "..");

export function getContentRoot(cwd = portalRoot) {
  const fromEnv = process.env.CONTENT_ROOT?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }

  const pointerFile = path.join(cwd, ".content-root");
  if (fs.existsSync(pointerFile)) {
    const pointed = fs.readFileSync(pointerFile, "utf8").trim();
    if (pointed && fs.existsSync(path.join(pointed, "docs.json"))) {
      return pointed;
    }
  }

  const sibling = path.resolve(
    cwd,
    "..",
    "..",
    "agentruntime",
    "agentruntime-docs",
  );
  if (fs.existsSync(path.join(sibling, "docs.json"))) {
    return sibling;
  }

  const demo = path.join(cwd, "examples", "demo-docs");
  if (fs.existsSync(path.join(demo, "docs.json"))) {
    return demo;
  }

  return sibling;
}

export function assertContentRoot(cwd = portalRoot) {
  const root = getContentRoot(cwd);
  const marker = path.join(root, "docs.json");
  if (!fs.existsSync(marker)) {
    throw new Error(
      `Content root not found or missing docs.json: ${root}\n` +
        "Set CONTENT_ROOT, CONTENT_GIT_REPO, or add examples/demo-docs.",
    );
  }
  return root;
}

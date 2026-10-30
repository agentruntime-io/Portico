import fs from "fs";
import path from "path";

/**
 * Absolute path to the documentation content repository (docs.json + MDX).
 * Override with CONTENT_ROOT in .env.local or CI.
 *
 * Resolution order:
 * 1. CONTENT_ROOT env
 * 2. .content-root pointer (only when CONTENT_GIT_REPO is set — clone at build)
 * 3. examples/demo-docs (bundled demo)
 */
export function getContentRoot(): string {
  const cwd = process.cwd();
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

export function assertContentRoot(): string {
  const root = getContentRoot();
  const marker = path.join(root, "docs.json");
  if (!fs.existsSync(marker)) {
    throw new Error(
      `Content root not found or missing docs.json: ${root}\n` +
        "Set CONTENT_ROOT to a folder containing docs.json, set CONTENT_GIT_REPO to clone one at build time, or restore examples/demo-docs.",
    );
  }
  return root;
}

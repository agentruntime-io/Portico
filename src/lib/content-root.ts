import fs from "fs";

import path from "path";



/**

 * Absolute path to the documentation content repository (docs.json + MDX).

 * Override with CONTENT_ROOT in .env.local or CI.

 *

 * Resolution order:

 * 1. CONTENT_ROOT env

 * 2. .content-root file (written by scripts/prepare-content.mjs)

 * 3. Sibling agentruntime-docs checkout (AgentRuntime dev layout)

 * 4. examples/demo-docs (OSS default)

 */

export function getContentRoot(): string {

  const cwd = process.cwd();

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



export function assertContentRoot(): string {

  const root = getContentRoot();

  const marker = path.join(root, "docs.json");

  if (!fs.existsSync(marker)) {

    throw new Error(

      `Content root not found or missing docs.json: ${root}\n` +

        "Set CONTENT_ROOT, CONTENT_GIT_REPO, or use examples/demo-docs.",

    );

  }

  return root;

}



/**
 * Optional clone step for hosted builds (Vercel, CI).
 *
 * Set CONTENT_GIT_REPO (+ optional CONTENT_GIT_BRANCH) to fetch docs at build time.
 * Writes .content-root so later steps resolve CONTENT_ROOT without extra env.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { portalRoot } from "./content-root.mjs";

const repo = process.env.CONTENT_GIT_REPO?.trim();
if (!repo) {
  process.exit(0);
}

const branch = process.env.CONTENT_GIT_BRANCH?.trim() || "main";
const target =
  process.env.CONTENT_ROOT?.trim() ?
    path.resolve(process.env.CONTENT_ROOT)
  : path.join(portalRoot, ".content", "checkout");

const parent = path.dirname(target);
fs.rmSync(parent, { recursive: true, force: true });
fs.mkdirSync(parent, { recursive: true });

const quotedBranch = branch.replace(/"/g, '\\"');
const quotedRepo = repo.replace(/"/g, '\\"');
const quotedTarget = target.replace(/"/g, '\\"');

console.log(`Cloning ${repo}@${branch} → ${target}`);
execSync(
  `git clone --depth 1 --branch "${quotedBranch}" "${quotedRepo}" "${quotedTarget}"`,
  { stdio: "inherit", cwd: portalRoot },
);

if (!fs.existsSync(path.join(target, "docs.json"))) {
  console.error(`Cloned repo is missing docs.json at ${target}`);
  process.exit(1);
}

fs.writeFileSync(path.join(portalRoot, ".content-root"), target, "utf8");
console.log(`Content ready at ${target}`);

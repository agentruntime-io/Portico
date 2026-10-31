/**
 * Publish the content repo's static files (images, video, PDFs…) so MDX can
 * reference them by their repo path, as Mintlify does: `/images/x.png` in a page
 * resolves to `<contentRoot>/images/x.png`.
 *
 * Files are copied to public/_content/ (gitignored) before `dev` and `build`;
 * next.config.ts rewrites asset URLs there after Portico's own routes and
 * public files, so content can never shadow them. Served from the CDN, not a
 * serverless function.
 */
import fs from "fs";
import path from "path";
import { assertContentRoot, portalRoot } from "./content-root.mjs";

export const ASSET_EXTENSIONS = [
  "png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "ico",
  "mp4", "webm", "mov", "mp3", "wav",
  "pdf", "zip", "csv", "woff", "woff2",
];
const ASSET_RE = new RegExp(`\\.(${ASSET_EXTENSIONS.join("|")})$`, "i");
const SKIP_DIRS = new Set(["node_modules", ".git", ".generated", ".content", ".next"]);

const contentRoot = assertContentRoot();
const target = path.join(portalRoot, "public", "_content");
fs.rmSync(target, { recursive: true, force: true });

let count = 0;
let bytes = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue;
    const from = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(from);
    } else if (entry.isFile() && ASSET_RE.test(entry.name)) {
      const to = path.join(target, path.relative(contentRoot, from));
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      count += 1;
      bytes += fs.statSync(from).size;
    }
  }
}
walk(contentRoot);

console.log(
  `Published ${count} content asset(s) (${(bytes / 1048576).toFixed(1)} MB) to public/_content`,
);

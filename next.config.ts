import type { NextConfig } from "next";
import { loadRedirects } from "./src/lib/content-config";

function loadContentRedirects() {
  try {
    return loadRedirects();
  } catch {
    return [];
  }
}

const contentTrace = [".content/**/*", ".content-root"];

// Keep in sync with ASSET_EXTENSIONS in scripts/sync-content-assets.mjs.
const CONTENT_ASSET_EXT =
  "png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|mov|mp3|wav|pdf|zip|csv|woff2?";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@apidevtools/swagger-parser"],
  // Cloned docs live under .content/ (gitignored). Dynamic routes read MDX at
  // request time, so include the checkout in serverless traces on Vercel.
  outputFileTracingIncludes: {
    "/*": contentTrace,
    "/[...slug]": contentTrace,
    "/changelog": contentTrace,
    "/reference": contentTrace,
    "/reference/[specId]": contentTrace,
    "/reference/[specId]/[tagSlug]": contentTrace,
    "/reference/[specId]/[tagSlug]/[operationSlug]": contentTrace,
    "/openapi/[file]": contentTrace,
  },
  async redirects() {
    return loadContentRedirects();
  },
  async rewrites() {
    // Content repo assets (scripts/sync-content-assets.mjs) keep their repo paths,
    // e.g. /images/x.png. afterFiles runs after Portico's pages and public files,
    // so content can't shadow them.
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: `/:asset((?!_content/).+\\.(?:${CONTENT_ASSET_EXT}))`,
          destination: "/_content/:asset",
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;

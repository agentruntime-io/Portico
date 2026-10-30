import type { NextConfig } from "next";
import { loadRedirects } from "./scripts/content-config.mjs";

function loadContentRedirects() {
  try {
    return loadRedirects();
  } catch {
    return [];
  }
}

const contentTrace = [".content/**/*", ".content-root"];

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
};

export default nextConfig;

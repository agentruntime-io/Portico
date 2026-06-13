import type { NextConfig } from "next";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

function loadRedirects(): { source: string; destination: string; permanent: boolean }[] {
  try {
    const file = path.join(process.cwd(), "content", "redirects.yaml");
    const raw = fs.readFileSync(file, "utf8");
    const list = yaml.load(raw) as {
      from: string;
      to: string;
      permanent?: boolean;
    }[];
    if (!Array.isArray(list)) return [];
    return list.map((r) => ({
      source: r.from,
      destination: r.to,
      permanent: r.permanent ?? false,
    }));
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["@apidevtools/swagger-parser"],
  async redirects() {
    return loadRedirects();
  },
};

export default nextConfig;

import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import { loadDocsJson } from "@/lib/docs-config";

export type OpenApiSpecEntry = {
  id: string;
  title: string;
  file: string;
};

export type SiteVerification = {
  google?: string;
  yandex?: string;
  yahoo?: string;
  other?: { name: string; content: string }[];
};

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage?: string;
  githubEditBase?: string;
  verification?: SiteVerification;
  openapi: {
    specs: OpenApiSpecEntry[];
  };
  navbar?: {
    links?: { label: string; href: string }[];
    primary?: { label: string; href: string };
  };
};

let cached: SiteConfig | null = null;

async function loadPortalOverrides(): Promise<Partial<SiteConfig>> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "content", "site.yaml"),
      "utf8",
    );
    return yaml.load(raw) as Partial<SiteConfig>;
  } catch {
    return {};
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
  if (cached) return cached;

  const [docsJson, overrides] = await Promise.all([
    loadDocsJson(),
    loadPortalOverrides(),
  ]);

  const contentRepo =
    process.env.CONTENT_REPO_URL ??
    "https://github.com/agentruntime-io/agentruntime-docs";

  cached = {
    name: docsJson.name,
    description:
      docsJson.description ??
      "Documentation for AgentRuntime.",
    url: overrides.url ?? process.env.SITE_URL ?? "https://docs.agentruntime.io",
    ogImage: overrides.ogImage ?? process.env.SITE_OG_IMAGE,
    githubEditBase:
      overrides.githubEditBase ?? `${contentRepo.replace(/\/$/, "")}/blob/main`,
    verification: overrides.verification,
    openapi: overrides.openapi ?? { specs: [] },
    navbar: docsJson.navbar
      ? {
          links: docsJson.navbar.links,
          primary: docsJson.navbar.primary
            ? {
                label: docsJson.navbar.primary.label,
                href: docsJson.navbar.primary.href,
              }
            : undefined,
        }
      : undefined,
  };

  return cached;
}

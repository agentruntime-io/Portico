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

const DEFAULT_CONTENT_REPO_URL =
  "https://github.com/agentruntime-io/agentruntime-docs";

/** GitHub repo URL for edit links — explicit override, or derived from CONTENT_GIT_REPO (no .git). */
export function resolveContentRepoUrl(): string {
  const explicit = process.env.CONTENT_REPO_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const gitRepo = process.env.CONTENT_GIT_REPO?.trim();
  if (gitRepo) {
    return gitRepo.replace(/\.git\/?$/i, "").replace(/\/$/, "");
  }

  return DEFAULT_CONTENT_REPO_URL;
}

/** Docs content branch — used for clone (prepare-content) and GitHub edit links. */
export function resolveContentGitBranch(): string {
  return process.env.CONTENT_GIT_BRANCH?.trim() || "main";
}

export function buildGithubEditBase(repoUrl: string, branch: string): string {
  const base = repoUrl.replace(/\/$/, "");
  const cleanBranch = branch.replace(/^\/+|\/+$/g, "");
  return `${base}/blob/${cleanBranch}`;
}

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

function mergeVerification(
  fromYaml?: SiteVerification,
): SiteVerification | undefined {
  const google =
    process.env.GOOGLE_SITE_VERIFICATION?.trim() ||
    fromYaml?.google?.trim() ||
    undefined;

  const merged: SiteVerification = {
    ...fromYaml,
    ...(google ? { google } : {}),
  };

  const hasValue =
    merged.google ||
    merged.yahoo ||
    merged.yandex ||
    (merged.other?.length ?? 0) > 0;

  return hasValue ? merged : undefined;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  if (cached) return cached;

  const [docsJson, overrides] = await Promise.all([
    loadDocsJson(),
    loadPortalOverrides(),
  ]);

  const contentRepo = resolveContentRepoUrl();
  const contentBranch = resolveContentGitBranch();

  cached = {
    name: docsJson.name,
    description:
      docsJson.description ??
      "Documentation for AgentRuntime.",
    url: overrides.url ?? process.env.SITE_URL ?? "https://docs.agentruntime.io",
    ogImage: overrides.ogImage ?? process.env.SITE_OG_IMAGE ?? "/opengraph-image",
    githubEditBase:
      overrides.githubEditBase ??
      buildGithubEditBase(contentRepo, contentBranch),
    verification: mergeVerification(overrides.verification),
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

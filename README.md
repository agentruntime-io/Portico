# Portico

[![CI](https://github.com/agentruntime-io/Portico/actions/workflows/portico-ci.yml/badge.svg)](https://github.com/agentruntime-io/Portico/actions/workflows/portico-ci.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)

**Self-hosted documentation portal** for teams who want docs-as-code: Git-backed `docs.json` + MDX, integrated OpenAPI reference, search, and SEO — without locking prose into this repository.

Built by [AgentRuntime](https://www.agentruntime.io) and shared with the open source community.

## Why Portico?

| You need… | Portico provides… |
|-----------|-------------------|
| Docs in Git | Renders `docs.json` + `.mdx` from any content repo |
| API reference | OpenAPI-driven `/reference/*` UI bundled in the renderer |
| Discoverability | Sitemap, `robots.txt`, `llms.txt`, JSON-LD, Open Graph |
| Fast local dev | Demo content included — `npm run dev` works immediately |
| Production hosting | Static-friendly Next.js build; Vercel, Docker, or any Node host |

**Two-repo model:** your **content repo** holds prose; **this repo** is the engine that builds and serves the site.

```
your-docs/          Portico (this repo)
├── docs.json  ──►  Next.js build  ──►  docs.yourcompany.com
├── *.mdx
└── i18n/…
```

## Quick start

**Requirements:** Node.js 20+, npm.

```bash
git clone https://github.com/agentruntime-io/Portico.git
cd Portico
npm install
npm run dev
```

Open [http://localhost:3004](http://localhost:3004). The bundled sample in `examples/demo-docs/` is used automatically.

### Use your own docs

```bash
cp .env.example .env.local
# CONTENT_ROOT=/absolute/path/to/your-docs-repo
npm run dev
```

Or clone content at build time (CI / Vercel): set `CONTENT_GIT_REPO` — see [SELF_HOSTING.md](./SELF_HOSTING.md).

### Production build

```bash
npm run validate
npm run build
npm run start
```

## Features

- **Navigation** from `docs.json` (groups, icons, navbar CTAs)
- **MDX** with callouts, steps, cards, tabs, Mermaid, Shiki highlighting
- **Search** across docs and API operations (build-time index)
- **i18n** via `i18n/{locale}/…` content paths
- **Changelog** route with RSS
- **OpenAPI** reference UI from YAML in `content/openapi/`

## Configuration

Most deployments need **two** environment variables:

| Variable | Required | Purpose |
|----------|----------|---------|
| `CONTENT_GIT_REPO` | Yes (production) | Git clone URL for your docs repo (`.git` suffix is fine) |
| `SITE_URL` | Yes (production) | Canonical URL for sitemap and metadata |

Optional:

| Variable | Default | Purpose |
|----------|---------|---------|
| `CONTENT_GIT_BRANCH` | `main` | Branch to clone and for “Edit this page” links |
| `CONTENT_ROOT` | — | Local docs path (dev only; don’t use with `CONTENT_GIT_REPO` on Vercel) |
| `CONTENT_REPO_URL` | derived from `CONTENT_GIT_REPO` | Override edit-link repo URL (without `.git`) |

“Edit this page” uses `CONTENT_GIT_REPO` with `.git` stripped and the same branch as `CONTENT_GIT_BRANCH`. Override with `CONTENT_REPO_URL` or `githubEditBase` in `content/site.yaml` if needed.

Renderer overrides: `content/site.yaml` (public URL, OpenAPI specs, verification tokens).

Full deployment guide: **[SELF_HOSTING.md](./SELF_HOSTING.md)**

## Project layout

| Path | What it is |
|------|------------|
| `src/` | Next.js app (routes, components, MDX pipeline) |
| `examples/demo-docs/` | Minimal sample content for dev and CI |
| `content/site.yaml` | Site URL, OpenAPI paths, SEO overrides |
| `content/openapi/` | Bundled API specs (optional) |
| `scripts/` | Content clone, validation, search index |

## Stack

Next.js 16 · React 19 · Tailwind CSS 4 · `next-mdx-remote` · Shiki · Mermaid · OpenAPI 3.x

UI conventions: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

## About AgentRuntime

Portico powers [AgentRuntime](https://www.agentruntime.io) documentation in production. We open-sourced the same renderer so you can self-host your own docs site with the same toolchain.

## Community

- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [License](LICENSE) (Apache 2.0)

## Links

- **Repository:** https://github.com/agentruntime-io/Portico
- **AgentRuntime:** https://www.agentruntime.io

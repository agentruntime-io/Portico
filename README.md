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

| Variable | Purpose |
|----------|---------|
| `CONTENT_ROOT` | Local path to your docs checkout |
| `CONTENT_GIT_REPO` | Clone docs at build time (Vercel / CI) |
| `SITE_URL` | Canonical URL for sitemap and metadata |
| `CONTENT_REPO_URL` | “Edit this page” GitHub base URL |

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

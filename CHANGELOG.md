# Changelog

All notable changes to Portico are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-06-17

### Fixed

- MDX marketing pages rendering empty on production
- Vercel runtime serving cloned docs instead of the bundled demo fallback when content clone fails

### Changed

- Migrated Next.js middleware to the Next.js 16 `proxy.ts` convention
- Expanded bundled demo docs with AgentRuntime platform, API, connector, and workflow guides
- Refreshed docs shell navigation: sidebar groups, global nav anchors, and mobile nav
- Simplified search control and improved keyboard / dialog accessibility
- Centralized theme and font-scale tokens with flash-free init script
- MDX prose rendering via dedicated enhancer and server-side callouts / steps
- Open Graph image generation aligned with site branding
- Updated dependencies (Next.js, React, ESLint, TypeScript, Tailwind, GitHub Actions)

### Notes

- Post-deploy hardening and CI license-check adjustments for Next.js `sharp` transitive deps.

[0.1.1]: https://github.com/agentruntime-io/Portico/releases/tag/v0.1.1

## [0.1.0] - 2026-06-13

### Added

- Self-hosted documentation portal renderer (Next.js 16, React 19)
- `docs.json` + MDX content pipeline with search index generation
- OpenAPI reference UI (`/reference/*`) from bundled YAML specs
- SEO surfaces: sitemap, `robots.txt`, `llms.txt`, JSON-LD, Open Graph
- Changelog route with RSS
- i18n content paths (`i18n/{locale}/…`)
- Bundled demo content (`examples/demo-docs/`) for zero-setup local dev
- Content wiring via `CONTENT_ROOT` or `CONTENT_GIT_REPO`
- Self-hosting guide (`SELF_HOSTING.md`) for Vercel, Docker, and deploy hooks
- Design system reference (`DESIGN_SYSTEM.md`)
- CI: lint, typecheck, dependency audit, license compliance, validate, and production build
- Dependabot for npm and GitHub Actions
- OSS governance: Apache 2.0 license, contributing guide, security policy, code of conduct

### Notes

- Portico is the renderer; your prose lives in a separate docs repository.
- Built by [AgentRuntime](https://www.agentruntime.io) and shared with the open source community.

[0.1.0]: https://github.com/agentruntime-io/Portico/releases/tag/v0.1.0

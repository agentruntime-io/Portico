# Changelog

All notable changes to Portico are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Requires Node.js 22.12+** (mermaid 12); CI, the Docker example and `engines` move to Node 22
- Mermaid 12 (classic look and dagre layout pinned, so diagrams look as before); clears the katex advisory. It adds `elkjs` (EPL-2.0), now allowed by the license check
- Full CI runs on demand (`workflow_dispatch`); a lockfile-only `npm audit` workflow still runs automatically on dependency changes and weekly

### Fixed

- Images and other static files in the content repo (for example `/images/x.png`) are published with the site; previously they returned 404. They are copied to `public/_content` before `dev` and `build` and served from their repo paths, after Portico's own routes and files
- `npm run validate` no longer reports two adjacent tables (separated by a blank line) as one table split by a blank line

## [0.2.0] - 2026-10-30

### Added

- `Tip`, `Check` and `Danger` callouts; `## Heading {#custom-id}` heading ids
- Branded `not-found` and `error` pages inside the docs shell
- Mermaid diagrams render at natural size with horizontal scroll and an expand dialog
- Theme preference now includes **System** (follows `prefers-color-scheme`, the default)
- Home page components `HomePage`, `Hero` (with a large search field), `HeroAction` and `Section`
- `docs.json` `logo` (one file or `{ light, dark }`) shown in the header, per theme
- Portico logo set in `public/brand/` (mark, horizontal and stacked logos, light and dark, plus a theme-aware `portico-icon.svg`); the favicon replaces Next.js's default icon, and the attribution line shows the mark
- Home page components `Band`, `TaskList` and `Task`, and `HeroAside` (right-hand column of a `Hero`); `Hero` gains `highlight` and `suggestions` ("Try" chips under the search card); `Section` gains `description` and a heading link (`href` + `linkLabel`)
- `docs.json` `colors` (`primary`, `light`, `dark`) override the brand tokens, and `docs.json` `fonts` replace the heading and body fonts (Google Fonts by family name, or a self-hosted `source`); tints derive from the brand colour
- Content repos can carry their own `site.yaml`, redirects (`redirects.yaml` or `docs.json` `redirects`) and OpenAPI specs (`openapi/` or `site.yaml` `openapi.specs`)
- `docs.json` `favicon`, `footer` (link groups and socials), `appearance` (`default` theme, `strict` hides the switch) and `logo.href`; a support contact (`site.yaml` `support`, or a Support/Help link in `docs.json`) shows Help
- Search results are labelled with the page's `docs.json` navigation group
- API reference contact, license and section links come from the spec (`info.contact`, `info.license`, `##` headings in `info.description`)

### Changed

- Visual redesign: one palette (`--canvas`, `--surface`, `--ink`, `--brand`, …) keyed on `data-theme`, with the previous token names kept as aliases; Instrument Sans, Bricolage Grotesque and JetBrains Mono replace Geist
- Header is full width with underlined Documentation / API tabs, a search field and a primary CTA; under 820px the header is just brand, search and a menu button that opens the drawer
- Sidebar is a tree with page counts and a brand rule on the current page; the right "On this page" rail starts at 1180px, with an inline disclosure below it
- Doc page: breadcrumb row with Copy link, display-font title, restyled prose, callouts, tables, code blocks and steps; the pager now carries the Edit this page row
- Home page: `Hero` search card, `Section` headers, four-column `CardGroup` and `Card` styling (Mintlify-style home markup gets the same look)
- Shiki dual-theme colours apply to every highlighted code block
- Removed the Help and Home utility links; site links come from `docs.json` (`anchors`, `navbar`)
- Header: theme, text size and language move into one **Display settings** popover
- Copy link is a quiet text button on the breadcrumb row; less space between the page header and the article
- Mintlify-style home pages render with Portico card styling instead of green link-coloured outlines and titles
- `npm run validate` loads `.env.local`, prints the content root, compiles every MDX page, flags unknown components, broken internal links and tables split by blank lines
- Search indexes headings and full stripped body text, matches every term (hyphen = space) and highlights hits; the index is regenerated on `npm run dev` and no longer committed
- API reference descriptions render Markdown
- MDX compiles with `blockJS: false` (JSX-expression props such as `Card title={<span/>}` work; `blockDangerousJS` stays on)
- SSR chrome uses the URL locale; untranslated fallback pages canonicalise to the English URL and are `noindex`

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
- No AgentRuntime defaults in the engine: no default site URL or edit-link repo, product-neutral changelog/API/OG copy, generic client samples (`callApi`)

### Removed

- Fallback to a sibling `agentruntime-docs` checkout when `CONTENT_ROOT` is unset (the bundled demo is used instead)
- Portico's own `content/` folder (site config, redirects and the bundled spec moved into `examples/demo-docs`)

### Security

- Next.js 16.4.3 and patched `dompurify`, `brace-expansion`, `fast-uri`, `zod`, `source-map-js` and `postcss-selector-parser`; `npm audit --audit-level=high` is clean again

### Upgrade notes

- Move `site.yaml`, `redirects.yaml` and `openapi/` into your content repo, next to `docs.json`.
- Set `SITE_URL` in production; without it (or `site.yaml` `url`) canonical URLs fall back to `http://localhost:3004`.
- "Edit this page" appears only when `CONTENT_REPO_URL`, `CONTENT_GIT_REPO` or `site.yaml` `githubEditBase` is set.
- Set `CONTENT_ROOT` (or `CONTENT_GIT_REPO`) explicitly; Portico no longer looks for a sibling checkout.

### Notes

- Post-deploy hardening and CI license-check adjustments for Next.js `sharp` transitive deps.

[0.2.0]: https://github.com/agentruntime-io/Portico/releases/tag/v0.2.0
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

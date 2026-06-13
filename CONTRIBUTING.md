# Contributing to Portico

Thank you for helping improve Portico. This repository is the **renderer** (Next.js app). User-facing documentation **content** usually lives in a separate repo wired via `CONTENT_ROOT` or `CONTENT_GIT_REPO`.

## Before you start

- Read [README.md](./README.md) for architecture and local setup.
- For hosting and env vars, see [SELF_HOSTING.md](./SELF_HOSTING.md).
- For UI tokens and MDX components, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

## Development setup

Requirements: **Node.js 20+**, **npm**.

```bash
git clone https://github.com/agentruntime-io/Portico.git
cd Portico
npm install
npm run dev
```

Open [http://localhost:3004](http://localhost:3004). The bundled sample at `examples/demo-docs/` is used by default.

To point at your own docs checkout:

```bash
cp .env.example .env.local
# Set CONTENT_ROOT=/absolute/path/to/your-docs
npm run dev
```

## Checks to run before opening a PR

```bash
npm run lint
npm run typecheck
npm run validate
npm run build
```

CI runs the same validate + build flow against `examples/demo-docs` on every push and pull request (see [`.github/workflows/portico-ci.yml`](./.github/workflows/portico-ci.yml)).

Set `CONTENT_ROOT=examples/demo-docs` when validating locally if you have not configured `.env.local`.

## Pull request guidelines

1. **Open an issue first** for large changes (new features, breaking behavior, or broad refactors) so we can align on approach.
2. **Keep PRs focused** — one logical change per PR when possible.
3. **Update docs** when you change user-visible behavior, env vars, or content format support.
4. **Match existing style** — TypeScript, App Router patterns, Tailwind tokens from `DESIGN_SYSTEM.md`, minimal scope.
5. **Do not commit secrets** — `.env.local`, API keys, or private repo tokens.

## What to contribute

Good fits for this repo:

- Bug fixes in rendering, navigation, search, SEO, or OpenAPI reference UI
- MDX component support and accessibility improvements
- Performance and build-time improvements
- Tests and CI hardening
- Documentation for self-hosting and configuration

Usually **out of scope** here (belongs in your content repo instead):

- Product prose, tutorials, and marketing copy
- Customer-specific `docs.json` / MDX pages

## Code of conduct

Be respectful and constructive. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the [Apache License, Version 2.0](LICENSE).

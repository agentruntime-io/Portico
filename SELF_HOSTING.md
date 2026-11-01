# Self-hosting Portico

Portico is a **renderer**. Your prose lives in a separate **content repository**
(`docs.json` + `*.mdx`), or in the bundled **`examples/demo-docs`** for trying it out.

## Quick start (no extra clone)

```bash
npm install
npm run dev
```

Open [http://localhost:3004](http://localhost:3004). Content resolves automatically:

1. `CONTENT_ROOT` env (if set)
2. `.content-root` pointer (after `CONTENT_GIT_REPO` clone)
3. **`examples/demo-docs`** ← bundled demo

## Use your own docs locally

```bash
export CONTENT_ROOT=/absolute/path/to/your-docs
npm run dev
```

Or in `.env.local`:

```env
CONTENT_ROOT=/absolute/path/to/your-docs
SITE_URL=http://localhost:3004
```

Or clone at build time (same as Vercel):

```env
CONTENT_GIT_REPO=https://github.com/your-org/your-docs.git
SITE_URL=http://localhost:3004
# CONTENT_GIT_BRANCH=main   # optional, defaults to main
```

## Production build

```bash
npm run validate
npm run build
npm run start
```

Build **reads MDX from disk** and emits static pages. Visitors never hit GitHub at request time.

---

## Vercel (recommended pattern)

### A. Try the demo (fastest)

1. Import the Portico repo into Vercel.
2. Root Directory: `.` (this repository is the app root).
3. The included [`vercel.json`](./vercel.json) sets `CONTENT_ROOT=examples/demo-docs`.
4. Deploy — no second repository required.

### B. Your real docs repo (clone at build)

**Vercel project** = Portico repository.

**Environment variables** (Vercel → Settings → Environment Variables, or **Import .env**):

| Variable | Required | Example |
|----------|----------|---------|
| `CONTENT_GIT_REPO` | Yes | `https://github.com/your-org/your-docs.git` |
| `SITE_URL` | Yes | `https://docs.yourcompany.com` |
| `CONTENT_GIT_BRANCH` | No (default `main`) | `main` |

You do **not** need `CONTENT_REPO_URL` unless the edit-link repo differs from the clone repo. Portico strips `.git` from `CONTENT_GIT_REPO` and builds edit URLs as `{repo}/blob/{branch}`.

Do **not** set `CONTENT_ROOT` when using `CONTENT_GIT_REPO` — the install step clones into
`.content/checkout` and writes `.content-root`.

**Install Command** (override in Vercel if not using defaults):

```bash
npm ci
```

**Build Command:**

```bash
npm run validate && npm run build
```

`prebuild` runs `scripts/prepare-content.mjs`, which clones `CONTENT_GIT_REPO` when set.

### C. Redeploy when only docs change

Vercel watches the **Portico** repo. Pushing to **docs** alone does not rebuild.

1. Vercel → Project → Settings → **Deploy Hooks** → create hook.
2. Copy [`examples/workflows/deploy-external-docs.yml`](./examples/workflows/deploy-external-docs.yml)
   into your **docs** repo as `.github/workflows/deploy-docs-portal.yml`.
3. Add secret `VERCEL_DEPLOY_HOOK` in the docs repo.

Every push to `main` on the docs repo triggers a fresh Vercel build (Portico clones latest docs).

---

## GitHub Actions (Portico CI)

[`.github/workflows/portico-ci.yml`](./.github/workflows/portico-ci.yml) validates and builds with
`examples/demo-docs` on every push/PR.

Optional: set repository variable `CONTENT_GIT_REPO` to smoke-test the clone path in CI.

---

## Docker (outline)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG CONTENT_GIT_REPO
ARG CONTENT_GIT_BRANCH=main
ENV CONTENT_GIT_REPO=$CONTENT_GIT_REPO
ENV CONTENT_GIT_BRANCH=$CONTENT_GIT_BRANCH
ENV SITE_URL=https://docs.example.com
RUN npm run validate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3004
CMD ["npm", "run", "start"]
```

Build with:

```bash
docker build \
  --build-arg CONTENT_GIT_REPO=https://github.com/your-org/your-docs.git \
  -t portico .
```

---

## LLM and agent access

Every Portico site exposes its docs to LLMs and coding agents. Nothing to configure; replace `https://<your-docs>` with your `SITE_URL`.

| URL | What it returns |
|-----|-----------------|
| `https://<your-docs>/<page>.md` | One page as Markdown (`/workflows/studio.md`, `/index.md` for the home page, `/es/...` for a locale): `# Title`, the description, then the MDX body. Components such as `<Steps>` stay in the text. Unknown, `draft` and `noindex` pages return 404 |
| `https://<your-docs>/llms.txt` | Index of pages and navigation |
| `https://<your-docs>/llms-full.txt` | Every page in `docs.json` navigation order, each with its title and `Source:` URL |
| `https://<your-docs>/mcp` | Docs MCP server (below) |

### Docs MCP server

`/mcp` is a read-only [MCP](https://modelcontextprotocol.io) server over Streamable HTTP. It is stateless and answers each `POST` with JSON; `GET` returns 405. It offers three tools:

- `search_docs` (`query`, optional `limit`): title, URL, navigation group and a snippet per match
- `get_page` (`path`): a page as Markdown; takes `/workflows/studio`, `workflows/studio` or a full URL
- `list_pages`: the navigation as groups of pages (title and path)

Connect a client that supports remote HTTP servers. For example, in a `.mcp.json` (Claude Code) or a similar client config:

```json
{
  "mcpServers": {
    "my-docs": {
      "type": "http",
      "url": "https://<your-docs>/mcp"
    }
  }
}
```

Claude Code can also add it from the command line: `claude mcp add --transport http my-docs https://<your-docs>/mcp`. Clients that only speak stdio can use a bridge such as `npx mcp-remote https://<your-docs>/mcp`.

The server name is `<site name> docs`. Search runs on an index built from your content when the first request arrives, so it needs no extra build step. To turn the endpoint off, add `mcp: false` to `site.yaml` in your content repo; `/mcp` then returns 404.

---

## Content repository layout

```
your-docs/
  docs.json
  index.mdx
  guide/
    quickstart.mdx
  i18n/
    es/
      guide/quickstart.mdx
```

See [`examples/demo-docs/`](./examples/demo-docs/) for a working minimal site.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Content root not found` | Set `CONTENT_ROOT` or ensure `examples/demo-docs` exists |
| Vercel build OK but stale content | Trigger deploy hook after docs push |
| Private docs repo on Vercel | Use HTTPS URL with token or Vercel’s git integration + submodule |
| Edit link 404 or wrong branch | Set `CONTENT_GIT_BRANCH`, or override `githubEditBase` in your content repo's `site.yaml` |

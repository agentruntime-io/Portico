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
3. Sibling `agentruntime/agentruntime-docs` (AgentRuntime dev checkout)
4. **`examples/demo-docs`** ← OSS default

## Use your own docs locally

```bash
export CONTENT_ROOT=/absolute/path/to/your-docs
npm run dev
```

Or in `.env.local`:

```env
CONTENT_ROOT=/absolute/path/to/your-docs
SITE_URL=http://localhost:3004
CONTENT_REPO_URL=https://github.com/your-org/your-docs
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

**Environment variables** (Vercel → Settings → Environment Variables):

| Variable | Example |
|----------|---------|
| `CONTENT_GIT_REPO` | `https://github.com/your-org/your-docs.git` |
| `CONTENT_GIT_BRANCH` | `main` |
| `SITE_URL` | `https://docs.yourcompany.com` |
| `CONTENT_REPO_URL` | `https://github.com/your-org/your-docs` |

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
FROM node:20-alpine AS builder
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

FROM node:20-alpine AS runner
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
| Edit link 404 | Set `CONTENT_REPO_URL` / `githubEditBase` in `content/site.yaml` |

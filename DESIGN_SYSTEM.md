# Portico — Design System

Design reference for Portico. Use this when adding pages, components, or content that should feel native to the docs experience.

**Stack:** Next.js 16 · React 19 · Tailwind CSS 4 · `@tailwindcss/typography` · Lucide icons

---

## 1. Design principles

| Principle | What it means in practice |
|-----------|---------------------------|
| **Readable first** | Long-form docs and API reference are the product. Typography, contrast, and spacing prioritize scanning and comprehension. |
| **Emerald accent** | Brand color signals interactivity, active state, and links — never as a full-page wash except on the marketing home hero. |
| **Layered surfaces** | App background → sidebar → main panel creates depth without heavy chrome. |
| **Theme-aware tokens** | Components use CSS custom properties (`--text-main`, `--panel-bg`, …), not hard-coded dark colors. |
| **Developer-native** | Monospace for paths, methods, and code; structured tables and JSON blocks for API content. |

---

## 2. Color system

### 2.1 Semantic tokens

Tokens are defined in `src/app/globals.css` and synchronized in `src/app/layout.tsx` (init script) and `src/components/site-controls.tsx` (toggle).

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--background` | `#0a0a0a` | `#f3f6f4` | Root / body fallback |
| `--foreground` | `#ededed` | `#171717` | Root text fallback |
| `--app-bg` | `#080b0a` | `#eef3f0` | Page canvas behind panels |
| `--panel-bg` | `#0b100e` | `#fbfcfb` | Main content card, header, modals |
| `--sidebar-bg` | `#080b0a` | `#f5f8f6` | Fixed sidebar |
| `--panel-border` | `#27272a` | `#cfd8d3` | Borders, dividers |
| `--text-main` | `#f4f4f5` | `#18181b` | Primary text |
| `--text-muted` | `#a1a1aa` | `#4b5563` | Secondary text, labels |
| `--doc-font-scale` | `1` (default) | `1` | Multiplier for `.doc-prose` font size |

**Usage in Tailwind:**

```html
<div class="bg-[var(--panel-bg)] text-[var(--text-main)] border-[var(--panel-border)]">
```

Theme is applied via `data-theme="dark"` | `data-theme="light"` on `<html>`. Default is **dark**; preference persists in `localStorage` key `doc-theme`.

### 2.2 Brand accent — Emerald

Emerald is the single interactive accent across docs and API reference.

| Role | Dark | Light | Tailwind |
|------|------|-------|----------|
| Primary CTA | `emerald-600` bg | same | `bg-emerald-600 hover:bg-emerald-500` |
| Active nav text | `#6ee7b7` | `#047857` | `.docs-nav-active` |
| Nav hover | `#34d399` | `#047857` | `.docs-nav-item:hover` |
| Prose links | `#34d399` | `#047857` | `--tw-prose-links` |
| Hover surface | — | — | `hover:bg-emerald-500/10` |
| Active surface | — | — | `bg-emerald-500/15` |
| Badge (header) | — | — | `bg-emerald-600 text-white` |

Avoid using emerald for large background fields inside doc panels; reserve it for links, active states, and primary actions.

### 2.3 HTTP method colors

Used in API sidebar (`ApiMethod`) and operation headers (`MethodBadge`).

| Method | Sidebar (mono text) | Badge (pill) |
|--------|---------------------|--------------|
| GET | `text-sky-400` | `bg-blue-100 text-blue-800` / `dark:bg-blue-950 dark:text-blue-200` |
| POST | `text-emerald-400` | `bg-emerald-100 text-emerald-800` / `dark:bg-emerald-950 dark:text-emerald-200` |
| PUT / PATCH | `text-amber-400` / `text-yellow-300` | `bg-amber-100 text-amber-900` / `dark:bg-amber-950` |
| DELETE | `text-red-400` | `bg-red-100 text-red-800` / `dark:bg-red-950 dark:text-red-200` |

### 2.4 API surface classes

Theme-aware utility classes in `globals.css` for OpenAPI UI. Prefer these over raw zinc colors in API components.

| Class | Purpose |
|-------|---------|
| `.api-card` | Card container (responses, auth panel, schema) |
| `.api-card-header` | Card title bar |
| `.api-control` | Secondary buttons (copy, language tabs) |
| `.api-input` | Text inputs in API playground |
| `.api-code` | Code / JSON blocks |
| `.api-soft` | Subtle inset backgrounds |
| `.api-muted` | Secondary text |
| `.api-faint` | Tertiary / meta text |
| `.api-divider` | Border color for separators |

### 2.5 Navigation classes (shared across docs + API)

| Class | Purpose |
|-------|---------|
| `.nav-item` / `.docs-nav-item` | Default sidebar link (primary text) |
| `.nav-item-muted` | Dense sidebar link (muted text — API operation list) |
| `.nav-active` / `.docs-nav-active` | Current page or section |
| `.toc-link` / `.toc-link-active` | On-this-page table of contents |
| `.ds-link` | Icon/text links with emerald hover (right rail, downloads) |

### 2.6 Shared surface classes (docs + API)

Use these anywhere a component is not API-specific. API-only surfaces still use `.api-*`.

| Class | Purpose |
|-------|---------|
| `.ds-control` | Bordered toolbar control (search, theme, font scale, mobile menu) |
| `.ds-modal` | Modal / overlay panel (search dialog) |
| `.ds-kbd` | Keyboard shortcut chip (`Ctrl K`) |
| `.ds-section-label` | Uppercase section heading (Parameters, Responses, …) |
| `.ds-badge` | Soft pill badge (search section label, `yaml` tag) |
| `.ds-soft` | Subtle inset background |
| `.ds-inline-code` | Inline code outside prose |
| `.ds-tab` / `.ds-tab-active` / `.ds-tab-active-accent` | Segmented tabs (search, client libraries) |
| `.ds-hover-row` | List row hover (search results) |
| `.ds-empty-state` | Dashed placeholder panel (AI search stub) |
| `.ds-status-code` | HTTP status code chip in response cards |
| `.ds-table` | Parameter / data tables |
| `.ds-accent-text` | Emerald accent text (refs, schema types) |
| `.ds-shadow-panel` | Elevated panel shadow (main card, modals, drawers) |
| `.ds-callout` / `.ds-callout-note` / `.ds-callout-warning` / `.ds-callout-info` | MDX `<Note>`, `<Warning>`, `<Info>` callouts |

**Layout split (unchanged):** docs use `DocsShell` + rounded main panel; API uses `ApiReferenceShell` + flat main column + optional right rail. Both share tokens, nav classes, and toolbar controls.

**No zinc overrides:** components use `data-theme` tokens and `ds-*` / `api-*` classes — not Tailwind `zinc-*` utilities or legacy `dark:` zinc patches.

### 2.7 Accessibility & i18n

| Concern | Implementation |
|---------|----------------|
| Skip link | `.skip-link` → `#main-content` |
| Focus | `:focus-visible` emerald ring on interactive elements |
| Dialogs | `useDialog()` — trap, Escape, focus restore, scroll lock |
| Motion | `@media (prefers-reduced-motion: reduce)` in `globals.css` |
| UI i18n | `I18nProvider` + `useI18n()` + `src/lib/i18n/messages/{en,es,fr,ja}.ts` |
| Content i18n | Not in portal — author localized MDX in agentruntime-docs |

Add new UI strings to **all four** message files, then use `t("dotted.key")` in client components.

---

## 3. Typography

### 3.1 Font families

| Role | Family | Notes |
|------|--------|-------|
| UI / body | Arial, Helvetica, sans-serif | Set on `body` in `globals.css` |
| Sans (theme) | Geist Sans (`--font-geist-sans`) | Registered in `@theme inline`; use when Geist is loaded |
| Mono | Geist Mono (`--font-geist-mono`) | Paths, methods, kbd, code samples |
| Prose | Tailwind Typography `prose` | Markdown content via `.doc-prose` |

### 3.2 Type scale

| Element | Classes | Size / weight |
|---------|---------|---------------|
| Home hero label | `text-sm font-semibold uppercase tracking-widest` | Eyebrow |
| Page title (prose layout) | `text-3xl font-bold tracking-tight` | H1 in `ProsePageLayout` |
| Page description | `text-lg leading-7` | Muted intro |
| Markdown H2 | `prose-h2:text-2xl` | Section headings |
| Markdown H3 | `prose-h3:text-xl` | Subsections |
| Header nav | `text-xs font-medium uppercase tracking-wide` | Top bar section links |
| Sidebar items | `text-sm` | Nav links |
| On-this-page | `text-[13px]` | Right rail TOC |
| API section label | `text-sm font-bold uppercase tracking-wide text-zinc-500` | Parameters, Responses, etc. |
| Code blocks | `text-xs leading-relaxed` | JSON / curl samples |

### 3.3 Font scaling

`FontScaleControls` sets `--doc-font-scale` to one of `0.9 | 1 | 1.1 | 1.2`. `.doc-prose` uses:

```css
font-size: calc(1rem * var(--doc-font-scale));
```

Persisted in `localStorage` key `doc-font-scale`.

### 3.4 Prose theming

`.prose` colors are overridden per theme via `--tw-prose-*` variables in `globals.css`. Inline code and pre blocks have additional rules under `[data-theme="light"]` and `[data-theme="dark"]` for `.doc-prose`.

---

## 4. Layout & spacing

### 4.1 Shell structure (docs / guides / changelog)

```
┌─────────────────────────────────────────────────────────────┐
│ DocsHeader (sticky, h-14, max-w-[1600px])                   │
├──────────┬──────────────────────────────────────────────────┤
│ Sidebar  │ Main panel (rounded-2xl, shadow-2xl)             │
│ 320px    │ px-6 sm:px-10, pb-16                             │
│ fixed    │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

| Region | Key classes |
|--------|-------------|
| App wrapper | `bg-[var(--app-bg)]` |
| Header | `sticky top-0 z-40 h-14 border-b backdrop-blur-md` |
| Sidebar | `fixed w-[320px] top-14 hidden md:block` |
| Main offset | `md:pl-[344px]` (sidebar + gap) |
| Content max width | `max-w-[1800px]` shell; `max-w-6xl` inside prose layout |

### 4.2 API reference layout

| Region | Width | Breakpoint |
|--------|-------|------------|
| API sidebar | `340px` | `lg:flex` |
| Main content | `flex-1 min-w-0` | — |
| Right rail (server, samples) | `380px` | `xl:block` |
| Content max width | `max-w-[1520px]` | — |

### 4.3 Prose page grid

`ProsePageLayout` uses a two-column grid at `lg`:

- Article: `minmax(0, 1fr)`
- On-this-page: `220px`, `sticky top-24`

### 4.4 Breakpoints (Tailwind defaults)

| Prefix | Min width | Portal usage |
|--------|-----------|--------------|
| `sm` | 640px | Horizontal padding, kbd in search |
| `md` | 768px | Sidebar visible; mobile nav hidden |
| `lg` | 1024px | API sidebar; prose TOC column |
| `xl` | 1280px | API right rail |

### 4.5 Radii & elevation

| Pattern | Value |
|---------|-------|
| Buttons / inputs | `rounded-lg` |
| Main panel | `rounded-2xl` |
| Modals / assistant | `rounded-xl` / `rounded-2xl` |
| Pills / badges | `rounded-md` / `rounded` |
| Shadow (panels) | `shadow-2xl shadow-black/20` (light theme softens via CSS override) |

---

## 5. Components

### 5.1 Buttons

**Primary (marketing home only)**

```
rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500
```

**Secondary / outline**

```
rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-zinc-50
```

**Icon control (header toolbar)**

```
inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] hover:bg-emerald-500/10
```

**API control (copy, etc.)**

```
api-control inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium
```

**Send (assistant)**

```
inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white hover:bg-emerald-600
```

### 5.2 Header toolbar

Right cluster order: `NavbarLinks` → `NavbarPrimaryCta` → `FontScaleControls` → `LanguageSelector` → `ThemeToggle` → `AssistantLauncher` → `SearchControl` → `MobileNavButton`.

- **`NavbarLinks`** / **`NavbarPrimaryCta`** (`navbar-cta.tsx`) — sourced from `docs.json` → `navbar.links` and `navbar.primary` (e.g. Pricing, GitHub, Open Console).
- External links open in a new tab; internal links respect locale via `localizeHref`.
- Primary CTA is visible on all breakpoints (`text-xs`, compact padding on phones).
- On mobile (`lg:hidden` drawer), the same navbar block appears at the top of `MobileNavButton` before doc sections.

All icon buttons share the `h-9` control height for alignment.

### 5.3 Search modal

- Trigger: full-width up to `max-w-md`, shows `Ctrl K` kbd on `sm+`
- Overlay: `bg-black/40`, panel `max-w-2xl rounded-xl`
- Modes: **Search** (zinc active tab) / **AI Search** (emerald active tab)
- Results: section badge + title + URL + excerpt; hover `bg-zinc-50 dark:bg-zinc-900`

### 5.4 Cards

**Docs main panel**

```
rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-2xl shadow-black/20
```

**API card**

```
api-card overflow-hidden rounded-lg border
```

Header row: `api-card-header border-b px-4 py-2 text-sm font-semibold`

### 5.5 Code blocks (Shiki)

Markdown and MDX fences are highlighted at build time via **Shiki** + `rehype-pretty-code` (`src/lib/rehype-pipeline.ts`).

| Context | Treatment |
|---------|-----------|
| Fenced code | `<figure data-rehype-pretty-code-figure>` + dual-theme spans (`--shiki-light` / `--shiki-dark`) |
| Theme switch | `html[data-theme]` selects active token colors in `globals.css` |
| Copy | `DocProse` wraps each block with `CodeCopyButton` (top-right) |
| Markdown inline | Rounded, padded; theme-specific bg in `.doc-prose` |
| API JSON / curl | `.api-code` with optional copy header bar |
| Schema refs | `font-mono text-xs text-emerald-700 dark:text-emerald-400` |

### 5.5a Mermaid diagrams

` ```mermaid ` fences become `<div data-mermaid="…">` in the rehype pipeline; `MermaidDiagram` hydrates on the client.

- Container: `.mermaid-diagram` — bordered panel, horizontal scroll on small screens
- Theme: re-renders when `html[data-theme]` changes (`MutationObserver`)
- Errors: `.ds-callout-warning` with message text

### 5.5b MDX layout components (`mdx-layout.tsx`)

| Component | Purpose |
|-----------|---------|
| `<Tabs>` / `<Tab title="…">` | Tabbed prose or code |
| `<CodeGroup>` | Alias for tabbed code blocks |
| `<Accordion>` / `<AccordionGroup>` | Collapsible FAQ-style sections |
| `<Frame caption="…">` | Screenshot / media with optional caption (`.ds-frame`) |
| `<Expandable>` | Alias for a single accordion |

### 5.5c Page actions

`PageActions` groups **Copy link** + **Edit this page** (when `githubEditBase` is set in `site.yaml` / `CONTENT_REPO_URL`).

- Edit URL: `githubEditBase` + `i18n/{locale}/path.mdx` via `githubEditUrl()` in `src/lib/edit-url.ts`
- Shown in `ProsePageLayout` and marketing-style MDX home pages

### 5.5d Page navigation (pager)

`DocPager` — prev/next footer cards at the bottom of doc pages.

- Docs: order follows flattened `docs.json` sidebar (`src/lib/pager.ts`)
- API reference: tag-level prev/next (`src/lib/api-pager.ts`); overview links back to last API guide page

### 5.6 Tables (API parameters)

```
thead: border-b border-zinc-200 dark:border-zinc-800
rows: border-b border-zinc-100 dark:border-zinc-800/80
required: red asterisk text-red-600
```

### 5.7 On this page (TOC)

- Sticky `top-24`, left border on container
- Active section: `border-emerald-500 font-semibold text-emerald-700 dark:text-emerald-400`
- H3 indent: `pl-10` vs H2 `pl-5`
- Scroll spy via `IntersectionObserver`

### 5.8 Mobile navigation

- Hamburger: `lg:hidden`, `h-9 w-9`
- Drawer: left slide-over `w-[min(20rem,88vw)]`, backdrop `bg-black/60`
- Top block: `docs.json` navbar links + primary CTA (full-width button)
- Reuses `.docs-nav-active` / `.docs-nav-item`

### 5.9 Assistant panel

Fixed `bottom-4 right-4 top-20`, max width `min(420px, calc(100vw - 2rem))`. Input area uses `border-emerald-500/60 bg-emerald-500/5`.

---

## 6. Icons

**Library:** [Lucide React](https://lucide.dev) (`lucide-react`)

| Context | Icon | Size |
|---------|------|------|
| Nav groups | `BookOpen`, `Braces`, `FileClock`, `Map` | `h-4 w-4` |
| Utility nav | `Home`, `FileClock`, `CircleHelp` | `h-4 w-4` |
| Theme | `Moon` / `Sun` | `h-4 w-4` |
| Language | `Globe2` | `h-4 w-4` |
| Assistant | `Bot` | `h-4 w-4` / `h-5 w-5` in panel |
| Search | `Search` | `h-4 w-4` |
| TOC | `ListFilter` | `h-3.5 w-3.5` |
| Copy | `Copy` / `Check` | `h-3.5 w-3.5` |

Default icon stroke size matches Lucide defaults at these bounding boxes.

---

## 7. Motion & interaction

| Pattern | Implementation |
|---------|----------------|
| Color transitions | `transition-colors` on nav links |
| Chevron expand | `transition group-open:rotate-90` on API tag groups |
| Hover (nav) | Emerald tint background, no scale |
| Focus | Native focus on inputs; buttons use `outline-none` — ensure visible focus when adding new controls |
| Modals | Open/close without animation (instant) |

Keep motion minimal; this is a documentation surface, not a marketing site.

---

## 8. Accessibility

| Requirement | Current pattern |
|-------------|-----------------|
| Icon-only buttons | `aria-label` on theme, assistant, search close, mobile nav |
| Language select | `aria-label="Documentation language"` |
| Font scale | `aria-label` on group and +/- buttons |
| Landmarks | `<header>`, `<main>`, `<aside>`, `aria-label` on utility nav |
| Keyboard | `Ctrl/Cmd+K` search, `Escape` closes modals |
| Language | `document.documentElement.lang` from selector |
| Heading anchors | `.anchor-heading-link` — no underline, inherit color |

When adding components, preserve 44×44px touch targets on mobile (`h-9` = 36px — acceptable for dense toolbar; increase padding on primary mobile actions).

---

## 9. Page patterns

### 9.1 Marketing home (`/`)

Standalone layout (no `DocsShell`). Gradient hero `from-emerald-50/80 to-zinc-50` (light) / `dark:from-emerald-950/30 dark:to-zinc-950`. Primary + secondary + text link CTAs.

### 9.2 Prose content (`/docs`, `/guides`, `/changelog`)

`DocsShell` + `ProsePageLayout`:

1. Eyebrow (`text-sm font-medium text-[var(--text-muted)]`)
2. Title
3. Optional description
4. `CopyPageButton`
5. `MarkdownBody` (`.doc-prose.prose`)

### 9.3 API reference (`/reference`)

`ApiReferenceShell` with tag-grouped sidebar, `OperationDocView` sections:

1. Method badge + path
2. Summary / description
3. Sample request (curl)
4. Parameters table
5. Request body (schema + example)
6. Responses (per status code cards)

Right rail: server URL, `AuthenticatedClientSamples` with language tabs and auth token field.

---

## 10. Content & markdown conventions

Rendered through `MarkdownBody` with:

- `remark-gfm` (tables, task lists, strikethrough)
- `rehype-slug` + `rehype-autolink-headings` (anchor links use `.anchor-heading-link`)
- `rehype-sanitize` for safe HTML

Prose utility highlights:

- `prose-h1:hidden` — page title comes from layout, not markdown H1
- `prose-h2:mt-14` — section breathing room
- `prose-headings:scroll-mt-24` — offset for sticky header

---

## 11. Do / don't

**Do**

- Use semantic CSS variables for surfaces and text in shell components.
- Use `.api-*` classes inside API reference UI.
- Use emerald for links, active nav, and primary CTAs.
- Match existing `h-9` toolbar control sizing.
- Test both `data-theme="light"` and `data-theme="dark"`.

**Don't**

- Introduce new accent colors without strong justification.
- Hard-code `#080b0a` / zinc-950 in new docs components — use tokens.
- Use Scalar/Redoc-style third-party API chrome; keep first-party patterns.
- Rely on `prefers-color-scheme` alone — explicit `data-theme` wins (see light-theme overrides in `globals.css`).

---

## 12. File map

| File | Responsibility |
|------|----------------|
| `src/app/globals.css` | Tokens, `.api-*`, `.docs-nav-*`, prose overrides, light-theme fixes |
| `src/app/layout.tsx` | Theme flash-prevention script, root metadata |
| `src/components/docs-shell.tsx` | Header, sidebar, main docs layout |
| `src/components/prose-page-layout.tsx` | Article + TOC grid |
| `src/components/markdown-body.tsx` | Prose wrapper classes |
| `src/components/api-reference-shell.tsx` | API layout, method colors, sidebar |
| `src/components/operation-doc.tsx` | Operation detail sections |
| `src/components/site-controls.tsx` | Theme, language, assistant |
| `src/components/search-control.tsx` | Search / AI modal |
| `src/components/font-scale-controls.tsx` | Accessible type scaling |

---

## 13. Quick reference — copy-paste snippets

**Themed panel**

```tsx
<div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 text-[var(--text-main)]">
```

**Sidebar link**

```tsx
<Link
  href="/docs/example"
  className="block rounded-md px-2 py-1.5 text-sm transition-colors docs-nav-item"
>
  Example
</Link>
```

**Active sidebar link**

```tsx
className="block rounded-md px-2 py-1.5 text-sm transition-colors docs-nav-active font-medium"
```

**Section eyebrow + title (docs page)**

```tsx
<p className="text-sm font-medium text-[var(--text-muted)]">Documentation</p>
<h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-main)]">Page title</h1>
```

**API JSON block**

```tsx
<div className="api-code overflow-hidden rounded-lg">
  <pre className="overflow-x-auto p-4 text-xs leading-relaxed">{body}</pre>
</div>
```

---

*Last synced with portal source: Tailwind 4, Next.js 16.2.6. Update this doc when adding new tokens or shared components.*

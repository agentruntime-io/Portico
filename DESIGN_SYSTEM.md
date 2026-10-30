# Portico — Design System

Design reference for Portico. Use this when adding pages, components, or content that should feel native to the docs experience.

**Stack:** Next.js 16 · React 19 · Tailwind CSS 4 · `@tailwindcss/typography` · Lucide icons

---

## 1. Design principles

| Principle | What it means in practice |
|-----------|---------------------------|
| **General engine, content-driven** | Portico is a general open-source docs engine, not one company's site. A site's branding, content and structure come from its content repo (`docs.json` and MDX); Portico supplies neutral defaults. Never hard-code a product name, colour, logo, link or page list in portal components. Mintlify-style home pages (`data-product-guide-index` markup) are supported through compatibility CSS in `home.css`. |
| **Readable first** | Long-form docs and API reference are the product. Typography, contrast, and spacing prioritize scanning and comprehension. |
| **One brand accent** | A single brand colour signals interactivity, active state, and links. It is a token (`--brand`), so a site's `docs.json` `colors` replace it everywhere. Never use it as a full-page wash. |
| **Calm surfaces** | One canvas colour, white (or deep green-black) cards on it, and 1px hairlines for structure. Depth comes from borders and soft shadows, not heavy chrome. |
| **Theme-aware tokens** | Components use CSS custom properties (`--ink`, `--surface`, `--brand`, …), not hard-coded colours. Every value has a light and a dark counterpart. |
| **Developer-native** | Monospace for paths, methods, labels and code; structured tables and JSON blocks for API content. |

---

## 2. Color system

### 2.1 Palette tokens

One palette, defined only in `src/app/globals.css` and keyed on `html[data-theme="light"|"dark"]`. The init script in `src/app/layout.tsx` (built by `src/lib/theme-tokens.ts`) only sets `data-theme` before paint; it does not write colours. `src/components/theme-toggle.tsx` changes the preference.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--canvas` | `#f8faf8` | `#0d1311` | Page background, header, sidebar, drawer |
| `--surface` | `#ffffff` | `#121a17` | Cards, popovers, inputs, steps counters |
| `--sunk` | `#eff3f0` | `#172019` | Inset areas: inline code, table headers, callouts, hover rows |
| `--ink` | `#12201a` | `#e6ede8` | Primary text |
| `--ink-2` | `#465750` | `#a3b3aa` | Secondary text |
| `--ink-3` | `#5f6f67` | `#86978e` | Labels, meta, mono captions |
| `--line` | `#e0e7e2` | `#1d2824` | Hairlines: header, sidebar, cards, tables |
| `--line-2` | `#cdd8d1` | `#2b3a33` | Stronger borders: controls, search field, popovers |
| `--brand` | `#059669` | `#34c28e` | Brand accent: rules, dots, focus, active indicators |
| `--brand-ink` | `#047857` | `#63d4a8` | Brand-coloured text: links, active nav, hover titles |
| `--btn` | `#047857` | `#2fb583` | Primary button background (hero actions) |
| `--on-btn` | `#ffffff` | `#04180f` | Text on `--btn` |
| `--btn-hover` | `color-mix(--btn 82%, #000)` | `color-mix(--btn 85%, #fff)` | Primary button hover |
| `--brand-soft` | `color-mix(--brand 9%, transparent)` | `10%` | Faint brand wash (hover, focus halo, icon tiles) |
| `--brand-line` | `color-mix(--brand 35%, transparent)` | `30%` | Link underline, blockquote rule, marker underline |
| `--glow` | `color-mix(--brand 13%, transparent)` | `8%` | Hero radial glow |
| `--cta-bg` / `--cta-fg` | `#12201a` / `#f8faf8` | `#e6ede8` / `#0d1311` | Header call-to-action and mobile bottom bar. Neutral ink, deliberately not brand-coloured |
| `--warn-bg` / `--warn-ink` / `--warn-line` | `#fdf5e3` / `#7a4b05` / `#f0dcae` | `#1d180d` / `#e4bb70` / `#3a2f14` | Warning and Danger callouts |
| `--info-bg` / `--info-ink` | `#e9f1fa` / `#244f7c` | `#101b27` / `#8fb8e3` | Reserved for info surfaces; the current callouts do not use them |
| `--code-bg` / `--code-ink` | `#f1f5f2` / `#22332b` | `#0a100e` / `#cfddd5` | Code block surface and default code colour |
| `--tok-key` / `--tok-str` / `--tok-num` | `#2a5d8c` / `#0b6b4c` / `#965a10` | `#8db7e0` / `#7fd1ae` / `#e0b878` | Syntax-token colours for non-Shiki code (Shiki supplies its own per theme) |
| `--shadow-1` / `--shadow-2` / `--shadow-pop` | soft green-black shadows | `none` / deeper black shadows | Card, raised card and popover elevation |
| `--doc-font-scale` | `1` (default) | `1` | Multiplier for `.doc-prose` text; see 3.3 |

**Usage in Tailwind:**

```html
<div class="bg-[var(--surface)] text-[var(--ink)] border-[var(--line)]">
```

Theme is applied via `data-theme="dark"` | `data-theme="light"` on `<html>`. The preference is **light**, **dark** or **system** (the default; follows `prefers-color-scheme`), persisted in `localStorage` key `doc-theme`. The `@custom-variant dark` rule makes Tailwind `dark:` utilities follow `data-theme`, not the OS setting.

#### 2.1a Legacy aliases

Older components still use the previous names. They are aliases of the palette in `:root` and must not be given their own values:

| Legacy token | Resolves to |
|--------------|-------------|
| `--background`, `--app-bg`, `--sidebar-bg` | `--canvas` |
| `--foreground`, `--text-main` | `--ink` |
| `--panel-bg` | `--surface` |
| `--panel-border` | `--line` |
| `--text-muted` | `--ink-2` |
| `--surface-muted` | `--sunk` |
| `--accent` | `--brand` |
| `--accent-strong` | `--brand-ink` |

Use the palette names in new code. `--panel-bg` and friends exist so API reference and other older UI keep rendering; they are not a second theme.

### 2.2 Brand accent and `docs.json` colors

The brand accent is a green by default, but it is only a default. `docs.json` (Mintlify format) can replace it:

```json
{ "colors": { "primary": "#4F46E5", "light": "#818CF8", "dark": "#4338CA" } }
```

`src/lib/site-theme.ts` turns this into a `<style>` block in the root layout, with higher specificity than the token blocks in `globals.css`. Only 3- or 6-digit hex values are accepted; anything else is ignored, so content cannot inject CSS. Nothing is emitted unless `primary` is a valid hex.

| `docs.json` key | Sets |
|-----------------|------|
| `primary` | `--brand` in light mode |
| `dark` | `--brand-ink` and `--btn` in light mode (Mintlify: `dark` is the light-mode button colour). If omitted, `--btn` is `primary` and `--brand-ink` is `color-mix(primary 72%, #000)` |
| `light` | `--brand`, `--brand-ink` and `--btn` in dark mode. If omitted, `primary` is used |

`--on-btn` is chosen automatically (near-black or white, by luminance of the button colour). `--btn-hover`, `--brand-soft`, `--brand-line`, `--glow` and the text selection tint are `color-mix` of `--brand`, so they follow without further config. `--cta-bg` is not affected: the header CTA stays neutral ink.

| Role | Token | Where |
|------|-------|-------|
| Primary action | `--btn` / `--on-btn` | Hero primary button (`.hm-btn-primary`) |
| Link and active text | `--brand-ink` | Prose links, current sidebar page, pager hover, TOC |
| Indicator | `--brand` | Tab underline, sidebar rule, TOC rule, focus ring, eyebrow dot |
| Wash | `--brand-soft`, `--brand-line` | Hover backgrounds, link underlines, blockquote rule |

Do not hard-code a green (`emerald-*`, `#059669`) in portal components; use the tokens so a re-branded site stays consistent.

### 2.3 HTTP method colors

Used in API sidebar (`ApiMethod`) and operation headers (`MethodBadge`). These are the one place fixed hues remain: they carry meaning, not brand, and ignore `docs.json` `colors`.

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

### 2.5 Navigation classes

The docs sidebar and drawer no longer use these; they use `SidebarNavGroup` (see 5.2). The classes remain for API reference and utility links.

| Class | Purpose |
|-------|---------|
| `.nav-item` / `.docs-nav-item` | Default link (primary text, brand wash on hover). Used by `GlobalNavAnchors` and the API sidebar |
| `.nav-item-muted` | Dense link (muted text, API operation list) |
| `.nav-active` / `.docs-nav-active` | Current item: brand wash and a 2px brand rule |
| `.toc-link` / `.toc-link-active` | Legacy TOC links (API reference). Doc pages use `.doc-toc-link` |
| `.ds-link` | Icon/text links with brand hover (right rail, downloads) |

### 2.6 Shared surface classes (docs + API)

Use these anywhere a component is not API-specific. API-only surfaces still use `.api-*`.

| Class | Purpose |
|-------|---------|
| `.ds-control` | Bordered control |
| `.ds-modal` | Modal / overlay panel (search dialog) |
| `.ds-kbd` | Keyboard shortcut chip (`Ctrl K`) |
| `.ds-section-label` | Uppercase section heading (Parameters, Responses, …) |
| `.ds-badge` | Soft pill badge (search section label, `yaml` tag) |
| `.ds-soft` | Subtle inset background |
| `.ds-inline-code` | Inline code outside prose |
| `.ds-tab` / `.ds-tab-active` / `.ds-tab-active-accent` | Segmented tabs (search, client libraries) |
| `.ds-hover-row` | List row hover (search results) |
| `.ds-empty-state` | Dashed placeholder panel |
| `.ds-status-code` | HTTP status code chip in response cards |
| `.ds-table` | Parameter / data tables |
| `.ds-accent-text` | Brand accent text (refs, schema types) |
| `.ds-shadow-panel` | Elevated panel shadow |
| `.ds-callout` + `-note` / `-info` / `-tip` / `-check` / `-warning` / `-danger` | MDX callouts; styled in `src/styles/doc.css` (see 9.2) |
| `.ds-steps` / `.ds-step` | MDX `<Steps>`; styled in `doc.css` |
| `.ds-card` | Stable hook on `<Card>` so prose link rules skip it; styling is `.hm-card` |
| `.pref-seg` / `.pref-seg-btn` | Segmented control used by theme and text-size settings |

**Unified shell:** docs and API reference share one header (`DocsHeader`), the same tokens and the same drawer. The docs sidebar is a tree; the API sidebar is its own list.

**No zinc overrides:** components use `data-theme` tokens and `ds-*` / `api-*` classes — not Tailwind `zinc-*` utilities or legacy `dark:` zinc patches.

### 2.7 Accessibility & i18n

| Concern | Implementation |
|---------|----------------|
| Skip link | `.skip-link` → `#main-content` |
| Focus | `:focus-visible` brand ring on interactive elements; in light theme the ring uses `--brand-ink` with a white halo for contrast |
| Dialogs | `useDialog()` — trap, Escape, focus restore, scroll lock |
| Motion | `@media (prefers-reduced-motion: reduce)` in `globals.css` and `doc.css` / `home.css` |
| UI i18n | `I18nProvider` + `useI18n()` + `src/lib/i18n/messages/{en,es,fr,ja}.ts` |
| Content i18n | Not in portal — author localized MDX in your content repo |

Add new UI strings to **all four** message files, then use `t("dotted.key")` in client components.

---

## 3. Typography

### 3.1 Font families

Loaded once with `next/font/google` in `src/app/layout.tsx`, exposed as CSS variables:

| Role | Family | Variable | Notes |
|------|--------|----------|-------|
| Body / UI | Instrument Sans | `--font-body` (from `--font-instrument-sans`) | Tailwind `font-sans` |
| Headings | Bricolage Grotesque (optical-size axis) | `--font-heading` (from `--font-bricolage`) | Page titles, section and card titles, wordmark; Tailwind `font-display` |
| Mono | JetBrains Mono 400 / 500 | `--font-code` (from `--font-jetbrains-mono`) | Paths, methods, kbd, code, breadcrumbs, mono labels; Tailwind `font-mono` |
| Fallbacks | `system-ui`, `-apple-system`, `Segoe UI`, `sans-serif` (mono: `ui-monospace`, `Cascadia Mono`, `Consolas`) | | Used until the web font loads or if it fails |

**`docs.json` `fonts`** replace the body and heading fonts for one site (mono is fixed):

```json
{ "fonts": { "heading": { "family": "Playfair Display" }, "body": { "family": "Inter" } } }
```

- A single `{ "family": "Inter" }` applies to both; `heading` and `body` set them separately. Optional `weight`, `source` and `format` (`woff` or `woff2`).
- With no `source`, the family is loaded from Google Fonts (`wght@400;500;600;700`, `display=swap`) through a `<link>` in the root layout.
- With a `source` (an `https://` URL), a `@font-face` is emitted with `font-display: swap` and no Google request.
- Family names must match `^[\w][\w \-]{0,60}$`; anything else is ignored. The result overrides `--font-heading` / `--font-body` with the system fallback stack appended.

### 3.2 Type scale

| Element | Size / weight | Where |
|---------|---------------|-------|
| Home hero title | Heading, 66px / 600, `-0.04em`, line-height 1; 56px under a 1180px hero, 40px under 640px | `.hm-title` |
| Hero lead | 18px (16px under 640px), `--ink-2` | `.hm-lead` |
| Home section title | Heading, 26px / 600 (22px under 640px) | `.hm-sec-title` |
| Eyebrow / breadcrumb | Mono, 11.5px, uppercase, `0.04em`–`0.09em` tracking, `--ink-3` | `.hm-eyebrow`, `.hm-sec-eyebrow`, `.doc-crumbs` |
| Page title | Heading, 46px / 600, `-0.038em`, line-height 1.04; 34px under 640px | `.doc-title` |
| Page description | 18px / 1.6 (16.5px under 640px), `--ink-2` | `.doc-desc` |
| Prose body | 16.5px (16px under 640px) × `--doc-font-scale`, line-height 1.72 | `.doc-prose` |
| Prose H2 / H3 / H4 | Heading, 27 / 20 / 17px × scale (23 / 19px under 640px for H2 / H3) | `.doc-prose` |
| Card title | Heading, 18px / 600 | `.hm-card-title` |
| Card description | 14px / 1.55, `--ink-2` | `.hm-card-desc` |
| Band title / pager title | Heading, 17px / 600 | `.hm-band-title`, `.doc-pager-card b` |
| Header tabs | `text-sm` (14px) / 500 | `MainNavTabs` |
| Sidebar group and page | 13.5px; groups 600, pages 400 (current 600) | `SidebarNavGroup` |
| Sidebar page count | Mono, 10.5px, `--ink-3` | `SidebarNavGroup` |
| On this page | 13px links; mono 10.5px label | `.doc-toc-link`, `.doc-toc-label` |
| Inline code | `0.84em` mono | `.doc-prose` |
| Code blocks | Mono, 13px × scale, line-height 1.7 | `.doc-prose pre` |
| Code / table / pager labels | Mono, 10.5px, uppercase, `0.06em`–`0.08em` tracking | `.code-label`, `th`, `.doc-pager-card small` |
| API section label | `text-sm font-bold uppercase tracking-wide` | Parameters, Responses, etc. |

The legacy variables `--font-size-toolbar-item`, `--font-size-sidebar-label`, `--line-height-sidebar-label`, `--font-size-sidebar-item` and `--line-height-sidebar-item` still exist in `globals.css` for `.toolbar-nav-item`, `.docs-nav-label` and `.docs-nav-row` (used by utility links and the API sidebar).

### 3.3 Font scaling

`FontScaleControls` sets `--doc-font-scale` to one of `0.9 | 1 | 1.1 | 1.2` (applied to `<html>` before paint by the init script). It scales article text only: `.doc-prose` body, H2–H4 and code blocks, for example:

```css
font-size: calc(16.5px * var(--doc-font-scale));
```

Page titles, descriptions, the shell and the home page do not scale. Persisted in `localStorage` key `doc-font-scale`. The control is a segmented group inside **Display settings** (desktop) and in the drawer footer (mobile).

### 3.4 Prose theming

`.prose` colours (`--tw-prose-*`) are mapped to the palette tokens in `src/styles/doc.css`, so they follow the theme and the site's brand colours. `globals.css` still sets some `!important` text colours on `.doc-prose`; rules that fight them use a leading `html` / `html[data-theme]` for higher specificity (see the cascade note at the top of `doc.css`). Colours in `doc.css` and `home.css` are tokens only.

---

## 4. Layout & spacing

### 4.1 Shell structure (docs / guides / changelog)

```
┌──────────────────────────────────────────────────────────────┐
│ Header: sticky, full width, 56px (58px from 640px)           │
├────────────┬───────────────────────────────┬─────────────────┤
│ Sidebar    │ Main                          │                 │
│ 260px      │ px-5 → px-6 → px-12           │  Right TOC      │
│ (268 from  │ article max 44rem             │  (from 1180px)  │
│ 1180px)    │                               │                 │
│ sticky     │                               │                 │
└────────────┴───────────────────────────────┴─────────────────┘
          Under 820px: no sidebar; a "Group · Page" bar floats at the bottom
```

| Region | Key classes |
|--------|-------------|
| App wrapper | `bg-[var(--canvas)] text-[var(--ink)]` |
| Header | `sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--canvas)]`; inner row `h-14`, `min-[640px]:h-[58px]`, padding `pl-4 pr-2.5` → `px-5` |
| Grid | `grid-cols-1`; `min-[820px]:grid-cols-[260px_minmax(0,1fr)]`; `min-[1180px]:grid-cols-[268px_minmax(0,1fr)]` |
| Sidebar | `sticky top-[58px] h-[calc(100vh-58px)] overflow-y-auto border-r border-[var(--line)]`, `hidden` until 820px |
| Main | `px-5 pt-[22px]` → `px-6 pt-7` (640px) → `px-12 pt-9` (820px); `pb-12` |
| Article column | `.doc-article`, `max-width: 44rem` |
| Bottom bar | `sticky bottom-3`, 48px, hidden from 820px |

Everything sits on one `--canvas`; structure comes from 1px `--line` hairlines (header bottom edge, sidebar right edge). Cards and popovers use `--surface`.

### 4.2 API reference layout

| Region | Width | Breakpoint |
|--------|-------|------------|
| Header | Same `DocsHeader` as docs | — |
| API sidebar | `280px`, fixed | `lg:flex` (1024px) |
| Main content | `bg-[var(--canvas)] lg:ml-[280px]` | `lg` |
| Right rail (server, samples) | `380px` | `xl:block` (1280px) |
| Content max width | `max-w-[1520px]` | — |

Below `lg` the hamburger in the header opens the API navigation drawer (`ApiMobileNav`) instead of the docs bottom bar.

### 4.3 Prose page grid

`ProsePageLayout` adds a right column from 1180px:

- Grid: `minmax(0, 1fr)` and a `208px` TOC column, pulled out of main's right padding with `-mr-12`; the article column keeps a `pr-12` gutter.
- TOC column (`.doc-toc-col`): `sticky top-4rem`, starts at the header's bottom edge, scrolls independently.
- Below 1180px there is no column; an inline "On this page" disclosure sits under the description (see 5.7).
- Chrome-less pages (the marketing home) skip the breadcrumb, title, TOC and edit row and use `mx-auto w-full max-w-6xl`.

### 4.4 Breakpoints

The docs shell uses arbitrary `min-[…]` values rather than the Tailwind defaults:

| Width | Applies to | What changes |
|-------|-----------|--------------|
| `640px` | Viewport | Header tabs, primary CTA and Display settings appear; the hamburger goes away (the drawer is reached from the bottom bar up to 820px). Header 56 → 58px; main padding 20 → 24px; prose 16 → 16.5px; page title 34 → 46px; unwrapped tables stop stacking; pager two columns; "Copy link" shows its label |
| `820px` | Viewport | Sidebar (260px) appears; bottom bar and drawer retire; main padding 48px; heading hash anchors show; drawer auto-closes when resized past it |
| `960px` | Hero container | `HeroAside` appears; hero becomes two columns |
| `1000px` | Card container | `cols={4}` card grids go four across (3-up from 760px, 2-up from 640px) |
| `1180px` | Viewport | Right TOC rail replaces the inline TOC; sidebar widens to 268px; the hero title steps from 56 to 66px (measured on the hero width) |

Home blocks (`hm-hero`, `hm-sec`, `hm-cg`, `hm-tasks`) use CSS container queries, so their 640 / 760 / 960 / 1000px thresholds follow the content column, not the window. Task rows go two columns from 640px of container width.

Tailwind's `lg` (1024px) and `xl` (1280px) remain in use for the header search field (a 230px field from `lg`, an icon button below) and the API reference layout.

### 4.5 Radii & elevation

| Pattern | Value |
|---------|-------|
| Ghost buttons, copy button, tabs | `8px` |
| Header controls, CTA, hamburger | `10px` |
| Hero buttons, drawer CTA | `12px` |
| Inline TOC, images, sidebar toggle | `12px` / `8px` |
| Callouts, tables, code blocks | `14px` |
| Pager cards, display-settings popover, bottom bar | `16px` |
| Home cards, band, search card | `18px` |
| Inline code | `6px` |
| Cards at rest | `--shadow-1`; hovered card `--shadow-2`; popovers and bottom bar `--shadow-pop` |

---

## 5. Components

### 5.1 Buttons

**Header call-to-action (`NavbarPrimaryCta`)** — neutral ink, not brand-coloured:

```
inline-flex h-[34px] items-center gap-1.5 rounded-[10px] bg-[var(--cta-bg)] px-3.5 text-[13px] font-semibold text-[var(--cta-fg)] hover:opacity-90
```

**Hero primary / ghost (home)** — `.hm-btn` is 46px high, `12px` radius, 15px / 600:

- `.hm-btn-primary`: `--btn` background, `--on-btn` text, arrow icon that nudges on hover.
- `.hm-btn-ghost`: `--surface` background, `--line-2` border.
- `.hm-btn-sm`: compact variant (used in `Band`).

**Icon control (header)**

```
inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--ink-2)] hover:bg-[var(--sunk)] hover:text-[var(--ink)]
```

The hamburger is the same at `h-11 w-11` (44px touch target).

**Quiet text button (`.doc-ghost-btn`)** — "Copy link" in the breadcrumb row: 30px high, `8px` radius, `--ink-3` text, `--sunk` on hover.

**Segmented control (`.pref-seg`)** — theme (Light / Dark / System) and text size.

**API control (copy, etc.)**

```
api-control inline-flex min-h-11 items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium
```

### 5.2 Header, sidebar and drawer

**Header (`DocsHeader`, `docs-shell.tsx`)** — one full-width row, left to right:

1. **Brand** (`DocsBrand`) — the `docs.json` `logo` (a string or `{ light, dark }`, paths relative to the content root) plus a small `DOCS` badge; without a logo, the site name in the heading font (17px / 700) plus the badge. Logos are inlined as data URIs (SVG, PNG, or WebP, at most 200 KB each) and swapped per theme with `.site-logo-light` / `.site-logo-dark`.
2. **Tabs** (`MainNavTabs`, from 640px) — *Documentation* and *API reference* as full-height links; the active one has a 2px `--brand` underline. With several OpenAPI specs, API reference opens a menu; with one it links straight to it.
3. **Search** (`SearchControl`) — an icon button below 1024px, a 230px field with a `Ctrl K` hint from `lg`.
4. **Primary CTA** (`NavbarPrimaryCta`, from 640px) — from `docs.json` `navbar.primary`; external links show an arrow and open in a new tab.
5. **Display settings** (`DisplaySettings`, from 640px) — a `SlidersHorizontal` icon button opening a 304px popover (`rounded-2xl`, `--shadow-pop`) with theme, text size, language and, under a rule, the `docs.json` `navbar.links`. Closes on outside click or Escape and returns focus to the trigger.
6. **Hamburger** (`MobileNavButton`, under 640px) — opens the drawer.

Under 640px the tabs, CTA and Display settings move into the drawer. The old *Help* and *Home* utility links are gone (Help emailed AgentRuntime, which does not belong in a general engine); every other link comes from `docs.json` (`navbar.links`, `navbar.primary`, and navigation `anchors`). The brand already links home.

**Sidebar (`DocsSidebar`, from 820px)** — a sticky, independently scrolling tree on `--canvas` with a right hairline. Top to bottom: global anchors (`GlobalNavAnchors`, from `docs.json` `anchors`, `/` filtered out), the groups, and the Portico attribution. On load it scrolls so the current page is visible.

**Group (`SidebarNavGroup`)** — a toggle row (label 13.5px / 600, a mono page count, a chevron that rotates when open) over a tree-lined list: a `1px --line` guide on the left. The current page gets a `2px --brand` rule on the guide, `--brand-ink` text and weight 600, instead of a filled row. Other pages are `--ink-2`, `--ink` on hover. The group that holds the current page is always open (its toggle is disabled); others follow `defaultExpanded` from `docs.json`.

**Drawer (`MobileNavButton`)** — a left slide-over, `w-[min(20rem,100vw)]` on `--canvas`, 300ms ease, with a `bg-black/45` fading backdrop. It stays mounted off-canvas, is `inert` while closed, and closes itself when the viewport passes 820px (1024px for API reference). Contents:

- 54px header: logo or site name, `Docs` label, close button.
- Scrolling body, auto-positioned so the current group header sits near the top: a *Documentation / API reference* switch (when API specs exist), a search trigger, the groups (`variant="drawer"`, 44px rows), global anchors, `navbar.links` and attribution.
- Footer (hairline above): a preferences row (segmented icon-only theme, text size, language) and the full-width primary CTA (44px, `--cta-bg`). On short viewports (under 500px high) the footer collapses to one row.

**Mobile bottom bar (`MobileLocationBar`, under 820px)** — a floating 48px pill, `sticky bottom-3`, on `--cta-bg` with `--shadow-pop`, showing `Group · Page` for the current page (hidden if the page is not in the nav) and a menu button. Tapping the button dispatches `OPEN_NAV_EVENT` to open the drawer.

### 5.3 Search

- Header trigger: see 5.2. In the drawer, `DrawerSearchTrigger` closes the drawer then opens the dialog.
- Home hero: `HeroSearchTrigger` draws a search *card* (62px row, `18px` radius) that opens the same dialog, with optional "Try" chips that open it prefilled.
- Dialog: `search-dialog`, `max-w-lg`, `bg-black/50` overlay. Suggested pages when empty, loading and no-results states, hits highlighted with `.search-mark`; no reserved empty-panel height.

### 5.4 Cards

**Home cards (`Card`)** — `.hm-card`: `--surface`, `1px --line`, `18px` radius, 20px padding, `--shadow-1`. An optional icon tile (`.hm-tile`, brand-soft square) sits above a 18px heading-font title and a 14px `--ink-2` description. Linked cards show an `ArrowUpRight` that nudges on hover and lift 2px with `--shadow-2`. See 9.1.

**API card**

```
api-card overflow-hidden rounded-lg border
```

Header row: `api-card-header border-b px-4 py-2 text-sm font-semibold`

### 5.5 Code blocks (Shiki)

Markdown and MDX fences are highlighted at build time via **Shiki** + `rehype-pretty-code` (`src/lib/rehype-pipeline.ts`).

| Context | Treatment |
|---------|-----------|
| Fenced code | `<figure data-rehype-pretty-code-figure>`: `14px` radius, `1px --line`, `--code-bg`, clipped |
| Header row | `.code-head` (40px): the file title, or the language in mono caps, on the left; language tag and `CodeCopyButton` ("Copy") on the right |
| Body | `pre` 16/18px padding, JetBrains Mono 13px × scale, line-height 1.7, `--code-ink`, horizontal scroll |
| Theme switch | Shiki spans carry `--shiki-light` / `--shiki-dark`; `html[data-theme]` selects one for **every** highlighted block |
| CodeGroup | One shared shell; tab strip (`.doc-tab`, 40px, 2px `--brand` underline on the active tab) replaces the header |
| Markdown inline | `0.84em` mono on `--sunk`, `1px --line` border, `6px` radius, `--ink` |
| API JSON / curl | `.api-code` with optional copy header bar |
| Schema refs | `.ds-accent-text` mono |

### 5.5a Mermaid diagrams

` ```mermaid ` fences become `<div data-mermaid="…">` in the rehype pipeline; `MermaidDiagram` hydrates on the client.

- Container: `.mermaid-diagram` — bordered panel, rendered at natural size with horizontal scroll and an expand dialog
- Theme: re-renders when `html[data-theme]` changes (`MutationObserver`)
- Errors: `.ds-callout-warning` with message text

### 5.5b MDX layout components (`mdx-layout.tsx`, `mdx-steps.tsx`)

| Component | Purpose |
|-----------|---------|
| `<Tabs>` / `<Tab title="…">` | Tabbed prose or code (`.doc-tabs`, shares `.doc-tab` with CodeGroup) |
| `<CodeGroup>` | Alias for tabbed code blocks |
| `<Accordion>` / `<AccordionGroup>` | Collapsible FAQ-style sections |
| `<Frame caption="…">` | Screenshot / media with optional caption (`.ds-frame`) |
| `<Expandable>` | Alias for a single accordion |
| `<Steps>` / `<Step title="…">` | Numbered procedure: 30px counter circles joined by a 1px connector, bold run-in title |
| `<Note>`, `<Info>`, `<Tip>`, `<Check>`, `<Warning>`, `<Danger>` | Callouts (see 9.2) |

The home components (`HomePage`, `Hero`, `Section`, `Card`, `CardGroup`, `Band`, `TaskList`, `Task`) are in 9.1.

### 5.5c Page actions

`PageCrumbs` (`page-actions.tsx`) is the breadcrumb row above the title: `Group › Page` in mono caps (11.5px, `--ink-3`), the group from the `docs.json` navigation and the page as `aria-current="page"`, with the **Copy link** ghost button (`CopyPageButton`) right-aligned. Long trails truncate with an ellipsis; under 640px the button shows only its icon.

**Edit this page** moved to the footer, below the pager (see 5.5d). It shows when `githubEditBase` is set — derived from `CONTENT_GIT_REPO` + `CONTENT_GIT_BRANCH`, or overridden in `site.yaml`.

- Edit URL: `githubEditBase` + `i18n/{locale}/path.mdx` via `githubEditUrl()` in `src/lib/edit-url.ts`
- Rendered by `ProsePageLayout`; not shown on chrome-less home pages

### 5.5d Page navigation (pager)

`DocPager` — previous / next cards followed by the edit row, at the bottom of the article.

- Two cards (`.doc-pager-card`): `--surface`, `1px --line`, `16px` radius, a mono caps "Previous" / "Next" label with an arrow, and the page title in the heading font (17px). The next card is right-aligned. Hover: border strengthens, the card lifts 1px and the title turns `--brand-ink`. One column under 640px.
- Edit row (`.doc-edit-row`): a hairline above, the **Edit this page** link on the left and a muted `owner/repo` label on the right.
- Docs: order follows the flattened `docs.json` sidebar (`src/lib/pager.ts`)
- API reference: tag indexes page through tags; operation pages page through endpoints (`src/lib/api-pager.ts`)

### 5.6 Tables

Markdown tables arrive wrapped in `.doc-table-wrap` (see 9.2). API parameter tables:

```
thead: border-b border-[var(--line)]
rows: border-b border-[var(--line)]
required: red asterisk text-red-600
```

### 5.7 On this page (TOC)

- From 1180px: the right rail (`.doc-toc-col`, `OnThisPage`) — a mono caps "On this page" label with a `List` icon, then links on a `1px --line` guide. The active link has a `2px --brand` rule, `--ink` text and weight 600. H3 links indent to 28px. Scroll spy via `IntersectionObserver`.
- Under 1180px: `MobileTableOfContents`, a `details` disclosure (`.doc-toc-m`: `--surface`, `12px` radius) under the description listing the same links.

### 5.8 Mobile navigation

Covered in 5.2 (drawer and bottom bar). API reference uses `ApiMobileNav` below `lg`, with the same visual language.

### 5.9 Assistant panel

`AssistantLauncher` (`site-controls.tsx`) is not currently mounted in the header. If it returns, use palette tokens (`--brand`, `--surface`, `--line`) rather than emerald utilities; the panel is fixed `bottom-4 right-4 top-20`, max width `min(420px, calc(100vw - 2rem))`.

---

## 6. Icons

**Library:** [Lucide React](https://lucide.dev) (`lucide-react`)

| Context | Icon | Size |
|---------|------|------|
| Nav groups | Named in `docs.json` (`src/lib/nav-icons.ts`) | `h-4 w-4` |
| Header settings | `SlidersHorizontal` | `h-[18px] w-[18px]` |
| Menu / close | `Menu` / `X` | `h-[18px] w-[18px]` |
| Sidebar group | `ChevronRight` (rotates open) | `h-3.5 w-3.5` |
| Theme | `Sun` / `Moon` / `Monitor` | segmented control |
| Search | `Search` | `h-[18px] w-[18px]` |
| External link | `ArrowUpRight` | `h-3.5 w-3.5` |
| Card / row / hero actions | `ArrowUpRight` / `ArrowRight` | `1.05em` |
| TOC | `List`, `ChevronDown` | `h-3.5 w-3.5` |
| Copy | `Copy` / `Check` | `14px` |
| Edit | `SquarePen` | `14px` |
| Callouts | `StickyNote`, `Info`, `Lightbulb`, `CircleCheckBig`, `AlertTriangle`, `OctagonAlert` | `13px` in a 24px circle |
| Home tiles | Any name from `mdx-cards.tsx` (`icon="rocket"`) | tile glyph |

Default icon stroke size matches Lucide defaults at these bounding boxes.

### 6.1 Brand

Portico's logo is the AgentRuntime "A" with an open green door in place of AgentRuntime's triangle. Assets live in `public/brand/`.

| Asset | Use |
|-------|-----|
| `portico-mark-light.svg` / `portico-mark-dark.svg` | Mark alone |
| `portico-logo-light.svg` / `portico-logo-dark.svg` | Horizontal: mark + "Portico" |
| `portico-logo-stacked-light.svg` / `portico-logo-stacked-dark.svg` | Stacked: mark, "Portico", and "BY AGENTRUNTIME" |
| `portico-icon.svg` | 32×32 favicon source; follows `prefers-color-scheme` |

| Colour | Light | Dark |
|--------|-------|------|
| Ink | `#171715` | `#F5F5F2` |
| Door | `#0F8A5F` | `#34D399` |

**Geometry**

- The A is copied exactly from AgentRuntime's mark. Do not redraw or re-proportion it.
- The door replaces the triangle. Its top and bottom edges sit at 29°, square to the A's legs.
- Its near edge dips below the legs, the way AgentRuntime's triangle does.

**Type**

- Horizontal logo: Inter 720 at -0.04em tracking, drawn as outlines and laid out like the AgentRuntime wordmark.
- Tagline ("BY AGENTRUNTIME"): Inter 600, 9px, 0.16em tracking.

**Usage**

- Horizontal logo for headers.
- Stacked logo for the README and social images.
- Mark for the favicon (`src/app/favicon.ico` holds 16, 32 and 48 px) and the attribution line (`PorticoAttribution`, via `.site-logo-light` / `.site-logo-dark`).
- Use the light assets on light backgrounds and the dark assets on dark backgrounds.

The docs header (`DocsBrand`) shows the *content's* `docs.json` logo, not Portico's. The Portico logo identifies the portal itself and does not replace a site's own branding.

---

## 7. Motion & interaction

| Pattern | Implementation |
|---------|----------------|
| Color transitions | `transition-colors` on nav links, tabs and ghost buttons (120–150ms) |
| Chevron expand | Sidebar group chevron rotates 90° in 150ms |
| Card hover | Linked home cards lift 2px and gain `--shadow-2`; the corner arrow nudges up-right. Pager cards lift 1px |
| Drawer | Slides in over 300ms with a fading backdrop (`cubic-bezier(0.22, 1, 0.36, 1)`) |
| Hover (nav) | Colour change only, no scale |
| Focus | `:focus-visible` brand outline (2px, 2px offset) on every control; the search dialog's inputs draw their own ring |
| Modals | Open/close without animation (instant) |
| Reduced motion | `prefers-reduced-motion: reduce` removes transforms and transitions |

Keep motion minimal; this is a documentation surface, not a marketing site.

---

## 8. Accessibility

| Requirement | Current pattern |
|-------------|-----------------|
| Icon-only buttons | `aria-label` on settings, search, hamburger, drawer close, bottom-bar menu, copy |
| Language select | `aria-label="Documentation language"` |
| Font scale | `aria-label` on group and each size button |
| Segmented controls | `role="radio"` / `aria-checked`; the popover focuses the checked option on open |
| Landmarks | `<header>`, `<main>`, `<nav>` with `aria-label` (sidebar, breadcrumb, page navigation, site links), `<aside>` |
| Current page | `aria-current="page"` on the sidebar link and breadcrumb; `aria-current` on the active TOC link |
| Keyboard | `Ctrl/Cmd+K` search, `Escape` closes dialogs and the settings popover |
| Language | `document.documentElement.lang` from selector |
| Heading anchors | `.anchor-heading-link` — a hover `#` marker (hidden under 820px), no underline |

Header controls are 36px from 640px and the hamburger, drawer rows and drawer CTA are 44px on touch layouts. Compact exceptions: the drawer preferences row and inline prose links. In light theme the focus ring uses `--brand-ink`, not `--brand`.

---

## 9. Page patterns

### 9.1 Home page (`/`)

The home page renders chrome-less inside `DocsShell`: no breadcrumb, title, TOC or edit row; the authored MDX supplies the title. Author it with the home components in `src/components/mdx-home.tsx` and `mdx-cards.tsx`. They own all layout and styling (`src/styles/home.css`) because content repos are not scanned by Tailwind; MDX only passes text, links and icon names. Every component accepts an optional `locale` (default English) used to localise `href`s.

**`HomePage`** wraps the page (renders `<div data-product-guide-index class="docs-home">`); sections own their spacing.

**`Hero`** — eyebrow, title, lead, search card, actions, optional right-hand column.

| Prop | Type | Notes |
|------|------|-------|
| `title` | string | Required |
| `eyebrow` | string | Mono caps line with a brand dot |
| `highlight` | string | Substring of `title` drawn with a brand marker underline |
| `description` | string | Lead paragraph |
| `search` | boolean | Search card; default `true`, `false` hides it |
| `suggestions` | string[] | "Try" chips under the search card; each opens search prefilled |
| children | `HeroAction`s and one `HeroAside` | Non-aside children form the action row |

- **`HeroAction`** — `href`, `primary` (filled `--btn` button with an arrow; otherwise a ghost button), children as the label.
- **`HeroAside`** — `decoration` (draws faint arch lines behind the content), children: any MDX (a code block, an image, a `Card`). Shown from a 960px-wide hero, hidden below.

**`Section`** — a titled block with spacing and a heading anchor.

| Prop | Type | Notes |
|------|------|-------|
| `title` | string | Required; slugified into the heading id unless `id` is set |
| `id` | string | Anchor id |
| `eyebrow` | string | Mono caps line above the title |
| `description` | string | Paragraph under the heading |
| `href` + `linkLabel` | string | Both needed to show a link on the right of the heading |

**`CardGroup`** — `cols` of `1`, `2` (default), `3` or `4`. Collapses by container width: one column under 640px, three-up from 760px, four-up from 1000px; a lone last card in a two-column group spans the row.

**`Card`** — `title`, `icon` (a Lucide name such as `rocket`, `book-open`, `plug`; unknown names render no tile), `href` (makes the card a link with an `ArrowUpRight`), children as the description.

**`Band`** — a tinted strip for a single call-out: `title`, `icon`, `href` + `cta` (a small ghost button), children as the text.

**`TaskList`** / **`Task`** — divider-ruled rows for common tasks, one column and two from 640px of container width. `Task`: `title`, `icon`, `href` (shows a hover arrow), children as the description.

````mdx
<HomePage>
  <Hero
    eyebrow="Product documentation"
    title="Build with confidence."
    highlight="confidence."
    description="Guides, concepts and a full API reference."
    suggestions={["Authentication", "Webhooks", "Rate limits"]}
  >
    <HeroAction href="/quickstart" primary>Quickstart</HeroAction>
    <HeroAction href="/concepts/overview">How it works</HeroAction>

    <HeroAside decoration>
```json
{ "status": "ok" }
```
    </HeroAside>
  </Hero>

  <Section id="start-here" title="Start here" href="/quickstart" linkLabel="All guides">
    <CardGroup cols={3}>
      <Card title="Quickstart" icon="rocket" href="/quickstart">Make your first request in five minutes.</Card>
      <Card title="Concepts" icon="layers" href="/concepts/overview">The model behind the product.</Card>
      <Card title="API reference" icon="plug" href="/reference">Every endpoint, with examples.</Card>
    </CardGroup>
    <Band title="Browse the guides" icon="book-open" href="/guides" cta="Open guides">
      End-to-end recipes for common integrations.
    </Band>
  </Section>

  <Section id="common-tasks" title="Common tasks">
    <TaskList>
      <Task title="Create an API key" icon="key-round" href="/keys">Generate and rotate credentials.</Task>
      <Task title="Verify a webhook" icon="webhook" href="/webhooks">Check signatures on incoming events.</Task>
    </TaskList>
  </Section>
</HomePage>
````

**Mintlify-style home pages** (`<div data-product-guide-index>` with Tailwind utility classes such as `text-gray-600`, `bg-gray-50`, `font-serif`, `grid sm:grid-cols-2`, and bare `border` cards) still render. `home.css` carries a compatibility block that maps those utilities onto Portico tokens: h1 and h2 sizing in the heading font, muted text, card grids, and `rounded-2xl` link cards with the same surface, border, hover lift and muted description as `Card`. A migrated site needs no content changes; new sites should use the components above.

### 9.2 Doc page (`/docs`, `/guides`, `/changelog`)

`DocsShell` + `ProsePageLayout`, top to bottom:

1. **Breadcrumb row** — `Group › Page` in mono caps with **Copy link** on the right (5.5c).
2. **Title** — `.doc-title`, heading font, 46px (34px under 640px), balanced wrapping.
3. **Description** — `.doc-desc`, 18px, `--ink-2`. Optional.
4. **Inline TOC** — the `details` disclosure, under 1180px only (5.7).
5. **Prose** — `MarkdownBody` / `DocProse`, `.doc-prose.prose`, 28px below the header.
6. **Pager and edit row** — previous / next cards, then the edit link (5.5d).
7. **Right TOC** — from 1180px, in its own column (4.3).

**Prose** — 16.5px × scale, line-height 1.72, `--ink-2` body copy on `--ink` strong text. H2–H4 use the heading font with tight tracking, a hover `#` anchor in `--brand-ink`, and `scroll-margin` for the sticky header. Links are `--brand-ink`, underlined with `--brand-line` (1.5px, 3px offset). Lists have `--ink-3` markers (mono numerals for ordered lists). Blockquotes have a 3px `--brand-line` rule, no italics. Images get a hairline border and `12px` radius. `hr` is a `--line` rule.

**Callouts** — `<Note>`, `<Info>`, `<Tip>`, `<Check>`, `<Warning>`, `<Danger>` render `.ds-callout`: `14px` radius, 14/16px padding, a `1px` border, a 24px circular icon beside a bold title and the content.

| Kind | Surface | Icon |
|------|---------|------|
| Note, Info, Tip, Check | `--sunk`, `--line` border, `--ink` text; the icon is `--brand-ink` | `StickyNote`, `Info`, `Lightbulb`, `CircleCheckBig` |
| Warning, Danger | `--warn-bg`, `--warn-line`, `--warn-ink` | `AlertTriangle`, `OctagonAlert` |

The title is the localised kind name (`callout.*` message keys). The client `mdx-callouts.tsx` exports only Note, Warning and Info; the server `mdx-callouts-server.tsx` provides all six.

**Tables** — markdown tables are wrapped in `.doc-table-wrap`: a `14px`-radius `--surface` card with a hairline border and horizontal scroll, `min-width: 560px`, 13px/16px cell padding, a `--sunk` header row in mono caps (10.5px, `--ink-3`), row rules in `--line`, the first column in `--ink`, and a hover tint. Tables not wrapped (inside custom components) fall back to stacked rows under 640px.

**Code blocks** — 5.5: a hairline-bordered figure on `--code-bg` with a 40px header (title or language, copy button), JetBrains Mono at 13px, and Shiki dual-theme colours.

**Steps** — `<Steps>` / `<Step title="…">`: a 30px mono counter circle (`--surface`, `--line-2` border) per step joined by a 1px `--line-2` connector; the bold `--ink` title runs into the first paragraph, and the body is `--ink-2` at 0.96em.

**Pager and edit row** — two hairline cards; below them a rule, the edit link and the muted `owner/repo` label.

**TOC** — right rail with a 2px brand rule on the current heading from 1180px; inline disclosure below.

Prose utility highlights:

- The page title comes from the layout, not markdown H1 (`prose-h1:hidden`); chrome-less pages keep their authored `<h1>`.
- `prose-headings:scroll-mt-24` offsets for the sticky header.

### 9.3 API reference (`/reference`)

`ApiReferenceShell` uses concise tag indexes at `/reference/[specId]/[tagSlug]` and dedicated operation pages at `/reference/[specId]/[tagSlug]/[operationSlug]`. Each operation page contains:

1. Method badge + path
2. Summary / description
3. Sample request (curl)
4. Parameters table
5. Request body (schema + example)
6. Responses (per status code cards)

Right rail: server URL, auth token field, test request, then language samples. Below `xl`, the same tester appears immediately after the operation heading.

---

## 10. Content & markdown conventions

Rendered through `MarkdownBody` with:

- `remark-gfm` (tables, task lists, strikethrough)
- `rehype-slug` + `rehype-autolink-headings` (anchor links use `.anchor-heading-link`; `## Heading {#custom-id}` sets an explicit id)
- `rehype-sanitize` for safe HTML

Content decides branding and structure: `docs.json` supplies `name`, `logo`, `colors`, `fonts`, `navigation`, `anchors` and `navbar`; MDX supplies the pages. Do not encode either in portal source.

---

## 11. Do / don't

**Do**

- Use palette tokens (`--canvas`, `--surface`, `--sunk`, `--ink*`, `--line*`, `--brand*`) for surfaces, text and borders in shell components.
- Use `--brand` / `--brand-ink` / `--btn` for accent, so `docs.json` `colors` take effect.
- Use `.api-*` classes inside API reference UI.
- Use the home components for home pages and `.doc-prose` / `.ds-*` styling for article content.
- Let content repos own branding: logo, colours, fonts, links and page structure come from `docs.json` and MDX.
- Keep touch targets at 44px on touch layouts (hamburger, drawer rows) and 36px for desktop header controls.
- Test both `data-theme="light"` and `data-theme="dark"`, and at 360, 640, 820, 1180px and wider.

**Don't**

- Hard-code a brand colour (`emerald-*`, `#059669`), a product name, a logo or a vendor link in portal components.
- Reintroduce Help or Home utility links; links come from `docs.json`.
- Introduce new accent colours without strong justification.
- Hard-code `#080b0a` / zinc-950 in new docs components — use tokens.
- Define a theme colour outside `globals.css`; the legacy names (`--panel-bg`, …) are aliases, not a second palette.
- Use Scalar/Redoc-style third-party API chrome; keep first-party patterns.
- Rely on `prefers-color-scheme` alone — explicit `data-theme` wins.
- Add Tailwind utilities to content-facing components expecting them to work in content repos: only Portico's own source is scanned, so use the plain CSS classes in `home.css` / `doc.css`.

---

## 12. File map

| File | Responsibility |
|------|----------------|
| `src/app/globals.css` | Palette tokens, legacy aliases, `@theme`, `.api-*`, `.ds-*`, base prose rules, focus and motion |
| `src/app/layout.tsx` | Fonts (`next/font`), theme init script, `docs.json` theme `<style>` and font `<link>`, root metadata |
| `src/lib/site-theme.ts` | `docs.json` `colors` and `fonts` to validated CSS overrides |
| `src/lib/theme-tokens.ts` | Theme names, font-scale levels, init script source |
| `src/styles/doc.css` | Doc page: breadcrumb, title, prose, callouts, tables, code blocks, tabs, steps, pager, edit row, TOC |
| `src/styles/home.css` | Home: hero, search card, sections, cards, band, task rows, Mintlify compatibility |
| `src/components/docs-shell.tsx` | Header, brand, sidebar, bottom bar, main grid |
| `src/components/sidebar-nav-group.tsx` | Tree group in the sidebar and drawer |
| `src/components/mobile-nav.tsx` | Drawer and hamburger |
| `src/components/display-settings.tsx` | Header settings popover |
| `src/components/main-nav-tabs.tsx`, `navbar-cta.tsx`, `global-nav-anchors.tsx` | Header tabs, links and CTA, sidebar anchors (from `docs.json`) |
| `src/components/mdx-home.tsx` | `HomePage`, `Hero`, `HeroAction`, `HeroAside`, `Section`, `Band`, `TaskList`, `Task` |
| `src/components/mdx-cards.tsx` | `Card`, `CardGroup`, `Icon`, icon-name map |
| `src/components/prose-page-layout.tsx` | Article + TOC grid, header, pager |
| `src/components/page-actions.tsx`, `doc-pager.tsx` | Breadcrumb row with Copy link; pager and edit row |
| `src/components/mdx-layout.tsx`, `mdx-steps.tsx`, `mdx-callouts*.tsx` | Tabs, accordions, steps, callouts |
| `src/components/markdown-body.tsx`, `doc-prose.tsx` | Prose wrapper classes, code-block chrome |
| `src/components/on-this-page.tsx`, `mobile-toc.tsx` | Right TOC and inline disclosure |
| `src/components/api-reference-shell.tsx` | API layout, method colors, sidebar |
| `src/components/operation-doc.tsx` | Operation detail sections |
| `src/components/site-controls.tsx` | Language select, assistant (unmounted) |
| `src/components/search-control.tsx` | Search dialog, header, drawer and hero triggers |
| `src/components/font-scale-controls.tsx`, `theme-toggle.tsx` | Text size and theme segmented controls |

---

## 13. Quick reference — copy-paste snippets

**Themed panel**

```tsx
<div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-[var(--ink)]">
```

**Sidebar group** — use the component, not hand-rolled links:

```tsx
<SidebarNavGroup group={group} isActiveItem={(href) => isActiveNavItem(href, activePath)} />
```

**Active tree link** (what `SidebarNavGroup` renders for the current page)

```tsx
className="-ml-px block border-l-2 border-[var(--brand)] py-[5px] pl-3.5 pr-2.5 text-[13.5px] font-semibold text-[var(--brand-ink)]"
```

**Mono label**

```tsx
<p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--ink-3)]">Label</p>
```

**Page title block** (from `ProsePageLayout`)

```tsx
<PageCrumbs groupLabel="Guides" title="Page title" />
<h1 className="doc-title">Page title</h1>
<p className="doc-desc">One sentence of context.</p>
```

**API JSON block**

```tsx
<div className="api-code overflow-hidden rounded-lg">
  <pre className="overflow-x-auto p-4 text-xs leading-relaxed">{body}</pre>
</div>
```

---

*Last synced with portal source: Tailwind 4, Next.js 16.2.9, the redesign (commits `a7a833e`, `9d7383e`). Update this doc when adding new tokens or shared components.*

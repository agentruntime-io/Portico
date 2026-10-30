import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Children, isValidElement, type ReactNode } from "react";
import { IconTile, unwrapSingleParagraph } from "@/components/mdx-cards";
import { HeroSearchTrigger } from "@/components/search-control";
import type { Locale } from "@/lib/i18n";
import { defaultLocale } from "@/lib/i18n";
import { localizeHref } from "@/lib/locale-routing";

// Home page building blocks. Content repos are not scanned by Tailwind, so these
// components own all layout and styling (src/styles/home.css); MDX only passes
// text, links and icon names.

function renderTitle(title: string, highlight?: string): ReactNode {
  if (!highlight) return title;
  const at = title.indexOf(highlight);
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <em>{highlight}</em>
      {title.slice(at + highlight.length)}
    </>
  );
}

/**
 * Right-hand column of a `Hero`: any MDX (an image, a Card, a code block).
 * Shown from 960px of hero width, hidden below. `decoration` draws faint arch
 * lines behind the content.
 */
export function HeroAside({
  decoration = false,
  children,
}: {
  decoration?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="hm-aside">
      {decoration ? (
        <div className="hm-arch" aria-hidden>
          <svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice">
            <path d="M20 420V150a130 130 0 0 1 260 0v270" />
            <path d="M52 420V152a98 98 0 0 1 196 0v268" />
            <path d="M84 420V154a66 66 0 0 1 132 0v266" />
          </svg>
        </div>
      ) : null}
      <div className="hm-aside-in">{children}</div>
    </div>
  );
}

/**
 * Home hero: eyebrow, title (with an optional marker-underlined `highlight`),
 * lead, search card with "Try" chips, and a row of `HeroAction` buttons.
 * A `HeroAside` child becomes the right-hand column.
 */
export function Hero({
  eyebrow,
  title,
  highlight,
  description,
  search = true,
  suggestions,
  children,
}: {
  eyebrow?: string;
  title: string;
  /** Substring of `title` drawn with the marker underline. */
  highlight?: string;
  description?: string;
  search?: boolean;
  /** Search terms shown as "Try" chips; a chip opens search prefilled with it. */
  suggestions?: string[];
  children?: ReactNode;
}) {
  const all = Children.toArray(children);
  const isAside = (c: ReactNode) => isValidElement(c) && c.type === HeroAside;
  const aside = all.filter(isAside);
  const actions = all.filter((c) => !isAside(c));

  return (
    <section className="hm-hero not-prose">
      <div className={`hm-hero-grid${aside.length ? " has-aside" : ""}`}>
        <div className="hm-hero-main">
          {eyebrow ? (
            <div className="hm-eyebrow">
              <i aria-hidden />
              {eyebrow}
            </div>
          ) : null}
          <h1 className="hm-title">{renderTitle(title, highlight)}</h1>
          {description ? <p className="hm-lead">{description}</p> : null}
          {search ? <HeroSearchTrigger suggestions={suggestions} /> : null}
          {actions.length ? <div className="hm-cta-row">{actions}</div> : null}
        </div>
        {aside}
      </div>
    </section>
  );
}

export function HeroAction({
  href,
  primary = false,
  children,
  locale = defaultLocale,
}: {
  href: string;
  primary?: boolean;
  children: ReactNode;
  locale?: Locale;
}) {
  return (
    <Link
      href={localizeHref(href, locale)}
      className={`hm-btn ${primary ? "hm-btn-primary" : "hm-btn-ghost"}`}
    >
      {children}
      {primary ? <ArrowRight aria-hidden /> : null}
    </Link>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A home section: heading with an optional right-hand link, then any content. */
export function Section({
  id,
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  children,
  locale = defaultLocale,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  /** With `linkLabel`, a link on the right of the heading. */
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
  locale?: Locale;
}) {
  const headingId = id ?? (slugify(title) || undefined);
  return (
    <section aria-labelledby={headingId} className="hm-sec not-prose">
      <div className="hm-sec-in">
        <div className="hm-sec-h">
          <div className="hm-sec-heading">
            {eyebrow ? <div className="hm-sec-eyebrow">{eyebrow}</div> : null}
            <h2 id={headingId} className="hm-sec-title">
              {title}
            </h2>
          </div>
          {href && linkLabel ? (
            <Link href={localizeHref(href, locale)} className="hm-sec-link">
              {linkLabel}
              <ArrowRight aria-hidden />
            </Link>
          ) : null}
        </div>
        {description ? <p className="hm-sec-desc">{description}</p> : null}
        {children}
      </div>
    </section>
  );
}

/** A tinted strip: icon tile, title plus text, and a small ghost button. */
export function Band({
  title,
  icon,
  href,
  cta,
  children,
  locale = defaultLocale,
}: {
  title: string;
  icon?: string;
  href?: string;
  /** Button label; the button shows only with `href` and `cta`. */
  cta?: string;
  children?: ReactNode;
  locale?: Locale;
}) {
  return (
    <div className="hm-band not-prose">
      <IconTile icon={icon} />
      <div className="hm-band-t">
        <div className="hm-band-title">{title}</div>
        {children ? (
          <div className="hm-band-text">{unwrapSingleParagraph(children)}</div>
        ) : null}
      </div>
      {href && cta ? (
        <Link
          href={localizeHref(href, locale)}
          className="hm-btn hm-btn-ghost hm-btn-sm"
        >
          {cta}
          <ArrowRight aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

/** Divider-row list of `Task` links: one column, two from 640px. */
export function TaskList({ children }: { children?: ReactNode }) {
  return (
    <div className="hm-tasks not-prose">
      <div className="hm-rows" role="list">
        {children}
      </div>
    </div>
  );
}

/** One row of a `TaskList`: icon tile, title, description (children) and a hover arrow. */
export function Task({
  title,
  icon,
  href,
  children,
  locale = defaultLocale,
}: {
  title: string;
  icon?: string;
  href?: string;
  children?: ReactNode;
  locale?: Locale;
}) {
  const inner = (
    <>
      <IconTile icon={icon} />
      <div className="hm-row-t">
        <span className="hm-row-title">{title}</span>
        {children ? (
          <div className="hm-row-desc">{unwrapSingleParagraph(children)}</div>
        ) : null}
      </div>
      {href ? <ArrowRight className="hm-row-go" aria-hidden /> : null}
    </>
  );
  return (
    <div className="hm-row-item" role="listitem">
      {href ? (
        <Link href={localizeHref(href, locale)} className="hm-row">
          {inner}
        </Link>
      ) : (
        <div className="hm-row">{inner}</div>
      )}
    </div>
  );
}

/** Wraps the home page: sections own their spacing. */
export function HomePage({ children }: { children: ReactNode }) {
  return (
    <div data-product-guide-index className="docs-home">
      {children}
    </div>
  );
}

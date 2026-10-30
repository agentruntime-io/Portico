import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { HeroSearchTrigger } from "@/components/search-control";
import type { Locale } from "@/lib/i18n";
import { defaultLocale } from "@/lib/i18n";
import { localizeHref } from "@/lib/locale-routing";

// Home page building blocks. Content repos are not scanned by Tailwind, so these
// components own all layout and styling; MDX only passes text and links.

export function Hero({
  eyebrow,
  title,
  description,
  search = true,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  search?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="docs-home-hero not-prose rounded-2xl px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 text-[2rem] font-semibold leading-[1.12] tracking-[-0.04em] text-[var(--text-main)] [text-wrap:balance] sm:text-[2.5rem] lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-muted)] [text-wrap:pretty] sm:text-lg sm:leading-8">
            {description}
          </p>
        ) : null}
        {search ? (
          <div className="mt-8 max-w-xl">
            <HeroSearchTrigger />
          </div>
        ) : null}
        {children ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {children}
          </div>
        ) : null}
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
      className={`${primary ? "docs-home-primary" : "docs-home-secondary"} inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors`}
    >
      {children}
      {primary ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
    </Link>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="docs-home-section not-prose">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className={`${eyebrow ? "mt-3 " : ""}scroll-mt-24 text-2xl font-semibold tracking-[-0.025em] text-[var(--text-main)] sm:text-[1.75rem]`}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Wraps the home page so sections get even vertical rhythm. */
export function HomePage({ children }: { children: ReactNode }) {
  return (
    <div data-product-guide-index className="docs-home flex w-full flex-col gap-14 py-6 sm:py-8 lg:gap-20 lg:py-10">
      {children}
    </div>
  );
}

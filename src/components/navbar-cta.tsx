"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { localizeHref } from "@/lib/locale-routing";
import type { SiteConfig } from "@/lib/site";

function isExternalHref(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:")
  );
}

export function NavbarLinks({
  navbar,
  className,
  onNavigate,
}: {
  navbar?: SiteConfig["navbar"];
  className?: string;
  onNavigate?: () => void;
}) {
  const { t, locale } = useI18n();
  if (!navbar?.links?.length) return null;
  const linkClass =
    "toolbar-nav-item inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-main)] xl:min-h-9 xl:min-w-0 xl:px-2.5 xl:py-1.5";

  return (
    <nav className={className} aria-label={t("nav.siteLinks")}>
      {navbar.links.map((link) =>
        isExternalHref(link.href) ? (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className={linkClass}
          >
            {link.label}
            <span className="sr-only"> ({t("nav.opensNewTab")})</span>
          </a>
        ) : (
          <Link
            key={link.href}
            href={localizeHref(link.href, locale)}
            onClick={onNavigate}
            className={linkClass}
          >
            {link.label}
          </Link>
        ),
      )}
    </nav>
  );
}

export function NavbarPrimaryCta({
  navbar,
  className,
  onNavigate,
}: {
  navbar?: SiteConfig["navbar"];
  className?: string;
  onNavigate?: () => void;
}) {
  const { t } = useI18n();
  if (!navbar?.primary) return null;

  const external = isExternalHref(navbar.primary.href);

  return (
    <a
      href={navbar.primary.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onNavigate}
      className={
        className ??
        "inline-flex h-[34px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-[var(--cta-bg)] px-3.5 text-[13px] font-semibold text-[var(--cta-fg)] transition-opacity hover:opacity-90"
      }
    >
      {navbar.primary.label}
      {external ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : null}
      {external ? <span className="sr-only"> ({t("nav.opensNewTab")})</span> : null}
    </a>
  );
}

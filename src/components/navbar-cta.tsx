"use client";

import Link from "next/link";
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
    "toolbar-nav-item inline-flex min-h-11 min-w-11 items-center justify-center font-medium text-[var(--text-muted)] transition hover:text-[var(--text-main)] xl:min-h-9 xl:min-w-0";

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
        "toolbar-nav-item inline-flex min-h-11 shrink-0 items-center rounded-lg bg-emerald-700 px-3 py-2 font-semibold text-white transition hover:bg-emerald-600 xl:min-h-9"
      }
    >
      {navbar.primary.label}
      {external ? <span className="sr-only"> ({t("nav.opensNewTab")})</span> : null}
    </a>
  );
}

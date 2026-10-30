"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { useSiteUi } from "@/components/site-name-provider";
import type { NavFile } from "@/lib/nav";
import { localizeHref } from "@/lib/locale-routing";
import type { Locale } from "@/lib/i18n";

function isExternalHref(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:")
  );
}

export function GlobalNavAnchors({
  nav,
  locale,
  onNavigate,
  className,
  variant = "sidebar",
}: {
  nav: NavFile;
  locale: Locale;
  onNavigate?: () => void;
  className?: string;
  variant?: "sidebar" | "drawer";
}) {
  const { t } = useI18n();
  const { support } = useSiteUi();
  // The brand already links home; every other anchor comes from docs.json, plus Help
  // when the site configures a support contact.
  const fromDocs = nav.globalAnchors?.filter((a) => a.href !== "/") ?? [];
  // support may itself come from a docs.json Support/Help anchor; don't list it twice.
  const anchors =
    support && !fromDocs.some((a) => a.href === support.href)
      ? [...fromDocs, { label: support.label ?? t("nav.help"), href: support.href }]
      : fromDocs;
  if (!anchors.length) return null;

  return (
    <ul className={className ?? "mt-2 space-y-1"}>
      {anchors.map((anchor) => {
        const external = isExternalHref(anchor.href);
        const href = external ? anchor.href : localizeHref(anchor.href, locale);
        const itemClass =
          variant === "drawer"
            ? "docs-nav-row flex min-h-11 items-center rounded-md px-2.5 py-2 transition-colors docs-nav-item"
            : "docs-nav-row flex min-h-8 items-center rounded-md px-2.5 py-1.5 transition-colors docs-nav-item";
        return (
          <li key={anchor.href}>
            {external ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNavigate}
                className={itemClass}
              >
                {anchor.label}
              </a>
            ) : (
              <Link prefetch={false} href={href} onClick={onNavigate} className={itemClass}>
                {anchor.label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

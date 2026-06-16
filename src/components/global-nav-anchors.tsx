"use client";

import Link from "next/link";
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
}: {
  nav: NavFile;
  locale: Locale;
  onNavigate?: () => void;
  className?: string;
}) {
  const anchors = nav.globalAnchors?.filter(
    (a) => a.href !== "/" && a.href !== "/changelog",
  );
  if (!anchors?.length) return null;

  return (
    <ul className={className ?? "mt-2 space-y-1"}>
      {anchors.map((anchor) => {
        const external = isExternalHref(anchor.href);
        const href = external ? anchor.href : localizeHref(anchor.href, locale);
        const itemClass =
          "block rounded-md px-2 py-2 text-sm transition-colors docs-nav-item";
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
              <Link href={href} onClick={onNavigate} className={itemClass}>
                {anchor.label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

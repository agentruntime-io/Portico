"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { useSiteUi } from "@/components/site-name-provider";
import { localizeHref } from "@/lib/locale-routing";

const SOCIAL_LABELS: Record<string, string> = {
  x: "X",
  twitter: "X",
  github: "GitHub",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  discord: "Discord",
  slack: "Slack",
  facebook: "Facebook",
  instagram: "Instagram",
  reddit: "Reddit",
  medium: "Medium",
  website: "Website",
};

function isExternal(href: string) {
  return /^(https?:|mailto:)/.test(href);
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { locale } = useI18n();
  const className = "transition-colors hover:text-[var(--ink)]";
  return isExternal(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link prefetch={false} href={localizeHref(href, locale)} className={className}>
      {children}
    </Link>
  );
}

/** Site footer from docs.json `footer` (link groups and socials); nothing when unset. */
export function SiteFooter({ siteName }: { siteName: string }) {
  const { footer } = useSiteUi();
  const groups = footer?.links?.filter((group) => group.items.length) ?? [];
  const socials = Object.entries(footer?.socials ?? {});
  if (!groups.length && !socials.length) return null;

  return (
    <footer className="mt-16 border-t border-[var(--line)] pb-7 pt-6 text-[13px] text-[var(--ink-3)]">
      {groups.length ? (
        <div className="grid grid-cols-2 gap-6 min-[640px]:grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
          {groups.map((group, index) => (
            <nav key={group.header ?? index} aria-label={group.header} className="grid content-start gap-2">
              {group.header ? (
                <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em]">{group.header}</p>
              ) : null}
              {group.items.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </nav>
          ))}
        </div>
      ) : null}
      <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${groups.length ? "mt-6" : ""}`}>
        <span>
          © {new Date().getFullYear()} {siteName}
        </span>
        {socials.length ? (
          <nav aria-label="Social" className="flex flex-wrap gap-x-4 gap-y-2 min-[640px]:ml-auto">
            {socials.map(([key, href]) => (
              <FooterLink key={key} href={href}>
                {SOCIAL_LABELS[key.toLowerCase()] ?? key}
              </FooterLink>
            ))}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}

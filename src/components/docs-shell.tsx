"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { CircleHelp, FileClock, Home } from "lucide-react";
import { isActiveNavItem } from "@/lib/nav-active";
import type { NavFile } from "@/lib/nav";
import { localizeHref } from "@/lib/locale-routing";
import { FontScaleControls } from "@/components/font-scale-controls";
import { MobileNavButton } from "@/components/mobile-nav";
import { SearchControl } from "@/components/search-control";
import { NavbarLinks, NavbarPrimaryCta } from "@/components/navbar-cta";
import {
  AssistantLauncher,
  LanguageSelector,
  ThemeToggle,
} from "@/components/site-controls";
import type { SiteConfig } from "@/lib/site";
import { PorticoAttribution } from "@/components/portico-attribution";
import { GlobalNavAnchors } from "@/components/global-nav-anchors";
import { SidebarNavGroup } from "@/components/sidebar-nav-group";

const utilityLinks = [
  { titleKey: "nav.home" as const, href: "/", icon: Home },
  { titleKey: "nav.changelog" as const, href: "/changelog", icon: FileClock },
  { titleKey: "nav.help" as const, href: "mailto:hello@agentruntime.io", icon: CircleHelp },
];

export function DocsHeader({
  siteName,
  nav,
  activePath,
  navbar,
}: {
  siteName: string;
  nav: NavFile;
  activePath: string;
  navbar?: SiteConfig["navbar"];
}) {
  const { t, locale } = useI18n();
  const topLinks = nav.groups.slice(0, 3).map((group) => ({
    label: group.label,
    href: group.items[0]?.href ?? "/",
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--panel-border)] bg-[var(--panel-bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
        <Link
          href={localizeHref("/", locale)}
          className="flex min-w-0 shrink items-center gap-2 text-sm font-semibold tracking-tight text-[var(--text-main)]"
        >
          <span className="shrink-0 rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold uppercase text-white">
            {t("nav.docsBadge")}
          </span>
          <span className="hidden truncate min-[420px]:inline">{siteName}</span>
        </Link>
        <nav className="hidden min-w-0 items-center gap-1 lg:flex" aria-label={t("nav.sectionNav")}>
          {topLinks.map((item) => {
            const active =
              activePath === item.href ||
              (item.href !== "/" && activePath.startsWith(item.href));
            return (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wide transition-colors ${
                active
                  ? "text-[var(--text-main)]"
                  : "text-[var(--text-muted)] hover:bg-emerald-500/10 hover:text-[var(--text-main)]"
              }`}
            >
              {item.label}
            </Link>
            );
          })}
        </nav>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
          <NavbarLinks
            navbar={navbar}
            className="hidden shrink-0 items-center gap-3 lg:flex"
          />
          <NavbarPrimaryCta navbar={navbar} />
          <SearchControl />
          <div className="hidden items-center gap-2 lg:flex">
            <FontScaleControls />
            <LanguageSelector />
          </div>
          <div className="hidden lg:block">
            <AssistantLauncher />
          </div>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          <MobileNavButton
            nav={nav}
            activePath={activePath}
            navbar={navbar}
          />
        </div>
      </div>
    </header>
  );
}

export function DocsSidebar({
  nav,
  activePath,
}: {
  nav: NavFile;
  activePath: string;
}) {
  const { t, locale } = useI18n();

  const groupedNav = nav.groups.filter(
    (group) => !(group.label === "Project" && group.items.length === 1),
  );

  return (
    <aside className="fixed bottom-0 left-0 top-14 z-30 hidden w-[min(320px,85vw)] overflow-y-auto border-r border-[var(--panel-border)] bg-[var(--sidebar-bg)] px-4 pb-16 sm:px-6 lg:block">
      <div className="space-y-8 pt-8">
        <nav aria-label={t("nav.utilityNav")}>
          <ul className="space-y-1">
            {utilityLinks.map((item) => {
              const href = item.href.startsWith("mailto:")
                ? item.href
                : localizeHref(item.href, locale);
              const active = isActiveNavItem(href, activePath);
              const Icon = item.icon;
              const content = (
                <>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{t(item.titleKey)}</span>
                </>
              );
              const className = `flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                active ? "docs-nav-active font-medium" : "docs-nav-item"
              }`;

              return (
                <li key={item.href}>
                  {item.href.startsWith("mailto:") ? (
                    <a href={href} className={className}>
                      {content}
                    </a>
                  ) : (
                    <Link href={href} className={className}>
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <GlobalNavAnchors nav={nav} locale={locale} />
        </nav>

        {groupedNav.map((group) => (
          <SidebarNavGroup
            key={group.label}
            group={group}
            isActiveItem={(href) => isActiveNavItem(href, activePath)}
          />
        ))}
        <PorticoAttribution />
      </div>
    </aside>
  );
}

export function DocsShell({
  siteName,
  nav,
  activePath,
  navbar,
  children,
}: {
  siteName: string;
  nav: NavFile;
  activePath: string;
  navbar?: SiteConfig["navbar"];
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--app-bg)] text-[var(--text-main)]">
      <DocsHeader
        siteName={siteName}
        nav={nav}
        activePath={activePath}
        navbar={navbar}
      />
      <div className="mx-auto flex w-full max-w-[1800px] flex-1 gap-0 px-1 py-1.5 sm:px-4 sm:py-4 lg:pl-[344px] lg:px-6">
        <DocsSidebar nav={nav} activePath={activePath} />
        <main
          id="main-content"
          tabIndex={-1}
          aria-label={t("a11y.mainContent")}
          className="ds-shadow-panel min-w-0 flex-1 overflow-x-clip rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 pb-10 sm:rounded-2xl sm:px-8 sm:pb-16 lg:px-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

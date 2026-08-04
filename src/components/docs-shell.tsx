"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
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
import { MainNavTabs } from "@/components/main-nav-tabs";
import { SidebarNavGroup } from "@/components/sidebar-nav-group";
import type { MainNavTargets } from "@/lib/main-nav";

const utilityLinks = [
  { titleKey: "nav.home" as const, href: "/", icon: Home },
  { titleKey: "nav.changelog" as const, href: "/changelog", icon: FileClock },
  { titleKey: "nav.help" as const, href: "mailto:hello@agentruntime.io", icon: CircleHelp },
];

export function DocsBrand({
  siteName,
  className = "",
  nameClassName = "",
}: {
  siteName: string;
  className?: string;
  nameClassName?: string;
}) {
  const { t, locale } = useI18n();
  return (
    <Link
      href={localizeHref("/", locale)}
      className={`flex min-h-11 min-w-0 items-center gap-2.5 text-sm font-semibold tracking-tight text-[var(--text-main)] ${className}`}
    >
      <span className="shrink-0 rounded-lg border border-[var(--panel-border)] bg-[var(--surface-muted)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
        {t("nav.docsBadge")}
      </span>
      <span className={`truncate text-[15px] ${nameClassName}`}>
        {siteName}
      </span>
    </Link>
  );
}

export function DocsHeader({
  siteName,
  nav,
  activePath,
  navbar,
  mainNav,
  desktopSidebar,
}: {
  siteName: string;
  nav: NavFile;
  activePath: string;
  navbar?: SiteConfig["navbar"];
  mainNav: MainNavTargets;
  desktopSidebar?: "docs" | "api";
}) {
  const headerOffset =
    desktopSidebar === "docs"
      ? "xl:ml-[280px]"
      : desktopSidebar === "api"
        ? "lg:ml-[340px]"
        : "";
  const brandVisibility =
    desktopSidebar === "docs"
      ? "xl:hidden"
      : desktopSidebar === "api"
        ? "lg:hidden"
        : "";
  const innerWidth = desktopSidebar
    ? "flex h-16 w-full items-center gap-4 px-4 sm:px-6"
    : "mx-auto flex h-16 max-w-[1680px] items-center gap-4 px-4 sm:px-6";

  return (
    <header
      className={`sticky top-0 z-40 bg-[var(--sidebar-bg)] ${headerOffset}`}
    >
      <div className={innerWidth}>
        <DocsBrand
          siteName={siteName}
          className={`shrink ${brandVisibility}`}
          nameClassName="hidden min-[420px]:inline"
        />
        <MainNavTabs activePath={activePath} mainNav={mainNav} />
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
          <NavbarLinks
            navbar={navbar}
            className="hidden shrink-0 items-center gap-3 xl:flex"
          />
          <NavbarPrimaryCta navbar={navbar} />
          <SearchControl />
          <div className="hidden items-center gap-2 xl:flex">
            <FontScaleControls />
            <LanguageSelector />
          </div>
          <div className="hidden xl:block">
            <AssistantLauncher />
          </div>
          <div className="hidden xl:block">
            <ThemeToggle />
          </div>
          <MobileNavButton
            nav={nav}
            activePath={activePath}
            navbar={navbar}
            mainNav={mainNav}
            hideAt={desktopSidebar === "api" ? "lg" : "xl"}
          />
        </div>
      </div>
    </header>
  );
}

export function DocsSidebar({
  siteName,
  nav,
  activePath,
}: {
  siteName: string;
  nav: NavFile;
  activePath: string;
}) {
  const { t, locale } = useI18n();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const groupedNav = nav.groups.filter(
    (group) => !(group.label === "Project" && group.items.length === 1),
  );

  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    const activeItem = sidebar?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    if (!sidebar || !activeItem) return;

    const sidebarRect = sidebar.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();
    const visibleInset = 32;
    const isVisible =
      activeRect.top >= sidebarRect.top + visibleInset &&
      activeRect.bottom <= sidebarRect.bottom - visibleInset;

    if (isVisible) return;

    const centeredTop =
      sidebar.scrollTop +
      activeRect.top -
      sidebarRect.top -
      (sidebar.clientHeight - activeItem.offsetHeight) / 2;
    sidebar.scrollTop = Math.max(0, centeredTop);
  }, [activePath]);

  return (
    <aside
      className="docs-sidebar fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col overflow-hidden bg-[var(--sidebar-bg)] xl:flex"
    >
      <div className="flex h-16 shrink-0 items-center px-5">
        <DocsBrand siteName={siteName} />
      </div>
      <div
        ref={sidebarRef}
        className="docs-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-14"
      >
        <div className="space-y-5 pt-7">
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
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{t(item.titleKey)}</span>
                  </>
                );
                const className = `docs-nav-row flex min-h-8 items-center gap-3 rounded-lg px-2.5 py-1.5 transition-colors ${
                  active ? "docs-nav-active font-medium" : "docs-nav-item"
                }`;

                return (
                  <li key={item.href}>
                    {item.href.startsWith("mailto:") ? (
                      <a href={href} className={className}>
                        {content}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={className}
                      >
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {groupedNav.map((group) => (
            <SidebarNavGroup
              key={group.label}
              group={group}
              isActiveItem={(href) => isActiveNavItem(href, activePath)}
            />
          ))}
          <div className="pt-2">
            <GlobalNavAnchors
              nav={nav}
              locale={locale}
              className="space-y-1"
            />
          </div>
          <PorticoAttribution />
        </div>
      </div>
    </aside>
  );
}

export function DocsShell({
  siteName,
  nav,
  activePath,
  navbar,
  mainNav,
  children,
}: {
  siteName: string;
  nav: NavFile;
  activePath: string;
  navbar?: SiteConfig["navbar"];
  mainNav: MainNavTargets;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--sidebar-bg)] text-[var(--text-main)]">
      <DocsHeader
        siteName={siteName}
        nav={nav}
        activePath={activePath}
        navbar={navbar}
        mainNav={mainNav}
        desktopSidebar="docs"
      />
      <div className="flex w-full flex-1 xl:pl-[280px]">
        <DocsSidebar siteName={siteName} nav={nav} activePath={activePath} />
        <main
          id="main-content"
          tabIndex={-1}
          aria-label={t("a11y.mainContent")}
          className="min-w-0 flex-1 overflow-x-clip bg-[var(--panel-bg)] px-5 pb-12 sm:px-8 sm:pb-16 lg:px-12 xl:rounded-tl-2xl xl:px-14"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

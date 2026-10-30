"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { useI18n } from "@/components/i18n-provider";
import { useSiteLogo } from "@/components/site-name-provider";
import { isActiveNavItem } from "@/lib/nav-active";
import type { NavFile } from "@/lib/nav";
import { localizeHref } from "@/lib/locale-routing";
import { DisplaySettings } from "@/components/display-settings";
import { MobileNavButton, OPEN_NAV_EVENT } from "@/components/mobile-nav";
import { SearchControl } from "@/components/search-control";
import { NavbarPrimaryCta } from "@/components/navbar-cta";
import type { SiteConfig } from "@/lib/site";
import { PorticoAttribution } from "@/components/portico-attribution";
import { GlobalNavAnchors } from "@/components/global-nav-anchors";
import { MainNavTabs } from "@/components/main-nav-tabs";
import { SidebarNavGroup } from "@/components/sidebar-nav-group";
import type { MainNavTargets } from "@/lib/main-nav";

export function DocsBrand({
  siteName,
  className = "",
  nameClassName = "",
  badgeClassName = "",
}: {
  siteName: string;
  className?: string;
  nameClassName?: string;
  badgeClassName?: string;
}) {
  const { t, locale } = useI18n();
  const logo = useSiteLogo();
  const badge = (
    <span className={`shrink-0 rounded-md border border-[var(--line)] bg-[var(--sunk)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-ink)] ${badgeClassName}`}>
      {t("nav.docsBadge")}
    </span>
  );
  return (
    <Link prefetch={false}
      href={localizeHref("/", locale)}
      className={`flex min-h-11 min-w-0 items-center gap-2.5 text-sm font-semibold tracking-tight text-[var(--ink)] ${className}`}
    >
      {logo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- inline data URI */}
          <img src={logo.light} alt={siteName} className="site-logo-light h-5 w-auto min-w-0 max-w-[32vw] object-contain object-left sm:h-6 sm:max-w-[200px]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- inline data URI */}
          <img src={logo.dark} alt={siteName} className="site-logo-dark h-5 w-auto min-w-0 max-w-[32vw] object-contain object-left sm:h-6 sm:max-w-[200px]" />
          {badge}
        </>
      ) : (
        <>
          <span className={`truncate font-display text-[17px] font-bold tracking-[-0.02em] ${nameClassName}`}>
            {siteName}
          </span>
          {badge}
        </>
      )}
    </Link>
  );
}

/**
 * Full-width sticky header: brand, Documentation / API tabs, search, the site's primary
 * CTA and display settings. Under 640px the tabs, CTA and settings move into the drawer.
 */
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
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--canvas)]">
      <div className="flex h-14 w-full items-center gap-2 pl-4 pr-2.5 min-[640px]:h-[58px] min-[640px]:px-5">
        <DocsBrand siteName={siteName} className="shrink" />
        <MainNavTabs activePath={activePath} mainNav={mainNav} className="ml-4 hidden h-full min-w-0 items-stretch gap-1 min-[640px]:flex" />
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
          <SearchControl />
          <div className="ml-1.5 hidden min-[640px]:block">
            <NavbarPrimaryCta navbar={navbar} />
          </div>
          <div className="hidden min-[640px]:block">
            <DisplaySettings navbar={navbar} />
          </div>
          <MobileNavButton
            nav={nav}
            activePath={activePath}
            navbar={navbar}
            mainNav={mainNav}
            hideAt={desktopSidebar === "api" ? "lg" : "docs"}
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
  const sidebarRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    const activeItem = sidebar?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!sidebar || !activeItem) return;
    const sidebarRect = sidebar.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();
    const visibleInset = 32;
    if (
      activeRect.top >= sidebarRect.top + visibleInset &&
      activeRect.bottom <= sidebarRect.bottom - visibleInset
    ) {
      return;
    }
    sidebar.scrollTop = Math.max(
      0,
      sidebar.scrollTop + activeRect.top - sidebarRect.top - (sidebar.clientHeight - activeItem.offsetHeight) / 2,
    );
  }, [activePath]);

  return (
    <nav
      ref={sidebarRef}
      aria-label={t("nav.documentation")}
      className="docs-sidebar-scroll sticky top-[58px] hidden h-[calc(100vh-58px)] overflow-y-auto border-r border-[var(--line)] pb-8 pl-5 pr-3.5 pt-6 min-[820px]:block"
    >
      <GlobalNavAnchors nav={nav} locale={locale} className="mb-4 space-y-0.5" />
      {nav.groups.map((group) => (
        <SidebarNavGroup
          key={group.label}
          group={group}
          isActiveItem={(href) => isActiveNavItem(href, activePath)}
        />
      ))}
      <div className="mt-6">
        <PorticoAttribution />
      </div>
    </nav>
  );
}

/** Under 820px: sticky pill showing "Group · Page" that opens the navigation drawer. */
function MobileLocationBar({ nav, activePath }: { nav: NavFile; activePath: string }) {
  const { t } = useI18n();
  let label: string | undefined;
  for (const group of nav.groups) {
    const item = group.items.find((entry) => isActiveNavItem(entry.href, activePath));
    if (item) {
      label = `${group.label} · ${item.title}`;
      break;
    }
  }
  if (!label) return null;
  return (
    <div className="sticky bottom-3 z-30 m-3 flex h-12 items-center gap-2.5 rounded-2xl bg-[var(--cta-bg)] pl-3.5 pr-2 text-[13.5px] font-medium text-[var(--cta-fg)] shadow-[var(--shadow-pop)] min-[820px]:hidden">
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <button
        type="button"
        aria-label={t("nav.openMenu")}
        onClick={() => window.dispatchEvent(new Event(OPEN_NAV_EVENT))}
        className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] transition-colors hover:bg-[rgb(127_127_127/0.2)]"
      >
        <Menu className="h-[17px] w-[17px]" aria-hidden />
      </button>
    </div>
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
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <DocsHeader
        siteName={siteName}
        nav={nav}
        activePath={activePath}
        navbar={navbar}
        mainNav={mainNav}
        desktopSidebar="docs"
      />
      <div className="grid w-full flex-1 grid-cols-1 min-[820px]:grid-cols-[260px_minmax(0,1fr)] min-[1180px]:grid-cols-[268px_minmax(0,1fr)]">
        <DocsSidebar nav={nav} activePath={activePath} />
        <main
          id="main-content"
          tabIndex={-1}
          aria-label={t("a11y.mainContent")}
          className="min-w-0 overflow-x-clip px-5 pb-12 pt-[22px] min-[640px]:px-6 min-[640px]:pt-7 min-[820px]:px-12 min-[820px]:pt-9"
        >
          {children}
        </main>
      </div>
      <MobileLocationBar nav={nav} activePath={activePath} />
    </div>
  );
}

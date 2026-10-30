"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n-provider";
import { useSiteLogo, useSiteName } from "@/components/site-name-provider";
import { useDialog } from "@/lib/a11y/use-dialog";
import { FontScaleControls } from "@/components/font-scale-controls";
import { NavbarLinks, NavbarPrimaryCta } from "@/components/navbar-cta";
import { PorticoAttribution } from "@/components/portico-attribution";
import { GlobalNavAnchors } from "@/components/global-nav-anchors";
import { DrawerSearchTrigger } from "@/components/search-control";
import { SidebarNavGroup } from "@/components/sidebar-nav-group";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/site-controls";
import { isActiveNavItem } from "@/lib/nav-active";
import type { NavFile } from "@/lib/nav";
import { localizeHref } from "@/lib/locale-routing";
import {
  isApiReferencePath,
  isDocumentationPath,
  type MainNavTargets,
} from "@/lib/main-nav";
import type { SiteConfig } from "@/lib/site";

/** Dispatched by the docs bottom bar to open this drawer. */
export const OPEN_NAV_EVENT = "docs:open-nav";

export function MobileNavButton({
  nav,
  activePath,
  navbar,
  mainNav,
  hideAt = "docs",
}: {
  nav: NavFile;
  activePath: string;
  navbar?: SiteConfig["navbar"];
  mainNav: MainNavTargets;
  /** "docs": button under 640px (the bottom bar opens the drawer up to 820px); "lg": API reference. */
  hideAt?: "lg" | "docs";
}) {
  const { t, locale } = useI18n();
  const siteName = useSiteName();
  const logo = useSiteLogo();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeDialog = useCallback(() => setOpen(false), []);
  const desktopVisibility = hideAt === "lg" ? "lg:hidden" : "min-[640px]:hidden";

  useDialog(open, closeDialog, dialogRef, closeRef);

  useEffect(() => {
    setMounted(true);
    const openNav = () => setOpen(true);
    window.addEventListener(OPEN_NAV_EVENT, openNav);
    return () => window.removeEventListener(OPEN_NAV_EVENT, openNav);
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia(
      hideAt === "lg" ? "(min-width: 1024px)" : "(min-width: 820px)",
    );
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) closeDialog();
    };
    desktopQuery.addEventListener("change", closeAtDesktop);
    return () => desktopQuery.removeEventListener("change", closeAtDesktop);
  }, [closeDialog, hideAt]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      const scroller = navScrollRef.current;
      const activeItem = scroller?.querySelector<HTMLElement>(
        '[aria-current="page"]',
      );
      if (!scroller || !activeItem) return;

      const scrollerRect = scroller.getBoundingClientRect();
      const activeRect = activeItem.getBoundingClientRect();
      const activeGroup = activeItem.closest<HTMLElement>("[data-nav-group]");
      const groupHeader = activeGroup?.firstElementChild as HTMLElement | null;
      const groupHeaderRect = groupHeader?.getBoundingClientRect();
      const itemIsVisible =
        activeRect.top >= scrollerRect.top + 16 &&
        activeRect.bottom <= scrollerRect.bottom - 16;
      const groupContextIsPositioned =
        !groupHeaderRect ||
        (groupHeaderRect.top >= scrollerRect.top + 8 &&
          groupHeaderRect.top <= scrollerRect.top + 32);
      if (itemIsVisible && groupContextIsPositioned) return;

      const groupAndItemFit =
        groupHeaderRect &&
        activeRect.bottom - groupHeaderRect.top <= scroller.clientHeight - 32;
      const targetOffset = groupAndItemFit
        ? groupHeaderRect.top - scrollerRect.top - 8
        : activeRect.top -
          scrollerRect.top -
          (scroller.clientHeight - activeItem.offsetHeight) / 2;

      scroller.scrollTop = Math.max(0, scroller.scrollTop + targetOffset);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activePath, open]);

  const groupedNav = nav.groups.filter(
    (group) => !(group.label === "Project" && group.items.length === 1),
  );

  // Documentation / API reference switch: one API spec links straight to it, several to the index.
  const docsHref = localizeHref(mainNav.docsHomeHref, locale);
  const apiHref = mainNav.apiSpecs.length
    ? localizeHref(
        mainNav.apiSpecs.length === 1 ? mainNav.apiSpecs[0]!.href : "/reference",
        locale,
      )
    : null;

  const drawer =
    mounted
      ? createPortal(
          <div
            aria-hidden={!open}
            className={`fixed inset-0 z-[var(--z-modal-backdrop)] ${
              open ? "pointer-events-auto" : "pointer-events-none"
            } ${desktopVisibility}`}
          >
            <div
              role="presentation"
              aria-hidden
              onClick={closeDialog}
              className={`absolute inset-0 bg-black/45 transition-opacity duration-300 motion-reduce:transition-none ${
                open ? "opacity-100" : "opacity-0"
              }`}
            />
            <aside
              ref={dialogRef}
              id={panelId}
              inert={!open}
              data-state={open ? "open" : "closed"}
              className={`absolute inset-y-0 left-0 flex w-[min(20rem,100vw)] flex-col bg-[var(--canvas)] transition-[transform,box-shadow]  duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none sm:rounded-r-2xl ${
                open ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"
              }`}
              role="dialog"
              aria-modal="true"
              aria-label={t("nav.menuTitle")}
            >
              <header className="flex h-[54px] shrink-0 items-center gap-2 border-b border-[var(--line)] pl-4 pr-3.5">
                <Link
                  prefetch={false}
                  href={localizeHref("/", locale)}
                  onClick={closeDialog}
                  className="flex min-w-0 items-center gap-2.5 text-[var(--ink)]"
                >
                  {logo ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element -- inline data URI */}
                      <img src={logo.light} alt={siteName} className="site-logo-light h-5 w-auto min-w-0 max-w-[180px] object-contain object-left" />
                      {/* eslint-disable-next-line @next/next/no-img-element -- inline data URI */}
                      <img src={logo.dark} alt={siteName} className="site-logo-dark h-5 w-auto min-w-0 max-w-[180px] object-contain object-left" />
                    </>
                  ) : (
                    <span className="truncate font-display text-[17px] font-bold tracking-[-0.02em]">
                      {siteName}
                    </span>
                  )}
                  <span className="shrink-0 text-[13px] font-medium text-[var(--ink-3)]">
                    {t("nav.docsBadge")}
                  </span>
                </Link>
                <span className="flex-1" />
                <button
                  ref={closeRef}
                  type="button"
                  aria-label={t("nav.closeMenu")}
                  onClick={closeDialog}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[var(--ink-2)] transition-colors hover:bg-[var(--sunk)] hover:text-[var(--ink)]"
                >
                  <X className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </header>
              <div
                ref={navScrollRef}
                className="docs-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-2 pt-3"
              >
                {apiHref ? (
                  <nav
                    aria-label={t("nav.mainNav")}
                    className="pref-seg pref-seg-fill mnav-switch mb-3"
                  >
                    <Link
                      prefetch={false}
                      href={docsHref}
                      onClick={closeDialog}
                      aria-current={isDocumentationPath(activePath) ? "true" : undefined}
                      className="pref-seg-btn"
                    >
                      {t("nav.documentation")}
                    </Link>
                    <Link
                      prefetch={false}
                      href={apiHref}
                      onClick={closeDialog}
                      aria-current={isApiReferencePath(activePath) ? "true" : undefined}
                      className="pref-seg-btn"
                    >
                      {t("nav.apiReference")}
                    </Link>
                  </nav>
                ) : null}
                <div className="mnav-search mb-3.5">
                  <DrawerSearchTrigger onActivate={closeDialog} />
                </div>
                <div>
                  {groupedNav.map((group) => (
                    <SidebarNavGroup
                      key={group.label}
                      group={group}
                      isActiveItem={(href) => isActiveNavItem(href, activePath)}
                      onNavigate={closeDialog}
                      variant="drawer"
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <GlobalNavAnchors
                    nav={nav}
                    locale={locale}
                    onNavigate={closeDialog}
                    className="space-y-0"
                    variant="drawer"
                  />
                </div>
                <NavbarLinks
                  navbar={navbar}
                  className="mt-2 flex flex-wrap gap-x-1 px-1 text-[13px] [&_a]:min-w-0 [&_a]:px-1.5 [&_a]:font-normal [&_a]:text-[var(--ink-2)] [&_a:hover]:bg-transparent [&_a:hover]:text-[var(--brand-ink)]"
                  onNavigate={closeDialog}
                />
                <div className="mt-3">
                  <PorticoAttribution compact />
                </div>
              </div>
              <footer className="drawer-footer grid shrink-0 gap-2.5 border-t border-[var(--line)] bg-[var(--canvas)] p-3">
                <div className="mnav-prefs flex items-center gap-2">
                  <ThemeToggle variant="segmented" iconOnly />
                  <FontScaleControls />
                  <LanguageSelector variant="drawer" />
                </div>
                <NavbarPrimaryCta
                  navbar={navbar}
                  className="mnav-cta inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--cta-bg)] text-[14.5px] font-semibold text-[var(--cta-fg)] transition-opacity hover:opacity-90"
                  onNavigate={closeDialog}
                />
              </footer>
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        aria-label={t("nav.openMenu")}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-[var(--ink-2)] transition-colors hover:bg-[var(--sunk)] hover:text-[var(--ink)] ${desktopVisibility}`}
      >
        <Menu className="h-[18px] w-[18px]" />
      </button>
      {drawer}
    </>
  );
}

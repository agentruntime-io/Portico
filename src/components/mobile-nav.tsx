"use client";

import Link from "next/link";
import { CircleHelp, FileClock, Home, Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n-provider";
import { useDialog } from "@/lib/a11y/use-dialog";
import { FontScaleControls } from "@/components/font-scale-controls";
import { NavbarLinks, NavbarPrimaryCta } from "@/components/navbar-cta";
import { PorticoAttribution } from "@/components/portico-attribution";
import { GlobalNavAnchors } from "@/components/global-nav-anchors";
import { MainNavTabs } from "@/components/main-nav-tabs";
import { DrawerSearchTrigger } from "@/components/search-control";
import { SidebarNavGroup } from "@/components/sidebar-nav-group";
import {
  LanguageSelector,
  ThemeToggle,
} from "@/components/site-controls";
import { isActiveNavItem } from "@/lib/nav-active";
import type { NavFile } from "@/lib/nav";
import { localizeHref } from "@/lib/locale-routing";
import type { MainNavTargets } from "@/lib/main-nav";
import type { SiteConfig } from "@/lib/site";

const utilityLinks = [
  { titleKey: "nav.home" as const, href: "/", icon: Home },
  { titleKey: "nav.changelog" as const, href: "/changelog", icon: FileClock },
  { titleKey: "nav.help" as const, href: "mailto:hello@agentruntime.io", icon: CircleHelp },
];

export function MobileNavButton({
  nav,
  activePath,
  navbar,
  mainNav,
  hideAt = "xl",
}: {
  nav: NavFile;
  activePath: string;
  navbar?: SiteConfig["navbar"];
  mainNav: MainNavTargets;
  hideAt?: "lg" | "xl";
}) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const navScrollRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeDialog = useCallback(() => setOpen(false), []);
  const desktopVisibility = hideAt === "lg" ? "lg:hidden" : "xl:hidden";

  useDialog(open, closeDialog, dialogRef, closeRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia(
      hideAt === "lg" ? "(min-width: 1024px)" : "(min-width: 1280px)",
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
      const isVisible =
        activeRect.top >= scrollerRect.top + 16 &&
        activeRect.bottom <= scrollerRect.bottom - 16;
      if (isVisible) return;

      scroller.scrollTop = Math.max(
        0,
        scroller.scrollTop +
          activeRect.top -
          scrollerRect.top -
          (scroller.clientHeight - activeItem.offsetHeight) / 2,
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activePath, open]);

  const groupedNav = nav.groups.filter(
    (group) => !(group.label === "Project" && group.items.length === 1),
  );

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
              className={`absolute inset-y-0 left-0 flex w-[min(20rem,100vw)] flex-col bg-[var(--sidebar-bg)] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none sm:rounded-r-2xl ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
              role="dialog"
              aria-modal="true"
              aria-label={t("nav.menuTitle")}
            >
              <div className="flex h-14 shrink-0 items-center justify-between px-4">
                <p className="text-sm font-semibold text-[var(--text-main)]">
                  {t("nav.menuTitle")}
                </p>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label={t("nav.closeMenu")}
                  onClick={closeDialog}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-emerald-500/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="shrink-0 px-4 pb-2">
                <DrawerSearchTrigger onActivate={closeDialog} />
                <MainNavTabs
                  activePath={activePath}
                  mainNav={mainNav}
                  onNavigate={closeDialog}
                  className="mt-2 flex flex-wrap gap-2"
                />
              </div>
              <nav
                ref={navScrollRef}
                className="docs-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-3 pt-1"
                aria-label={t("nav.utilityNav")}
              >
                <ul className="space-y-1">
                  {utilityLinks.map((item) => {
                    const href = item.href.startsWith("mailto:")
                      ? item.href
                      : localizeHref(item.href, locale);
                    const active = isActiveNavItem(href, activePath);
                    const Icon = item.icon;
                    const className = `flex min-h-11 items-center gap-3 rounded-md px-2 py-2 text-sm ${
                      active ? "docs-nav-active font-medium" : "docs-nav-item"
                    }`;
                    const content = (
                      <>
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span>{t(item.titleKey)}</span>
                      </>
                    );
                    return (
                      <li key={item.href}>
                        {item.href.startsWith("mailto:") ? (
                          <a
                            href={href}
                            aria-current={active ? "page" : undefined}
                            className={className}
                          >
                            {content}
                          </a>
                        ) : (
                          <Link
                            href={href}
                            onClick={closeDialog}
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
                <div className="mt-3">
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
                <div className="mt-2 flex min-h-11 items-center gap-5 px-2.5">
                  <NavbarPrimaryCta
                    navbar={navbar}
                    className="toolbar-nav-item inline-flex min-h-11 items-center font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--accent-strong)]"
                    onNavigate={closeDialog}
                  />
                  <NavbarLinks
                    navbar={navbar}
                    className="flex items-center gap-5"
                    onNavigate={closeDialog}
                  />
                </div>
                <div className="mt-3">
                  <PorticoAttribution compact />
                </div>
              </nav>
              <footer className="flex h-14 shrink-0 items-center bg-[var(--sidebar-bg)] px-4">
                <div className="flex w-full items-center justify-end gap-1.5">
                  <ThemeToggle compact />
                  <FontScaleControls compact />
                  <LanguageSelector variant="drawer" compact />
                </div>
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
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] hover:bg-emerald-500/10 ${desktopVisibility}`}
      >
        <Menu className="h-4 w-4" />
      </button>
      {drawer}
    </>
  );
}

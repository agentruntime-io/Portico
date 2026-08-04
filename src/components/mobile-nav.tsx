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
import { SidebarNavGroup } from "@/components/sidebar-nav-group";
import {
  AssistantLauncher,
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
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeDialog = useCallback(() => setOpen(false), []);
  const desktopVisibility = hideAt === "lg" ? "lg:hidden" : "xl:hidden";

  useDialog(open, closeDialog, dialogRef, closeRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  const groupedNav = nav.groups.filter(
    (group) => !(group.label === "Project" && group.items.length === 1),
  );

  const drawer =
    open && mounted
      ? createPortal(
          <div
            className={`fixed inset-0 z-[var(--z-modal-backdrop)] ${desktopVisibility}`}
          >
            <div
              role="presentation"
              aria-hidden
              onClick={closeDialog}
              className="absolute inset-0 bg-black/60"
            />
            <aside
              ref={dialogRef}
              id={panelId}
              className="absolute bottom-0 left-0 top-16 flex w-[min(20rem,88vw)] flex-col border-r border-[var(--panel-border)] bg-[var(--sidebar-bg)] shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label={t("nav.menuTitle")}
            >
              <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-4 py-3">
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
              <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label={t("nav.utilityNav")}>
                <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] p-3">
                  <ThemeToggle />
                  <FontScaleControls />
                  <LanguageSelector variant="drawer" />
                  <AssistantLauncher />
                </div>
                <NavbarPrimaryCta
                  navbar={navbar}
                  className="mb-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  onNavigate={closeDialog}
                />
                <NavbarLinks
                  navbar={navbar}
                  className="mb-3 flex flex-col gap-2"
                  onNavigate={closeDialog}
                />
                <MainNavTabs
                  activePath={activePath}
                  mainNav={mainNav}
                  onNavigate={closeDialog}
                  className="mb-4 flex flex-wrap gap-2"
                />
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
                          <a href={href} className={className}>
                            {content}
                          </a>
                        ) : (
                          <Link
                            href={href}
                            onClick={closeDialog}
                            className={className}
                          >
                            {content}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div className="my-4 border-t border-[var(--panel-border)]" />
                {groupedNav.map((group) => (
                  <SidebarNavGroup
                    key={group.label}
                    group={group}
                    isActiveItem={(href) => isActiveNavItem(href, activePath)}
                    onNavigate={closeDialog}
                    variant="drawer"
                  />
                ))}
                <div className="mt-4 border-t border-[var(--panel-border)] pt-4">
                  <GlobalNavAnchors
                    nav={nav}
                    locale={locale}
                    onNavigate={closeDialog}
                    className="space-y-1"
                    variant="drawer"
                  />
                </div>
                <div className="mt-8 pb-4">
                  <PorticoAttribution />
                </div>
              </nav>
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

"use client";

import Link from "next/link";
import { CircleHelp, FileClock, Home, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n-provider";
import { useDialog } from "@/lib/a11y/use-dialog";
import { NavbarLinks, NavbarPrimaryCta } from "@/components/navbar-cta";
import type { NavFile } from "@/lib/nav";
import { navIcon } from "@/lib/nav-icons";
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
}: {
  nav: NavFile;
  activePath: string;
  navbar?: SiteConfig["navbar"];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialog(open, () => setOpen(false), dialogRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActiveItem = (href: string) => {
    if (href === "/") return activePath === "/";
    return activePath === href || activePath.startsWith(`${href}/`);
  };

  const groupedNav = nav.groups.filter(
    (group) => !(group.label === "Project" && group.items.length === 1),
  );

  const drawer =
    open && mounted
      ? createPortal(
          <div
            ref={dialogRef}
            className="fixed inset-0 z-[100] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.browseDocs")}
          >
            <button
              type="button"
              aria-label={t("nav.closeMenu")}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60"
            />
            <aside className="absolute bottom-0 left-0 top-14 flex w-[min(20rem,88vw)] flex-col border-r border-[var(--panel-border)] bg-[var(--sidebar-bg)] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--text-main)]">
                  {t("nav.browseDocs")}
                </p>
                <button
                  type="button"
                  aria-label={t("nav.closeMenu")}
                  onClick={() => setOpen(false)}
                  className="rounded-md p-2 text-[var(--text-muted)] hover:bg-emerald-500/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label={t("nav.utilityNav")}>
                {navbar?.links?.length || navbar?.primary ? (
                  <div className="mb-4 space-y-3 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] p-3">
                    <NavbarLinks
                      navbar={navbar}
                      className="flex flex-col gap-2"
                      onNavigate={() => setOpen(false)}
                    />
                    <NavbarPrimaryCta
                      navbar={navbar}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                      onNavigate={() => setOpen(false)}
                    />
                  </div>
                ) : null}
                <ul className="space-y-1">
                  {utilityLinks.map((item) => {
                    const active = isActiveItem(item.href);
                    const Icon = item.icon;
                    const className = `flex items-center gap-3 rounded-md px-2 py-2 text-sm ${
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
                          <a href={item.href} className={className}>
                            {content}
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
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
                {groupedNav.map((group) => {
                  const Icon = navIcon(group.icon);
                  return (
                    <div key={group.label} className="mb-6">
                      <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span>{group.label}</span>
                      </div>
                      <ul className="space-y-0.5">
                        {group.items.map((item) => {
                          const active = isActiveItem(item.href);
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`block rounded-md px-2 py-2 text-sm ${
                                  active
                                    ? "docs-nav-active font-medium"
                                    : "docs-nav-item"
                                }`}
                              >
                                {item.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
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
        aria-label={t("nav.browseDocs")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] hover:bg-emerald-500/10 lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>
      {drawer}
    </>
  );
}

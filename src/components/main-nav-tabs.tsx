"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import {
  activeApiSpecId,
  isApiReferencePath,
  isDocumentationPath,
  type MainNavTargets,
} from "@/lib/main-nav";
import { localizeHref } from "@/lib/locale-routing";

// Header tabs: full-height links with a 2px brand underline on the active one.
function tabClass(active: boolean) {
  return `relative inline-flex h-full min-h-11 items-center px-3 text-sm font-medium transition-colors ${
    active
      ? "text-[var(--ink)] after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-sm after:bg-[var(--brand)]"
      : "text-[var(--ink-2)] hover:text-[var(--ink)]"
  }`;
}

function ApiReferenceNav({
  activePath,
  apiSpecs,
  onNavigate,
  menuId,
}: {
  activePath: string;
  apiSpecs: MainNavTargets["apiSpecs"];
  onNavigate?: () => void;
  menuId: string;
}) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = isApiReferencePath(activePath);
  const currentSpecId = activeApiSpecId(activePath, apiSpecs);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  if (apiSpecs.length === 1) {
    const href = localizeHref(apiSpecs[0]!.href, locale);
    return (
      <Link prefetch={false} href={href} onClick={onNavigate} className={tabClass(active)}>
        {t("nav.apiReference")}
      </Link>
    );
  }

  const menuHref = localizeHref("/reference", locale);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={`${menuId}-trigger`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`gap-1 ${tabClass(active)}`}
      >
        {t("nav.apiReference")}
        <ChevronDown
          className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className="api-card absolute left-0 top-full z-50 mt-1 min-w-[14rem] overflow-hidden rounded-md border py-1 shadow-lg"
        >
          <li role="none">
            <Link prefetch={false}
              href={menuHref}
              role="menuitem"
              onClick={() => {
                close();
                onNavigate?.();
              }}
              className="flex min-h-11 items-center px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--text-main)]"
            >
              {t("nav.allApiReferences")}
            </Link>
          </li>
          <li role="separator" className="api-divider my-1 border-t" />
          {apiSpecs.map((spec) => {
            const href = localizeHref(spec.href, locale);
            const isActive = spec.id === currentSpecId;
            return (
              <li key={spec.id} role="none">
                <Link prefetch={false}
                  href={href}
                  role="menuitem"
                  onClick={() => {
                    close();
                    onNavigate?.();
                  }}
                  className={`flex min-h-11 items-center px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--brand-soft)] font-medium text-[var(--text-main)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {spec.title}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function MainNavTabs({
  activePath,
  mainNav,
  onNavigate,
  className,
}: {
  activePath: string;
  mainNav: MainNavTargets;
  onNavigate?: () => void;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const menuId = useId();
  const docsHref = localizeHref(mainNav.docsHomeHref, locale);
  const hasApi = mainNav.apiSpecs.length > 0;

  return (
    <nav
      className={className ?? "ml-4 hidden h-full min-w-0 items-stretch gap-1 lg:flex"}
      aria-label={t("nav.mainNav")}
    >
      <Link prefetch={false}
        href={docsHref}
        onClick={onNavigate}
        className={tabClass(isDocumentationPath(activePath))}
      >
        {t("nav.documentation")}
      </Link>
      {hasApi ? (
        <ApiReferenceNav
          activePath={activePath}
          apiSpecs={mainNav.apiSpecs}
          onNavigate={onNavigate}
          menuId={menuId}
        />
      ) : null}
    </nav>
  );
}

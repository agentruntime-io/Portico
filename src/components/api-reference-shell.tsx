"use client";

import Link from "next/link";
import { Children } from "react";
import { ChevronRight, ExternalLink, KeyRound, Mail } from "lucide-react";
import { ApiMobileNav } from "@/components/api-mobile-nav";
import { ApiMethod } from "@/components/api-method";
import { AuthenticatedClientSamples } from "@/components/api-reference-controls";
import { DocsBrand, DocsHeader } from "@/components/docs-shell";
import { useI18n } from "@/components/i18n-provider";
import type { NavFile } from "@/lib/nav";
import type { SiteConfig } from "@/lib/site";
import type { OpenApiDocument, ResolvedOperation } from "@/lib/openapi/core";
import {
  apiOperationHref,
  getPrimarySecurityScheme,
  groupOperationsByTag,
  slugifyTag,
  stripApiPrefix,
} from "@/lib/openapi/core";
import { ApiSectionNav } from "@/components/api-section-nav";
import { ApiSpecSwitcher } from "@/components/api-spec-switcher";
import type { MainNavTargets } from "@/lib/main-nav";
import { openApiDownloadUrl } from "@/lib/main-nav";
import { PorticoAttribution } from "@/components/portico-attribution";

function ApiSidebar({
  siteName,
  specId,
  operations,
  apiSpecs,
  openApiFile,
  activeTag,
  activeSlug,
}: {
  siteName: string;
  specId: string;
  operations: ResolvedOperation[];
  apiSpecs: MainNavTargets["apiSpecs"];
  openApiFile: string;
  activeTag?: string;
  activeSlug?: string;
}) {
  const { t } = useI18n();
  const grouped = groupOperationsByTag(operations);

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 hidden w-[340px] flex-col overflow-hidden bg-[var(--sidebar-bg)] lg:flex"
      aria-label={t("nav.sectionNav")}
    >
      <div className="flex h-16 shrink-0 items-center px-4">
        <DocsBrand siteName={siteName} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
        <ApiSpecSwitcher specs={apiSpecs} activeSpecId={specId} />
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          <ApiSectionNav specId={specId} />
          <div className="mt-6 space-y-2">
            {[...grouped.entries()].map(([tag, tagOps]) => {
              const tagSlug = slugifyTag(tag);
              const tagActive = activeTag === tagSlug;
              return (
                <details key={tag} open={tagActive} className="group">
                  <summary
                    className={`flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium ${
                      tagActive ? "nav-active" : "nav-item-muted"
                    }`}
                  >
                    <span>{tag}</span>
                    <ChevronRight className="api-faint ml-auto h-3.5 w-3.5 transition group-open:rotate-90" />
                    <span className="api-faint text-xs">
                      {tagOps.length}
                    </span>
                  </summary>
                  <ul className="api-divider mt-1 space-y-0.5 border-l pl-3">
                    <li>
                      <Link
                        href={`/reference/${specId}/${tagSlug}`}
                        className="nav-item-muted api-faint block rounded-md px-2 py-1.5 text-sm"
                      >
                        {t("api.sectionOverview")}
                      </Link>
                    </li>
                    {tagOps.map((op) => {
                      const active = activeSlug === op.slug;
                      return (
                        <li key={op.slug}>
                          <Link
                            href={apiOperationHref(specId, op)}
                            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm leading-tight ${
                              active ? "nav-active" : "nav-item-muted"
                            }`}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {op.summary ?? stripApiPrefix(op.path)}
                            </span>
                            <ApiMethod method={op.method} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              );
            })}
          </div>
        </div>
        <div className="api-divider mt-3 space-y-3 border-t pt-3 text-sm">
          <a
            href={openApiDownloadUrl(openApiFile)}
            className="api-control flex items-center justify-center gap-2 rounded-md border px-3 py-2 font-medium"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("api.openApiClient")}
          </a>
          <div className="api-faint text-xs">
            <span>{t("api.poweredBy")}</span>
          </div>
          <PorticoAttribution />
        </div>
      </div>
    </aside>
  );
}

export { ApiMethod } from "@/components/api-method";

export function ApiMobileRightRail({
  doc,
  operation,
  className = "mt-12",
}: {
  doc: OpenApiDocument;
  operation?: ResolvedOperation;
  className?: string;
}) {
  const { t } = useI18n();
  const server = doc.servers?.[0];
  const security = getPrimarySecurityScheme(doc);
  const securityName = security?.[0] ?? "BearerAuth";
  const securityScheme = security?.[1];
  const path = operation ? `${server?.url ?? ""}${operation.path}` : server?.url;

  return (
    <section
      className={`${className} space-y-4 border-t border-[var(--panel-border)] pt-8 xl:hidden`}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {t("api.server")}
      </h2>
      <div className="api-card overflow-hidden rounded-lg border">
        <div className="api-divider break-all border-b px-4 py-3 font-mono text-xs sm:text-sm">
          {path}
        </div>
        <div className="api-faint px-4 py-2 text-sm">
          {server?.description ?? "Production"}
        </div>
      </div>
      <AuthenticatedClientSamples
        method={operation?.method}
        url={path ?? ""}
        securityName={securityName}
        securityDescription={securityScheme?.description}
      />
    </section>
  );
}

export function ApiRightRail({
  doc,
  operation,
}: {
  doc: OpenApiDocument;
  operation?: ResolvedOperation;
}) {
  const { t } = useI18n();
  const server = doc.servers?.[0];
  const security = getPrimarySecurityScheme(doc);
  const securityName = security?.[0] ?? "BearerAuth";
  const securityScheme = security?.[1];
  const path = operation ? `${server?.url ?? ""}${operation.path}` : server?.url;

  return (
    <aside className="hidden w-[380px] shrink-0 xl:block">
      <div className="sticky top-24 space-y-4">
        <div className="api-muted flex justify-end gap-4 pr-1">
          <a
            href="mailto:hello@agentruntime.io"
            aria-label={t("api.email")}
            className="ds-link nav-item-muted rounded-md p-1"
          >
            <Mail className="h-4 w-4" />
          </a>
          <span className="api-divider h-5 border-l" />
          <a
            href="https://www.agentruntime.io/legal"
            className="ds-link nav-item-muted inline-flex items-center gap-2 rounded-md px-1 text-sm font-semibold"
          >
            <KeyRound className="h-4 w-4" />
            {t("api.proprietary")}
          </a>
        </div>
        <div className="api-card overflow-hidden rounded-lg border">
          <div className="api-card-header border-b px-4 py-2 text-sm font-semibold">
            {t("api.server")}
          </div>
          <div className="api-divider break-all border-b px-4 py-3 font-mono text-xs sm:text-sm">
            {path}
          </div>
          <div className="api-faint px-4 py-2 text-sm">
            {server?.description ?? "Production"}
          </div>
        </div>
        <AuthenticatedClientSamples
          method={operation?.method}
          url={path ?? ""}
          securityName={securityName}
          securityDescription={securityScheme?.description}
        />
      </div>
    </aside>
  );
}

export function ApiReferenceShell({
  specId,
  siteName,
  nav,
  navbar,
  mainNav,
  openApiFile,
  operations,
  activeTag,
  activeSlug,
  children,
  rightRail,
}: {
  specId: string;
  siteName: string;
  nav: NavFile;
  navbar?: SiteConfig["navbar"];
  mainNav: MainNavTargets;
  openApiFile: string;
  operations: ResolvedOperation[];
  activeTag?: string;
  activeSlug?: string;
  children: React.ReactNode;
  rightRail?: React.ReactNode;
}) {
  const { t } = useI18n();
  const contentChildren = Children.toArray(children);
  const railChildren = Children.toArray(rightRail);
  const activePath = activeTag
    ? `/reference/${specId}/${activeTag}`
    : `/reference/${specId}`;
  return (
    <div className="min-h-screen bg-[var(--sidebar-bg)] text-[var(--text-main)]">
      <DocsHeader
        siteName={siteName}
        nav={nav}
        activePath={activePath}
        navbar={navbar}
        mainNav={mainNav}
        desktopSidebar="api"
      />
      <ApiSidebar
        siteName={siteName}
        specId={specId}
        operations={operations}
        apiSpecs={mainNav.apiSpecs}
        openApiFile={openApiFile}
        activeTag={activeTag}
        activeSlug={activeSlug}
      />
      <ApiMobileNav
        specId={specId}
        apiSpecs={mainNav.apiSpecs}
        operations={operations.map((op) => ({
          slug: op.slug,
          method: op.method,
          summary: op.summary,
          path: op.path,
          tags: op.tags,
        }))}
        activeTag={activeTag}
        activeSlug={activeSlug}
      />
      <main
        id="main-content"
        tabIndex={-1}
        aria-label={t("a11y.mainContent")}
        className="min-w-0 bg-[var(--panel-bg)] lg:ml-[340px] lg:rounded-tl-2xl"
      >
        <div className="mx-auto flex max-w-[1520px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:gap-14 lg:px-10 lg:py-10 xl:px-16">
          <div className="min-w-0 flex-1">{contentChildren}</div>
          {railChildren}
        </div>
      </main>
    </div>
  );
}

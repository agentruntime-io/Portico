"use client";

import Link from "next/link";
import { ChevronRight, ListTree, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ApiMethod } from "@/components/api-method";
import { useI18n } from "@/components/i18n-provider";
import { useDialog } from "@/lib/a11y/use-dialog";

type ApiOp = {
  slug: string;
  method: string;
  summary?: string;
  path: string;
  tags: string[];
};

function slugifyTag(tagName: string): string {
  return tagName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function tagSlugForOperation(op: ApiOp): string {
  const tag = op.tags[0] ?? "default";
  return slugifyTag(tag);
}

const sectionKeys = [
  ["api.sections.overview", "#overview"],
  ["api.sections.authentication", "#authentication"],
  ["api.sections.baseUrl", "#base-url"],
  ["api.sections.requestResponse", "#request--response-format"],
  ["api.sections.asyncModel", "#async-execution-model"],
  ["api.sections.stepTypes", "#step-types"],
  ["api.sections.templateVars", "#template-variables"],
  ["api.sections.errorHandling", "#error-handling"],
  ["api.sections.rateLimits", "#rate-limits"],
] as const;

export function ApiMobileNav({
  specId,
  operations,
  activeTag,
  activeSlug,
}: {
  specId: string;
  operations: ApiOp[];
  activeTag?: string;
  activeSlug?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialog(open, () => setOpen(false), dialogRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  const grouped = new Map<string, ApiOp[]>();
  for (const op of operations) {
    const tags = op.tags.length ? op.tags : ["default"];
    for (const tag of tags) {
      if (!grouped.has(tag)) grouped.set(tag, []);
      grouped.get(tag)!.push(op);
    }
  }

  const drawer =
    open && mounted
      ? createPortal(
          <div
            ref={dialogRef}
            className="fixed inset-0 z-[100] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.apiEndpoints")}
          >
            <button
              type="button"
              aria-label={t("nav.closeMenu")}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60"
            />
            <aside className="absolute bottom-0 left-0 top-14 flex w-[min(22rem,92vw)] flex-col border-r border-[var(--panel-border)] bg-[var(--sidebar-bg)] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--text-main)]">
                  {t("nav.apiEndpoints")}
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
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {t("nav.guideSections")}
                </p>
                <ul className="mb-4 space-y-0.5">
                  {sectionKeys.map(([key, href]) => (
                    <li key={href}>
                      <Link
                        href={`/reference/${specId}${href}`}
                        onClick={() => setOpen(false)}
                        className="nav-item-muted block rounded-md px-2 py-2 text-sm"
                      >
                        {t(key)}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {t("nav.operations")}
                </p>
                <div className="space-y-2">
                  {[...grouped.entries()].map(([tag, tagOps]) => {
                    const tagSlug = slugifyTag(tag);
                    const tagActive = activeTag === tagSlug;
                    return (
                      <details key={tag} open={tagActive} className="group">
                        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-[var(--text-main)] [&::-webkit-details-marker]:hidden">
                          <span className="min-w-0 flex-1 truncate">{tag}</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition group-open:rotate-90" />
                          <span className="text-xs text-[var(--text-muted)]">
                            {tagOps.length}
                          </span>
                        </summary>
                        <ul className="mt-1 space-y-0.5 border-l border-[var(--panel-border)] pl-3">
                          <li>
                            <Link
                              href={`/reference/${specId}/${tagSlug}`}
                              onClick={() => setOpen(false)}
                              className="nav-item-muted block rounded-md px-2 py-1.5 text-sm"
                            >
                              {t("api.sectionOverview")}
                            </Link>
                          </li>
                          {tagOps.map((op) => {
                            const active = activeSlug === op.slug;
                            return (
                              <li key={op.slug}>
                                <Link
                                  href={`/reference/${specId}/${tagSlugForOperation(op)}#${op.slug}`}
                                  onClick={() => setOpen(false)}
                                  className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                                    active ? "nav-active" : "nav-item-muted"
                                  }`}
                                >
                                  <span className="min-w-0 flex-1 truncate">
                                    {op.summary ?? op.path}
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
              </nav>
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="sticky top-14 z-30 border-b border-[var(--panel-border)] bg-[var(--sidebar-bg)] px-4 py-2 lg:hidden">
        <button
          type="button"
          aria-label={t("nav.apiEndpoints")}
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2.5 text-sm font-medium text-[var(--text-main)] hover:bg-emerald-500/10"
        >
          <ListTree className="h-4 w-4 shrink-0" aria-hidden />
          {t("nav.apiEndpoints")}
        </button>
      </div>
      {drawer}
    </>
  );
}

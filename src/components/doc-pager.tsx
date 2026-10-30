"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EditPageButton } from "@/components/edit-page-button";
import { useI18n } from "@/components/i18n-provider";
import type { PageNeighbor } from "@/lib/pager";

/**
 * Previous / next cards, followed by the "Edit this page" row. The edit row only
 * renders when the page has an edit URL; `repoLabel` (e.g. `owner/repo`) is shown muted
 * on its right and omitted when absent.
 */
export function DocPager({
  prev,
  next,
  editUrl,
  repoLabel,
}: {
  prev?: PageNeighbor;
  next?: PageNeighbor;
  editUrl?: string;
  repoLabel?: string;
}) {
  const { t } = useI18n();
  if (!prev && !next && !editUrl) return null;

  return (
    <>
      {prev || next ? (
        <nav aria-label={t("nav.pageNav")} className="doc-pager">
          {prev ? (
            <Link href={prev.href} rel="prev" className="doc-pager-card">
              <small>
                <ArrowLeft aria-hidden />
                {t("nav.previous")}
              </small>
              <b>{prev.title}</b>
            </Link>
          ) : null}
          {next ? (
            <Link
              href={next.href}
              rel="next"
              className="doc-pager-card doc-pager-next"
            >
              <small>
                {t("nav.next")}
                <ArrowRight aria-hidden />
              </small>
              <b>{next.title}</b>
            </Link>
          ) : null}
        </nav>
      ) : null}
      {editUrl ? (
        <div className="doc-edit-row">
          <EditPageButton url={editUrl} />
          {repoLabel ? <span className="doc-edit-repo">{repoLabel}</span> : null}
        </div>
      ) : null}
    </>
  );
}

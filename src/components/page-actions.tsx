"use client";

import { ChevronRight } from "lucide-react";
import { CopyPageButton } from "@/components/copy-page-button";
import { useI18n } from "@/components/i18n-provider";

/**
 * Breadcrumb row above the page title: "Group › Page title" in mono caps, with the
 * "Copy link" ghost button right-aligned. The group comes from the docs.json nav.
 */
export function PageCrumbs({
  groupLabel,
  title,
}: {
  groupLabel?: string;
  title: string;
}) {
  const { t } = useI18n();

  return (
    <div className="doc-crumbs">
      <nav aria-label={t("nav.breadcrumb")} className="doc-crumbs-trail">
        <ol>
          {groupLabel ? (
            <li className="doc-crumbs-group">
              <span>{groupLabel}</span>
              <ChevronRight aria-hidden className="doc-crumbs-sep" />
            </li>
          ) : null}
          <li className="doc-crumbs-page" aria-current="page">
            <span>{title}</span>
          </li>
        </ol>
      </nav>
      <CopyPageButton />
    </div>
  );
}

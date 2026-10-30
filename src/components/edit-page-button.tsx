"use client";

import { SquarePen } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export function EditPageButton({ url }: { url: string }) {
  const { t } = useI18n();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="doc-edit-link"
    >
      <SquarePen className="doc-edit-link-icon" aria-hidden />
      {t("nav.editPage")}
    </a>
  );
}

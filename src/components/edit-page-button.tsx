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
      className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-main)] sm:min-h-8"
    >
      <SquarePen className="h-3.5 w-3.5" aria-hidden />
      {t("nav.editPage")}
    </a>
  );
}

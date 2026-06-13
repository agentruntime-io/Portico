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
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:border-emerald-500/40 hover:text-[var(--text-main)]"
    >
      <SquarePen className="h-4 w-4" aria-hidden />
      {t("nav.editPage")}
    </a>
  );
}

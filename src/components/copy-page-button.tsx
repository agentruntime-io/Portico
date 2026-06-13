"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export function CopyPageButton() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        const value = window.location.href;
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          const textarea = document.createElement("textarea");
          textarea.value = value;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:border-emerald-500/40 hover:text-[var(--text-main)]"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      {copied ? t("copy.copiedLink") : t("copy.copyLink")}
    </button>
  );
}

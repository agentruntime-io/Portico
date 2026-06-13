"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { useI18n } from "@/components/i18n-provider";

export function CodeCopyButton({ code }: { code: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [code]);

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      aria-label={copied ? t("copy.copiedCode") : t("copy.copyCode")}
      className="code-copy-btn inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg)]/90 text-[var(--text-muted)] backdrop-blur transition hover:text-[var(--text-main)]"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
    </button>
  );
}

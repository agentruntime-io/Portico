"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";

/**
 * Copy button for a code block header. `code` may be a function so the text is read
 * from the DOM at click time (tabbed groups, enhanced blocks).
 */
export function CodeCopyButton({ code }: { code: string | (() => string) }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = useCallback(async () => {
    const value = typeof code === "function" ? code() : code;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [code]);

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      aria-label={copied ? t("copy.copiedCode") : t("copy.copyCode")}
      className="code-copy-btn"
    >
      {copied ? (
        <Check className="code-copy-icon code-copy-done" aria-hidden />
      ) : (
        <Copy className="code-copy-icon" aria-hidden />
      )}
      <span aria-hidden>{copied ? t("copy.copied") : t("copy.copy")}</span>
    </button>
  );
}

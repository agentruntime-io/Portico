"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export function CopyPageButton() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const label = copied ? t("copy.copiedLink") : t("copy.copyLink");

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
      aria-label={label}
      className="doc-ghost-btn"
    >
      {copied ? (
        <Check className="doc-ghost-btn-icon doc-ghost-btn-done" aria-hidden />
      ) : (
        <Copy className="doc-ghost-btn-icon" aria-hidden />
      )}
      <span className="doc-ghost-btn-label">{label}</span>
    </button>
  );
}

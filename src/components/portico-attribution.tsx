"use client";

import { useI18n } from "@/components/i18n-provider";

const AGENTRUNTIME_URL = "https://www.agentruntime.io";

export function PorticoAttribution() {
  const { t } = useI18n();

  return (
    <p className="border-t border-[var(--panel-border)] px-2 pt-4 text-xs leading-relaxed text-[var(--text-muted)]">
      <a
        href={AGENTRUNTIME_URL}
        className="font-medium text-[var(--text-main)] underline-offset-2 hover:underline"
        rel="noopener noreferrer"
      >
        {t("attribution.portico")}
      </a>{" "}
      {t("attribution.openSourceFrom")}{" "}
      <a
        href={AGENTRUNTIME_URL}
        className="underline-offset-2 hover:underline"
        rel="noopener noreferrer"
      >
        {t("attribution.agentRuntime")}
      </a>
    </p>
  );
}

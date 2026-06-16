"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { fontScaleLevels } from "@/lib/theme-tokens";

export function FontScaleControls() {
  const { t } = useI18n();
  const [index, setIndex] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("doc-font-scale");
    const parsed = stored ? Number(stored) : 1;
    const nextIndex = fontScaleLevels.findIndex((level) => level === parsed);
    setIndex(nextIndex >= 0 ? nextIndex : 1);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const value = fontScaleLevels[index] ?? 1;
    document.documentElement.style.setProperty("--doc-font-scale", String(value));
    window.localStorage.setItem("doc-font-scale", String(value));
  }, [index, ready]);

  const current = Math.round((fontScaleLevels[index] ?? 1) * 100);

  return (
    <div
      role="group"
      aria-label={t("fontScale.group")}
      className="ds-control inline-flex shrink-0 overflow-hidden rounded-lg text-xs font-semibold"
    >
      <button
        type="button"
        aria-label={t("fontScale.decrease")}
        disabled={index === 0}
        onClick={() => setIndex((currentIndex) => Math.max(0, currentIndex - 1))}
        className="px-2.5 py-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        A-
      </button>
      <span className="api-divider border-l" aria-hidden />
      <span className="sr-only" aria-live="polite">
        {current}%
      </span>
      <button
        type="button"
        aria-label={t("fontScale.increase")}
        disabled={index === fontScaleLevels.length - 1}
        onClick={() =>
          setIndex((currentIndex) =>
            Math.min(fontScaleLevels.length - 1, currentIndex + 1),
          )
        }
        className="px-2.5 py-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        A+
      </button>
    </div>
  );
}

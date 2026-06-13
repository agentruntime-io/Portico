"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";

const levels = [0.9, 1, 1.1, 1.2] as const;

export function FontScaleControls() {
  const { t } = useI18n();
  const [index, setIndex] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("doc-font-scale");
      const parsed = stored ? Number(stored) : 1;
      const nextIndex = levels.findIndex((level) => level === parsed);
      setIndex(nextIndex >= 0 ? nextIndex : 1);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const value = levels[index];
    document.documentElement.style.setProperty("--doc-font-scale", String(value));
    window.localStorage.setItem("doc-font-scale", String(value));
  }, [index, ready]);

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
        onClick={() => setIndex((current) => Math.max(0, current - 1))}
        className="px-2.5 py-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        A-
      </button>
      <span className="api-divider border-l" aria-hidden />
      <button
        type="button"
        aria-label={t("fontScale.increase")}
        disabled={index === levels.length - 1}
        onClick={() =>
          setIndex((current) => Math.min(levels.length - 1, current + 1))
        }
        className="px-2.5 py-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        A+
      </button>
    </div>
  );
}

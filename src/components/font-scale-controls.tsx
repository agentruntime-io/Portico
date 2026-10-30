"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import type { MessageKey } from "@/lib/i18n";
import { fontScaleLevels } from "@/lib/theme-tokens";

// One "A" per level in fontScaleLevels (0.9 / 1 / 1.1 / 1.2), drawn at a matching size.
const LEVELS: { labelKey: MessageKey; fontSize: number }[] = [
  { labelKey: "fontScale.smaller", fontSize: 11 },
  { labelKey: "fontScale.default", fontSize: 13 },
  { labelKey: "fontScale.larger", fontSize: 15 },
  { labelKey: "fontScale.largest", fontSize: 17 },
];

export function FontScaleControls({
  className = "",
}: {
  /** Kept for existing call sites; the segmented control has a single size. */
  compact?: boolean;
  className?: string;
}) {
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
      className={`pref-seg shrink-0 ${className}`}
    >
      {fontScaleLevels.map((level, i) => {
        const { labelKey, fontSize } = LEVELS[i] ?? LEVELS[1];
        return (
          <button
            key={level}
            type="button"
            aria-label={t(labelKey)}
            title={t(labelKey)}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
            className="pref-seg-btn"
            style={{ fontSize, fontWeight: 600 }}
          >
            A
          </button>
        );
      })}
      <span className="sr-only" aria-live="polite">
        {current}%
      </span>
    </div>
  );
}

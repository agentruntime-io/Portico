"use client";

import { useI18n } from "@/components/i18n-provider";

export function SkipLink() {
  const { t } = useI18n();
  return (
    <a href="#main-content" className="skip-link">
      {t("a11y.skipToContent")}
    </a>
  );
}

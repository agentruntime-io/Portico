"use client";

import {
  AlertTriangle,
  Info as InfoIcon,
  Lightbulb,
} from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/components/i18n-provider";

function Callout({
  kind,
  children,
}: {
  kind: "note" | "warning" | "info";
  children: ReactNode;
}) {
  const { t } = useI18n();
  const styles = {
    note: "ds-callout ds-callout-note",
    warning: "ds-callout ds-callout-warning",
    info: "ds-callout ds-callout-info",
  };
  const labelKeys = {
    note: "callout.note",
    warning: "callout.warning",
    info: "callout.info",
  } as const;
  const icons = { note: Lightbulb, warning: AlertTriangle, info: InfoIcon };
  const Icon = icons[kind];

  return (
    <div className={styles[kind]} role="note">
      <div className="ds-callout-row">
        <span className="ds-callout-icon" aria-hidden>
          <Icon />
        </span>
        <div className="ds-callout-main">
          <div className="ds-callout-title">{t(labelKeys[kind])}</div>
          <div className="ds-callout-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <Callout kind="note">{children}</Callout>;
}

export function Warning({ children }: { children: ReactNode }) {
  return <Callout kind="warning">{children}</Callout>;
}

export function Info({ children }: { children: ReactNode }) {
  return <Callout kind="info">{children}</Callout>;
}

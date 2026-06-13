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
    <div className={styles[kind]}>
      <p className="mb-2 flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        {t(labelKeys[kind])}
      </p>
      <div className="[&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{children}</div>
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

import {
  AlertTriangle,
  Info as InfoIcon,
  Lightbulb,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { translate } from "@/lib/i18n";

function Callout({
  kind,
  locale,
  children,
}: {
  kind: "note" | "warning" | "info";
  locale: Locale;
  children: ReactNode;
}) {
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
        {translate(locale, labelKeys[kind])}
      </p>
      <div className="[&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}

export function createCalloutComponents(locale: Locale) {
  return {
    Note: ({ children }: { children: ReactNode }) => (
      <Callout kind="note" locale={locale}>
        {children}
      </Callout>
    ),
    Warning: ({ children }: { children: ReactNode }) => (
      <Callout kind="warning" locale={locale}>
        {children}
      </Callout>
    ),
    Info: ({ children }: { children: ReactNode }) => (
      <Callout kind="info" locale={locale}>
        {children}
      </Callout>
    ),
  };
}

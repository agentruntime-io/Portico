import {
  AlertTriangle,
  CheckCircle2,
  Info as InfoIcon,
  Lightbulb,
  OctagonAlert,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { translate } from "@/lib/i18n";

type CalloutKind = "note" | "warning" | "info" | "tip" | "check" | "danger";

function Callout({
  kind,
  locale,
  children,
}: {
  kind: CalloutKind;
  locale: Locale;
  children: ReactNode;
}) {
  const styles = {
    note: "ds-callout ds-callout-note",
    warning: "ds-callout ds-callout-warning",
    info: "ds-callout ds-callout-info",
    tip: "ds-callout ds-callout-tip",
    check: "ds-callout ds-callout-check",
    danger: "ds-callout ds-callout-danger",
  };
  const labelKeys = {
    note: "callout.note",
    warning: "callout.warning",
    info: "callout.info",
    tip: "callout.tip",
    check: "callout.check",
    danger: "callout.danger",
  } as const;
  const icons = {
    note: Lightbulb,
    warning: AlertTriangle,
    info: InfoIcon,
    tip: Sparkles,
    check: CheckCircle2,
    danger: OctagonAlert,
  };
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
    Tip: ({ children }: { children: ReactNode }) => (
      <Callout kind="tip" locale={locale}>
        {children}
      </Callout>
    ),
    Check: ({ children }: { children: ReactNode }) => (
      <Callout kind="check" locale={locale}>
        {children}
      </Callout>
    ),
    Danger: ({ children }: { children: ReactNode }) => (
      <Callout kind="danger" locale={locale}>
        {children}
      </Callout>
    ),
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

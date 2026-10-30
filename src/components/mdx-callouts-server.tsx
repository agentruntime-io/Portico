import {
  AlertTriangle,
  CircleCheckBig,
  Info as InfoIcon,
  Lightbulb,
  OctagonAlert,
  StickyNote,
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
    note: StickyNote,
    warning: AlertTriangle,
    info: InfoIcon,
    tip: Lightbulb,
    check: CircleCheckBig,
    danger: OctagonAlert,
  };
  const Icon = icons[kind];

  return (
    <div className={styles[kind]} role="note">
      <div className="ds-callout-row">
        <span className="ds-callout-icon" aria-hidden>
          <Icon />
        </span>
        <div className="ds-callout-main">
          <div className="ds-callout-title">
            {translate(locale, labelKeys[kind])}
          </div>
          <div className="ds-callout-content">{children}</div>
        </div>
      </div>
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

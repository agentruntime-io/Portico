import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Cable,
  CalendarClock,
  CreditCard,
  Eye,
  GitPullRequest,
  Inbox,
  Info as InfoIcon,
  KeyRound,
  Layers,
  Plug,
  Rocket,
  Shield,
  ShoppingBag,
  UserPlus,
  Webhook,
  Workflow,
  Wrench,
} from "lucide-react";
import { isValidElement, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { defaultLocale } from "@/lib/i18n";
import { localizeHref } from "@/lib/locale-routing";

const iconMap: Record<string, LucideIcon> = {
  rocket: Rocket,
  workflow: Workflow,
  plug: Plug,
  cable: Cable,
  brain: Brain,
  "key-round": KeyRound,
  "credit-card": CreditCard,
  inbox: Inbox,
  webhook: Webhook,
  eye: Eye,
  wrench: Wrench,
  shield: Shield,
  layers: Layers,
  "shopping-bag": ShoppingBag,
  "git-pull-request": GitPullRequest,
  "calendar-clock": CalendarClock,
  "user-plus": UserPlus,
  "book-open": BookOpen,
};

function unwrapSingleParagraph(children: ReactNode): ReactNode {
  if (
    isValidElement<{ children?: ReactNode }>(children) &&
    children.type === "p"
  ) {
    return children.props.children;
  }
  return children;
}

export function Card({
  title,
  href,
  icon,
  children,
  className,
  locale = defaultLocale,
}: {
  title?: ReactNode;
  href?: string;
  icon?: string;
  children?: ReactNode;
  className?: string;
  size?: number;
  locale?: Locale;
}) {
  const Icon = icon ? iconMap[icon] : undefined;
  const inner = (
    <>
      {Icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)]">
          <Icon className="h-[18px] w-[18px] text-emerald-700 dark:text-emerald-400" aria-hidden />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        {title ? (
          <span className="block text-[15px] font-semibold leading-6 text-[var(--text-main)]">
            {title}
          </span>
        ) : null}
        {children ? (
          <div className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            {unwrapSingleParagraph(children)}
          </div>
        ) : null}
      </div>
      {href ? (
        <ArrowUpRight
          className="mt-1 h-4 w-4 shrink-0 text-[var(--text-muted)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent-strong)]"
          aria-hidden
        />
      ) : null}
    </>
  );
  const cls =
    `ds-card group flex h-full flex-row items-start gap-4 rounded-xl border border-transparent bg-[var(--surface-muted)] p-5 no-underline transition hover:border-emerald-500/35 hover:bg-[var(--sidebar-bg)] hover:shadow-sm ` +
    (className ?? "");
  if (href) {
    return (
      <Link href={localizeHref(href, locale)} className={cls}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function CardGroup({
  cols,
  children,
}: {
  cols?: number;
  children: ReactNode;
}) {
  const grid =
    cols === 3
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : cols === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2";
  return (
    <div className={`not-prose my-7 grid grid-cols-1 gap-3 ${grid}`}>{children}</div>
  );
}

export function Icon({
  icon,
  className,
}: {
  icon: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  const Lucide = iconMap[icon] ?? InfoIcon;
  return (
    <Lucide
      className={className ?? "h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"}
      aria-hidden
    />
  );
}

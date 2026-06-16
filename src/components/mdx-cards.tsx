import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
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
import type { ReactNode } from "react";
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
        <Icon className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
      ) : null}
      <div className="flex flex-col gap-1">
        {title ? (
          <span className="text-base font-semibold text-[var(--text-main)]">
            {title}
          </span>
        ) : null}
        {children ? (
          <div className="text-sm leading-relaxed text-[var(--text-muted)]">
            {children}
          </div>
        ) : null}
      </div>
    </>
  );
  const cls =
    `ds-card rounded-2xl flex flex-col gap-3 border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 no-underline shadow-sm transition hover:border-emerald-500/50 hover:bg-emerald-500/5 ` +
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
    <div className={`not-prose my-6 grid grid-cols-1 gap-4 ${grid}`}>{children}</div>
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

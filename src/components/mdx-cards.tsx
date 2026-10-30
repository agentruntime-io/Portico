import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Bell,
  Bot,
  Brain,
  Cable,
  CalendarClock,
  Calendar,
  ChartColumn,
  Check,
  CircleCheck,
  CircleHelp,
  Clock,
  Cloud,
  Cpu,
  CreditCard,
  Database,
  Download,
  Eye,
  FileText,
  FlaskConical,
  Folder,
  GitBranch,
  GitPullRequest,
  Globe,
  Inbox,
  Info as InfoIcon,
  KeyRound,
  Layers,
  Lightbulb,
  Link as LinkIcon,
  Lock,
  Mail,
  MessageSquare,
  Package,
  Play,
  Plug,
  Puzzle,
  Rocket,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Terminal,
  TriangleAlert,
  Upload,
  User,
  UserPlus,
  Users,
  Webhook,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";
import { isValidElement, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { defaultLocale } from "@/lib/i18n";
import { localizeHref } from "@/lib/locale-routing";
import { navIconMap } from "@/lib/nav-icons";

/**
 * Icon names authors can use in MDX (`icon="rocket"`). Starts from the docs.json
 * navigation icons, then adds the common Lucide names. Imported one by one so the
 * bundle does not carry the whole Lucide set. Names are kebab-case Lucide names.
 */
const iconMap: Record<string, LucideIcon> = {
  ...navIconMap,
  activity: Activity,
  bell: Bell,
  book: BookOpen,
  "book-open": BookOpen,
  bot: Bot,
  brain: Brain,
  cable: Cable,
  calendar: Calendar,
  "calendar-clock": CalendarClock,
  "chart-column": ChartColumn,
  check: Check,
  "circle-check": CircleCheck,
  "circle-help": CircleHelp,
  clock: Clock,
  cloud: Cloud,
  cpu: Cpu,
  card: CreditCard,
  "credit-card": CreditCard,
  database: Database,
  download: Download,
  eye: Eye,
  "file-text": FileText,
  "flask-conical": FlaskConical,
  folder: Folder,
  "git-branch": GitBranch,
  "git-pull-request": GitPullRequest,
  globe: Globe,
  inbox: Inbox,
  info: InfoIcon,
  key: KeyRound,
  "key-round": KeyRound,
  layers: Layers,
  lightbulb: Lightbulb,
  link: LinkIcon,
  lock: Lock,
  mail: Mail,
  "message-square": MessageSquare,
  package: Package,
  play: Play,
  plug: Plug,
  puzzle: Puzzle,
  rocket: Rocket,
  search: Search,
  server: Server,
  settings: Settings,
  shield: Shield,
  "shield-check": ShieldCheck,
  "shopping-bag": ShoppingBag,
  "sliders-horizontal": SlidersHorizontal,
  sparkles: Sparkles,
  star: Star,
  terminal: Terminal,
  "triangle-alert": TriangleAlert,
  upload: Upload,
  user: User,
  "user-plus": UserPlus,
  users: Users,
  webhook: Webhook,
  workflow: Workflow,
  wrench: Wrench,
  zap: Zap,
};

/** Authored icon name to its iconMap key (case and `_`/space insensitive). */
function iconKey(name?: string): string | undefined {
  if (!name) return undefined;
  const key = name.trim().toLowerCase().replace(/[_\s]+/g, "-");
  return key in iconMap ? key : undefined;
}

/** Renders a named icon, or `fallback` (default: nothing) when the name is unknown. */
function NamedIcon({
  name,
  className,
  fallback,
}: {
  name?: string;
  className?: string;
  fallback?: LucideIcon;
}) {
  const key = iconKey(name);
  const Lucide = key ? iconMap[key] : fallback;
  return Lucide ? <Lucide className={className} aria-hidden /> : null;
}

export function unwrapSingleParagraph(children: ReactNode): ReactNode {
  if (
    isValidElement<{ children?: ReactNode }>(children) &&
    children.type === "p"
  ) {
    return children.props.children;
  }
  return children;
}

/** Square icon tile shared by cards, bands and task rows. Renders nothing for an unknown icon. */
export function IconTile({ icon }: { icon?: string }) {
  if (!iconKey(icon)) return null;
  return (
    <span className="hm-tile" aria-hidden>
      <NamedIcon name={icon} />
    </span>
  );
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
  const inner = (
    <>
      <IconTile icon={icon} />
      <div className="hm-card-body">
        {title ? <h3 className="hm-card-title">{title}</h3> : null}
        {children ? (
          <div className="hm-card-desc">{unwrapSingleParagraph(children)}</div>
        ) : null}
      </div>
      {href ? <ArrowUpRight className="hm-card-go" aria-hidden /> : null}
    </>
  );
  // `ds-card` stays as a stable hook: prose link rules exclude it.
  const cls = `hm-card ds-card not-prose${className ? ` ${className}` : ""}`;
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
  const n = cols === 1 || cols === 3 || cols === 4 ? cols : 2;
  return (
    <div className="hm-cg not-prose">
      <div className="hm-cg-grid" data-cols={n}>
        {children}
      </div>
    </div>
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
  return (
    <NamedIcon
      name={icon}
      fallback={InfoIcon}
      className={className ?? "h-5 w-5 shrink-0 text-[var(--brand-ink)]"}
    />
  );
}

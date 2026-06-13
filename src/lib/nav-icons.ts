import {
  BookOpen,
  Bot,
  Braces,
  Code2,
  FileClock,
  Home,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Map,
  Plug,
  Rocket,
  Terminal,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/** docs.json icon names → Lucide components. */
export const navIconMap: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  bot: Bot,
  brackets: Braces,
  code: Code2,
  history: FileClock,
  house: Home,
  "layout-dashboard": LayoutDashboard,
  "life-buoy": LifeBuoy,
  layers: Layers,
  map: Map,
  plug: Plug,
  rocket: Rocket,
  terminal: Terminal,
  workflow: Workflow,
};

export function navIcon(name?: string, fallback: LucideIcon = BookOpen): LucideIcon {
  if (!name) return fallback;
  return navIconMap[name] ?? fallback;
}

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { createCalloutComponents } from "@/components/mdx-callouts-server";
import { Card, CardGroup, Icon } from "@/components/mdx-cards";
import {
  Band,
  Hero,
  HeroAction,
  HeroAside,
  HomePage,
  Section,
  Task,
  TaskList,
} from "@/components/mdx-home";
import {
  Accordion,
  AccordionGroup,
  CodeGroup,
  Expandable,
  Frame,
  Tab,
  Tabs,
} from "@/components/mdx-layout";
import { Step, Steps } from "@/components/mdx-steps";
import type { Locale } from "@/lib/i18n";
import { localizeHref } from "@/lib/locale-routing";

function LocalizedLink({
  href,
  children,
  className,
  locale,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
  locale: Locale;
} & Omit<ComponentProps<typeof Link>, "href" | "children" | "className">) {
  return (
    <Link href={localizeHref(href, locale)} className={className} {...rest}>
      {children}
    </Link>
  );
}

/** Server-safe MDX components for next-mdx-remote/rsc (no client boundaries). */
export function createRscMdxComponents(locale: Locale) {
  const callouts = createCalloutComponents(locale);

  return {
    Steps,
    Step,
    ...callouts,
    Tab,
    Tabs,
    CodeGroup,
    Accordion,
    AccordionGroup,
    Frame,
    Expandable,
    Card: (props: ComponentProps<typeof Card>) => (
      <Card {...props} locale={locale} />
    ),
    CardGroup,
    Icon,
    Hero,
    HeroAction: (props: ComponentProps<typeof HeroAction>) => (
      <HeroAction {...props} locale={locale} />
    ),
    // Rendered as-is: Hero finds its aside child by component identity.
    HeroAside,
    HomePage,
    Section: (props: ComponentProps<typeof Section>) => (
      <Section {...props} locale={locale} />
    ),
    Band: (props: ComponentProps<typeof Band>) => (
      <Band {...props} locale={locale} />
    ),
    TaskList,
    Task: (props: ComponentProps<typeof Task>) => (
      <Task {...props} locale={locale} />
    ),
    a: (props: ComponentProps<typeof LocalizedLink>) => (
      <LocalizedLink {...props} locale={locale} />
    ),
  };
}

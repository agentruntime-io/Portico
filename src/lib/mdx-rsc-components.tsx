import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { createCalloutComponents } from "@/components/mdx-callouts-server";
import { Card, CardGroup, Icon } from "@/components/mdx-cards";
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
    Card: (props: ComponentProps<typeof Card>) => (
      <Card {...props} locale={locale} />
    ),
    CardGroup,
    Icon,
    a: (props: ComponentProps<typeof LocalizedLink>) => (
      <LocalizedLink {...props} locale={locale} />
    ),
  };
}

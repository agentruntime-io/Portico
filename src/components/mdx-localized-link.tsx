"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { useI18n } from "@/components/i18n-provider";
import { localizeHref } from "@/lib/locale-routing";

export function MdxLocalizedLink({
  href,
  children,
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "children" | "className">) {
  const { locale } = useI18n();
  return (
    <Link href={localizeHref(href, locale)} className={className} {...rest}>
      {children}
    </Link>
  );
}

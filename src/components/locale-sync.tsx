"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { localeFromPathname } from "@/lib/locale-routing";

export function LocaleSync() {
  const pathname = usePathname();
  const { setLocaleFromPath } = useI18n();

  useEffect(() => {
    setLocaleFromPath(localeFromPathname(pathname));
  }, [pathname, setLocaleFromPath]);

  return null;
}

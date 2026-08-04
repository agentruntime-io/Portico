"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LegacyOperationHashRedirect({
  hrefBySlug,
}: {
  hrefBySlug: Record<string, string>;
}) {
  const router = useRouter();

  useEffect(() => {
    const operationSlug = decodeURIComponent(window.location.hash.slice(1));
    const target = hrefBySlug[operationSlug];
    if (target) router.replace(target);
  }, [hrefBySlug, router]);

  return null;
}

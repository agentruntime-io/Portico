"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { ApiSpecNavEntry } from "@/lib/main-nav";
import { localizeHref } from "@/lib/locale-routing";

export function ApiSpecSwitcher({
  specs,
  activeSpecId,
  className,
  onNavigate,
}: {
  specs: ApiSpecNavEntry[];
  activeSpecId: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const { t, locale } = useI18n();

  if (specs.length <= 1) return null;

  const active = specs.find((spec) => spec.id === activeSpecId);

  return (
    <div className={className}>
      <p className="api-faint mb-1.5 px-2 text-xs font-medium uppercase tracking-wide">
        {t("api.selectSpec")}
      </p>
      <details className="group relative">
        <summary className="api-control flex cursor-pointer list-none items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
          <span className="min-w-0 flex-1 truncate">
            {active?.title ?? t("nav.apiReference")}
          </span>
          <ChevronDown className="api-faint h-4 w-4 shrink-0 transition group-open:rotate-180" />
        </summary>
        <ul className="api-card absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-md border py-1 shadow-lg">
          {specs.map((spec) => {
            const href = localizeHref(spec.href, locale);
            const isActive = spec.id === activeSpecId;
            return (
              <li key={spec.id}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  className={`block px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-emerald-500/15 font-medium text-[var(--text-main)]"
                      : "text-[var(--text-muted)] hover:bg-emerald-500/10 hover:text-[var(--text-main)]"
                  }`}
                >
                  {spec.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </details>
    </div>
  );
}

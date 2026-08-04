"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Rss } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export function ChangelogToolbar({
  areas,
  versions,
}: {
  areas: string[];
  versions: string[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const area = searchParams.get("area") ?? "";
  const version = searchParams.get("version") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    router.push(query ? `/changelog?${query}` : "/changelog", { scroll: false });
  }

  return (
    <div className="changelog-toolbar flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {areas.length > 0 ? (
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <span className="sr-only">{t("changelog.filterArea")}</span>
            <select
              value={area}
              onChange={(event) => updateParam("area", event.target.value)}
              className="changelog-select ds-control h-9 rounded-lg px-3 text-sm"
              aria-label={t("changelog.filterArea")}
            >
              <option value="">{t("changelog.allAreas")}</option>
              {areas.map((item) => (
                <option key={item} value={item}>
                  {formatLabel(item)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {versions.length > 0 ? (
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <span className="sr-only">{t("changelog.filterVersion")}</span>
            <select
              value={version}
              onChange={(event) => updateParam("version", event.target.value)}
              className="changelog-select ds-control h-9 rounded-lg px-3 text-sm"
              aria-label={t("changelog.filterVersion")}
            >
              <option value="">{t("changelog.allVersions")}</option>
              {versions.map((item) => (
                <option key={item} value={item}>
                  v{item}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <a
        href="/changelog/rss.xml"
        className="changelog-subscribe ds-control inline-flex h-9 items-center gap-2 self-start rounded-lg px-3 text-sm font-medium sm:self-auto"
      >
        <Rss className="h-4 w-4" aria-hidden />
        {t("changelog.subscribeRss")}
      </a>
    </div>
  );
}

function formatLabel(value: string): string {
  return value
    .split(/[-_/]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

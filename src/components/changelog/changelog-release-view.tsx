import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MarkdownBody } from "@/components/markdown-body";
import type { ChangelogRelease, ChangelogSectionKey } from "@/lib/changelog";
import { CHANGELOG_SECTIONS } from "@/lib/changelog";

const SECTION_LABELS: Record<ChangelogSectionKey, string> = {
  added: "Added",
  changed: "Changed",
  deprecated: "Deprecated",
  removed: "Removed",
  fixed: "Fixed",
  security: "Security",
};

export function ChangelogReleaseView({
  release,
  prev,
  next,
  labels,
}: {
  release: ChangelogRelease;
  prev?: ChangelogRelease;
  next?: ChangelogRelease;
  labels: {
    back: string;
    previous: string;
    next: string;
  };
}) {
  const hasStructured = CHANGELOG_SECTIONS.some((key) => release.sections[key]?.length);

  return (
    <article className="changelog-release mx-auto max-w-3xl">
      <Link
        href="/changelog"
        className="changelog-back inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {labels.back}
      </Link>

      <header className="mt-6 border-b border-[var(--panel-border)] pb-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <time dateTime={release.date} className="changelog-date font-medium text-[var(--text-main)]">
            {formatDisplayDate(release.date)}
          </time>
          {release.version ? (
            <span className="changelog-version ds-badge rounded-full px-2 py-0.5 text-xs font-semibold">
              v{release.version}
            </span>
          ) : null}
          {release.areas.map((area) => (
            <span
              key={area}
              className="changelog-area rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
            >
              {formatArea(area)}
            </span>
          ))}
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--text-main)] sm:text-3xl">
          {release.title}
        </h1>
        {release.summary ? (
          <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
            {release.summary}
          </p>
        ) : null}
      </header>

      {hasStructured ? (
        <div className="mt-8 space-y-8">
          {CHANGELOG_SECTIONS.map((key) => {
            const items = release.sections[key];
            if (!items?.length) return null;
            return (
              <section key={key} className="changelog-section">
                <h2 className="changelog-section-title text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {SECTION_LABELS[key]}
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--text-main)] sm:text-base">
                  {items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : null}

      {release.bodyHtml ? (
        <div className="changelog-body doc-prose mt-8 max-w-none">
          <MarkdownBody html={release.bodyHtml} />
        </div>
      ) : null}

      <nav
        className="changelog-pager mt-12 flex flex-col gap-3 border-t border-[var(--panel-border)] pt-6 sm:flex-row sm:justify-between"
        aria-label={labels.previous}
      >
        {prev ? (
          <Link
            href={prev.href}
            className="changelog-pager-link group flex flex-col gap-1 rounded-lg border border-[var(--panel-border)] p-4 transition hover:border-emerald-500/40"
          >
            <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              {labels.previous}
            </span>
            <span className="font-medium text-[var(--text-main)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={next.href}
            className="changelog-pager-link group flex flex-col gap-1 rounded-lg border border-[var(--panel-border)] p-4 text-right transition hover:border-emerald-500/40 sm:ml-auto"
          >
            <span className="flex items-center justify-end gap-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              {labels.next}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="font-medium text-[var(--text-main)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              {next.title}
            </span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}

function formatDisplayDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatArea(value: string): string {
  return value
    .split(/[-_/]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

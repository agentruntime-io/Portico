import Link from "next/link";
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

export function ChangelogTimeline({
  releases,
  emptyMessage,
  readMoreLabel,
}: {
  releases: ChangelogRelease[];
  emptyMessage: string;
  readMoreLabel: string;
}) {
  if (!releases.length) {
    return (
      <p className="changelog-empty rounded-xl border border-dashed border-[var(--panel-border)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ol className="changelog-timeline relative space-y-0">
      {releases.map((release, index) => (
        <li key={release.slug} className="changelog-timeline-item relative pl-8 pb-10 last:pb-0">
          {index < releases.length - 1 ? (
            <span
              className="changelog-timeline-line absolute left-[11px] top-3 bottom-0 w-px bg-[var(--panel-border)]"
              aria-hidden
            />
          ) : null}
          <span
            className="changelog-timeline-dot absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full border-2 border-emerald-500/60 bg-[var(--panel-bg)]"
            aria-hidden
          />
          <article className="changelog-card rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <time
                dateTime={release.date}
                className="changelog-date font-medium text-[var(--text-main)]"
              >
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
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-[var(--text-main)] sm:text-xl">
              <Link href={release.href} className="changelog-title-link hover:text-emerald-600 dark:hover:text-emerald-400">
                {release.title}
              </Link>
            </h2>
            {release.summary ? (
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {release.summary}
              </p>
            ) : null}
            <SectionPreview sections={release.sections} />
            <Link
              href={release.href}
              className="changelog-read-more mt-4 inline-flex text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              {readMoreLabel} →
            </Link>
          </article>
        </li>
      ))}
    </ol>
  );
}

function SectionPreview({
  sections,
}: {
  sections: Partial<Record<ChangelogSectionKey, string[]>>;
}) {
  const highlights: string[] = [];
  for (const key of CHANGELOG_SECTIONS) {
    const items = sections[key];
    if (!items?.length) continue;
    highlights.push(...items.slice(0, 2));
    if (highlights.length >= 3) break;
  }
  if (!highlights.length) return null;

  return (
    <ul className="mt-3 space-y-1.5 text-sm text-[var(--text-muted)]">
      {highlights.slice(0, 3).map((item) => (
        <li key={item} className="flex gap-2">
          <span className="text-emerald-500" aria-hidden>
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
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

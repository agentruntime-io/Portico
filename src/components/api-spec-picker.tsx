import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { OpenApiSpecEntry } from "@/lib/site";

export function ApiSpecPicker({
  specs,
  descriptions,
  labels,
}: {
  specs: OpenApiSpecEntry[];
  descriptions: Record<string, string>;
  labels: {
    title: string;
    description: string;
    viewReference: string;
  };
}) {
  return (
    <div className="mx-auto max-w-3xl px-2 pt-8 sm:px-0 sm:pt-12 lg:pt-14">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)] sm:text-4xl">
          {labels.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">
          {labels.description}
        </p>
      </header>
      <ul className="space-y-4">
        {specs.map((spec) => {
          const description = descriptions[spec.id];
          return (
            <li key={spec.id}>
              <Link
                href={`/reference/${spec.id}`}
                className="api-card group flex items-start gap-4 rounded-xl border p-5 transition hover:border-emerald-500/40 hover:bg-emerald-500/5"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-[var(--text-main)]">
                    {spec.title}
                  </h2>
                  {description ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--text-muted)]">
                      {description}
                    </p>
                  ) : null}
                </div>
                <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-500">
                  {labels.viewReference}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ApiMethod } from "@/components/api-method";
import {
  apiOperationHref,
  type ResolvedOperation,
} from "@/lib/openapi/core";

export function OperationIndexList({
  specId,
  operations,
}: {
  specId: string;
  operations: ResolvedOperation[];
}) {
  return (
    <ul className="api-card divide-y divide-[var(--panel-border)] overflow-hidden rounded-xl border">
      {operations.map((operation) => (
        <li key={operation.slug}>
          <Link
            href={apiOperationHref(specId, operation)}
            className="group flex items-start gap-4 px-4 py-4 transition-colors hover:bg-emerald-500/5 sm:px-5"
          >
            <ApiMethod method={operation.method} />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-[var(--text-main)]">
                {operation.summary ??
                  `${operation.method.toUpperCase()} ${operation.path}`}
              </span>
              <code className="api-faint mt-1 block break-all font-mono text-xs">
                {operation.path}
              </code>
            </span>
            <ArrowRight
              className="mt-1 h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent-strong)]"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

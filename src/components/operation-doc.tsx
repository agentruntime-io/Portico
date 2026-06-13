"use client";

import type { OpenApiDocument, ResolvedOperation } from "@/lib/openapi/core";
import { CopyButton } from "@/components/api-reference-controls";
import { useI18n } from "@/components/i18n-provider";
import { SchemaView } from "@/components/schema-view";

function JsonBlock({ value }: { value: unknown }) {
  const body = JSON.stringify(value, null, 2);
  return (
    <div className="api-code overflow-hidden rounded-lg">
      <div className="api-divider flex justify-end border-b px-3 py-2">
        <CopyButton value={body} />
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">{body}</pre>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    get: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
    post: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    put: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
    patch: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
    delete: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  };
  const cls = colors[method.toLowerCase()] ?? "ds-soft text-[var(--text-main)]";
  return (
    <span
      className={`rounded px-2 py-0.5 font-mono text-xs font-bold uppercase ${cls}`}
    >
      {method}
    </span>
  );
}

function CurlSample({ op, baseUrl }: { op: ResolvedOperation; baseUrl: string }) {
  const url = `${baseUrl.replace(/\/$/, "")}${op.path}`;
  const lines = [`curl -sS -X ${op.method.toUpperCase()} \\`, `  '${url}'`];
  const sample = lines.join("\n");
  return (
    <div className="api-code overflow-hidden rounded-lg">
      <div className="api-divider flex justify-end border-b px-3 py-2">
        <CopyButton value={sample} />
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">{sample}</pre>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ParamsTable({ params }: { params: any[] }) {
  const { t } = useI18n();
  if (!params?.length) return null;
  return (
    <div className="overflow-x-auto sm:overflow-visible">
      <table className="ds-table w-full min-w-0 text-left text-sm">
        <thead>
          <tr>
            <th>{t("api.operation.name")}</th>
            <th>{t("api.operation.in")}</th>
            <th>{t("api.operation.type")}</th>
            <th>{t("api.operation.description")}</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <tr key={i}>
              <td className="font-mono text-xs text-[var(--text-main)]">
                {p.name}
                {p.required ? (
                  <span className="ml-1 text-red-600">*</span>
                ) : null}
              </td>
              <td className="api-faint text-xs">{p.in}</td>
              <td className="font-mono text-xs text-[var(--text-main)]">
                {(p.schema as { type?: string })?.type ?? "-"}
              </td>
              <td className="api-muted">{p.description ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OperationDocView({
  op,
  doc,
  id,
}: {
  op: ResolvedOperation;
  doc: OpenApiDocument;
  id?: string;
}) {
  const { t } = useI18n();
  const base = doc.servers?.[0]?.url ?? "https://example.com";
  const parameters = (op.operation.parameters as unknown[]) ?? [];
  const requestBody = op.operation.requestBody as
    | Record<string, unknown>
    | undefined;
  const responses = (op.operation.responses ?? {}) as Record<
    string,
    {
      description?: string;
      content?: Record<string, { schema?: unknown; example?: unknown; examples?: unknown }>;
    }
  >;

  return (
    <div id={id} className="scroll-mt-8 space-y-10">
      <div className="api-divider flex flex-wrap items-center gap-3 border-b pb-6">
        <MethodBadge method={op.method} />
        <code className="break-all font-mono text-xs text-[var(--text-main)] sm:text-sm">{op.path}</code>
      </div>
      {op.summary ? <p className="text-lg api-muted">{op.summary}</p> : null}
      {op.description ? (
        <div className="doc-prose prose prose-zinc max-w-none">
          <p>{op.description}</p>
        </div>
      ) : null}

      <section>
        <h2 className="ds-section-label">{t("api.operation.sampleRequest")}</h2>
        <CurlSample op={op} baseUrl={base} />
      </section>

      {parameters.length ? (
        <section>
          <h2 className="ds-section-label">{t("api.operation.parameters")}</h2>
          <ParamsTable params={parameters} />
        </section>
      ) : null}

      {requestBody ? (
        <section>
          <h2 className="ds-section-label">{t("api.operation.requestBody")}</h2>
          <div className="api-card rounded-lg border p-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {Object.entries((requestBody as any).content ?? {}).map(
              ([mime, body]) => (
                <div key={mime}>
                  <p className="api-faint mb-2 font-mono text-xs">{mime}</p>
                  {body && typeof body === "object" && "schema" in body ? (
                    <SchemaView
                      doc={doc}
                      schema={(body as { schema: unknown }).schema}
                    />
                  ) : null}
                  {body && typeof body === "object" && "example" in body ? (
                    <div className="mt-4">
                      <p className="ds-section-label mb-2 text-xs">
                        {t("api.operation.example")}
                      </p>
                      <JsonBlock value={(body as { example: unknown }).example} />
                    </div>
                  ) : null}
                </div>
              ),
            )}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="ds-section-label">{t("api.operation.responses")}</h2>
        <ul className="space-y-4">
          {Object.entries(responses).map(([code, res]) => (
            <li key={code} className="api-card rounded-lg border">
              <div className="api-card-header flex items-center border-b px-4 py-2">
                <span className="ds-status-code">{code}</span>
                <span className="api-muted ml-3 text-sm">{res.description}</span>
              </div>
              <div className="p-4">
                {res.content
                  ? Object.entries(res.content).map(([mime, body]) => (
                      <div key={mime}>
                        <p className="api-faint mb-2 font-mono text-xs">{mime}</p>
                        {body.schema ? (
                          <SchemaView doc={doc} schema={body.schema} />
                        ) : null}
                        {body.example !== undefined ? (
                          <div className="mt-4">
                            <p className="ds-section-label mb-2 text-xs">
                              {t("api.operation.exampleResponse")}
                            </p>
                            <JsonBlock value={body.example} />
                          </div>
                        ) : null}
                      </div>
                    ))
                  : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

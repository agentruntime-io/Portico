import type { ReactNode } from "react";

import type { OpenApiDocument } from "@/lib/openapi/core";

import { resolveRef } from "@/lib/openapi/core";



function JsonBlock({ value }: { value: unknown }) {

  return (

    <pre className="api-code mt-2 overflow-x-auto rounded-lg p-3 text-xs">

      {JSON.stringify(value, null, 2)}

    </pre>

  );

}



function SchemaFrame({

  title,

  level,

  children,

}: {

  title?: ReactNode;

  level: number;

  children: ReactNode;

}) {

  if (level < 2) {

    return (

      <div className="space-y-2">

        {title}

        {children}

      </div>

    );

  }



  return (

    <details open={level < 4} className="api-card rounded-md border p-3">

      <summary className="cursor-pointer text-sm font-medium text-[var(--text-main)]">

        {title ?? "Schema"}

      </summary>

      <div className="mt-3">{children}</div>

    </details>

  );

}



export function SchemaView({

  name,

  schema,

  doc,

  level = 0,

}: {

  name?: string;

  schema: unknown;

  doc: OpenApiDocument;

  level?: number;

}) {

  if (schema === null || schema === undefined) {

    return <span className="api-faint">-</span>;

  }

  if (typeof schema !== "object") {

    return (

      <code className="ds-inline-code text-sm">

        {String(schema)}

      </code>

    );

  }



  const s = schema as Record<string, unknown>;

  if (typeof s.$ref === "string") {

    const r = resolveRef(doc, s.$ref);

    if (r) {

      return (

        <div className={level > 0 ? "border-l-2 border-emerald-500/40 pl-3" : ""}>

          <p className="ds-accent-text font-mono text-xs">

            {s.$ref}

          </p>

          <SchemaView schema={r} doc={doc} level={level + 1} />

        </div>

      );

    }

    return (

      <code className="text-sm text-amber-600 dark:text-amber-400">{s.$ref}</code>

    );

  }



  const title = name ? (

    <h4 className="font-mono text-sm font-semibold text-[var(--text-main)]">

      {name}

    </h4>

  ) : null;



  if (Array.isArray(s.allOf) && s.allOf.length) {

    return (

      <div className="space-y-2">

        {title}

        <p className="api-faint text-xs font-medium">allOf</p>

        <ul className="space-y-3">

          {(s.allOf as unknown[]).map((part, i) => (

            <li key={i}>

              <SchemaView doc={doc} schema={part} level={level + 1} />

            </li>

          ))}

        </ul>

      </div>

    );

  }



  if (Array.isArray(s.oneOf) || Array.isArray(s.anyOf)) {

    const opts = (s.oneOf ?? s.anyOf) as unknown[];

    return (

      <div className="space-y-2">

        {title}

        <p className="api-faint text-xs font-medium">

          {s.oneOf ? "oneOf" : "anyOf"}

        </p>

        <ul className="list-inside list-decimal space-y-2 text-sm">

          {opts.map((o, i) => (

            <li key={i}>

              <SchemaView doc={doc} schema={o} level={level + 1} />

            </li>

          ))}

        </ul>

      </div>

    );

  }



  if (s.type === "object" || s.properties) {

    const props = (s.properties ?? {}) as Record<string, unknown>;

    const required = new Set(

      Array.isArray(s.required) ? (s.required as string[]) : [],

    );

    return (

      <SchemaFrame title={title} level={level}>

        <dl className="space-y-3">

          {Object.entries(props).map(([k, v]) => (

            <div key={k}>

              <dt className="flex flex-wrap items-baseline gap-2">

                <code className="text-sm font-semibold text-[var(--text-main)]">

                  {k}

                </code>

                {required.has(k) ? (

                  <span className="text-[10px] font-bold uppercase text-red-600">

                    required

                  </span>

                ) : null}

              </dt>

              <dd className="mt-1">

                <SchemaView doc={doc} schema={v} level={level + 1} />

              </dd>

            </div>

          ))}

        </dl>

      </SchemaFrame>

    );

  }



  if (s.type === "array" && s.items) {

    return (

      <div>

        {title}

        <p className="api-faint mb-1 text-xs">array of</p>

        <SchemaView

          doc={doc}

          schema={s.items}

          level={level + 1}

        />

      </div>

    );

  }



  if (typeof s.type === "string") {

    return (

      <div className="space-y-1">

        {title}

        <p className="api-muted text-sm">

          <span className="ds-accent-text font-mono">

            {String(s.type)}

          </span>

          {Array.isArray(s.enum) ? (

            <span className="api-faint ml-2 text-xs">

              enum: {(s.enum as unknown[]).join(" | ")}

            </span>

          ) : null}

        </p>

        {s.description ? (

          <p className="api-muted text-sm">

            {String(s.description)}

          </p>

        ) : null}

        {s.example !== undefined ? <JsonBlock value={s.example} /> : null}

      </div>

    );

  }



  return (

    <div>

      {title}

      <JsonBlock value={s} />

    </div>

  );

}



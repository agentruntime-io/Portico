"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eye, EyeOff, Play, Trash2 } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

type SampleLanguage =
  | "shell"
  | "typescript"
  | "react"
  | "node"
  | "python"
  | "powershell"
  | "go"
  | "ruby";

const labels: Record<SampleLanguage, string> = {
  shell: "Shell",
  typescript: "TypeScript",
  react: "React",
  node: "Node.js",
  python: "Python",
  powershell: "PowerShell",
  go: "Go",
  ruby: "Ruby",
};

export function CopyButton({ value }: { value: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          const textarea = document.createElement("textarea");
          textarea.value = value;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className="api-control inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? t("copy.copied") : t("copy.copy")}
    </button>
  );
}

function buildSamples({
  method,
  url,
  token,
}: {
  method?: string;
  url: string;
  token?: string;
}): Record<SampleLanguage, string> {
  const verb = method?.toUpperCase() ?? "GET";
  const bearer = token?.trim() || "<token>";
  const authHeader = `Bearer ${bearer}`;
  return {
    shell: `curl -sS -X ${verb} \\\n  '${url}' \\\n  -H 'Authorization: ${authHeader}'`,
    typescript: `type ApiResponse = unknown;\n\nexport async function callAgentRuntime(): Promise<ApiResponse> {\n  const response = await fetch("${url}", {\n    method: "${verb}",\n    headers: {\n      Authorization: "${authHeader}",\n      Accept: "application/json",\n    },\n  });\n\n  if (!response.ok) {\n    throw new Error(\`AgentRuntime API failed: \${response.status}\`);\n  }\n\n  return response.json() as Promise<ApiResponse>;\n}`,
    react: `import { useEffect, useState } from "react";\n\nexport function AgentRuntimeResult() {\n  const [data, setData] = useState<unknown>(null);\n  const [error, setError] = useState<string | null>(null);\n\n  useEffect(() => {\n    const controller = new AbortController();\n\n    fetch("${url}", {\n      method: "${verb}",\n      signal: controller.signal,\n      headers: {\n        Authorization: "${authHeader}",\n        Accept: "application/json",\n      },\n    })\n      .then(async (response) => {\n        if (!response.ok) throw new Error(String(response.status));\n        return response.json();\n      })\n      .then(setData)\n      .catch((err: Error) => setError(err.message));\n\n    return () => controller.abort();\n  }, []);\n\n  if (error) return <pre>{error}</pre>;\n  return <pre>{JSON.stringify(data, null, 2)}</pre>;\n}`,
    node: `const response = await fetch("${url}", {\n  method: "${verb}",\n  headers: {\n    Authorization: "${authHeader}",\n    Accept: "application/json",\n  },\n});\n\nif (!response.ok) {\n  throw new Error(\`AgentRuntime API failed: \${response.status}\`);\n}\n\nconsole.log(await response.json());`,
    python: `import requests\n\nresponse = requests.request(\n    "${verb}",\n    "${url}",\n    headers={\n        "Authorization": "${authHeader}",\n        "Accept": "application/json",\n    },\n)\nresponse.raise_for_status()\n\nprint(response.json())`,
    powershell: `$headers = @{\n  Authorization = "${authHeader}"\n  Accept = "application/json"\n}\n\nInvoke-RestMethod \\\n  -Method ${verb} \\\n  -Uri "${url}" \\\n  -Headers $headers`,
    go: `package main\n\nimport (\n\t\"fmt\"\n\t\"io\"\n\t\"net/http\"\n)\n\nfunc main() {\n\treq, err := http.NewRequest(\"${verb}\", \"${url}\", nil)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\treq.Header.Set(\"Authorization\", \"${authHeader}\")\n\treq.Header.Set(\"Accept\", \"application/json\")\n\n\tres, err := http.DefaultClient.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer res.Body.Close()\n\n\tbody, _ := io.ReadAll(res.Body)\n\tfmt.Println(string(body))\n}`,
    ruby: `require "net/http"\n\nuri = URI("${url}")\nrequest = Net::HTTP::${verb.charAt(0) + verb.slice(1).toLowerCase()}.new(uri)\nrequest["Authorization"] = "${authHeader}"\nrequest["Accept"] = "application/json"\n\nresponse = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|\n  http.request(request)\nend\nputs response.body`,
  };
}

function AuthPanel({
  securityName,
  description,
  token,
  setToken,
}: {
  securityName: string;
  description?: string;
  token: string;
  setToken: (token: string) => void;
}) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  return (
    <div className="api-card overflow-hidden rounded-lg border">
      <div className="api-card-header flex items-center border-b px-4 py-2 text-sm">
        <span className="font-semibold">{t("api.auth.title")}</span>
        <span className="api-faint ml-2">{t("api.auth.required")}</span>
        <span className="api-muted ml-auto">{securityName}</span>
      </div>
      <p className="api-muted api-divider border-b px-4 py-3 text-sm">
        {description ?? "Pass a bearer token in the Authorization header."}
      </p>
      <div className="space-y-2 px-4 py-3">
        <label className="block text-sm font-medium" htmlFor="api-token">
          {t("api.auth.bearerToken")}
        </label>
        <div className="flex gap-2">
          <input
            id="api-token"
            type={visible ? "text" : "password"}
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Token"
            autoComplete="off"
            spellCheck={false}
            className="api-input min-w-0 flex-1 rounded-md border px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            aria-label={visible ? t("api.auth.hideToken") : t("api.auth.showToken")}
            onClick={() => setVisible((current) => !current)}
            className="api-control inline-flex h-9 w-9 items-center justify-center rounded-md border"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label={t("api.auth.clearToken")}
            onClick={() => setToken("")}
            className="api-control inline-flex h-9 w-9 items-center justify-center rounded-md border"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="api-faint text-xs">{t("api.auth.sessionHint")}</p>
      </div>
    </div>
  );
}

function ClientLibraryTabs({
  method,
  url,
  token,
}: {
  method?: string;
  url: string;
  token: string;
}) {
  const { t } = useI18n();
  const [active, setActive] = useState<SampleLanguage>("shell");
  const samples = useMemo(
    () => buildSamples({ method, url, token }),
    [method, token, url],
  );

  return (
    <div className="api-card overflow-hidden rounded-lg border">
      <div className="api-card-header border-b px-4 py-2 text-sm font-semibold">
        {t("api.auth.clientLibraries")}
      </div>
      <div className="api-divider flex gap-1 overflow-x-auto border-b px-3 py-2 text-sm">
        {(Object.keys(labels) as SampleLanguage[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`rounded-md px-3 py-1.5 font-medium ${
              active === key ? "nav-active" : "nav-item-muted api-faint"
            }`}
          >
            {labels[key]}
          </button>
        ))}
      </div>
      <div className="api-divider flex items-center justify-between border-b px-4 py-2">
        <span className="text-sm font-medium">{labels[active]}</span>
        <CopyButton value={samples[active]} />
      </div>
      <pre className="api-code max-h-72 overflow-auto px-4 py-3 text-sm leading-relaxed">
        {samples[active]}
      </pre>
    </div>
  );
}

function TestRequestPanel({
  method,
  url,
  token,
}: {
  method?: string;
  url: string;
  token: string;
}) {
  const { t } = useI18n();
  const [result, setResult] = useState<string>("");
  const [headers, setHeaders] = useState<string>("");
  const [requestUrl, setRequestUrl] = useState(url);
  const [body, setBody] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const verb = method?.toUpperCase() ?? "GET";
  const isReadOnly = verb === "GET";
  const canRun = token.trim() && requestUrl && (isReadOnly || confirmed);

  return (
    <div className="api-card overflow-hidden rounded-lg border">
      <div className="api-card-header border-b px-4 py-2 text-sm font-semibold">
        {t("api.auth.testRequest")}
      </div>
      <div className="space-y-3 px-4 py-3">
        <p className="api-faint text-xs">
          Runs from your browser. Non-GET requests require explicit
          confirmation and tokens are sent only when you click Send.
        </p>
        <label className="api-muted block text-xs font-medium">
          Request URL
          <input
            value={requestUrl}
            onChange={(event) => setRequestUrl(event.target.value)}
            className="api-input mt-1 w-full rounded-md border px-3 py-2 font-mono text-xs outline-none"
          />
        </label>
        {!isReadOnly ? (
          <label className="api-muted block text-xs font-medium">
            JSON body
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={5}
              placeholder="{ }"
              className="api-input mt-1 w-full resize-y rounded-md border px-3 py-2 font-mono text-xs outline-none"
            />
          </label>
        ) : null}
        {!isReadOnly ? (
          <label className="api-faint flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5"
            />
            I understand this {verb} request may change data or trigger workflow
            execution.
          </label>
        ) : null}
        <button
          type="button"
          disabled={!canRun || busy}
          onClick={async () => {
            setBusy(true);
            setResult("");
            try {
              const response = await fetch(requestUrl, {
                method: verb,
                headers: {
                  Authorization: `Bearer ${token.trim()}`,
                  Accept: "application/json",
                  ...(isReadOnly ? {} : { "Content-Type": "application/json" }),
                },
                body: isReadOnly ? undefined : body || "{}",
              });
              const text = await response.text();
              setHeaders(
                [...response.headers.entries()]
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("\n"),
              );
              setResult(
                `HTTP ${response.status} ${response.statusText}\n\n${text}`,
              );
            } catch (error) {
              setResult(
                error instanceof Error
                  ? error.message
                  : "Request failed before a response was received.",
              );
            } finally {
              setBusy(false);
            }
          }}
          className="api-control inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Play className="h-3.5 w-3.5" />
          {busy ? t("api.auth.sending") : `${t("api.auth.send")} ${verb}`}
        </button>
        {!canRun ? (
          <p className="api-faint text-xs">
            Enter a bearer token
            {!isReadOnly ? " and confirm the non-GET request" : ""} to enable
            testing.
          </p>
        ) : null}
        {headers ? (
          <pre className="api-code max-h-36 overflow-auto rounded-md p-3 text-xs leading-relaxed">
            {headers}
          </pre>
        ) : null}
        {result ? (
          <pre className="api-code max-h-56 overflow-auto rounded-md p-3 text-xs leading-relaxed">
            {result}
          </pre>
        ) : null}
      </div>
    </div>
  );
}

export function AuthenticatedClientSamples({
  method,
  url,
  securityName,
  securityDescription,
}: {
  method?: string;
  url: string;
  securityName: string;
  securityDescription?: string;
}) {
  const [token, setToken] = useState("");

  return (
    <>
      <AuthPanel
        securityName={securityName}
        description={securityDescription}
        token={token}
        setToken={setToken}
      />
      <ClientLibraryTabs method={method} url={url} token={token} />
      <TestRequestPanel key={`${method ?? "GET"}:${url}`} method={method} url={url} token={token} />
    </>
  );
}

import pkg from "../../package.json";
import { searchDocs } from "@/lib/docs-search";
import { loadMarkdownPage, renderPageMarkdown } from "@/lib/llm-markdown";
import { getNavigation } from "@/lib/nav";
import { getSiteConfig } from "@/lib/site";

/**
 * Read-only docs MCP server, speaking JSON-RPC 2.0 over Streamable HTTP, stateless:
 * every POST is answered with a single `application/json` response (no SSE stream,
 * no session). Written against the protocol directly; the three tools do not need
 * the MCP SDK. The HTTP layer lives in `src/app/mcp/route.ts`.
 */

/** Newest first; the client's requested version is echoed when we support it. */
const SUPPORTED_PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

export const JSON_RPC_ERRORS = {
  parse: -32700,
  invalidRequest: -32600,
  methodNotFound: -32601,
  invalidParams: -32602,
  internal: -32603,
} as const;

type JsonRpcId = string | number | null;

export type JsonRpcResponse =
  | { jsonrpc: "2.0"; id: JsonRpcId; result: unknown }
  | {
      jsonrpc: "2.0";
      id: JsonRpcId;
      error: { code: number; message: string; data?: unknown };
    };

/** Thrown inside a method handler to answer with a JSON-RPC error. */
class RpcError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
  }
}

const DEFAULT_SEARCH_LIMIT = 8;
const MAX_SEARCH_LIMIT = 25;
const MAX_QUERY_CHARS = 500;

const TOOLS = [
  {
    name: "search_docs",
    description:
      "Search the documentation. Returns the best matching pages with title, URL, section and a snippet. Open a result with get_page.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "What to look for, for example: webhook retries.",
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: MAX_SEARCH_LIMIT,
          description: `Maximum results (default ${DEFAULT_SEARCH_LIMIT}).`,
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: { title: "Search docs", readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_page",
    description:
      "Get one documentation page as Markdown. Accepts a path (/workflows/studio or workflows/studio) or a full page URL.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Page path such as /workflows/studio, or the page's full URL.",
        },
      },
      required: ["path"],
      additionalProperties: false,
    },
    annotations: { title: "Get page", readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_pages",
    description:
      "List every documentation page, grouped as in the site navigation, with title and path.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { title: "List pages", readOnlyHint: true, openWorldHint: false },
  },
];

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

function text(value: string, isError = false): ToolResult {
  return { content: [{ type: "text", text: value }], ...(isError ? { isError } : {}) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** `/a/b`, `a/b`, `a/b.md`, `https://host/a/b/?x#y` and `/` become URL segments. */
export function pathArgToSlug(input: string): string[] {
  let value = input.trim();
  if (/^https?:\/\//i.test(value)) {
    try {
      value = new URL(value).pathname;
    } catch {
      return [];
    }
  }
  value = value.split(/[?#]/)[0];
  try {
    value = decodeURIComponent(value);
  } catch {
    /* use as given */
  }
  return value
    .replace(/\.md$/i, "")
    .split("/")
    .filter(Boolean);
}

async function toolSearchDocs(args: Record<string, unknown>): Promise<ToolResult> {
  const query = args.query;
  if (typeof query !== "string" || !query.trim()) {
    throw new RpcError(JSON_RPC_ERRORS.invalidParams, "`query` must be a non-empty string.");
  }
  if (query.length > MAX_QUERY_CHARS) {
    throw new RpcError(
      JSON_RPC_ERRORS.invalidParams,
      `\`query\` is too long (max ${MAX_QUERY_CHARS} characters).`,
    );
  }
  let limit = DEFAULT_SEARCH_LIMIT;
  if (args.limit !== undefined) {
    if (
      typeof args.limit !== "number" ||
      !Number.isInteger(args.limit) ||
      args.limit < 1 ||
      args.limit > MAX_SEARCH_LIMIT
    ) {
      throw new RpcError(
        JSON_RPC_ERRORS.invalidParams,
        `\`limit\` must be an integer from 1 to ${MAX_SEARCH_LIMIT}.`,
      );
    }
    limit = args.limit;
  }

  const [site, hits] = await Promise.all([getSiteConfig(), searchDocs(query, limit)]);
  if (!hits.length) return text(`No pages found for "${query.trim()}".`);

  const base = site.url.replace(/\/$/, "");
  const blocks = hits.map((hit, i) => {
    const lines = [`${i + 1}. ${hit.title}${hit.group ? ` (${hit.group})` : ""}`];
    lines.push(`   URL: ${hit.href === "/" ? `${base}/` : `${base}${hit.href}`}`);
    lines.push(`   Path: ${hit.href}`);
    if (hit.snippet) lines.push(`   ${hit.snippet}`);
    return lines.join("\n");
  });
  return text(blocks.join("\n\n"));
}

async function toolGetPage(args: Record<string, unknown>): Promise<ToolResult> {
  const input = args.path;
  if (typeof input !== "string" || !input.trim()) {
    throw new RpcError(JSON_RPC_ERRORS.invalidParams, "`path` must be a non-empty string.");
  }
  const page = await loadMarkdownPage(pathArgToSlug(input));
  if (!page) {
    return text(
      `No page found for "${input}". Use search_docs or list_pages to find a valid path.`,
      true,
    );
  }
  return text(renderPageMarkdown(page));
}

async function toolListPages(): Promise<ToolResult> {
  const nav = await getNavigation();
  const blocks = nav.groups
    .filter((group) => group.items.length > 0)
    .map((group) =>
      [`## ${group.label}`, ...group.items.map((item) => `- ${item.title}: ${item.href}`)].join(
        "\n",
      ),
    );
  return text(blocks.join("\n\n") || "No pages.");
}

async function callTool(params: unknown): Promise<ToolResult> {
  if (!isRecord(params) || typeof params.name !== "string") {
    throw new RpcError(JSON_RPC_ERRORS.invalidParams, "`name` is required.");
  }
  const args = params.arguments ?? {};
  if (!isRecord(args)) {
    throw new RpcError(JSON_RPC_ERRORS.invalidParams, "`arguments` must be an object.");
  }
  switch (params.name) {
    case "search_docs":
      return toolSearchDocs(args);
    case "get_page":
      return toolGetPage(args);
    case "list_pages":
      return toolListPages();
    default:
      throw new RpcError(JSON_RPC_ERRORS.invalidParams, `Unknown tool: ${params.name}`);
  }
}

async function initialize(params: unknown) {
  const site = await getSiteConfig();
  const requested = isRecord(params) ? params.protocolVersion : undefined;
  const protocolVersion =
    typeof requested === "string" && SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
      ? requested
      : SUPPORTED_PROTOCOL_VERSIONS[0];
  return {
    protocolVersion,
    capabilities: { tools: {} },
    serverInfo: { name: `${site.name} docs`, version: pkg.version },
    instructions: `Read-only access to the ${site.name} documentation. Use search_docs to find pages, get_page to read one as Markdown and list_pages for the full table of contents.`,
  };
}

async function dispatch(method: string, params: unknown): Promise<unknown> {
  switch (method) {
    case "initialize":
      return initialize(params);
    case "ping":
      return {};
    case "tools/list":
      return { tools: TOOLS };
    case "tools/call":
      return callTool(params);
    default:
      throw new RpcError(JSON_RPC_ERRORS.methodNotFound, `Method not found: ${method}`);
  }
}

function errorResponse(id: JsonRpcId, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

/**
 * Handle one JSON-RPC message. Returns null for notifications and for client
 * responses, which get no reply.
 */
export async function handleMessage(message: unknown): Promise<JsonRpcResponse | null> {
  if (!isRecord(message) || message.jsonrpc !== "2.0") {
    return errorResponse(null, JSON_RPC_ERRORS.invalidRequest, "Invalid JSON-RPC request.");
  }
  const hasId = "id" in message;
  const id = message.id;
  if (hasId && id !== null && typeof id !== "string" && typeof id !== "number") {
    return errorResponse(null, JSON_RPC_ERRORS.invalidRequest, "Invalid request id.");
  }

  // A message with a result or error and no method is the client answering us.
  if (typeof message.method !== "string") {
    if (hasId && ("result" in message || "error" in message)) return null;
    return errorResponse(
      hasId ? (id as JsonRpcId) : null,
      JSON_RPC_ERRORS.invalidRequest,
      "Missing `method`.",
    );
  }

  // Notifications (no id) never get a response, even when the method is unknown.
  if (!hasId) return null;

  try {
    const result = await dispatch(message.method, message.params);
    return { jsonrpc: "2.0", id: id as JsonRpcId, result };
  } catch (error) {
    if (error instanceof RpcError) {
      return errorResponse(id as JsonRpcId, error.code, error.message);
    }
    console.error("[mcp] internal error", error);
    return errorResponse(id as JsonRpcId, JSON_RPC_ERRORS.internal, "Internal error.");
  }
}

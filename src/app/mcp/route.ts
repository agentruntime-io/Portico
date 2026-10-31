import {
  JSON_RPC_ERRORS,
  handleMessage,
  type JsonRpcResponse,
} from "@/lib/mcp-server";
import { getSiteConfig } from "@/lib/site";

/**
 * Read-only docs MCP server (Streamable HTTP, stateless, JSON responses only).
 * Turn it off with `mcp: false` in the content repo's site.yaml.
 */

const MAX_BODY_CHARS = 256 * 1024;
const MAX_BATCH = 20;

// Browser-based MCP clients call this cross-origin. The server is public and
// read-only and uses no cookies, so any origin may call it.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id",
  "Access-Control-Max-Age": "86400",
};

async function enabled() {
  return (await getSiteConfig()).mcp;
}

function disabled() {
  return new Response("Not found\n", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { ...CORS_HEADERS, "Cache-Control": "no-store" },
  });
}

function rpcError(code: number, message: string, status: number) {
  return json({ jsonrpc: "2.0", id: null, error: { code, message } }, status);
}

function accepted() {
  return new Response(null, { status: 202, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  if (!(await enabled())) return disabled();

  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) {
    return rpcError(JSON_RPC_ERRORS.invalidRequest, "Request body too large.", 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return rpcError(JSON_RPC_ERRORS.parse, "Parse error: body is not valid JSON.", 400);
  }

  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      return rpcError(JSON_RPC_ERRORS.invalidRequest, "Empty batch.", 400);
    }
    if (payload.length > MAX_BATCH) {
      return rpcError(
        JSON_RPC_ERRORS.invalidRequest,
        `Batch too large (max ${MAX_BATCH}).`,
        400,
      );
    }
    const replies = (await Promise.all(payload.map(handleMessage))).filter(
      (reply): reply is JsonRpcResponse => reply !== null,
    );
    // A batch of only notifications gets no body.
    if (!replies.length) return accepted();
    return json(replies);
  }

  const reply = await handleMessage(payload);
  if (!reply) return accepted();
  return json(reply);
}

/** No server-initiated stream: GET is not supported (same as Mintlify's /mcp). */
export async function GET() {
  if (!(await enabled())) return disabled();
  return new Response("Method Not Allowed\n", {
    status: 405,
    headers: {
      Allow: "POST",
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function OPTIONS() {
  if (!(await enabled())) return disabled();
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

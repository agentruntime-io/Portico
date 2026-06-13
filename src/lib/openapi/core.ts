import SwaggerParser from "@apidevtools/swagger-parser";
import path from "path";

export const HTTP_METHODS = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export type OpenApiDocument = {
  paths?: Record<string, Record<string, unknown>>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, SecurityScheme>;
  };
  info?: { title?: string; version?: string; description?: string };
  servers?: { url?: string; description?: string }[];
  openapi?: string;
  security?: Record<string, unknown>[] | unknown[];
  tags?: { name: string; description?: string }[];
};

export type SecurityScheme = {
  type?: string;
  scheme?: string;
  bearerFormat?: string;
  description?: string;
  name?: string;
  in?: string;
};

export type ResolvedOperation = {
  specId: string;
  slug: string;
  method: HttpMethod;
  path: string;
  operationId?: string;
  summary?: string;
  description?: string;
  tags: string[];
  operation: Record<string, unknown>;
};

export function slugifyOperationId(operationId: string): string {
  return operationId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function fallbackSlug(method: string, p: string): string {
  const tail = p
    .replace(/^\//, "")
    .replace(/[{}/]/g, "")
    .replace(/\//g, "-")
    .replace(/--+/g, "-")
    .toLowerCase();
  return `${method.toLowerCase()}-${tail}`.replace(/-$/, "");
}

export function operationSlug(
  method: HttpMethod,
  pathKey: string,
  operationId?: string,
): string {
  if (operationId) return slugifyOperationId(operationId);
  return fallbackSlug(method, pathKey);
}

export async function loadBundledSpec(
  specFile: string,
): Promise<OpenApiDocument> {
  const full = path.join(process.cwd(), "content", specFile);
  return SwaggerParser.validate(full) as Promise<OpenApiDocument>;
}

export function flattenOperations(
  specId: string,
  doc: OpenApiDocument,
): ResolvedOperation[] {
  const list: ResolvedOperation[] = [];
  const used = new Set<string>();
  for (const [p, pathItem] of Object.entries(doc.paths ?? {})) {
    for (const m of HTTP_METHODS) {
      const op = pathItem[m];
      if (!op || typeof op !== "object") continue;
      const o = op as Record<string, unknown>;
      let slug = operationSlug(
        m,
        p,
        typeof o.operationId === "string" ? o.operationId : undefined,
      );
      if (used.has(slug)) slug = `${slug}-${list.length}`;
      used.add(slug);
      list.push({
        specId,
        slug,
        method: m,
        path: p,
        operationId:
          typeof o.operationId === "string" ? o.operationId : undefined,
        summary: typeof o.summary === "string" ? o.summary : undefined,
        description:
          typeof o.description === "string" ? o.description : undefined,
        tags: Array.isArray(o.tags) ? (o.tags as string[]) : [],
        operation: o,
      });
    }
  }
  return list;
}

export function resolveRef(
  doc: OpenApiDocument,
  ref: string,
): unknown | null {
  if (!ref.startsWith("#/")) return null;
  const parts = ref.slice(2).split("/");
  let cur: unknown = doc;
  for (const part of parts) {
    if (cur && typeof cur === "object" && part in (cur as object)) {
      cur = (cur as Record<string, unknown>)[part];
    } else return null;
  }
  return cur;
}

export function groupOperationsByTag(
  ops: ResolvedOperation[],
): Map<string, ResolvedOperation[]> {
  const map = new Map<string, ResolvedOperation[]>();
  for (const op of ops) {
    const tags = op.tags.length ? op.tags : ["default"];
    for (const t of tags) {
      if (!map.has(t)) map.set(t, []);
      map.get(t)!.push(op);
    }
  }
  return map;
}

export function slugifyTag(tagName: string): string {
  return tagName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getTagDescription(
  doc: OpenApiDocument,
  tagName: string,
): string | undefined {
  return doc.tags?.find((tag) => tag.name === tagName)?.description;
}

export function getPrimarySecurityScheme(
  doc: OpenApiDocument,
): [string, SecurityScheme] | null {
  const required = Array.isArray(doc.security) ? doc.security[0] : null;
  const requiredName =
    required && typeof required === "object"
      ? Object.keys(required as Record<string, unknown>)[0]
      : undefined;
  const schemes = doc.components?.securitySchemes ?? {};
  const name = requiredName ?? Object.keys(schemes)[0];
  if (!name || !schemes[name]) return null;
  return [name, schemes[name]];
}

export function stripApiPrefix(pathKey: string): string {
  return pathKey.replace(/^\/api\/v\d+/, "") || "/";
}

export function tagSlugForOperation(op: ResolvedOperation): string {
  return slugifyTag(op.tags[0] ?? "default");
}

import fs from "fs/promises";
import path from "path";
import { resolveContentFile } from "@/lib/content-config";
import { getSiteConfig } from "@/lib/site";

const CONTENT_TYPES: Record<string, string> = {
  ".yaml": "application/yaml; charset=utf-8",
  ".yml": "application/yaml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

/** Serves a configured OpenAPI spec as `/openapi/<specId>.<ext>` from the content repo. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const ext = path.extname(file).toLowerCase();
  const specId = file.slice(0, file.length - ext.length);

  const site = await getSiteConfig();
  const spec = site.openapi.specs.find((s) => s.id === specId);
  const full = spec ? resolveContentFile(spec.file) : null;
  if (!spec || !full || path.extname(spec.file).toLowerCase() !== ext) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const body = await fs.readFile(full);
    return new Response(body, {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

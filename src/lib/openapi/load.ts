import SwaggerParser from "@apidevtools/swagger-parser";
import { resolveContentFile } from "@/lib/content-config";
import type { OpenApiDocument } from "@/lib/openapi/core";

/** Parse and validate an OpenAPI file that lives in the content repository. */
export async function loadBundledSpec(
  specFile: string,
): Promise<OpenApiDocument> {
  const full = resolveContentFile(specFile);
  if (!full) {
    throw new Error(`OpenAPI file is outside the content root: ${specFile}`);
  }
  return SwaggerParser.validate(full) as Promise<OpenApiDocument>;
}

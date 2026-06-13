import type { Locale } from "@/lib/i18n";
import { localizedMdxRelativePath } from "@/lib/locale-content";

export function githubEditUrl(
  githubEditBase: string | undefined,
  pagePath: string,
  contentLocale: Locale,
): string | undefined {
  if (!githubEditBase?.trim()) return undefined;
  const relative = localizedMdxRelativePath(pagePath, contentLocale).replace(
    /\\/g,
    "/",
  );
  return `${githubEditBase.replace(/\/$/, "")}/${relative}`;
}

import type { DocsJsonConfig } from "@/lib/docs-config";

/**
 * Site theming from docs.json (Mintlify format): `colors` override the brand tokens and
 * `fonts` replace Portico's default type. Output is CSS for a <style> in the root layout,
 * plus an optional Google Fonts stylesheet URL. Values are validated so content cannot
 * inject arbitrary CSS.
 */

type FontSpec = { family?: string; weight?: number; source?: string; format?: string };
export type DocsJsonFonts = FontSpec & { heading?: FontSpec; body?: FontSpec };

export type SiteTheme = { css?: string; fontStylesheet?: string };

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const FAMILY = /^[\w][\w \-]{0,60}$/;
// Higher specificity than the token blocks in globals.css, whatever the stylesheet order.
const LIGHT = 'html:root:not([data-theme="dark"])';
const DARK = 'html:root[data-theme="dark"]';

function hex(value?: string): string | undefined {
  const v = value?.trim();
  return v && HEX.test(v) ? v : undefined;
}

/** Near-black or white, whichever reads better on `color`. */
function onColor(color: string): string {
  const full = color.length === 4 ? color.replace(/[0-9a-f]/gi, (c) => c + c).slice(1) : color.slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#0b0f0e" : "#ffffff";
}

function brandCss(colors: DocsJsonConfig["colors"]): string {
  const primary = hex(colors?.primary);
  if (!primary) return "";
  const light = hex(colors?.light) ?? primary;
  const dark = hex(colors?.dark);
  // Mintlify: `dark` is the light-mode button colour; without it, darken primary for text.
  const ink = dark ?? `color-mix(in srgb, ${primary} 72%, #000)`;
  const btn = dark ?? primary;
  return (
    `${LIGHT}{--brand:${primary};--brand-ink:${ink};--btn:${btn};--on-btn:${onColor(dark ?? primary)}}` +
    `${DARK}{--brand:${light};--brand-ink:${light};--btn:${light};--on-btn:${onColor(light)}}`
  );
}

function fontFace(spec: FontSpec): string {
  const family = spec.family?.trim();
  const source = spec.source?.trim();
  if (!family || !FAMILY.test(family) || !source || !/^https:\/\/[^\s"'()]+$/.test(source)) return "";
  const format = spec.format === "woff" ? "woff" : "woff2";
  const weight = Number.isFinite(spec.weight) ? `font-weight:${spec.weight};` : "";
  return `@font-face{font-family:"${family}";src:url("${source}") format("${format}");${weight}font-display:swap}`;
}

function fontsCss(fonts?: DocsJsonFonts): { css: string; google: string[] } {
  if (!fonts) return { css: "", google: [] };
  const heading = fonts.heading ?? (fonts.family ? fonts : undefined);
  const body = fonts.body ?? (fonts.family ? fonts : undefined);
  const google = new Set<string>();
  let faces = "";
  const vars: string[] = [];
  for (const [token, spec] of [["--font-heading", heading], ["--font-body", body]] as const) {
    const family = spec?.family?.trim();
    if (!spec || !family || !FAMILY.test(family)) continue;
    if (spec.source) faces += fontFace(spec);
    else google.add(family);
    vars.push(`${token}:"${family}",system-ui,-apple-system,"Segoe UI",sans-serif`);
  }
  return { css: faces + (vars.length ? `html:root{${vars.join(";")}}` : ""), google: [...google] };
}

export function siteTheme(colors: DocsJsonConfig["colors"], fonts?: DocsJsonFonts): SiteTheme {
  const { css: fontCss, google } = fontsCss(fonts);
  const css = brandCss(colors) + fontCss;
  const fontStylesheet = google.length
    ? `https://fonts.googleapis.com/css2?${google
        .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700`)
        .join("&")}&display=swap`
    : undefined;
  return { css: css || undefined, fontStylesheet };
}

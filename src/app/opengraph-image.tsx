import { ImageResponse } from "next/og";

import { getSiteConfig } from "@/lib/site";
import { mixHex, onColor } from "@/lib/site-theme";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Used when docs.json sets no valid `colors.primary`. */
const DEFAULT_PRIMARY = "#14b8a6";
const DEFAULT_LIGHT = "#99f6e4";
const BASE = "#080b0a";

function siteHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

export default async function OpenGraphImage() {
  const site = await getSiteConfig();
  const host = siteHostname(site.url);
  const initial = (Array.from(site.name.trim())[0] ?? "").toUpperCase();

  // Colours come from docs.json (already validated as hex in site-theme).
  const primary = site.colors?.primary ?? DEFAULT_PRIMARY;
  const light = site.colors?.light ?? DEFAULT_LIGHT;
  const gradient = `linear-gradient(135deg, ${BASE} 0%, ${mixHex(BASE, primary, 0.14)} 45%, ${mixHex(BASE, primary, 0.62)} 100%)`;
  // The card is dark, so use the logo's dark-mode file when there is one.
  const logo = site.logo?.dark;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "72px",
          background: gradient,
          color: "#f4f4f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- satori renders plain <img>
            <img src={logo} alt={site.name} height={48} style={{ height: 48 }} />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
                color: onColor(primary),
              }}
            >
              {initial}
            </div>
          )}
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: light,
            }}
          >
            {host}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>
            {site.name}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.45,
              color: "#d4d4d8",
              maxWidth: 920,
            }}
          >
            {site.description}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

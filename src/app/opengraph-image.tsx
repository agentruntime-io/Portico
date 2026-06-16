import { ImageResponse } from "next/og";

import { getSiteConfig } from "@/lib/site";

export const alt = "AgentRuntime documentation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function siteHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "docs.agentruntime.io";
  }
}

export default async function OpenGraphImage() {
  const site = await getSiteConfig();
  const host = siteHostname(site.url);

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
          background:
            "linear-gradient(135deg, #080b0a 0%, #0f1f1a 45%, #0f766e 100%)",
          color: "#f4f4f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
              color: "#042f2e",
            }}
          >
            A
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#99f6e4",
            }}
          >
            {host}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>
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

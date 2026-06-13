import { ImageResponse } from "next/og";

import { getSiteConfig } from "@/lib/site";

export const alt = "Documentation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const site = await getSiteConfig();

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
          background: "linear-gradient(135deg, #0b100e 0%, #1a2e28 55%, #0f766e 100%)",
          color: "#f4f4f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#99f6e4",
          }}
        >
          Documentation
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>
            {site.name}
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.4,
              color: "#d4d4d8",
              maxWidth: 900,
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

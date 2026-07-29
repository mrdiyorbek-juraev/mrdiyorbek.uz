import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.fullName} — ${siteConfig.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card for the site root. Built with next/og rather than a checked-in
 * PNG so it stays in sync with siteConfig, and uses only system fonts so the
 * build never reaches out to a font CDN.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0d1512",
          backgroundImage:
            "radial-gradient(circle at 78% 18%, rgba(63,221,154,0.20), transparent 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            color: "#3fdd9a",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {siteConfig.role}
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 92,
            fontWeight: 700,
            color: "#f5f7f6",
            letterSpacing: -3,
          }}
        >
          {siteConfig.fullName}
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            lineHeight: 1.4,
            color: "#9bb0a8",
            maxWidth: 900,
          }}
        >
          Building OctaneJS and Typix. Writing about the web.
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 26,
            color: "#6f847c",
          }}
        >
          mrdiyorbek.uz
        </div>
      </div>
    ),
    size,
  );
}

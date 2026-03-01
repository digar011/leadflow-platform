import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Goldyon - Lead Intelligence Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #d4a843, #c49a3a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 20,
              fontSize: 36,
              fontWeight: 700,
              color: "#0a0a0f",
            }}
          >
            G
          </div>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Goldyon
          </span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#d4a843",
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          Lead Intelligence Platform
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#9ca3af",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Manage leads, track customer journeys, automate workflows, and grow
          your business.
        </div>
      </div>
    ),
    { ...size }
  );
}

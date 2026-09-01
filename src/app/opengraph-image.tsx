import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generated at build time so the social card always matches the current brand. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0f1430",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 48 48">
              <path d="M24 9.5 38.5 20H9.5z" fill="#ffffff" />
              <rect x="11" y="21.4" width="26" height="2.6" rx="1.1" fill="#ffffff" />
              <rect x="15" y="25.4" width="4" height="8.4" rx="0.9" fill="#ffffff" />
              <rect x="22" y="25.4" width="4" height="8.4" rx="0.9" fill="#ffffff" />
              <rect x="29" y="25.4" width="4" height="8.4" rx="0.9" fill="#ffffff" />
              <rect x="10" y="35.2" width="28" height="3.4" rx="1.4" fill="#f2c866" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
            <span>Royal</span>
            <span style={{ color: "#f2c866" }}>Refund</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Recover What Belongs To You
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#c8d0e4", maxWidth: 860, lineHeight: 1.4 }}>
            Submit a refund or dispute case, attach the evidence, and follow every stage of the review
            in one secure portal.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: "#9aa8c9" }}>
          <div
            style={{
              display: "flex",
              padding: "8px 18px",
              borderRadius: 999,
              background: "rgba(242,200,102,0.16)",
              color: "#f2c866",
              fontWeight: 700,
            }}
          >
            Secure
          </div>
          <div style={{ display: "flex" }}>Secure refund &amp; financial recovery platform</div>
        </div>
      </div>
    ),
    size,
  );
}

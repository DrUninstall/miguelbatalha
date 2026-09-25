import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/** The share image every page uses: the site name, a title and a line of context. */
export function renderOg(title: string, kicker: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#12131a",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, opacity: 0.8 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#a3b2ff" }} />
          Miguel Batalha
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 30, color: "#a3b2ff" }}>{kicker}</div>
          <div style={{ fontSize: 68, lineHeight: 1.12, letterSpacing: -1.5, maxWidth: 980, textWrap: "balance" }}>
            {title}
          </div>
        </div>
      </div>
    ),
    ogSize
  );
}

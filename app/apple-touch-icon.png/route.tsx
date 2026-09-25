import { ImageResponse } from "next/og";

// Emitted as out/apple-touch-icon.png, the path iOS also requests by default.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#12131a" }}>
        <svg width="112" height="112" viewBox="0 0 32 32">
          <path d="M8.5 22.5V10l7.5 8.5L23.5 10v12.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { width: 180, height: 180 }
  );
}

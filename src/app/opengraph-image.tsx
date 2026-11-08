import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Reincarnation Checklist";

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
          background: "#0b0b0d",
          color: "#f5efe4",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              background: "#e8b23d",
              color: "#1a1206",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            ✓
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>The Reincarnation Checklist</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 56, fontWeight: 800, lineHeight: 1.15, maxWidth: 1000 }}>
          252 mốc lịch sử, 11 quốc gia. Nếu được trọng sinh, bạn nên làm gì?
        </div>
        <div style={{ marginTop: 32, fontSize: 26, color: "#b9b0a0" }}>reincarnation-checklist.vn</div>
      </div>
    ),
    { ...size },
  );
}

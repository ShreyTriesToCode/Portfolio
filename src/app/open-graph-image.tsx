import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background: "#0b1020",
          color: "#e7eaf0",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800 }}>
          Shreyansh Singhal
        </div>
        <div style={{ marginTop: 16, fontSize: 28, opacity: 0.9 }}>
          Full Stack • App Dev • ML Projects
        </div>
        <div
          style={{
            marginTop: 28,
            height: 2,
            width: 520,
            background: "linear-gradient(90deg,#7aa2f7,transparent)",
          }}
        />
        <div style={{ marginTop: 22, fontSize: 18, opacity: 0.75 }}>
          VS Code themed portfolio built with Next.js + Supabase
        </div>
      </div>
    ),
    size
  );
}
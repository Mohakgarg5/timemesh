import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#FF8C69",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
        }}
      >
        {/* 3x3 grid of cells */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[0, 1, 2].map((row) => (
            <div key={row} style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2].map((col) => {
                const highlighted = (row === 0 && col === 0) || (row === 0 && col === 1) || (row === 1 && col === 0);
                return (
                  <div
                    key={col}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 1.5,
                      background: highlighted ? "white" : "rgba(255,255,255,0.35)",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}

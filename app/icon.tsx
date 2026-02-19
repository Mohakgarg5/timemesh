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
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Vertical grid lines */}
          <line x1="7" y1="2" x2="7" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="11" y1="2" x2="11" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="15" y1="2" x2="15" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          {/* Horizontal grid lines */}
          <line x1="2" y1="7" x2="20" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="2" y1="11" x2="20" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="2" y1="15" x2="20" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          {/* Highlighted cells */}
          <rect x="7.5" y="7.5" width="3" height="3" rx="0.5" fill="white" />
          <rect x="11.5" y="7.5" width="3" height="3" rx="0.5" fill="white" opacity="0.7" />
          <rect x="7.5" y="11.5" width="3" height="3" rx="0.5" fill="white" opacity="0.7" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

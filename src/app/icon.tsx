import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site.config";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: siteConfig.theme.primary,
      }}
    >
      <svg width="300" height="300" viewBox="0 0 100 100" fill="none">
        <path
          d="M50 5 88 30 50 95 12 30 50 5Z"
          stroke={siteConfig.theme.accent}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M12 30h76M31 30l19 65 19-65M31 30 50 5l19 25"
          stroke={siteConfig.theme.primaryForeground}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    size,
  );
}

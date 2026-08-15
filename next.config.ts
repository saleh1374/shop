import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // استقرار ساده روی هر سرور (هاست → سرور) با پوشه standalone
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;

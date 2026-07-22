import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  /** Avoid bundling all of `public/` into serverless traces (build-time fs scans + large assets). */
  outputFileTracingExcludes: {
    "/*": ["public/**/*"],
  },
  images: {
    qualities: [75, 85, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

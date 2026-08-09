import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  // macOS DMGs + Sparkle appcast live in the ontor-releases S3 bucket;
  // ontor.ai/downloads/mac/* is the stable URL baked into shipped apps
  // (Info.plist SUFeedURL) — never change this path.
  async rewrites() {
    return [
      {
        source: "/downloads/mac/:path*",
        destination:
          "https://ontor-releases.s3.us-east-2.amazonaws.com/mac/:path*",
      },
    ];
  },
};

export default nextConfig;

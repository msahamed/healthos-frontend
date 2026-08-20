import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  // Desktop installers are exposed through stable first-party download URLs.
  // macOS uses S3; the unsigned Windows beta uses GitHub Releases until the
  // S3 release identity is allowed to expose the windows/ prefix.
  async rewrites() {
    return [
      {
        source: "/downloads/mac/:path*",
        destination:
          "https://ontor-releases.s3.us-east-2.amazonaws.com/mac/:path*",
      },
      {
        source: "/downloads/windows/:path*",
        destination:
          "https://github.com/msahamed/healthOS/releases/download/windows-v1.0.0-beta.1/:path*",
      },
    ];
  },
};

export default nextConfig;

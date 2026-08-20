import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  // Desktop installers live in the ontor-releases S3 bucket and are exposed
  // through stable first-party download URLs. Windows is temporarily mirrored
  // below the bucket's existing public mac/ prefix.
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
          "https://ontor-releases.s3.us-east-2.amazonaws.com/mac/windows/:path*",
      },
    ];
  },
};

export default nextConfig;

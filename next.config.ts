import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.proofworks.ca",
      },
    ],
    domains: ["images.unsplash.com"],
  },
};

export default nextConfig;

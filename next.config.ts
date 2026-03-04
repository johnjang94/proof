/* eslint-disable @typescript-eslint/no-require-imports */
import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

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

export default withPWA(nextConfig);

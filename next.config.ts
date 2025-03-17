import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/cpu-scheduler", // Ensure all paths include the repo name
  assetPrefix: "/cpu-scheduler/", // Ensure static assets are prefixed correctly
  images: { unoptimized: true },
  trailingSlash: true, // Fixes missing file paths
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/cpu-scheduler',
  assetPrefix: '/cpu-scheduler/',
  trailingSlash: true, // Ensures proper URL resolution
  images: { unoptimized: true },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/cpu-scheduler', // Replace with your repository name if different
  assetPrefix: '/cpu-scheduler/', // Replace with your repository name if different
  images: { unoptimized: true },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;
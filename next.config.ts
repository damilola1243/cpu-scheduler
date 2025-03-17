import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/cpu-scheduler', // Required for GitHub Pages
  assetPrefix: '/cpu-scheduler/', // Ensures static assets load correctly
  images: { unoptimized: true },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;

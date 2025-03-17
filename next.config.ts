import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/cpu-scheduler', // Ensure this matches your GitHub Pages repo name or sub-path
  assetPrefix: '/cpu-scheduler/', // Same here, it should match
  images: { unoptimized: true }, // Optional, if using images
  webpack: (config) => {
    config.resolve.fallback = { fs: false }; // If you're using features that rely on fs
    return config;
  },
};

export default nextConfig;

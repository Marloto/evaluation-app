import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.BASE_PATH || '',
  reactStrictMode: true,  // Aktiviert strikte Prüfungen
};

export default nextConfig;

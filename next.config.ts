import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.BASE_PATH || '',
  reactStrictMode: true,  // Aktiviert strikte Prüfungen
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // The Anthropic SDK ships node-only credential helpers. In the browser
      // build those paths are never taken, so the node builtins are stubbed out.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, '');
        })
      );
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        child_process: false,
        util: false,
        url: false,
        buffer: false,
        process: false,
      };
    }
    return config;
  },
};

export default nextConfig;

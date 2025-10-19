import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Suppress hydration warnings for browser extensions
    suppressHydrationWarning: true,
  },
  // Disable strict mode to avoid double rendering in development
  reactStrictMode: false,
};

export default nextConfig;
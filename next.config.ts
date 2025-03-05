import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Optimizes for production deployments
  poweredByHeader: false, // Security: removes the X-Powered-By header
  reactStrictMode: true, // Helps identify issues early
  compress: true, // Enable compression for faster page loads
};

export default nextConfig;

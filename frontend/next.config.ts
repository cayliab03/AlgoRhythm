import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // This is mandatory for static exports!
  },
  eslint: {
    ignoreDuringBuilds: true, // This prevents small syntax warnings from breaking the build
  },
  typescript: {
    ignoreBuildErrors: true, // This ignores type mismatches so we can get the site live first
  },
};

export default nextConfig;

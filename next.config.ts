import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration
  turbopack: {
    // Add custom rules here if needed, but avoid forcing a root path that breaks resolution
  }
};

export default nextConfig;

import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "ajel.sa" },
      { protocol: "https", hostname: "cdn.ajel.sa" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  // Arabic + RTL friendly
  i18n: undefined, // We use single Arabic locale; switch via next-intl if multilingual added later
  poweredByHeader: false,
  compress: true,
};

export default config;

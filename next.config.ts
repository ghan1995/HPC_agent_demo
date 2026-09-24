import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Keep exported assets relative so `out/index.html` also works when it is
  // opened directly from Finder with a file:// URL.
  assetPrefix: ".",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;

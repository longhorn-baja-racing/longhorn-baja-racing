import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  basePath: "",
  assetPrefix: "",
  trailingSlash: true,

  env: {
    NEXT_PUBLIC_BASE_PATH: "",
  },

  images: {
    unoptimized: true,
  }
};

export default nextConfig;

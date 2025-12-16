import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  basePath: "/longhorn-baja-racing",
  assetPrefix: "/longhorn-baja-racing",
  trailingSlash: true,

  env: {
    NEXT_PUBLIC_BASE_PATH: "/longhorn-baja-racing",
  },

  images: {
    unoptimized: true,
  }
};

export default nextConfig;

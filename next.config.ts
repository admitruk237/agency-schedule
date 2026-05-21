import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/agency-schedule",
  images: { unoptimized: true },
};

export default nextConfig;

import type { NextConfig } from "next";

const CDN_PREFIX = "https://cdn.networklayer.co.uk/paulalivingstone";
const isProduction = process.env.NODE_ENV === "production";
const assetPrefix = isProduction ? CDN_PREFIX : undefined;
const basePathFromCdn = isProduction
  ? new URL(CDN_PREFIX).pathname.replace(/\/$/, "")
  : undefined;

const nextConfig: NextConfig = {
  assetPrefix,
  ...(basePathFromCdn
    ? {
        basePath: basePathFromCdn,
      }
    : {}),
};

export default nextConfig;

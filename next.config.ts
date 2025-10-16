import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Allow optimized delivery directly from the Network Layer CDN.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.networklayer.co.uk',
        pathname: '/paulalivingstone/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Explicitly declare base asset prefix for production builds.
  assetPrefix:
    process.env.NODE_ENV === 'production'
      ? 'https://cdn.networklayer.co.uk/paulalivingstone'
      : undefined,
};

export default nextConfig;

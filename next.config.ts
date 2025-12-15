import type { NextConfig } from "next";

// Get store ID from environment variable (defaults to '1' for local development)
const storeId = process.env.NEXT_PUBLIC_STORE_ID || '1';

const nextConfig: NextConfig = {
  // Expose store ID to the client
  env: {
    NEXT_PUBLIC_STORE_ID: storeId,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'modytest-002-site3.atempurl.com',
      },
      {
        protocol: 'https',
        hostname: 'modytest-002-site3.atempurl.com',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
    ],
  },

  // Headers for PWA manifest and service worker
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

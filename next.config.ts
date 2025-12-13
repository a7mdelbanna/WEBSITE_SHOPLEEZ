import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/demo/apple_game',
        destination: '/demo/apple_game/index.html',
      },
      {
        source: '/demo/apple_game/',
        destination: '/demo/apple_game/index.html',
      },
    ];
  },
};

export default nextConfig;

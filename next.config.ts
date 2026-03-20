import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/trading/:path*',
        destination: `http://${process.env.NEXT_PUBLIC_TRADING_API_HOST}:8080/:path*`, 
      },
    ]
  },
};

export default nextConfig;

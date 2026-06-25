import type { NextConfig } from 'next';

// Serve the well-known text files as markdown (parity with the static site).
const md = [{ key: 'Content-Type', value: 'text/markdown; charset=utf-8' }];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: '/examples/:path*', headers: md },
      { source: '/llms.txt', headers: md },
      { source: '/capabilities.txt', headers: md },
    ];
  },
};

export default nextConfig;

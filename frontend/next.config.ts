import type { NextConfig } from "next";

const ODOO_URL = process.env.ODOO_INTERNAL_URL || 'http://localhost:8069';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,

  // Universal proxy rewrites: completely eliminates any CORS by proxying all backend calls
  async rewrites() {
    return [
      {
        source: '/cover/api/:path*',
        destination: `${ODOO_URL}/cover/api/:path*`,
      },
      {
        source: '/web/image/:path*',
        destination: `${ODOO_URL}/web/image/:path*`,
      },
      {
        source: '/cover_events/static/:path*',
        destination: `${ODOO_URL}/cover_events/static/:path*`,
      },
    ];
  },

  // Global CORS and security headers for all routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS,PATCH' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With, Accept, Origin' },
        ],
      },
    ];
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;

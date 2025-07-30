/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '*.archive.org',
      },
    ],
  },
  experimental: {
  },
  allowedDevOrigins: ["*.cloudworkstations.dev"],
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      const { devServer } = config;
      if (devServer) {
        devServer.webSocketURL = `wss://${process.env.MONOSPACE_SERVER_HOST || 'localhost'}${process.env.MONOSPACE_SERVER_PORT ? `:${process.env.MONOSPACE_SERVER_PORT}` : ''}/_next/webpack-hmr`;
      }
    }
    return config;
  },
};

export default nextConfig;

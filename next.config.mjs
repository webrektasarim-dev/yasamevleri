/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Disable Fast Refresh logs
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Suppress development logs
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    return config;
  },
};

export default nextConfig;







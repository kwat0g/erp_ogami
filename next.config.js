/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Enable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Configure webpack for additional optimizations
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
  // Add environment variables that will be available on the client side
  env: {
    APP_NAME: 'Manufacturing ERP',
    APP_DESCRIPTION: 'Comprehensive ERP system for automotive parts manufacturing',
    APP_VERSION: '1.0.0',
  },
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Configure build output
  output: 'standalone',
};

module.exports = nextConfig;

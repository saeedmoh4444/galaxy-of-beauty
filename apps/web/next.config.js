/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@galaxy/shared', '@galaxy/api', '@galaxy/db'],
  experimental: {
    optimizePackageImports: ['@galaxy/shared'],
  },
};

export default nextConfig;

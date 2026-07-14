/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@galaxy/shared', '@galaxy/api', '@galaxy/db'],
  experimental: {
    optimizePackageImports: ['@galaxy/shared'],
  },

  // ── Image Optimization ─────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24h cache for optimized images
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.galaxyofbeauty.sa' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // ── ISR / Cache ────────────────────────────────────────
  // Pages are revalidated every 60s in production
  // Use per-page `export const revalidate = 60` for fine-grained control

  // ── Compression ────────────────────────────────────────
  compress: true,

  // ── Security Headers ───────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(self), payment=()',
          },
          // Cache static assets aggressively
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API + dynamic pages: never cache
      {
        source: '/(api|login|register|dashboard|admin|bookings|wallet|profile)/(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ];
  },

  // ── Redirects ──────────────────────────────────────────
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/admin', destination: '/admin/dashboard', permanent: true },
      { source: '/tech', destination: '/tech/dashboard', permanent: true },
    ];
  },

  // ── Bundle Optimization ────────────────────────────────
  poweredByHeader: false,
  reactStrictMode: true,

  webpack(config, { isServer, dev }) {
    // Enable tree-shaking for barrel files
    config.optimization = {
      ...config.optimization,
      sideEffects: true,
      usedExports: true,
    };

    // Add bundle analyzer in analyze mode
    if (process.env['ANALYZE'] === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
        }),
      );
    }

    return config;
  },
};

export default nextConfig;

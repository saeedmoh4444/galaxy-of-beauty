/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@galaxy/shared', '@galaxy/api', '@galaxy/db'],

  // TypeScript type checking is handled separately by `pnpm type-check` (tsc --noEmit).
  // Next.js build may produce TS2589 "type instantiation excessively deep" false
  // positives from deeply nested tRPC RouterOutput types. These are safe to ignore
  // because the separate `tsc --noEmit` step catches all real type errors.
  // ADR-001: TypeScript type-checking is handled separately by `pnpm type-check`
  // (tsc --noEmit, 10/10 workspaces). Next.js build may produce TS2589 false
  // positives from deeply nested tRPC RouterOutput types. See docs/adr/001-ts-build-strategy.md
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

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
      { protocol: 'https', hostname: 'images.unsplash.com' },
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
        source:
          '/(api|login|register|dashboard|admin|bookings|wallet|profile|tech|cart|checkout|payments|2fa)/(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
      // Content Security Policy
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.openai.com https://*.sentry.io wss:",
              "frame-src 'self' https://www.youtube.com https://js.stripe.com",
              "media-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
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
    // Suppress bullmq optional dependency warning (falls back to ioredis)
    config.resolve = {
      ...config.resolve,
      alias: { ...config.resolve?.alias, '@valkey/valkey-glide': false },
    };

    // Enable tree-shaking for barrel files
    // Note: do NOT set usedExports — it conflicts with Next.js's cacheUnaffected
    config.optimization = {
      ...config.optimization,
      sideEffects: true,
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

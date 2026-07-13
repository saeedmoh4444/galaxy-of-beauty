/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@galaxy/shared', '@galaxy/api', '@galaxy/db'],
  experimental: {
    optimizePackageImports: ['@galaxy/shared'],
  },

  // Security headers applied to all responses
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Disable XSS auditor (legacy; CSP handles this now)
          { key: 'X-XSS-Protection', value: '0' },
          // Control referrer information
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=()',
          },
          // Cache control for API responses
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },

  // Security: strip server identification header
  poweredByHeader: false,
};

export default nextConfig;

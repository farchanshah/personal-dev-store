/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Tambahkan output standalone untuk Vercel
  output: 'standalone',
  
  // Transpile package internal
  transpilePackages: ['@devstore/ui', '@devstore/utils', '@devstore/types'],
  
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'your-cdn-domain.com',
      'devstore-assets.s3.amazonaws.com',
    ],
    formats: ['image/avif', 'image/webp'],
    // Tambahkan unoptimized untuk Vercel
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  experimental: {
    serverActions: true,
    optimizeCss: true,
    // Tambahkan untuk monorepo
    outputFileTracingRoot: '../..',
  },
  
  // Nonaktifkan type checking dan eslint saat build di Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  async rewrites() {
    // Hanya gunakan rewrites jika API_URL ada, jika tidak gunakan local
    if (process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        },
      ];
    }
    
    // Untuk development/local, arahkan ke localhost:3000
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

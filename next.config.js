const bundleAnalyzer = require('@next/bundle-analyzer');
const path = require('path');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
  analyzerMode: 'static',
  reportFilename: process.env.BUNDLE_ANALYZE === 'server' ? '../analyze/server.html' : '../analyze/client.html',
});

/** @type {import('next').NextConfig} */

// Security Headers with relaxed CSP for Next.js
const securityHeaders = [
  // Basic security headers
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  // Relaxed Permissions Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  // Relaxed Content Security Policy for Next.js
  {
    key: 'Content-Security-Policy',
    value: [
      // only our own origin by default
      "default-src 'self'",
      // Next’s inline hydration + our analytics
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      // Tailwind & any runtime styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // images from self, data URIs & blobs
      "img-src 'self' data: blob:",
      // fonts from self, gstatic, and data URIs
      "font-src 'self' https://fonts.gstatic.com data:",
      // only our APIs + Firebase + GA + websockets
      "connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://firebaseinstallations.googleapis.com https://www.google-analytics.com wss:",
      // everything else locked down
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "manifest-src 'self'"
    ].join('; ')
  }
  
];

const nextConfig = {
  // Core Next.js settings
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
  
  // Disable build-blocking linting for now
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image configuration
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    domains: [
      'firebasestorage.googleapis.com',
      'res.cloudinary.com',
      'lh3.googleusercontent.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.firebaseapp.com',
      }
    ]
  },
  
  compress: true,
  
  // Simplified experimental config
  experimental: {
    optimizeCss: false,
  },
  
  // Updated webpack config with path aliases
  webpack: (config, { dev }) => {
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/ui': path.resolve(__dirname, 'src/ui'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/firebase': path.resolve(__dirname, 'src/firebase')
    };

    // Bundle splitting in production with analysis
    if (!dev && process.env.ANALYZE === "true") {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          firebase: {
            test: /[\\/]node_modules[\\/]firebase[\\/]/,
            name: 'firebase',
            priority: 15,
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  
  // FIXED: Correct environment variable names for Firebase
  env: {
    // Map to correct NEXT_PUBLIC_ prefixed variables
    FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGE_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    JWT_SECRET: process.env.JWT_SECRET,
  },

  // Apply security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      }
    ];
  },

  // Simplified redirects - only essential ones
  async redirects() {
    return [
      // Essential redirects for deleted pages
      {
        source: '/industries',
        destination: '/industries/oil-gas',
        permanent: false,
      },
      {
        source: '/solution',
        destination: '/portfolio',
        permanent: false,
      },
      {
        source: '/events',
        destination: '/posts/events',
        permanent: false,
      },
      {
        source: '/posts',
        destination: '/posts/news',
        permanent: false,
      },
      {
        source: '/resources',
        destination: '/resources/case-study',
        permanent: false,
      },
    ];
  },
};

// Add a console log to verify config is being picked up
console.log('⛔️ Using custom webpack aliases for path resolution');

module.exports = withBundleAnalyzer(nextConfig);
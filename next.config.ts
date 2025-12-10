import type { NextConfig } from "next";

const securityHeaders = [
  {
    // Prevent clickjacking attacks
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    // Prevent MIME type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    // Enable XSS filter in browsers
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    // Control referrer information
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    // Permissions Policy (formerly Feature-Policy)
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    // Content Security Policy
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com", // Required for Next.js + Turnstile
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
    ].join('; ')
  }
];

const nextConfig: NextConfig = {
  turbopack: {
    root: './',
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

// Initialize OpenNext Cloudflare for local development
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

import type { NextConfig } from "next";

// CSP is intentionally permissive on script-src/connect-src/frame-src: the admin
// Script Manager injects arbitrary 3rd-party tracking snippets (GTM, GA4, Meta
// Pixel, etc.) at runtime via dangerouslySetInnerHTML, so nonce/hash-based
// script-src isn't viable without a larger refactor. This still satisfies the
// "no CSP" / "no object-src / no base-uri" findings, which are the high-severity ones.
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // allow-popups (not strict same-origin) so OAuth popup flows (Meta/Google/Amazon
  // ad account connection) keep their window.opener reference
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

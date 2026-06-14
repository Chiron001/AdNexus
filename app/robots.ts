import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all bots to crawl public marketing pages
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',          // API routes — never index
          '/admin/',        // Super-admin panel
          '/dashboard',     // Authenticated dashboard
          '/accounts',      // Ad account manager
          '/diagnostics',   // Diagnostic reports
          '/recommendations',
          '/analytics',
          '/audiences',
          '/funnel',
          '/goals',
          '/alerts',
          '/ai',
          '/reports',
          '/billing',
          '/settings',
          '/onboarding',
          '/auth/',         // Supabase auth callback routes
          '/_next/',        // Next.js internals (Googlebot respects this)
        ],
      },
    ],
    sitemap: 'https://adnexusone.com/sitemap.xml',
    host:    'https://adnexusone.com',
  }
}

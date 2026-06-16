import type { MetadataRoute } from 'next'

const BLOCKED_PATHS = [
  '/api/',
  '/admin/',
  '/dashboard',
  '/accounts',
  '/diagnostics',
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
  '/auth/',
  '/_next/',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Standard search crawlers — full access to public pages
        userAgent: '*',
        allow: '/',
        disallow: BLOCKED_PATHS,
      },
      {
        // OpenAI GPTBot — allow public marketing content
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/platform',
          '/ai-engine',
          '/pricing',
          '/blog',
          '/blog/',
          '/industries/',
          '/tools/',
          '/case-studies',
          '/customers',
          '/platform-tour',
          '/help-center',
        ],
        disallow: BLOCKED_PATHS,
      },
      {
        // Anthropic Claude — allow public marketing content
        userAgent: 'ClaudeBot',
        allow: [
          '/',
          '/platform',
          '/ai-engine',
          '/pricing',
          '/blog',
          '/blog/',
          '/industries/',
          '/tools/',
          '/case-studies',
          '/customers',
        ],
        disallow: BLOCKED_PATHS,
      },
      {
        // Google Gemini / Bard
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: BLOCKED_PATHS,
      },
      {
        // Perplexity
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: BLOCKED_PATHS,
      },
      {
        // Meta AI
        userAgent: 'FacebookBot',
        allow: '/',
        disallow: BLOCKED_PATHS,
      },
      {
        // Common scrapers that add no indexing value — block them
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: 'https://adnexusone.com/sitemap.xml',
    host:    'https://adnexusone.com',
  }
}

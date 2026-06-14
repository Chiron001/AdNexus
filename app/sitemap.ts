import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

const BASE = 'https://adnexusone.com'

// ── Static page dates (update when you change a page's content) ───────────────
const D = {
  core:       '2026-06-14',
  platform:   '2026-05-20',
  industries: '2026-05-10',
  resources:  '2026-04-15',
  company:    '2026-04-01',
  legal:      '2026-01-15',
} as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch published blog posts for dynamic entries
  const admin = createAdminClient()
  const { data: posts } = await admin
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const blogEntries: MetadataRoute.Sitemap = (posts ?? []).map(p => ({
    url:             `${BASE}/blog/${p.slug}`,
    lastModified:    p.updated_at ?? p.published_at,
    changeFrequency: 'weekly' as const,
    priority:        0.75,
  }))

  return [

    // ── Level 0: Root ───────────────────────────────────────────────────────
    { url: `${BASE}/`,        lastModified: D.core, changeFrequency: 'weekly',  priority: 1.0  },

    // ── Level 1: Core conversion pages ─────────────────────────────────────
    { url: `${BASE}/pricing`,    lastModified: D.core, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${BASE}/ai-engine`,  lastModified: D.core, changeFrequency: 'monthly', priority: 0.90 },

    // ── Level 1: Platform section root ──────────────────────────────────────
    { url: `${BASE}/platform`,                      lastModified: D.platform, changeFrequency: 'monthly', priority: 0.88 },

    // ── Level 2: Platform sub-pages ─────────────────────────────────────────
    { url: `${BASE}/platform/meta`,                 lastModified: D.platform, changeFrequency: 'monthly', priority: 0.78 },
    { url: `${BASE}/platform/google`,               lastModified: D.platform, changeFrequency: 'monthly', priority: 0.78 },
    { url: `${BASE}/platform/amazon`,               lastModified: D.platform, changeFrequency: 'monthly', priority: 0.78 },
    { url: `${BASE}/platform/diagnostic-engine`,    lastModified: D.platform, changeFrequency: 'monthly', priority: 0.72 },
    { url: `${BASE}/platform/health-scoring`,       lastModified: D.platform, changeFrequency: 'monthly', priority: 0.72 },
    { url: `${BASE}/platform/revenue-impact`,       lastModified: D.platform, changeFrequency: 'monthly', priority: 0.72 },
    { url: `${BASE}/platform/alerts`,               lastModified: D.platform, changeFrequency: 'monthly', priority: 0.68 },
    { url: `${BASE}/platform/audit-reports`,        lastModified: D.platform, changeFrequency: 'monthly', priority: 0.68 },

    // ── Level 1: Industries ─────────────────────────────────────────────────
    { url: `${BASE}/industries/d2c-ecommerce`,      lastModified: D.industries, changeFrequency: 'monthly', priority: 0.82 },
    { url: `${BASE}/industries/fashion-lifestyle`,  lastModified: D.industries, changeFrequency: 'monthly', priority: 0.78 },
    { url: `${BASE}/industries/health-wellness`,    lastModified: D.industries, changeFrequency: 'monthly', priority: 0.78 },
    { url: `${BASE}/industries/performance-agencies`, lastModified: D.industries, changeFrequency: 'monthly', priority: 0.78 },
    { url: `${BASE}/industries/enterprise-brands`,  lastModified: D.industries, changeFrequency: 'monthly', priority: 0.78 },
    { url: `${BASE}/industries/travel-lifestyle`,   lastModified: D.industries, changeFrequency: 'monthly', priority: 0.75 },

    // ── Level 1: Tools ──────────────────────────────────────────────────────
    { url: `${BASE}/tools/roas-calculator`,         lastModified: D.resources, changeFrequency: 'monthly', priority: 0.82 },
    { url: `${BASE}/tools/ad-health-scorecard`,     lastModified: D.resources, changeFrequency: 'monthly', priority: 0.78 },

    // ── Level 1: Blog index ─────────────────────────────────────────────────
    { url: `${BASE}/blog`, lastModified: blogEntries[0]?.lastModified ?? D.resources, changeFrequency: 'weekly', priority: 0.80 },

    // ── Level 2: Individual blog posts (dynamic) ────────────────────────────
    ...blogEntries,

    // ── Level 1: Resources ──────────────────────────────────────────────────
    { url: `${BASE}/case-studies`,  lastModified: D.resources, changeFrequency: 'monthly', priority: 0.70 },
    { url: `${BASE}/platform-tour`, lastModified: D.resources, changeFrequency: 'monthly', priority: 0.68 },
    { url: `${BASE}/help-center`,   lastModified: D.resources, changeFrequency: 'weekly',  priority: 0.62 },

    // ── Level 1: Company ────────────────────────────────────────────────────
    { url: `${BASE}/customers`, lastModified: D.company, changeFrequency: 'monthly', priority: 0.68 },
    { url: `${BASE}/contact`,   lastModified: D.company, changeFrequency: 'yearly',  priority: 0.58 },

    // ── Level 1: Legal (low crawl priority) ─────────────────────────────────
    { url: `${BASE}/privacy`,  lastModified: D.legal, changeFrequency: 'yearly', priority: 0.30 },
    { url: `${BASE}/terms`,    lastModified: D.legal, changeFrequency: 'yearly', priority: 0.30 },
    { url: `${BASE}/refund`,   lastModified: D.legal, changeFrequency: 'yearly', priority: 0.30 },
    { url: `${BASE}/cookies`,  lastModified: D.legal, changeFrequency: 'yearly', priority: 0.30 },
  ]
}

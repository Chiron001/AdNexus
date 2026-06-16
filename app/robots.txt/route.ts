import { NextResponse } from 'next/server'
import { createRawAdminClient } from '@/lib/supabase/server'

export const revalidate = 60

const FALLBACK = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard
Disallow: /accounts
Disallow: /diagnostics
Disallow: /recommendations
Disallow: /analytics
Disallow: /audiences
Disallow: /funnel
Disallow: /goals
Disallow: /alerts
Disallow: /ai
Disallow: /reports
Disallow: /billing
Disallow: /settings
Disallow: /onboarding
Disallow: /auth/
Disallow: /_next/

User-agent: GPTBot
Allow: /
Allow: /platform
Allow: /ai-engine
Allow: /pricing
Allow: /blog/
Allow: /industries/
Allow: /tools/
Disallow: /api/
Disallow: /admin/

User-agent: ClaudeBot
Allow: /
Allow: /platform
Allow: /ai-engine
Allow: /pricing
Disallow: /api/
Disallow: /admin/

User-agent: Google-Extended
Allow: /
Disallow: /api/
Disallow: /admin/

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

Sitemap: https://adnexusone.com/sitemap.xml`

export async function GET() {
  let content = FALLBACK

  try {
    const admin = createRawAdminClient()
    const { data } = await admin
      .from('site_config')
      .select('value')
      .eq('key', 'robots_txt')
      .single()

    if (data?.value) content = data.value
  } catch {
    // fall through to FALLBACK
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type':  'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  })
}

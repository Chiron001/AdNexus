import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import HomeClient from './_home-client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const admin = createAdminClient()
  const { data: seo } = await admin.from('page_seo').select('*').eq('page_path', '/').single()
  const title       = seo?.meta_title       ?? 'Adnexusone — AI-Powered Ad Account Diagnostics'
  const description = seo?.meta_description ?? 'Connect Meta Ads, Google Ads, and Amazon Ads. Get instant health scores, diagnosed issues ranked by revenue impact, and plain-English AI recommendations.'
  const ogImage     = seo?.og_image_url     ?? undefined

  return {
    title,
    description,
    robots:     seo?.robots_directive ?? 'index,follow',
    alternates: { canonical: seo?.canonical_url ?? 'https://adnexusone.com' },
    openGraph: {
      title:       seo?.og_title       ?? title,
      description: seo?.og_description ?? description,
      url:         'https://adnexusone.com',
      siteName:    'AdNexus',
      type:        'website',
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card:        'summary_large_image',
      title:       seo?.og_title       ?? title,
      description: seo?.og_description ?? description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export default function Page() {
  return <HomeClient />
}

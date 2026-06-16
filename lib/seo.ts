import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

const BASE      = 'https://adnexusone.com'
const SITE_NAME = 'Adnexusone'

export async function getPageMetadata(
  path: string,
  defaults: { title: string; description: string }
): Promise<Metadata> {
  try {
    const admin = createAdminClient()
    const { data: seo } = await admin
      .from('page_seo')
      .select('*')
      .eq('page_path', path)
      .single()

    const title       = seo?.meta_title       ?? defaults.title
    const description = seo?.meta_description ?? defaults.description
    const ogImage     = seo?.og_image_url     ?? undefined
    const canonical   = seo?.canonical_url    ?? `${BASE}${path}`

    return {
      title,
      description,
      robots:     seo?.robots_directive ?? 'index,follow',
      alternates: { canonical },
      openGraph: {
        title:       seo?.og_title       ?? title,
        description: seo?.og_description ?? description,
        url:         canonical,
        siteName:    SITE_NAME,
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
  } catch {
    return {
      title:       defaults.title,
      description: defaults.description,
      alternates:  { canonical: `${BASE}${path}` },
    }
  }
}

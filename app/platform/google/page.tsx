import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import GoogleClient from './_client'
import { BreadcrumbJsonLD } from '@/components/seo/BreadcrumbJsonLD'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/platform/google', {
    title: 'Google Ads Diagnostics — Adnexusone',
    description: 'Diagnose Google Ads account issues automatically. Catch keyword cannibalization, Quality Score drops, conversion tracking gaps, and wasted spend.',
  })
}

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLD items={[
        { name: 'Home', href: '/' },
        { name: 'Platform', href: '/platform' },
        { name: 'Google Ads Diagnostics', href: '/platform/google' },
      ]} />
      <GoogleClient />
    </>
  )
}

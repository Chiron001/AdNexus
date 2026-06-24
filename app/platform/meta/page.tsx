import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import MetaClient from './_client'
import { BreadcrumbJsonLD } from '@/components/seo/BreadcrumbJsonLD'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/platform/meta', {
    title: 'Meta Ads Diagnostics — Adnexusone',
    description: 'Diagnose Meta Ads account issues automatically. Detect creative fatigue, audience overlap, pixel failures, and budget inefficiencies in real time.',
  })
}

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLD items={[
        { name: 'Home', href: '/' },
        { name: 'Platform', href: '/platform' },
        { name: 'Meta Ads Diagnostics', href: '/platform/meta' },
      ]} />
      <MetaClient />
    </>
  )
}

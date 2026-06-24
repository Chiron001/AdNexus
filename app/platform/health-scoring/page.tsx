import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import HealthScoringClient from './_client'
import { BreadcrumbJsonLD } from '@/components/seo/BreadcrumbJsonLD'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/platform/health-scoring', {
    title: 'Ad Account Health Scoring — Adnexusone',
    description: 'Every connected ad account gets a live health score updated on every sync. Track score trends over 30, 60, and 90 days across your entire portfolio.',
  })
}

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLD items={[
        { name: 'Home', href: '/' },
        { name: 'Platform', href: '/platform' },
        { name: 'Ad Account Health Scoring', href: '/platform/health-scoring' },
      ]} />
      <HealthScoringClient />
    </>
  )
}

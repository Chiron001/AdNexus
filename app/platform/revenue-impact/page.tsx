import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import RevenueClient from './_client'
import { BreadcrumbJsonLD } from '@/components/seo/BreadcrumbJsonLD'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/platform/revenue-impact', {
    title: 'Revenue Impact Analysis — Adnexusone',
    description: 'Every ad account issue is quantified in dollars. See exactly how much each problem is costing you so you know what to fix first.',
  })
}

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLD items={[
        { name: 'Home', href: '/' },
        { name: 'Platform', href: '/platform' },
        { name: 'Revenue Impact Analysis', href: '/platform/revenue-impact' },
      ]} />
      <RevenueClient />
    </>
  )
}

import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import AmazonClient from './_client'
import { BreadcrumbJsonLD } from '@/components/seo/BreadcrumbJsonLD'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/platform/amazon', {
    title: 'Amazon Ads Diagnostics — Adnexusone',
    description: 'Diagnose Amazon Advertising account issues. Identify high-ACOS campaigns, zero-sale ASINs, and wasted search term spend automatically.',
  })
}

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLD items={[
        { name: 'Home', href: '/' },
        { name: 'Platform', href: '/platform' },
        { name: 'Amazon Ads Diagnostics', href: '/platform/amazon' },
      ]} />
      <AmazonClient />
    </>
  )
}

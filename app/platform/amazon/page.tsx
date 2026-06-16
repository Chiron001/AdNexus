import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import AmazonClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/platform/amazon', {
    title: 'Amazon Ads Diagnostics — Adnexusone',
    description: 'Diagnose Amazon Advertising account issues. Identify high-ACOS campaigns, zero-sale ASINs, and wasted search term spend automatically.',
  })
}

export default function Page() {
  return <AmazonClient />
}

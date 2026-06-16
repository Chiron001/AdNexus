import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import TravelClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/industries/travel-lifestyle', {
    title: 'Ad Diagnostics for Travel & Lifestyle Brands — Adnexusone',
    description: 'Ad intelligence for travel and lifestyle brands. Protect budget during peak seasons and get alerted to performance drops before they escalate.',
  })
}

export default function Page() {
  return <TravelClient />
}

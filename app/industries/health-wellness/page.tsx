import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import HealthClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/industries/health-wellness', {
    title: 'Ad Diagnostics for Health & Wellness Brands — Adnexusone',
    description: 'Ad account intelligence for health and wellness brands. Identify Amazon ACOS waste, Meta pixel issues, and Google campaign inefficiencies.',
  })
}

export default function Page() {
  return <HealthClient />
}

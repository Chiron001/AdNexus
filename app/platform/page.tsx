import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import PlatformClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/platform', {
    title: 'Platform — Adnexusone Ad Diagnostics',
    description: 'One platform for Meta, Google, and Amazon ad diagnostics. Health scoring, revenue-impact ranking, AI briefs, and real-time alerts in a single workspace.',
  })
}

export default function Page() {
  return <PlatformClient />
}

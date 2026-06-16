import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import MetaClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/platform/meta', {
    title: 'Meta Ads Diagnostics — Adnexusone',
    description: 'Diagnose Meta Ads account issues automatically. Detect creative fatigue, audience overlap, pixel failures, and budget inefficiencies in real time.',
  })
}

export default function Page() {
  return <MetaClient />
}

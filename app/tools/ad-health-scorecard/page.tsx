import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import ScorecardClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/tools/ad-health-scorecard', {
    title: 'Ad Account Health Scorecard — Free Audit Tool — Adnexusone',
    description: 'Score your ad account health across 30 diagnostic checks. Free self-assessment tool for Meta, Google, and Amazon advertisers.',
  })
}

export default function Page() {
  return <ScorecardClient />
}

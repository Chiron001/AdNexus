import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import RoasClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/tools/roas-calculator', {
    title: 'ROAS Calculator — Free Ad Return Calculator — Adnexusone',
    description: 'Calculate your return on ad spend across Meta, Google, and Amazon. Free ROAS calculator with breakeven and target ROAS analysis.',
  })
}

export default function Page() {
  return <RoasClient />
}

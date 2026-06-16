import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import AgenciesClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/industries/performance-agencies', {
    title: 'Ad Diagnostics for Performance Agencies — Adnexusone',
    description: 'Manage 10+ client ad accounts without missing issues. Adnexusone runs continuous diagnostics across all accounts so you catch problems before clients do.',
  })
}

export default function Page() {
  return <AgenciesClient />
}

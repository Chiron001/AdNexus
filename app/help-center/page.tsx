import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import HelpCenterClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/help-center', {
    title: 'Help Center — Adnexusone',
    description: 'Documentation, guides, and answers for Adnexusone. Learn how to connect accounts, read diagnostics, and get the most out of your ad intelligence.',
  })
}

export default function Page() {
  return <HelpCenterClient />
}

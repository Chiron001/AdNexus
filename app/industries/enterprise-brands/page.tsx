import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import EnterpriseClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/industries/enterprise-brands', {
    title: 'Ad Diagnostics for Enterprise Brands — Adnexusone',
    description: 'Enterprise-grade ad account monitoring for large brands. Portfolio health scoring, multi-account dashboards, and AI-powered recommendations at scale.',
  })
}

export default function Page() {
  return <EnterpriseClient />
}

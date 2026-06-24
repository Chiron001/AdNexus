import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import AuditClient from './_client'
import { BreadcrumbJsonLD } from '@/components/seo/BreadcrumbJsonLD'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/platform/audit-reports', {
    title: 'AI Audit Reports — Adnexusone',
    description: 'Generate plain-English audit reports for any ad account in one click. Issues, revenue impact, and recommendations — ready to share with clients or leadership.',
  })
}

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLD items={[
        { name: 'Home', href: '/' },
        { name: 'Platform', href: '/platform' },
        { name: 'AI Audit Reports', href: '/platform/audit-reports' },
      ]} />
      <AuditClient />
    </>
  )
}

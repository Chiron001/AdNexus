import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import CaseStudiesClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/case-studies', {
    title: 'Case Studies — Adnexusone',
    description: 'Real ad account issues found, diagnosed, and fixed using Adnexusone. Before-and-after metrics across Meta, Google, and Amazon.',
  })
}

export default function Page() {
  return <CaseStudiesClient />
}

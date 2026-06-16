import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import DiagnosticClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/platform/diagnostic-engine', {
    title: 'Diagnostic Engine — Adnexusone',
    description: '30-point diagnostic engine that runs across every connected ad account. Issues ranked by revenue impact so you always fix the most expensive problem first.',
  })
}

export default function Page() {
  return <DiagnosticClient />
}

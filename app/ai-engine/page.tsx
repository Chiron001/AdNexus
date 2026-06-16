import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import AiEngineClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/ai-engine', {
    title: 'Adnexusone AI — Smart Ad Account Intelligence',
    description: 'Ask natural-language questions about your Meta, Google, and Amazon ad accounts. Get account-specific answers, not generic advice.',
  })
}

export default function Page() {
  return <AiEngineClient />
}

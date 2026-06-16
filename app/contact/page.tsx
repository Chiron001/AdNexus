import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import ContactClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/contact', {
    title: 'Contact — Adnexusone',
    description: 'Get in touch with the Adnexusone team. Questions about pricing, integrations, or enterprise plans — we respond within one business day.',
  })
}

export default function Page() {
  return <ContactClient />
}

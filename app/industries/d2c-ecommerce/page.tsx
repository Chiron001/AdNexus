import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import D2CClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/industries/d2c-ecommerce', {
    title: 'Ad Diagnostics for D2C Ecommerce — Adnexusone',
    description: 'Built for D2C ecommerce brands running Meta and Google ads. Catch ROAS drops, creative fatigue, and budget waste before they compound.',
  })
}

export default function Page() {
  return <D2CClient />
}

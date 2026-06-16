import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import FashionClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/industries/fashion-lifestyle', {
    title: 'Ad Diagnostics for Fashion & Lifestyle Brands — Adnexusone',
    description: 'Ad intelligence for fashion and lifestyle brands. Monitor campaign health, catch audience saturation, and protect your seasonal ad budget.',
  })
}

export default function Page() {
  return <FashionClient />
}

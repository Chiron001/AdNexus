import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import AlertsClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/platform/alerts', {
    title: 'Real-Time Ad Alerts — Adnexusone',
    description: 'Get Slack and email alerts the moment your ad accounts hit a problem. Budget exhaustion, ROAS drops, pixel failures — know before your clients do.',
  })
}

export default function Page() {
  return <AlertsClient />
}

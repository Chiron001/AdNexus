import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import PlatformTourClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/platform-tour', {
    title: 'Platform Tour — Adnexusone',
    description: 'Step-by-step walkthrough of Adnexusone. From connecting ad accounts to running your first diagnostic — under 10 minutes.',
  })
}

export default function Page() {
  return <PlatformTourClient />
}

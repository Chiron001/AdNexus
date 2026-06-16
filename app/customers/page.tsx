import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import CustomersClient from './_client'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/customers', {
    title: 'Customers — Adnexusone',
    description: 'See how D2C brands and performance agencies use Adnexusone to catch ad account issues early and protect their ad budget.',
  })
}

export default function Page() {
  return <CustomersClient />
}

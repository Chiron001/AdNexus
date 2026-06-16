import type { Metadata } from 'next'
import { Poppins, Lato } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/next'
import { createRawAdminClient } from '@/lib/supabase/server'

export const revalidate = 60

interface SiteScript {
  id: string
  script_html: string
  position: string
  is_active: boolean
}

async function getActiveScripts(): Promise<SiteScript[]> {
  try {
    const admin = createRawAdminClient()
    const { data } = await admin
      .from('site_scripts')
      .select('id, script_html, position, is_active')
      .eq('is_active', true)
      .order('created_at')
    return data ?? []
  } catch {
    return []
  }
}

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Adnexusone — AI-Powered Ad Account Diagnostics',
    template: '%s | Adnexusone',
  },
  description:
    'Connect Meta Ads, Google Ads, and Amazon Ads. Get instant health scores, diagnosed issues ranked by revenue impact, and plain-English AI recommendations.',
  metadataBase: new URL('https://adnexusone.com'),
  openGraph: {
    siteName: 'Adnexusone',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@adnexusone',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Adnexusone',
  url: 'https://adnexusone.com',
  logo: 'https://adnexusone.com/icon.svg',
  description: 'AI-powered ad account diagnostics for D2C brands and performance agencies.',
  sameAs: [
    'https://www.linkedin.com/company/adnexusone',
    'https://www.instagram.com/adnexusone',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: 'https://adnexusone.com/contact',
  },
}

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Adnexusone',
  url: 'https://adnexusone.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://adnexusone.com/blog?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Adnexusone',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://adnexusone.com',
  description: 'AI-powered ad account diagnostics platform for Meta, Google, and Amazon advertisers.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free diagnostic tier available',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const scripts = await getActiveScripts()
  const headScripts    = scripts.filter(s => s.position === 'head')
  const bodyStartScripts = scripts.filter(s => s.position === 'body_start')
  const bodyEndScripts = scripts.filter(s => s.position === 'body_end')

  return (
    <html lang="en" className={`${poppins.variable} ${lato.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_SCHEMA) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Scripts injected from Script Manager (head position loads before content) */}
        {headScripts.map(s => (
          <div key={s.id} dangerouslySetInnerHTML={{ __html: s.script_html }} />
        ))}
        {bodyStartScripts.map(s => (
          <div key={s.id} dangerouslySetInnerHTML={{ __html: s.script_html }} />
        ))}
        {children}
        {bodyEndScripts.map(s => (
          <div key={s.id} dangerouslySetInnerHTML={{ __html: s.script_html }} />
        ))}
        <Toaster richColors position="bottom-right" />
        <Analytics />
      </body>
    </html>
  )
}

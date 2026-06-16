import Link from 'next/link'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

import type { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/privacy', {
    title: 'Privacy Policy — Adnexusone',
    description: 'How Adnexusone collects, uses, and protects your personal data and ad account information.',
  })
}

const LAST_UPDATED = 'June 14, 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <LandingNav />

      <main className="max-w-3xl mx-auto px-5 sm:px-6 pt-20 sm:pt-32 pb-24">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-zinc-300 leading-relaxed">

          <section>
            <p>
              Adnexusone ("we", "us", or "our") operates the Adnexusone platform — an AI-powered ad account
              diagnostics tool for Meta Ads, Google Ads, and Amazon Ads. This Privacy Policy explains what
              data we collect, why we collect it, and how we protect it.
            </p>
            <p className="mt-3">
              By creating an account or using our platform, you agree to the practices described in this policy.
            </p>
          </section>

          <Section title="1. Information We Collect">
            <SubSection title="Account Information">
              When you sign up, we collect your name, email address, and company name. If you sign up via
              Google or Microsoft OAuth, we receive basic profile information (name, email, avatar) from
              those providers.
            </SubSection>
            <SubSection title="Ad Platform Data (via OAuth)">
              When you connect Meta Ads, Google Ads, or Amazon Ads, we request read-only OAuth access to
              your ad account metrics — campaign performance, spend, impressions, clicks, conversions, and
              audience data. We do <strong>not</strong> access personal data of your ad audiences, customer
              lists, or payment methods on those platforms. Access tokens are stored encrypted and only
              used to fetch diagnostic data.
            </SubSection>
            <SubSection title="Usage Data">
              We automatically collect information about how you use the platform: pages visited, features
              used, sync timestamps, browser type, device type, and IP address. This helps us improve the
              product and diagnose issues.
            </SubSection>
            <SubSection title="Payment Information">
              We use Paddle as our payment processor. Paddle is the Merchant of Record — they collect and
              store your card details directly on PCI DSS-certified infrastructure. We never see, store, or
              process raw card numbers, CVVs, or bank account details. We only store your Paddle Customer ID
              and Subscription ID.
            </SubSection>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide diagnostic analysis of your ad accounts</li>
              <li>To generate AI-powered insights and recommendations</li>
              <li>To send diagnostic alerts and weekly summary emails</li>
              <li>To process subscription payments and manage your plan</li>
              <li>To improve the platform through aggregated, anonymised analytics</li>
              <li>To communicate product updates and important account notices</li>
              <li>To detect and prevent fraud, abuse, and security incidents</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> sell your data. We do not use your ad account data to train AI
              models. Your campaign data is used solely to generate insights for your account.
            </p>
          </Section>

          <Section title="3. Data Sharing">
            <p>We share data only with the following categories of third-party services:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Supabase</strong> — our database and authentication provider (hosted on AWS)</li>
              <li><strong>Paddle</strong> — payment processing and subscription management</li>
              <li><strong>Meta, Google, Amazon</strong> — OAuth providers for ad account connections</li>
              <li><strong>Anthropic</strong> — AI inference for diagnostic recommendations (data is not retained or trained on per Anthropic's API terms)</li>
              <li><strong>Vercel</strong> — our hosting and deployment infrastructure</li>
            </ul>
            <p className="mt-3">
              We may disclose information if required by law, court order, or to protect the rights and
              safety of Adnexusone, our users, or the public.
            </p>
          </Section>

          <Section title="4. Data Retention">
            <p>
              We retain your account data for as long as your account is active. If you delete your account,
              we delete your personal data within 30 days, except where we are required by law to retain it
              longer (e.g. billing records for 7 years per Indian accounting requirements).
            </p>
            <p className="mt-3">Ad account diagnostic data is retained based on your plan:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Basic — 30 days</li>
              <li>Growth — 90 days</li>
              <li>Professional — 365 days</li>
            </ul>
          </Section>

          <Section title="5. Cookies">
            <p>
              We use essential cookies for authentication (session management) and functional cookies to
              remember your preferences. We do not use third-party advertising cookies. For full details,
              see our{' '}
              <Link href="/cookies" className="text-purple-400 hover:text-purple-300">Cookie Policy</Link>.
            </p>
          </Section>

          <Section title="6. Security">
            <p>
              We implement industry-standard security measures: HTTPS/TLS encryption in transit, AES-256
              encryption at rest for sensitive fields, role-based access controls, and regular security
              reviews. OAuth tokens are stored encrypted. We conduct regular audits of third-party services.
            </p>
            <p className="mt-3">
              No system is 100% secure. If you discover a security vulnerability, please email us at{' '}
              <a href="mailto:security@adnexusone.com" className="text-purple-400 hover:text-purple-300">security@adnexusone.com</a>.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Access</strong> — request a copy of the data we hold about you</li>
              <li><strong>Correction</strong> — update inaccurate data via your account settings</li>
              <li><strong>Deletion</strong> — request deletion of your account and all associated data</li>
              <li><strong>Portability</strong> — request your data in a machine-readable format</li>
              <li><strong>Opt-out</strong> — unsubscribe from marketing emails at any time</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, email{' '}
              <a href="mailto:privacy@adnexusone.com" className="text-purple-400 hover:text-purple-300">privacy@adnexusone.com</a>.
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              Our platform is not directed at children under 18. We do not knowingly collect data from
              minors. If you believe a minor has created an account, contact us immediately.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this policy from time to time. When we make material changes, we will notify
              you by email and update the "Last updated" date above. Continued use of the platform after
              changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>
              For any privacy-related questions or requests:<br />
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@adnexusone.com" className="text-purple-400 hover:text-purple-300">privacy@adnexusone.com</a><br />
              <strong>Address:</strong> Adnexusone, India
            </p>
          </Section>

        </div>
      </main>

      <LandingFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-zinc-800">{title}</h2>
      <div className="space-y-3 text-zinc-400">{children}</div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-zinc-200 mb-1.5">{title}</h3>
      <p className="text-zinc-400">{children}</p>
    </div>
  )
}

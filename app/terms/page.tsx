import Link from 'next/link'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata = { title: 'Terms of Service — Adnexusone' }

const LAST_UPDATED = 'June 14, 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <LandingNav />

      <main className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-24">
        <div className="mb-12">
          <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-zinc-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-zinc-300 leading-relaxed">

          <section>
            <p>
              These Terms of Service ("Terms") govern your access to and use of the Adnexusone platform
              ("Service"), operated by Adnexusone ("we", "us", or "our"). By creating an account or using
              the Service, you agree to these Terms. If you do not agree, do not use the Service.
            </p>
          </section>

          <Section title="1. Eligibility">
            <p>
              You must be at least 18 years old and have the authority to enter into a binding agreement
              on behalf of yourself or your organisation. By using the Service, you represent that you
              meet these requirements.
            </p>
          </Section>

          <Section title="2. Accounts">
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for
              all activity that occurs under your account. You must immediately notify us of any
              unauthorised use at{' '}
              <a href="mailto:support@adnexusone.com" className="text-purple-400 hover:text-purple-300">support@adnexusone.com</a>.
            </p>
            <p className="mt-3">
              You may not share your account with others, create multiple accounts for the same person, or
              use the Service for any purpose that violates applicable law.
            </p>
          </Section>

          <Section title="3. Subscription Plans & Billing">
            <SubSection title="Plans">
              We offer the following subscription plans:
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Basic</strong> — $19/month (includes a 30-day free trial)</li>
                <li><strong>Growth</strong> — $99/month</li>
                <li><strong>Professional</strong> — $499/month</li>
                <li><strong>Custom</strong> — contact us for enterprise pricing</li>
              </ul>
            </SubSection>

            <SubSection title="Free Trial">
              The Basic plan includes a 30-day free trial. You must provide valid payment details to start
              the trial. Your card will not be charged during the trial period. At the end of the trial,
              your subscription will automatically activate and your card will be charged $19. You may
              cancel at any time before the trial ends to avoid being charged.
            </SubSection>

            <SubSection title="Billing Cycle">
              Subscriptions are billed monthly in advance. Your billing date is set on the day your paid
              subscription begins (or the day after your trial ends). All prices are in USD.
            </SubSection>

            <SubSection title="Payment Processing">
              Payments are processed by Paddle, our Merchant of Record. By subscribing, you also agree to
              Paddle's terms of service. Paddle handles all payment compliance, tax collection, and receipts.
            </SubSection>

            <SubSection title="Automatic Renewal">
              Your subscription renews automatically at the end of each billing period unless you cancel.
              We will send an email reminder before each renewal.
            </SubSection>

            <SubSection title="Plan Changes">
              You may upgrade or downgrade your plan at any time from your account settings. Upgrades take
              effect immediately (prorated). Downgrades take effect at the end of the current billing period.
            </SubSection>
          </Section>

          <Section title="4. Cancellation">
            <p>
              You may cancel your subscription at any time from your account settings or by contacting us.
              Cancellation takes effect at the end of your current paid billing period — you retain access
              until then. We do not prorate refunds for unused days in a billing period, except where
              required by law. See our{' '}
              <Link href="/refund" className="text-purple-400 hover:text-purple-300">Refund Policy</Link>{' '}
              for details.
            </p>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Use the Service for any unlawful purpose or in violation of any regulations</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code from the platform</li>
              <li>Use automated scripts to scrape or bulk-download data from the platform</li>
              <li>Share your account credentials or allow others to access your account</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Upload malicious code or attempt to compromise our infrastructure</li>
              <li>Use the Service to compete with us or build a substantially similar product</li>
            </ul>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              The Adnexusone platform, including its software, design, AI models, diagnostic engine, and
              all content created by us, is owned by Adnexusone and protected by intellectual property laws.
            </p>
            <p className="mt-3">
              You retain ownership of your ad account data. By connecting your ad accounts, you grant us a
              limited licence to access and process that data solely to provide the Service.
            </p>
            <p className="mt-3">
              Diagnostic insights, action plans, and reports generated by our platform are provided for your
              use. You may share them with clients, but may not resell them as a standalone product without
              a white-label agreement with us.
            </p>
          </Section>

          <Section title="7. Third-Party Integrations">
            <p>
              The Service connects to Meta Ads, Google Ads, and Amazon Ads via their respective APIs. Your
              use of those integrations is also subject to the terms of those platforms. We are not
              responsible for changes to third-party APIs that affect the Service.
            </p>
          </Section>

          <Section title="8. Disclaimers">
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind. We do not
              guarantee that diagnostic insights or AI recommendations will result in improved advertising
              performance. Results depend on many factors outside our control, including your ad creative,
              audience, product, and market conditions.
            </p>
            <p className="mt-3">
              We do not warrant that the Service will be uninterrupted, error-free, or free of security
              vulnerabilities, though we take commercially reasonable steps to ensure reliability.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Adnexusone shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including lost profits, lost revenue,
              or loss of data, arising from your use of the Service.
            </p>
            <p className="mt-3">
              Our total liability for any claim arising from the Service shall not exceed the amount you
              paid to us in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="10. Indemnification">
            <p>
              You agree to indemnify and hold harmless Adnexusone and its team from any claims, losses,
              damages, or expenses (including legal fees) arising from your use of the Service, your
              violation of these Terms, or your violation of any third-party rights.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              We may suspend or terminate your account if you violate these Terms, fail to pay outstanding
              amounts, or engage in conduct that harms other users or the platform. We will provide notice
              where reasonably possible.
            </p>
            <p className="mt-3">
              Upon termination, your right to use the Service ceases. Sections 6, 8, 9, 10, and 12 survive
              termination.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms are governed by the laws of India. Any disputes arising from these Terms or the
              Service shall be subject to the exclusive jurisdiction of the courts located in India.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We may update these Terms from time to time. We will notify you of material changes by email
              at least 14 days before they take effect. Continued use of the Service after that date
              constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              Questions about these Terms?{' '}
              <a href="mailto:legal@adnexusone.com" className="text-purple-400 hover:text-purple-300">legal@adnexusone.com</a>
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
      <div className="text-zinc-400">{children}</div>
    </div>
  )
}

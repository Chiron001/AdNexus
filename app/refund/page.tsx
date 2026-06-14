import Link from 'next/link'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata = { title: 'Refund Policy — Adnexusone' }

const LAST_UPDATED = 'June 14, 2026'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <LandingNav />

      <main className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 pb-24">
        <div className="mb-12">
          <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Refund Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-zinc-300 leading-relaxed">

          <section>
            <p>
              At Adnexusone, we want you to be completely confident before you pay. That's why every
              Basic plan starts with a <strong>30-day free trial</strong> — no charge until the trial ends.
              This policy explains how billing works and when refunds are available.
            </p>
          </section>

          {/* Highlight box */}
          <div className="bg-purple-500/[0.07] border border-purple-500/20 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-3">The short version</h2>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>✅ <strong>30-day free trial</strong> on Basic — cancel before day 30, pay nothing</li>
              <li>✅ <strong>Cancel anytime</strong> — no lock-in, no cancellation fees</li>
              <li>✅ <strong>Refund within 48 hours</strong> for accidental charges (first occurrence)</li>
              <li>⚠️ No partial refunds for unused days in a paid billing period</li>
            </ul>
          </div>

          <Section title="1. Free Trial">
            <p>
              The Basic plan ($19/month) includes a 30-day free trial. Your card is authorised when you
              enter it, but <strong>no charge is made during the trial period</strong>. You can cancel at
              any point before the trial ends — you will not be charged anything.
            </p>
            <p className="mt-3">
              Growth ($99/month) and Professional ($499/month) plans do not include a free trial. You are
              charged immediately when you subscribe to these plans.
            </p>
          </Section>

          <Section title="2. Monthly Subscriptions">
            <p>
              All subscriptions are billed monthly in advance. Once a billing period begins and the charge
              is processed, <strong>we do not issue refunds for that period</strong>. You retain full access
              to your plan's features until the end of the paid period.
            </p>
            <p className="mt-3">
              Example: If you are charged on June 1st and cancel on June 10th, you retain access until
              June 30th but will not receive a refund for the 20 unused days.
            </p>
          </Section>

          <Section title="3. Accidental Charges">
            <p>
              If you were charged because you forgot to cancel before your trial ended, or due to a genuine
              mistake, contact us within <strong>48 hours</strong> of the charge and we will issue a full
              refund — no questions asked. This applies once per account.
            </p>
          </Section>

          <Section title="4. Duplicate Charges">
            <p>
              If you were charged more than once for the same billing period due to a system error, we will
              issue a full refund for the duplicate charge within 5 business days of your report.
            </p>
          </Section>

          <Section title="5. Upgrades & Downgrades">
            <p>
              When you <strong>upgrade</strong> mid-cycle (e.g. Basic → Growth), you are charged the
              prorated difference immediately for the remaining days in the current period. This charge is
              non-refundable.
            </p>
            <p className="mt-3">
              When you <strong>downgrade</strong>, the change takes effect at the end of your current
              billing period. No refund is issued for the price difference.
            </p>
          </Section>

          <Section title="6. Service Outages">
            <p>
              If the Adnexusone platform experiences a significant, extended outage (more than 24 consecutive
              hours) within a billing period, we may, at our discretion, offer a prorated service credit
              for the affected period. Credits are applied to your next invoice and are not redeemable for
              cash.
            </p>
          </Section>

          <Section title="7. How to Cancel">
            <p>You can cancel your subscription at any time:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Go to <strong>Dashboard → Billing → Cancel subscription</strong></li>
              <li>Or email us at{' '}
                <a href="mailto:support@adnexusone.com" className="text-purple-400 hover:text-purple-300">support@adnexusone.com</a>
              </li>
            </ul>
            <p className="mt-3">
              Cancellations take effect at the end of your current billing period. You will receive a
              confirmation email immediately.
            </p>
          </Section>

          <Section title="8. How to Request a Refund">
            <p>
              Email{' '}
              <a href="mailto:support@adnexusone.com" className="text-purple-400 hover:text-purple-300">support@adnexusone.com</a>{' '}
              with the subject line <strong>"Refund Request"</strong> and include:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Your registered email address</li>
              <li>The date and amount of the charge</li>
              <li>The reason for the request</li>
            </ul>
            <p className="mt-3">
              We respond to all refund requests within <strong>2 business days</strong>. Approved refunds
              are processed within 5–10 business days depending on your card issuer.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              Questions about billing or refunds?{' '}
              <a href="mailto:support@adnexusone.com" className="text-purple-400 hover:text-purple-300">support@adnexusone.com</a>
            </p>
            <p className="mt-3">
              For payment disputes, you can also contact{' '}
              <a href="https://www.paddle.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Paddle</a>
              {' '}directly as they are our Merchant of Record and handle all payment processing.
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

import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, X, Minus, Zap, ArrowRight, MessageSquare } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { getPageMetadata } from '@/lib/seo'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/pricing', {
    title: 'Pricing — Adnexusone Ad Diagnostics',
    description: 'Simple, transparent pricing for D2C brands and performance agencies. Start with a free diagnostic — upgrade when you see the value.',
  })
}


const PLANS = [
  {
    key: 'basic',
    name: 'Basic',
    price: '$19',
    per: '/month',
    trial: '30-day free trial',
    desc: 'For D2C brands getting started with ad diagnostics.',
    color: 'border-zinc-700 bg-zinc-900/40',
    badge: null,
    cta: 'Start free trial',
    href: '/signup',
    ctaStyle: 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.12]',
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '$99',
    per: '/month',
    trial: null,
    desc: 'For brands running serious budgets across multiple platforms.',
    color: 'border-blue-500/40 bg-blue-600/[0.07]',
    badge: 'Most Popular',
    badgeStyle: 'bg-blue-600 text-white',
    cta: 'Start Growth plan',
    href: '/signup?plan=growth',
    ctaStyle: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20',
  },
  {
    key: 'professional',
    name: 'Professional',
    price: '$499',
    per: '/month',
    trial: null,
    desc: 'For agencies managing multiple client ad accounts at scale.',
    color: 'border-purple-500/40 bg-purple-600/[0.05]',
    badge: 'AI Included Free',
    badgeStyle: 'bg-purple-600 text-white',
    cta: 'Start Professional plan',
    href: '/signup?plan=agency',
    ctaStyle: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20',
  },
  {
    key: 'custom',
    name: 'Custom',
    price: 'Custom',
    per: '',
    trial: null,
    desc: 'For enterprises with advanced requirements and custom SLAs.',
    color: 'border-amber-500/25 bg-amber-500/[0.04]',
    badge: null,
    cta: 'Talk to sales',
    href: '/contact',
    ctaStyle: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25',
  },
]

const PRICING_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AdNexus',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://adnexusone.com/pricing',
  offers: [
    {
      '@type': 'Offer',
      name: 'Basic',
      description: 'For D2C brands getting started with ad diagnostics. 1 ad account, Meta Ads, 30-day issue history.',
      price: '19',
      priceCurrency: 'USD',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '19', priceCurrency: 'USD', unitText: 'month' },
      url: 'https://adnexusone.com/pricing',
    },
    {
      '@type': 'Offer',
      name: 'Growth',
      description: 'For brands running serious budgets across multiple platforms. 5 ad accounts, Meta + Google + Amazon.',
      price: '99',
      priceCurrency: 'USD',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '99', priceCurrency: 'USD', unitText: 'month' },
      url: 'https://adnexusone.com/pricing',
    },
    {
      '@type': 'Offer',
      name: 'Professional',
      description: 'For agencies managing multiple client ad accounts at scale. 50 ad accounts, AI Engine included.',
      price: '499',
      priceCurrency: 'USD',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '499', priceCurrency: 'USD', unitText: 'month' },
      url: 'https://adnexusone.com/pricing',
    },
  ],
}

type Val = boolean | string | null
const CHECK = <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
const CROSS = <X className="w-4 h-4 text-zinc-600 mx-auto" />
const DASH  = <Minus className="w-4 h-4 text-zinc-700 mx-auto" />

const FEATURES: { category: string; rows: { label: string; hint?: string; vals: [Val,Val,Val,Val] }[] }[] = [
  {
    category: 'Ad Accounts',
    rows: [
      { label: 'Connected ad accounts',       vals: ['1', '5', '50', 'Unlimited'] },
      { label: 'Meta Ads',                    vals: [true, true, true, true] },
      { label: 'Google Ads',                  vals: [false, true, true, true] },
      { label: 'Amazon Ads',                  vals: [false, true, true, true] },
    ],
  },
  {
    category: 'Diagnostics',
    rows: [
      { label: 'Diagnostic checks per scan',  vals: ['10 checks', '1,000+ checks', '1,000+ checks', 'Custom'] },
      { label: 'Sync frequency',              vals: ['Manual only', 'Daily auto-sync', 'Hourly auto-sync', 'Real-time'] },
      { label: 'Issue severity scoring',      vals: [true, true, true, true] },
      { label: 'Revenue impact per issue',    vals: [false, true, true, true] },
      { label: 'Cross-platform diagnostics',  vals: [false, true, true, true] },
      { label: 'Custom diagnostic rules',     vals: [false, false, false, true] },
    ],
  },
  {
    category: 'AI Engine',
    rows: [
      { label: 'Adnexusone AI Engine',        hint: 'AI-written fix recommendations', vals: [false, '$69/mo add-on', true, true] },
      { label: 'AI fix action plans',         vals: [false, '$69/mo add-on', true, true] },
      { label: 'AI budget recommendations',   vals: [false, '$69/mo add-on', true, true] },
      { label: 'AI creative analysis',        vals: [false, '$69/mo add-on', true, true] },
    ],
  },
  {
    category: 'Reports & Export',
    rows: [
      { label: 'Health score dashboard',      vals: [true, true, true, true] },
      { label: 'PDF audit reports',           vals: [false, true, true, true] },
      { label: 'White-label PDFs',            hint: 'Your logo, your branding', vals: [false, false, true, true] },
      { label: 'CSV / data export',           vals: [false, true, true, true] },
      { label: 'API access',                  vals: [false, false, true, true] },
      { label: 'Scheduled report delivery',   vals: [false, true, true, true] },
    ],
  },
  {
    category: 'Alerts & Notifications',
    rows: [
      { label: 'Weekly digest email',         vals: [true, true, true, true] },
      { label: 'Instant issue alerts',        vals: [false, true, true, true] },
      { label: 'Slack notifications',         vals: [false, true, true, true] },
      { label: 'Custom alert thresholds',     vals: [false, false, true, true] },
    ],
  },
  {
    category: 'History & Data',
    rows: [
      { label: 'Issue history retention',     vals: ['30 days', '90 days', '365 days', 'Unlimited'] },
      { label: 'Performance trend charts',    vals: [false, true, true, true] },
    ],
  },
  {
    category: 'Team & Collaboration',
    rows: [
      { label: 'Team members',                vals: ['1 user', '3 users', '10 users', 'Unlimited'] },
      { label: 'Multi-user roles',            vals: [false, false, true, true] },
      { label: 'Issue assignment',            vals: [false, false, true, true] },
      { label: 'Client portal',               vals: [false, false, true, true] },
    ],
  },
  {
    category: 'Support',
    rows: [
      { label: 'Community support',           vals: [true, true, true, true] },
      { label: 'Email support',               vals: [false, true, true, true] },
      { label: 'Priority support',            vals: [false, false, true, true] },
      { label: 'Dedicated onboarding',        vals: [false, false, true, true] },
      { label: 'SLA commitment',              vals: [false, false, false, true] },
      { label: 'Custom integrations',         vals: [false, false, false, true] },
    ],
  },
]

const FAQS = [
  {
    q: 'Is there really no credit card required for the free trial?',
    a: 'The Basic plan includes a 30-day free trial. You will need to enter card details to start — but your card is only authorised, not charged. If you cancel before day 30, you pay nothing.',
  },
  {
    q: 'What happens when my trial ends?',
    a: 'At the end of day 30, your Basic subscription activates and you are charged $19. You can cancel any time before that from your dashboard.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Yes, at any time. Upgrades take effect immediately (prorated). Downgrades take effect at the end of your current billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex). Payments are processed securely by Paddle — your card details never touch our servers.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a full refund within 48 hours of an accidental charge (first occurrence). No refunds for planned subscription periods. See our Refund Policy for full details.',
  },
  {
    q: 'Is the AI Engine included in all plans?',
    a: 'The AI Engine is included free in the Professional plan. For Basic and Growth plans, it is available as a $69/month add-on.',
  },
  {
    q: 'What counts as one "ad account"?',
    a: 'One ad account = one connected advertising account from Meta, Google, or Amazon. For example, connecting one Meta Ads account and one Google Ads account uses 2 of your account slots.',
  },
  {
    q: 'Do you offer annual billing?',
    a: 'Annual billing with a discount is coming soon. Currently all plans are billed monthly. Join our mailing list to be notified when annual plans launch.',
  },
  {
    q: 'What is the Custom plan?',
    a: 'The Custom plan is for enterprises and large agencies needing unlimited accounts, real-time syncs, custom SLAs, custom diagnostic rules, or dedicated support. Contact us and we will build a plan around your needs.',
  },
]

function Val({ v }: { v: Val }) {
  if (v === true)  return CHECK
  if (v === false) return CROSS
  if (v === null)  return DASH
  return <span className="text-xs text-zinc-300 text-center block">{v}</span>
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PRICING_SCHEMA) }}
      />
      <LandingNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="pt-20 sm:pt-32 pb-16 px-5 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-4">Pricing</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5">
            Simple, transparent<br/>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">pricing</span>
          </h1>
          <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed mb-3">
            Start with a 30-day free trial on the Basic plan. No surprises. Cancel anytime.
          </p>
          <p className="text-zinc-600 text-sm">All prices in USD · Billed monthly · Payments by Paddle</p>
        </div>
      </section>

      {/* ── Plan cards ────────────────────────────────────────────── */}
      <section className="pb-20">
        {/* Mobile/tablet: horizontal scroll */}
        <div className="px-5 sm:px-6 xl:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 pt-5 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {PLANS.map((plan) => (
              <div key={plan.key + '-mobile'} className={`relative rounded-2xl border p-6 flex flex-col snap-start shrink-0 w-72 ${plan.color}`}>
                {plan.badge && (
                  <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-3 py-1 text-[10px] font-bold rounded-full whitespace-nowrap shadow-lg ${plan.badgeStyle ?? 'bg-blue-600 text-white'}`}>
                    {plan.badge}
                  </span>
                )}
                <p className="text-sm font-semibold text-zinc-400 mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  {plan.per && <span className="text-zinc-500 text-sm mb-1">{plan.per}</span>}
                </div>
                {plan.trial
                  ? <p className="text-[11px] text-emerald-400 font-semibold mb-3">{plan.trial}</p>
                  : <p className="text-[11px] text-transparent mb-3">—</p>
                }
                <p className="text-sm text-zinc-400 mb-5 leading-relaxed flex-1">{plan.desc}</p>
                <Link href={plan.href}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${plan.ctaStyle}`}>
                  {plan.cta} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-600 mt-1">← Swipe to see all plans →</p>
        </div>

        {/* Desktop: 4-column grid */}
        <div className="hidden xl:block px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-4 pt-5">
          {PLANS.map((plan) => (
            <div key={plan.key} className={`relative rounded-2xl border p-6 flex flex-col ${plan.color}`}>
              {plan.badge && (
                <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-3 py-1 text-[10px] font-bold rounded-full whitespace-nowrap shadow-lg ${plan.badgeStyle ?? 'bg-blue-600 text-white'}`}>
                  {plan.badge}
                </span>
              )}

              <p className="text-sm font-semibold text-zinc-400 mb-1">{plan.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                {plan.per && <span className="text-zinc-500 text-sm mb-1">{plan.per}</span>}
              </div>
              {plan.trial
                ? <p className="text-[11px] text-emerald-400 font-semibold mb-3">{plan.trial}</p>
                : <p className="text-[11px] text-transparent mb-3">—</p>
              }
              <p className="text-sm text-zinc-400 mb-5 leading-relaxed flex-1">{plan.desc}</p>

              <Link href={plan.href}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${plan.ctaStyle}`}>
                {plan.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* ── Feature comparison table ───────────────────────────────── */}
      <section className="px-5 sm:px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center mb-2">Full feature comparison</h2>
          <p className="text-zinc-500 text-center text-sm mb-10">Everything included in each plan at a glance.</p>

          <div className="rounded-2xl border border-zinc-800 overflow-x-auto">
            <div className="min-w-[700px]">
            {/* Header */}
            <div className="grid grid-cols-5 bg-zinc-900/80 border-b border-zinc-800">
              <div className="px-5 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Feature</div>
              {PLANS.map(p => (
                <div key={p.key} className="px-3 py-4 text-center">
                  <p className="text-sm font-bold text-white">{p.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{p.price}{p.per}</p>
                </div>
              ))}
            </div>

            {/* Rows */}
            {FEATURES.map(({ category, rows }) => (
              <div key={category}>
                <div className="grid grid-cols-5 bg-zinc-900/40 border-b border-zinc-800/60">
                  <div className="px-5 py-2.5 col-span-5">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{category}</span>
                  </div>
                </div>
                {rows.map(({ label, hint, vals }) => (
                  <div key={label} className="grid grid-cols-5 border-b border-zinc-800/40 hover:bg-zinc-900/30 transition-colors">
                    <div className="px-5 py-3.5">
                      <p className="text-sm text-zinc-300">{label}</p>
                      {hint && <p className="text-[11px] text-zinc-600 mt-0.5">{hint}</p>}
                    </div>
                    {vals.map((v, i) => (
                      <div key={i} className="px-3 py-3.5 flex items-center justify-center">
                        <Val v={v} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Engine add-on callout ───────────────────────────────── */}
      <section className="px-5 sm:px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-purple-500/20 bg-purple-600/[0.05] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/25">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-1">AI Engine Add-on</p>
              <h3 className="text-xl font-bold text-white mb-1">Get AI-written fixes for $69/month</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Available on Basic and Growth plans. The AI Engine analyses every diagnostic issue and writes
                specific, actionable fix recommendations — exactly what to change, why, and what impact to expect.
                Included free in the Professional plan.
              </p>
            </div>
            <Link href="/ai-engine"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-purple-500/20">
              Learn more <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center mb-2">Frequently asked questions</h2>
          <p className="text-zinc-500 text-center text-sm mb-10">Everything you need to know before signing up.</p>

          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none select-none">
                  <span className="text-sm font-semibold text-white">{q}</span>
                  <span className="text-zinc-500 group-open:rotate-45 transition-transform duration-200 shrink-0 text-xl leading-none">+</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-4">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enterprise CTA ────────────────────────────────────────── */}
      <section className="px-5 sm:px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Need a custom plan?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Managing 50+ ad accounts, need white-glove onboarding, custom SLAs, or a dedicated account manager?
                Talk to us and we'll build a plan around your requirements.
              </p>
            </div>
            <Link href="/contact"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 text-sm font-semibold rounded-xl transition-colors">
              Talk to sales <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="px-5 sm:px-6 pb-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Start diagnosing your ads today
          </h2>
          <p className="text-zinc-400 mb-8">
            30-day free trial on the Basic plan. No credit card charged until day 30. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup"
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-colors">
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact"
              className="flex items-center gap-2 px-8 py-3.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-white font-semibold rounded-xl text-sm transition-colors">
              Talk to sales
            </Link>
          </div>
          <p className="text-zinc-700 text-xs mt-5">No contracts · No lock-in · Cancel from your dashboard</p>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}

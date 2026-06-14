'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Search, Zap, Bell, BarChart3, FileText, MessageSquare, Shield } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

const CATEGORIES = [
  { icon: <Zap className="w-4 h-4 text-blue-400" />, title: 'Getting Started', count: 8 },
  { icon: <BarChart3 className="w-4 h-4 text-purple-400" />, title: 'Diagnostics & Checks', count: 14 },
  { icon: <Bell className="w-4 h-4 text-amber-400" />, title: 'Alerts & Notifications', count: 6 },
  { icon: <FileText className="w-4 h-4 text-emerald-400" />, title: 'Audit Reports', count: 9 },
  { icon: <MessageSquare className="w-4 h-4 text-cyan-400" />, title: 'Ask AI', count: 7 },
  { icon: <Shield className="w-4 h-4 text-violet-400" />, title: 'Account & Billing', count: 11 },
]

const FAQS = [
  {
    section: 'Getting started',
    items: [
      { q: 'How do I connect my Meta Ads account?', a: 'Go to Settings → Connected Accounts → Connect Meta. You\'ll be redirected to Facebook\'s OAuth flow. Adnexusone requests read-only access to your Ad account — we never request the ability to create or modify campaigns. Once authenticated, your account will appear in the workspace within 2 minutes.' },
      { q: 'Can I connect multiple ad accounts from the same platform?', a: 'Yes. Adnexusone supports multiple accounts per platform and multiple platforms per workspace. From Settings → Connected Accounts, click "Add Account" and select the platform. For agencies, accounts can be organized by client using the workspace structure.' },
      { q: 'How often does Adnexusone sync my account data?', a: 'By default, Adnexusone syncs every 4 hours. You can trigger a manual sync at any time from the dashboard. On Growth and Professional plans, sync frequency can be configured down to hourly.' },
      { q: 'What permissions does Adnexusone need on each platform?', a: 'Meta: Read access to ad accounts, campaigns, ad sets, ads, and insights. Google: Read access to campaigns, ad groups, keywords, and performance data. Amazon: Sponsored Products and Sponsored Brands read access. Adnexusone never requests write permissions — it cannot modify, pause, or create any campaigns.' },
    ],
  },
  {
    section: 'Diagnostics & checks',
    items: [
      { q: 'What is the health score and how is it calculated?', a: 'The health score is a 0–100 index of your account\'s ad operational health. It\'s calculated from the number of open issues, their severity, and the percentage of spend affected. A score below 60 indicates significant issues that are actively costing you money. Above 80 is generally healthy. The score updates on every sync.' },
      { q: 'Why does my health score change without me making any changes?', a: 'Health scores respond to live account performance data. If your CTR drops, frequency increases, or ROAS falls below baseline, the score adjusts. Conversely, if yesterday\'s issue resolves naturally (e.g. a zero-sale campaign gets a conversion), the score improves automatically.' },
      { q: 'How does Adnexusone detect creative fatigue?', a: 'Adnexusone tracks frequency per ad set and CTR trend over a rolling 7-day window. Fatigue is flagged when frequency exceeds your threshold (default: 4×) AND CTR has declined more than 20% over the trailing 7 days. Both conditions must be true — this avoids false positives from one-day anomalies.' },
      { q: 'What does "spend at risk" mean?', a: '"Spend at risk" is the monthly budget equivalent being consumed by ad sets or campaigns where a diagnosed issue is actively degrading performance. It\'s calculated as: (affected campaign daily spend) × 30. It represents money that\'s being spent on a broken configuration — not money you\'ve necessarily lost yet, but money at risk of poor return until the issue is fixed.' },
    ],
  },
  {
    section: 'Alerts & notifications',
    items: [
      { q: 'How do I set up Slack alerts?', a: 'Go to Settings → Notifications → Slack Integration. Click "Connect Slack" and follow the OAuth flow. You can then configure which alert types route to which Slack channels — e.g. budget exhaustion alerts to #media-ops, ROAS drops to #performance-team.' },
      { q: 'Can I set different alert thresholds per account?', a: 'Yes. In Settings → Alerts, click into any account to override the workspace-level defaults. Per-account overrides let you set tighter thresholds for high-spend clients and looser ones for test accounts.' },
      { q: 'Why am I not receiving email alerts?', a: 'Check Settings → Notifications → Email to confirm your address is verified and the alert types you want are enabled. Also check your spam folder — alerts come from alerts@adnexusone.io. If verified and enabled alerts still aren\'t arriving, contact support with your account ID.' },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      className="w-full text-left py-4 border-b border-white/[0.05] last:border-0 focus:outline-none"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-semibold text-white leading-snug">{q}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <p className="text-sm text-gray-400 leading-relaxed mt-3 pr-8">{a}</p>
      )}
    </button>
  )
}

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* Header */}
      <section className="relative pt-36 pb-16 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 45% at 50% -10%, rgba(139,92,246,0.10) 0%, transparent 55%)' }} />
        <div className="max-w-2xl mx-auto text-center relative">
          <span className="inline-flex text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border text-violet-400 bg-violet-500/10 border-violet-500/20 mb-6">Resources · Help Center</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">How can we help?</h1>
          <p className="text-gray-400 text-sm mb-8">Answers to the most common questions about Adnexusone — setup, diagnostics, alerts, and billing.</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full pl-11 pr-4 py-3.5 bg-zinc-950/80 border border-white/[0.10] rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="py-12 px-5 sm:px-6 border-b border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-6">Browse by topic</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat, i) => (
              <button key={i} className="bg-zinc-950/60 border border-white/[0.07] rounded-xl p-4 flex items-center gap-3 hover:border-white/[0.14] transition-all text-left group">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">{cat.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-white/90">{cat.title}</p>
                  <p className="text-[10px] text-gray-600">{cat.count} articles</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-5 sm:px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-12">
          {FAQS.map((section, i) => (
            <div key={i}>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-5">{section.section}</p>
              <div className="bg-zinc-950/60 border border-white/[0.07] rounded-2xl px-6">
                {section.items.map((item, j) => (
                  <FAQItem key={j} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact strip */}
        <div className="max-w-4xl mx-auto mt-16 bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-7 flex flex-col sm:flex-row items-center gap-5 justify-between">
          <div>
            <p className="text-base font-bold text-white mb-1">Still need help?</p>
            <p className="text-sm text-gray-400">Contact support and we'll reply within one business day.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a href="mailto:support@adnexusone.io" className="inline-flex items-center gap-2 px-5 py-3 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-white font-bold rounded-xl text-sm transition-all">
              Email support
            </a>
            <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20">
              Contact us <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}

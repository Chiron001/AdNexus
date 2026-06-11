'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Zap, BarChart3, Bell, FileText, MessageSquare, Shield } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

const STEPS = [
  {
    num: '01',
    icon: <Zap className="w-5 h-5 text-blue-400" />,
    title: 'Connect your ad accounts',
    subtitle: 'Setup · 2 minutes',
    body: 'Connect Meta, Google, and Amazon accounts via standard OAuth. AdNexus never stores your platform credentials — authentication is handled directly through each platform\'s official API.',
    details: ['Meta Business Manager integration via Facebook OAuth', 'Google Ads Manager account or individual account connection', 'Amazon Advertising account with Sponsored Products access', 'Multiple accounts connected in a single workspace — no per-account setup'],
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    dotColor: 'bg-blue-500',
  },
  {
    num: '02',
    icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
    title: 'Get your first diagnostic',
    subtitle: 'First scan · Under 5 minutes',
    body: 'On first sync, AdNexus runs a full 30-point diagnostic across every connected account. Issues are ranked by revenue impact — the most expensive problem is always at the top.',
    details: ['30+ diagnostic checks across Meta, Google, Amazon', 'Every issue quantified in spend at risk or ROAS impact', 'Priority ranking so you always fix the highest-cost issue first', 'Health score calculated per account and across portfolio'],
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    dotColor: 'bg-purple-500',
  },
  {
    num: '03',
    icon: <Bell className="w-5 h-5 text-amber-400" />,
    title: 'Configure your alerts',
    subtitle: 'Alert setup · 3 minutes',
    body: 'Set thresholds for budget, ROAS, frequency, and anomalies. When an account hits your threshold, you get a Slack or email alert with the issue, the impact, and the recommended next action.',
    details: ['Budget exhaustion alert with hours-to-empty prediction', 'ROAS drop threshold per account — daily or intraday', 'Pixel and conversion tracking health alerts', 'Campaign pause or disapproval notifications in real time'],
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    dotColor: 'bg-amber-500',
  },
  {
    num: '04',
    icon: <FileText className="w-5 h-5 text-emerald-400" />,
    title: 'Generate your first audit report',
    subtitle: 'Reports · 1 click',
    body: 'Pick an account, pick a date range, click generate. AdNexus writes a full diagnostic narrative in plain English — issues, impact, and recommendations — formatted and ready to share.',
    details: ['Natural language issue descriptions — no platform jargon', 'Impact quantified in rupees or percentage', 'Recommended action for each issue — specific and actionable', 'Export as PDF or share via link — ready for clients or leadership'],
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    dotColor: 'bg-emerald-500',
  },
  {
    num: '05',
    icon: <MessageSquare className="w-5 h-5 text-cyan-400" />,
    title: 'Ask AI about any account',
    subtitle: 'Ask AI · Always available',
    body: 'Type a question about any connected account. Ask AI pulls from live account data, not generic knowledge. "Why did ROAS drop last week?" gives you a specific answer based on your specific account.',
    details: ['Account-specific answers — not generic advice', 'Cross-platform synthesis ("Where should I reallocate this budget?")', 'Diagnosis requests ("What\'s causing the high CPA on this campaign?")', 'Trend interpretation with historical account context'],
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/20',
    dotColor: 'bg-cyan-500',
  },
  {
    num: '06',
    icon: <Shield className="w-5 h-5 text-violet-400" />,
    title: 'Monitor health continuously',
    subtitle: 'Ongoing · Fully automatic',
    body: 'After setup, AdNexus runs in the background. Every sync re-runs all diagnostics, compares to your baselines, and surfaces new issues. Your account health score updates automatically.',
    details: ['Automated diagnostic re-run on every account sync', 'Health score trend tracked over 30, 60, 90 days', 'New issue alerts only — no noise from already-known problems', 'Weekly health summary email — one digest, all accounts'],
    accentColor: 'text-violet-400',
    borderColor: 'border-violet-500/20',
    dotColor: 'bg-violet-500',
  },
]

export default function PlatformTourPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* Header */}
      <section className="relative pt-36 pb-16 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 45% at 50% -5%, rgba(99,102,241,0.12) 0%, transparent 55%)' }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <span className="inline-flex text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border text-indigo-400 bg-indigo-500/10 border-indigo-500/20 mb-6">Resources · Platform Tour</span>
          <h1 className="text-[2.2rem] sm:text-4xl font-extrabold text-white mb-4">From connected to confident in under 10 minutes</h1>
          <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">Here's exactly what happens after you sign up — step by step, what you'll see, what you'll get, and what you'll be able to do.</p>
        </div>
      </section>

      {/* Step panels */}
      <section className="px-5 sm:px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute left-[19px] sm:left-[19px] top-8 bottom-8 w-0.5 bg-white/[0.06]" />
            <div className="space-y-6">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-5 sm:gap-7 items-start">
                  <div className={`shrink-0 w-10 h-10 rounded-full border ${step.borderColor} bg-zinc-950 flex items-center justify-center z-10`}>{step.icon}</div>
                  <div className={`flex-1 bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.12] transition-all`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-white/20">{step.num}</span>
                        <h3 className={`text-base font-extrabold ${step.accentColor}`}>{step.title}</h3>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium">{step.subtitle}</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-5">{step.body}</p>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {step.details.map((d, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className={`w-1 h-1 rounded-full shrink-0 mt-2 ${step.dotColor}`} /> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA at bottom */}
          <div className="mt-16 text-center bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-10">
            <h2 className="text-2xl font-extrabold text-white mb-3">Start the real tour — in your actual account</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-7">Connect your first account and run a diagnostic in under 5 minutes. No credit card required.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}

'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Heart, ShieldCheck, AlertTriangle, BarChart3, Activity, TrendingDown, CheckCircle2 } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

const CHARACTERISTICS = [
  { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: 'Restricted category constraints', body: 'Health & supplement ads face editorial and compliance review on Meta and Google. AdNexus flags ad disapprovals, policy violations, and restricted audience settings before they pause your campaigns.' },
  { icon: <BarChart3 className="w-5 h-5 text-teal-400" />, title: 'Long conversion cycles', body: 'Supplement customers research for 2–4 weeks. Attribution windows matter more here than in impulse-buy categories. AdNexus checks attribution settings against your product\'s decision cycle.' },
  { icon: <TrendingDown className="w-5 h-5 text-cyan-400" />, title: 'High CPM due to interest targeting depth', body: 'Health audiences are expensive. Broad targeting burns money fast, narrow targeting limits scale. AdNexus benchmarks CPM and CTR by audience type so you can find the efficient range.' },
  { icon: <Activity className="w-5 h-5 text-green-400" />, title: 'Amazon Sponsored Products for supplements', body: 'Supplement ACOS varies wildly by category maturity. New launches vs. established SKUs need different bid strategies. AdNexus segments ACOS by campaign type and flags outliers.' },
]

const CHECKS = [
  { platform: 'Meta', color: 'emerald', items: ['Ad account policy flags and restricted audience issues', 'Purchase pixel health — critical for supplement attribution', 'Broad vs. narrow audience CPM benchmarking', 'Lookalike audience quality for health interest seeds'] },
  { platform: 'Google', color: 'teal', items: ['Search term irrelevance for health/supplement queries', 'Quality Score issues on health-category keywords', 'Brand protection gaps — competitor bidding on your brand name', 'Conversion tracking health for multi-step purchase flow'] },
  { platform: 'Amazon', color: 'cyan', items: ['Supplement ACOS by campaign type: auto vs. manual', 'Zero-sale ASIN detection for new product launches', 'Search term relevance for health category queries', 'Competitor conquest spend efficiency on high-ACOS terms'] },
]

const CLRMAP: Record<string, { badge: string; dot: string; border: string; glow: string }> = {
  emerald: { badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400', border: 'border-emerald-500/15', glow: 'rgba(16,185,129,0.06)' },
  teal:    { badge: 'text-teal-400 bg-teal-500/10 border-teal-500/20',          dot: 'bg-teal-400',    border: 'border-teal-500/15',    glow: 'rgba(20,184,166,0.06)' },
  cyan:    { badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',          dot: 'bg-cyan-400',    border: 'border-cyan-500/15',    glow: 'rgba(6,182,212,0.06)' },
}

export default function HealthWellnessPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* Hero — compliance badge style, green glow */}
      <section className="relative pt-36 pb-20 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(16,185,129,0.13) 0%, transparent 55%)' }} />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
              <Heart className="w-3 h-3" /> Industry · Health & Wellness
            </span>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border text-green-400 bg-green-500/10 border-green-500/20">
              <ShieldCheck className="w-3 h-3" /> Restricted category aware
            </span>
          </div>
          <h1 className="text-[2.2rem] sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.05] mb-6">
            Ad diagnostics built around<br /><span className="text-gradient animate-gradient">health category realities</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Health & wellness brands operate under ad policies that punish mistakes fast. AdNexus monitors compliance signals, attribution health, and spend efficiency simultaneously — so your campaigns stay live and profitable.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition-all">
            Run free health brand diagnostic <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* What makes health different — 2x2 grid */}
      <section className="py-20 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.6)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10">What makes health & wellness advertising different</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {CHARACTERISTICS.map((c, i) => (
              <div key={i} className="bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-6 flex gap-5 items-start">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">{c.icon}</div>
                <div>
                  <p className="text-sm font-bold text-white mb-2">{c.title}</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform checks — 3 column */}
      <section className="py-20 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10">AdNexus checks for health brands — by platform</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {CHECKS.map((ch, i) => {
              const c = CLRMAP[ch.color]
              return (
                <div key={i} className={`rounded-2xl border p-6 ${c.border}`} style={{ background: c.glow }}>
                  <span className={`inline-flex text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-5 ${c.badge}`}>{ch.platform}</span>
                  <ul className="space-y-3">
                    {ch.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${c.dot}`} /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Alert strip */}
      <div className="py-10 px-5 sm:px-6 my-4 border-y border-emerald-500/10" style={{ background: 'rgba(16,185,129,0.04)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm text-gray-300 text-center sm:text-left">Health & supplement brands are 3× more likely to face ad account restrictions than general retail. AdNexus surfaces policy risk signals before accounts get flagged — not after.</p>
          <Link href="/signup" className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] transition-all">
            Protect your account <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <LandingCTA />
      <LandingFooter />
    </div>
  )
}

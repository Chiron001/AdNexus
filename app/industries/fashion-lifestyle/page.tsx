'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

const CHALLENGES = [
  { num: '01', title: 'Seasonal spikes hit without campaign-level readiness', body: 'Fashion brands need to ramp creatives, budgets, and audiences 3–4 weeks before peak. Brands that audit too late lose first-mover advantage on impression share.' },
  { num: '02', title: 'Catalogue is too large to manage manually', body: 'A 500-SKU fashion brand on Meta DPA can\'t manually review which products are burning budget without converting. Catalogue-level waste goes undetected for months.' },
  { num: '03', title: 'Retargeting audiences exhaust without refresh', body: 'Website visitors and add-to-carts are finite pools. When retargeting frequency climbs past 5×, reach saturates — but most fashion brands only notice when ROAS has already dropped 40%.' },
  { num: '04', title: 'Google Shopping ROAS hidden by brand halo', body: 'Generic Shopping campaigns often look profitable because branded searches inflate the ROAS. Unbranded performance — where real scale lives — is obscured until you segment.' },
]

const SOLUTIONS = [
  { tag: 'Meta DPA', color: 'rose', title: 'Product-level catalogue intelligence', items: ['Low-ROAS product flagging with 14-day spend + conversion data', 'Zero-sale items consuming catalogue budget — isolated by SKU', 'Frequency per retargeting audience tracked to prevent pool exhaustion', 'Lookalike seed audience health check before scaling spend'] },
  { tag: 'Google Shopping', color: 'pink', title: 'Shopping segmentation diagnostics', items: ['Brand vs. non-brand ROAS split automatically surfaced', 'Low-performing product groups flagged with bid adjustment recommendation', 'Search term waste in Shopping campaigns — irrelevant queries and cost', 'Priority settings and bid strategy audit for max/target ROAS conflicts'] },
  { tag: 'Creatives', color: 'fuchsia', title: 'Creative fatigue before it kills your ROAS', items: ['Ad-set-level CTR trend tracked over rolling 7 days', 'Frequency threshold alert before reach saturation sets in', 'Creative rotation issues detected — single ad dominating spend', 'AI brief on next creative: angle, format, and messaging direction'] },
]

const COLOR: Record<string, { badge: string; bar: string; num: string }> = {
  rose:    { badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',    bar: 'bg-rose-500',    num: 'text-rose-500/30' },
  pink:    { badge: 'text-pink-400 bg-pink-500/10 border-pink-500/20',    bar: 'bg-pink-500',    num: 'text-pink-500/30' },
  fuchsia: { badge: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20', bar: 'bg-fuchsia-500', num: 'text-fuchsia-500/30' },
}

export default function FashionLifestylePage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* Hero — left-aligned, rose/pink glow */}
      <section className="relative pt-36 pb-24 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 0% 20%, rgba(244,63,94,0.12) 0%, transparent 60%)' }} />
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-12 items-center relative">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-6 text-rose-400 bg-rose-500/10 border-rose-500/20">
              <Sparkles className="w-3 h-3" /> Industry · Fashion & Lifestyle
            </span>
            <h1 className="text-[2.2rem] sm:text-5xl font-extrabold tracking-tight leading-[1.06] mb-6">
              Ad diagnostics for brands where <span className="text-gradient animate-gradient">attention is the product</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8">
              Fashion advertising is high-frequency, high-visual, and brutally seasonal. AdNexus monitors catalogue health, creative fatigue, and audience saturation so you never waste media budget on an exhausted pool.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-500/20 transition-all">
              Run free fashion audit <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['₹1.8L+','avg monthly DPA spend monitored'],['4.3×','ROAS after catalogue waste removed'],['14 days','lookback for zero-sale SKU detection'],['5×','frequency threshold before audience alert']].map(([stat, label], i) => (
              <div key={i} className="bg-zinc-950/70 border border-white/[0.07] rounded-2xl p-5">
                <p className="text-2xl font-black text-white mb-1">{stat}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges — numbered, left-bordered */}
      <section className="py-16 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.6)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10">Why fashion brands lose ad margin</p>
          <div className="space-y-5">
            {CHALLENGES.map((c, i) => (
              <div key={i} className="flex gap-6 items-start py-5 border-l-2 border-rose-500/20 pl-6">
                <span className="text-4xl font-black text-rose-500/20 leading-none shrink-0">{c.num}</span>
                <div>
                  <p className="text-base font-bold text-white mb-2">{c.title}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions — stacked cards */}
      <section className="py-20 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10">What AdNexus monitors for fashion brands</p>
          <div className="space-y-5">
            {SOLUTIONS.map((s, i) => {
              const c = COLOR[s.color]
              return (
                <div key={i} className="bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    <span className={`inline-flex shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${c.badge}`}>{s.tag}</span>
                    <div className="flex-1">
                      <p className="text-base font-bold text-white mb-4">{s.title}</p>
                      <ul className="grid sm:grid-cols-2 gap-2.5">
                        {s.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className={`w-1 h-1 rounded-full shrink-0 mt-2 ${c.bar}`} /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <LandingCTA />
      <LandingFooter />
    </div>
  )
}

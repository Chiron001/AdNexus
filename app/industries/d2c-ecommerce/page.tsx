'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight, ShoppingBag, CheckCircle2, AlertTriangle, Activity, BarChart3, TrendingUp } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

const CHALLENGES = [
  { icon: <AlertTriangle className="w-5 h-5 text-red-400" />, border: 'border-red-500/20', bg: 'bg-red-500/[0.06]', title: 'Creative fatigue kills ROAS silently', desc: 'D2C brands run 10–30 creatives per month. Without frequency monitoring, spend keeps hitting the same tired audience until ROAS collapses.' },
  { icon: <Activity className="w-5 h-5 text-orange-400" />, border: 'border-orange-500/20', bg: 'bg-orange-500/[0.06]', title: 'Broken pixels misattribute for months', desc: 'One broken purchase event can misattribute an entire quarter of revenue. Most brands discover it 90 days too late, after scaling the wrong campaigns.' },
  { icon: <BarChart3 className="w-5 h-5 text-amber-400" />, border: 'border-amber-500/20', bg: 'bg-amber-500/[0.06]', title: 'Amazon ACOS doubles without you noticing', desc: 'Auto campaigns start efficient and bloat silently. Without regular ACOS audits and search term reviews, margin erodes in 60 days.' },
]

const SOLUTIONS = [
  { tag: 'Meta', tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20', check: 'text-blue-400', title: 'Catch creative fatigue before CTR tanks', body: 'AdNexus tracks frequency, CTR trend, and reach saturation per ad set. When fatigue is detected, it flags the exact creatives to pause and writes a replacement brief.', bullets: ['Per-ad-set frequency monitoring', 'CTR decline threshold alerts with 7-day trend', 'AI brief for next creative batch — specific angle, format, and copy direction'] },
  { tag: 'Tracking', tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20', check: 'text-purple-400', title: 'Validate your pixel on every single sync', body: 'AdNexus checks purchase event firing rates on every account sync. If it drops even 10% below expected, you get an alert before misattribution compounds across weeks.', bullets: ['Purchase event validation on every sync', 'Conversion rate anomaly detection vs. 30-day baseline', 'Cross-platform attribution gap flagging with cost estimate'] },
  { tag: 'Amazon', tagColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20', check: 'text-orange-400', title: 'Control ACOS before it controls your margin', body: 'AdNexus benchmarks ACOS against your targets per campaign type. Zero-sale ASINs, runaway broad match, and bid bloat — all caught and quantified in rupees.', bullets: ['ACOS benchmarking per campaign: auto vs. manual vs. branded', 'Zero-sale ASIN detection with days-active and spend data', 'Search term waste flagging with recommended negatives'] },
]

export default function D2CEcommercePage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* Hero — centered, blue glow */}
      <section className="relative pt-36 pb-24 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(59,130,246,0.15) 0%, transparent 60%)' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-6 text-blue-400 bg-blue-500/10 border-blue-500/20">
            <ShoppingBag className="w-3 h-3" /> Industry · D2C E-commerce
          </span>
          <h1 className="text-[2.2rem] sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.05] mb-6">
            The ad intelligence OS<br /><span className="text-gradient animate-gradient">built for D2C brands</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            D2C brands live and die by ROAS. AdNexus monitors Meta, Google, and Amazon continuously so your media buyer always knows what to fix next — and exactly how much it's costing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all">
              Run free D2C diagnostic <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/platform" className="flex items-center gap-2 px-7 py-3.5 border border-white/[0.12] text-gray-300 hover:text-white rounded-xl text-sm transition-all">
              See the platform <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="py-10 px-5 sm:px-6 border-y border-white/[0.05]" style={{ background: 'rgba(4,5,14,0.8)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[['₹2.53L', 'avg monthly spend at risk per account'],['3.2x','avg ROAS recovery after fixing top issue'],['6 hrs','saved per week vs. manual audits'],['30','diagnostic checks per sync']].map(([stat, label], i) => (
            <div key={i}><p className="text-2xl sm:text-3xl font-black text-white mb-1">{stat}</p><p className="text-[11px] text-gray-500 leading-tight">{label}</p></div>
          ))}
        </div>
      </div>

      {/* Challenges */}
      <section className="py-20 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-8">What kills D2C ad performance</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {CHALLENGES.map((c, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${c.border} ${c.bg}`}>
                <div className="mb-4">{c.icon}</div>
                <p className="text-base font-bold text-white mb-2">{c.title}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions — alternating rows */}
      <section className="px-5 sm:px-6 pb-24" style={{ background: 'rgba(4,5,14,0.5)' }}>
        <div className="max-w-5xl mx-auto pt-16">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-12">How AdNexus solves them</p>
          {SOLUTIONS.map((s, i) => (
            <div key={i} className={`grid sm:grid-cols-2 gap-10 items-start py-10 ${i < SOLUTIONS.length - 1 ? 'border-b border-white/[0.06]' : ''}`}>
              <div className={i % 2 === 1 ? 'sm:order-2' : ''}>
                <span className={`inline-flex text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-4 ${s.tagColor}`}>{s.tag}</span>
                <h3 className="text-xl font-extrabold text-white mb-3">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-5">{s.body}</p>
                <ul className="space-y-2.5">
                  {s.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${s.check}`} /> {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`bg-zinc-950/80 border border-white/[0.07] rounded-2xl p-5 ${i % 2 === 1 ? 'sm:order-1' : ''}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" /></span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">{s.tag} — Live scan</span>
                </div>
                {s.bullets.map((b, j) => (
                  <div key={j} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${s.check}`} />
                    <span className="text-[11px] text-gray-300">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <LandingCTA />
      <LandingFooter />
    </div>
  )
}

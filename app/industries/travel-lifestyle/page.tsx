'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Plane, Calendar, TrendingDown, AlertTriangle, BarChart3, Activity } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

const SEASONS = [
  { season: 'Peak season', months: 'Nov – Jan', icon: <Calendar className="w-4 h-4 text-cyan-400" />, borderColor: 'border-cyan-500/20', accent: 'text-cyan-400', challenge: 'Budget exhausted before peak hour', detail: 'Daily budgets hit their cap by 2pm on high-intent days. Every hour after that is revenue abandoned to zero impression share. AdNexus alerts when budgets pace toward exhaustion so you can increase spend before the window closes.' },
  { season: 'Pre-season ramp', months: 'Sep – Oct', icon: <Activity className="w-4 h-4 text-sky-400" />, borderColor: 'border-sky-500/20', accent: 'text-sky-400', challenge: 'Campaigns not ready for demand surge', detail: 'Travel intent spikes before most brands increase their bids and budgets. AdNexus flags under-invested impression share 3 weeks before peak — so you can ramp before your competitors take the traffic.' },
  { season: 'Off-season', months: 'Mar – Jun', icon: <TrendingDown className="w-4 h-4 text-blue-400" />, borderColor: 'border-blue-500/20', accent: 'text-blue-400', challenge: 'Spend continuing at peak-season rates', detail: 'Off-season budgets left at peak levels waste significant margin. AdNexus detects declining CTR and conversion rates before ROAS collapses, and recommends tapering strategy with spend reallocation options.' },
  { season: 'Shoulder season', months: 'Feb, Jul', icon: <AlertTriangle className="w-4 h-4 text-indigo-400" />, borderColor: 'border-indigo-500/20', accent: 'text-indigo-400', challenge: 'Audience fatigue from evergreen creatives', detail: 'Travel audiences shown the same destination creative for 6+ months develop fatigue. AdNexus tracks frequency per destination and flags when new creative is needed — before CTR makes it obvious.' },
]

const CAPABILITIES = [
  'Budget exhaustion prediction — alert before peak hour loss', 'Seasonal demand vs. bid level gap detection', 'Destination-level ROAS benchmarking', 'Audience fatigue tracking per destination creative', 'Google Search impression share by destination keyword cluster', 'Amazon Sponsored Products for travel accessories and gear', 'Attribution window mismatch for long travel planning cycles', 'Cross-platform spend allocation during peak vs. off-peak',
]

export default function TravelLifestylePage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* Hero — seasonal narrative, cyan glow */}
      <section className="relative pt-36 pb-20 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 100% 50% at 50% -5%, rgba(6,182,212,0.12) 0%, transparent 55%)' }} />
        <div className="max-w-5xl mx-auto text-center relative">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-6 text-cyan-400 bg-cyan-500/10 border-cyan-500/20">
            <Plane className="w-3 h-3" /> Industry · Travel & Lifestyle
          </span>
          <h1 className="text-[2.2rem] sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.05] mb-6">
            Travel ad spend doesn't fail uniformly — <span className="text-gradient animate-gradient">it fails seasonally</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            In travel, the difference between profit and waste is often a matter of hours on peak days and weeks on off-peak months. AdNexus monitors travel ad accounts with seasonal awareness — flagging the right issues at the right time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {[['₹4.1L+','avg seasonal spend monitored'],['8 hrs','budget exhaustion lead time'],['4 seasons','of distinct ad health patterns tracked']].map(([v,l],i) => (
              <div key={i} className="bg-zinc-950/70 border border-white/[0.07] rounded-2xl px-6 py-4">
                <p className="text-xl font-black text-cyan-400 mb-0.5">{v}</p>
                <p className="text-[10px] text-gray-500">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal challenge cards */}
      <section className="py-20 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.6)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10">Seasonal challenges AdNexus monitors</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {SEASONS.map((s, i) => (
              <div key={i} className={`bg-zinc-950/60 border rounded-2xl p-6 ${s.borderColor}`}>
                <div className="flex items-center gap-3 mb-4">
                  {s.icon}
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${s.accent}`}>{s.season}</p>
                    <p className="text-[10px] text-gray-500">{s.months}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-white mb-2">{s.challenge}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities list */}
      <section className="py-20 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10">Full diagnostic coverage for travel brands</p>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4">
            {CAPABILITIES.map((cap, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-white/[0.05] last:border-0">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0 mt-2" />
                <span className="text-sm text-gray-300">{cap}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all">
              Run free travel account diagnostic <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <LandingCTA />
      <LandingFooter />
    </div>
  )
}

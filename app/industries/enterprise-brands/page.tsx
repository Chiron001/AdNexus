'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Building2, CheckCircle2, Shield, Globe, BarChart3, Users, FileText, Zap } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

const CAPABILITIES = [
  { icon: <Globe className="w-5 h-5 text-amber-400" />, title: 'Multi-account, multi-region visibility', body: 'Enterprise brands run 10–40 ad accounts across regions, business units, and platforms. AdNexus consolidates every account into one workspace — health scores, spend at risk, and priority issues across the entire portfolio.' },
  { icon: <BarChart3 className="w-5 h-5 text-orange-400" />, title: 'Platform-level spend intelligence', body: 'Total cross-platform spend is visible by region, by business unit, or by platform. No more stitching together CSV exports to understand where your ₹50L monthly budget is actually going.' },
  { icon: <Shield className="w-5 h-5 text-yellow-400" />, title: 'Brand safety and compliance monitoring', body: 'Large brands face reputational risk from ad placements and policy violations. AdNexus surfaces brand safety issues, ad disapprovals, and restricted placements before they escalate.' },
  { icon: <FileText className="w-5 h-5 text-amber-300" />, title: 'Executive-grade reporting', body: 'Automated diagnostic summaries formatted for C-suite reporting. Issues are explained in business terms, not platform jargon — ready for weekly leadership reviews without an analyst reformatting the data.' },
  { icon: <Users className="w-5 h-5 text-orange-300" />, title: 'Team-level access controls', body: 'Assign platform and account access by team member, region, or function. Agencies and internal teams see only the accounts relevant to them — with full audit log of every action.' },
  { icon: <Zap className="w-5 h-5 text-amber-500" />, title: 'Priority issue routing by severity', body: 'Critical issues — budget exhaustion, pixel failure, policy violations — are routed to the right team immediately via Slack or email. Medium issues queue into weekly review. Nothing gets missed.' },
]

const MATRIX = [
  { capability: 'Simultaneous platform coverage', meta: true, google: true, amazon: true },
  { capability: 'Cross-account health scores', meta: true, google: true, amazon: true },
  { capability: 'Budget exhaustion alerts (real-time)', meta: true, google: true, amazon: false },
  { capability: 'Creative fatigue monitoring', meta: true, google: false, amazon: false },
  { capability: 'Pixel & conversion tracking health', meta: true, google: true, amazon: false },
  { capability: 'ACOS / ROAS benchmarking', meta: false, google: true, amazon: true },
  { capability: 'Search term waste analysis', meta: false, google: true, amazon: true },
  { capability: 'Audience & targeting diagnostics', meta: true, google: true, amazon: false },
  { capability: 'Policy & compliance flags', meta: true, google: true, amazon: true },
  { capability: 'AI-generated audit summaries', meta: true, google: true, amazon: true },
]

export default function EnterpriseBrandsPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* Hero — minimal enterprise style, amber glow */}
      <section className="relative pt-36 pb-24 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(245,158,11,0.10) 0%, transparent 55%)' }} />
        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-8 text-amber-400 bg-amber-500/10 border-amber-500/20">
              <Building2 className="w-3 h-3" /> Industry · Enterprise Brands
            </span>
            <h1 className="text-[2.2rem] sm:text-5xl font-extrabold tracking-tight leading-[1.06] mb-6">
              Visibility across every account.<br /><span className="text-gradient animate-gradient">Control at enterprise scale.</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              Enterprise brands operate too many accounts, across too many platforms, with too many stakeholders to rely on manual audits. AdNexus is the always-on diagnostic layer that keeps every account performing at the portfolio level.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all">
                Request enterprise demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/platform" className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/[0.12] text-gray-300 hover:text-white rounded-xl text-sm transition-all">
                Explore the platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Capability cards — 3 col */}
      <section className="py-20 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.6)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10">Built for enterprise ad operations</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {CAPABILITIES.map((cap, i) => (
              <div key={i} className="bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">{cap.icon}</div>
                <p className="text-sm font-bold text-white mb-2">{cap.title}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{cap.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform matrix table */}
      <section className="py-20 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-8">Platform coverage matrix</p>
          <div className="bg-zinc-950/60 border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 px-5 py-3 border-b border-white/[0.06]">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest col-span-1">Capability</span>
              {['Meta', 'Google', 'Amazon'].map(p => (
                <span key={p} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">{p}</span>
              ))}
            </div>
            {MATRIX.map((row, i) => (
              <div key={i} className={`grid grid-cols-4 px-5 py-3.5 ${i < MATRIX.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                <span className="text-sm text-gray-300 col-span-1 pr-4">{row.capability}</span>
                {[row.meta, row.google, row.amazon].map((val, j) => (
                  <div key={j} className="flex items-center justify-center">
                    {val
                      ? <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      : <span className="w-4 h-px bg-white/10 block" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingCTA />
      <LandingFooter />
    </div>
  )
}

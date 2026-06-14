'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Users, CheckCircle2, BarChart3, FileText, Bell, Zap } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

const METRICS = [
  { value: '14', label: 'avg accounts per agency user', color: 'text-purple-400' },
  { value: '6 hrs', label: 'saved per week per account manager', color: 'text-violet-400' },
  { value: '100%', label: 'client-ready reports, zero formatting', color: 'text-fuchsia-400' },
  { value: '3 min', label: 'avg time to spot top priority issue', color: 'text-purple-300' },
]

const STEPS = [
  { icon: <Zap className="w-5 h-5 text-purple-400" />, num: '01', title: 'Connect all client accounts in one workspace', body: 'Link Meta, Google, and Amazon accounts across all clients into a single Adnexusone workspace. No tab switching, no spreadsheet tracking — all accounts visible from one dashboard.' },
  { icon: <BarChart3 className="w-5 h-5 text-violet-400" />, num: '02', title: 'Every account gets a daily diagnostic', body: 'Adnexusone runs 30+ checks per account on every sync — across all three platforms. Critical issues are ranked by revenue impact, so account managers always know the single most important fix.' },
  { icon: <Bell className="w-5 h-5 text-fuchsia-400" />, num: '03', title: 'Alerts reach the right person instantly', body: 'Configurable alert routing by client, platform, and severity. Budget exhaustion at 11am? Wrong person running an ad? Account manager gets a Slack notification in real time — not next week.' },
  { icon: <FileText className="w-5 h-5 text-purple-300" />, num: '04', title: 'Client reports that take 3 minutes to send', body: 'Adnexusone generates client-ready audit reports in natural language. Issues explained, impact quantified, next actions spelled out — ready to forward to the client without editing.' },
]

const MULTICLIENT = [
  { title: 'Cross-account spend at risk', body: 'Total monthly budget at risk across all clients visible on one screen — ranked by severity.' },
  { title: 'Account health leaderboard', body: 'Health scores per account let you see which clients need attention before they escalate to a call.' },
  { title: 'Configurable alert routing', body: 'Route alerts by account to the right account manager — so the right person always gets the right notification.' },
  { title: 'Exportable per-client reports', body: 'Generate, brand, and send diagnostic reports per client — no manual formatting, no Google Docs assembly.' },
  { title: 'Platform permission without credentials', body: 'Clients grant platform access via standard OAuth — no sharing of logins, no security risk for the agency.' },
  { title: 'AI audit summaries per account', body: 'Ask AI to summarise one client\'s account health and get a 3-sentence brief — ready for a team standup.' },
]

export default function PerformanceAgenciesPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* Hero — bold metrics hero, purple glow */}
      <section className="relative pt-36 pb-20 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 100% 10%, rgba(139,92,246,0.15) 0%, transparent 55%)' }} />
        <div className="max-w-6xl mx-auto relative">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-8 text-purple-400 bg-purple-500/10 border-purple-500/20">
            <Users className="w-3 h-3" /> Industry · Performance Agencies
          </span>
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-[2.2rem] sm:text-5xl font-extrabold tracking-tight leading-[1.06] mb-6">
                Manage 14 client accounts like<br /><span className="text-gradient animate-gradient">you have a team of 14</span>
              </h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8">
                Performance agencies operate on thin margins and high client volume. Adnexusone gives every account manager a continuous diagnostic engine across all client accounts — so nothing slips through before the client notices.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-500/25 transition-all">
                Try free for your agency <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {METRICS.map((m, i) => (
                <div key={i} className="bg-zinc-950/70 border border-white/[0.07] rounded-2xl p-5">
                  <p className={`text-3xl font-black mb-1.5 ${m.color}`}>{m.value}</p>
                  <p className="text-[11px] text-gray-500 leading-tight">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow — numbered steps */}
      <section className="py-20 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.6)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-12">How agencies run Adnexusone</p>
          <div className="relative">
            <div className="absolute left-[22px] top-8 bottom-8 w-px bg-purple-500/15 hidden sm:block" />
            <div className="space-y-8">
              {STEPS.map((s, i) => (
                <div key={i} className="flex gap-6 items-start relative">
                  <div className="shrink-0 w-11 h-11 rounded-full bg-zinc-950 border border-purple-500/30 flex items-center justify-center z-10">{s.icon}</div>
                  <div className="flex-1 bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black text-purple-500/40">{s.num}</span>
                      <p className="text-base font-bold text-white">{s.title}</p>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Multi-client capabilities — 3 col grid */}
      <section className="py-20 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10">Built for multi-client scale</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {MULTICLIENT.map((item, i) => (
              <div key={i} className="bg-zinc-950/60 border border-white/[0.07] rounded-xl p-5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 mb-3" />
                <p className="text-sm font-bold text-white mb-1.5">{item.title}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{item.body}</p>
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

'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calculator, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

function formatINR(val: number): string {
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`
  return `₹${val.toFixed(0)}`
}

const BENCHMARKS = [
  { category: 'D2C Fashion', roas: '3.0–4.5×', color: 'text-blue-400' },
  { category: 'D2C Beauty & Skincare', roas: '3.5–5.0×', color: 'text-pink-400' },
  { category: 'Health & Supplements', roas: '2.5–3.8×', color: 'text-emerald-400' },
  { category: 'Home & Living', roas: '2.8–4.0×', color: 'text-amber-400' },
  { category: 'Food & FMCG', roas: '2.0–3.2×', color: 'text-orange-400' },
  { category: 'Travel & Experience', roas: '4.0–6.0×', color: 'text-cyan-400' },
]

export default function ROASCalculatorPage() {
  const [spend, setSpend] = useState('')
  const [revenue, setRevenue] = useState('')
  const [cogs, setCogs] = useState('')
  const [target, setTarget] = useState('')

  const spendN = parseFloat(spend) || 0
  const revenueN = parseFloat(revenue) || 0
  const cogsN = parseFloat(cogs) || 0
  const targetN = parseFloat(target) || 0

  const roas = spendN > 0 ? revenueN / spendN : 0
  const grossProfit = revenueN - cogsN
  const netROI = spendN > 0 ? ((grossProfit - spendN) / spendN) * 100 : 0
  const breakEvenROAS = spendN > 0 && cogsN > 0 ? (spendN + cogsN) / spendN : 0
  const meetsTarget = targetN > 0 && roas >= targetN
  const roasGap = targetN > 0 ? roas - targetN : 0

  const hasResults = spendN > 0 && revenueN > 0

  let roasStatus: 'good' | 'warn' | 'bad' = 'good'
  if (roas < 2) roasStatus = 'bad'
  else if (roas < 3) roasStatus = 'warn'

  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      <section className="relative pt-36 pb-16 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -5%, rgba(234,179,8,0.10) 0%, transparent 55%)' }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-6 text-yellow-400 bg-yellow-500/10 border-yellow-500/20">
            <Calculator className="w-3 h-3" /> Tools · ROAS Calculator
          </span>
          <h1 className="text-[2.2rem] sm:text-4xl font-extrabold text-white mb-4">Calculate your true ROAS and break-even point</h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">Enter your ad spend, revenue, and COGS to see your actual return on ad spend, net ROI, and break-even ROAS.</p>
        </div>
      </section>

      <section className="pb-24 px-5 sm:px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-8 items-start">

          {/* Inputs */}
          <div className="bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-6 sm:p-7">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Your numbers</p>
            <div className="space-y-5">
              {[
                { label: 'Monthly ad spend (₹)', placeholder: 'e.g. 150000', value: spend, onChange: setSpend, hint: 'Total spend across Meta, Google, Amazon' },
                { label: 'Revenue attributed (₹)', placeholder: 'e.g. 450000', value: revenue, onChange: setRevenue, hint: 'Revenue attributed to the same period' },
                { label: 'Cost of goods sold (₹)', placeholder: 'e.g. 180000', value: cogs, onChange: setCogs, hint: 'Product cost for the revenue above (optional)' },
                { label: 'Target ROAS', placeholder: 'e.g. 3.5', value: target, onChange: setTarget, hint: 'Your minimum acceptable ROAS' },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">{field.label}</label>
                  <input
                    type="number"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900/80 border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/40"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">{field.hint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {hasResults ? (
              <>
                {/* Main ROAS card */}
                <div className={`rounded-2xl border p-7 ${roasStatus === 'good' ? 'border-emerald-500/25 bg-emerald-500/[0.05]' : roasStatus === 'warn' ? 'border-amber-500/25 bg-amber-500/[0.05]' : 'border-red-500/25 bg-red-500/[0.05]'}`}>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Your ROAS</p>
                  <p className={`text-5xl font-black mb-2 ${roasStatus === 'good' ? 'text-emerald-400' : roasStatus === 'warn' ? 'text-amber-400' : 'text-red-400'}`}>{roas.toFixed(2)}×</p>
                  {roasStatus === 'good' && <p className="text-sm text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Strong ROAS — above 3.0×</p>}
                  {roasStatus === 'warn' && <p className="text-sm text-amber-400 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Acceptable — aim for 3.0×+ for D2C</p>}
                  {roasStatus === 'bad' && <p className="text-sm text-red-400 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Below break-even for most D2C verticals</p>}
                </div>

                {/* Metric grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-950/60 border border-white/[0.07] rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 mb-1">Net ROI</p>
                    <p className={`text-xl font-black ${netROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{netROI.toFixed(1)}%</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">after ad spend {cogsN > 0 ? '+ COGS' : ''}</p>
                  </div>
                  <div className="bg-zinc-950/60 border border-white/[0.07] rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 mb-1">Break-even ROAS</p>
                    <p className="text-xl font-black text-white">{cogsN > 0 ? breakEvenROAS.toFixed(2) : '—'}×</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{cogsN > 0 ? 'min ROAS to cover spend + COGS' : 'enter COGS to calculate'}</p>
                  </div>
                  <div className="bg-zinc-950/60 border border-white/[0.07] rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 mb-1">Gross profit</p>
                    <p className="text-xl font-black text-white">{cogsN > 0 ? formatINR(grossProfit) : '—'}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">revenue minus COGS</p>
                  </div>
                  <div className="bg-zinc-950/60 border border-white/[0.07] rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 mb-1">Target gap</p>
                    <p className={`text-xl font-black ${targetN > 0 ? (meetsTarget ? 'text-emerald-400' : 'text-red-400') : 'text-white'}`}>{targetN > 0 ? `${roasGap >= 0 ? '+' : ''}${roasGap.toFixed(2)}×` : '—'}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{targetN > 0 ? (meetsTarget ? 'above target' : 'below target') : 'enter target ROAS'}</p>
                  </div>
                </div>

                {/* Insight */}
                <div className="bg-zinc-950/60 border border-white/[0.07] rounded-xl p-4">
                  <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-2">What this means</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {roas < 2 ? 'A ROAS below 2× is unlikely to be profitable for most D2C brands once COGS and operational costs are factored in. Run an Adnexusone diagnostic to find what\'s dragging down performance.' :
                     roas < 3 ? 'You\'re generating positive returns but leaving money on the table. Common causes at this ROAS level: creative fatigue, audience overlap, or wasted spend on low-converting ad sets.' :
                     roas >= 4 ? 'Strong performance. Focus on scaling the top-performing campaigns and protecting this ROAS as you increase spend — it typically drops 15–20% when budgets double.' :
                     'Good ROAS for most D2C verticals. Identify your top 2–3 campaigns by ROAS and shift more budget there before increasing total spend.'}
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-8 text-center">
                <TrendingUp className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Enter your spend and revenue to see your ROAS and break-even analysis</p>
              </div>
            )}

            {/* Benchmarks */}
            <div className="bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Industry ROAS benchmarks</p>
              <div className="space-y-2.5">
                {BENCHMARKS.map((b, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">{b.category}</span>
                    <span className={`text-[11px] font-bold ${b.color}`}>{b.roas}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto mt-12 bg-zinc-950/60 border border-yellow-500/15 rounded-2xl p-7 flex flex-col sm:flex-row items-center gap-5 justify-between">
          <div>
            <p className="text-base font-bold text-white mb-1">Know your ROAS? Now find out why it's where it is.</p>
            <p className="text-sm text-gray-400">Adnexusone diagnostics pinpoint the exact campaigns, ad sets, and settings dragging your ROAS down.</p>
          </div>
          <Link href="/signup" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition-all">
            Run free diagnostic <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}

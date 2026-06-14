'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

const CASES = [
  {
    brand: 'D2C Skincare Brand',
    industry: 'Beauty & Skincare',
    platform: 'Meta Ads',
    platformColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    problem: 'Creative fatigue destroying ROAS',
    context: 'Running 22 active creatives across 6 ad sets. Frequency hit 6.3× on their primary retargeting audience. CTR had dropped 38% over 3 weeks but the team attributed it to seasonality.',
    discovery: 'Adnexusone flagged frequency saturation on the retargeting ad set and identified 4 specific creatives with CTR below 0.8%. The AI brief recommended a UGC-led angle targeting review objections rather than benefits.',
    before: [{ metric: 'ROAS', value: '1.8×' }, { metric: 'CTR (primary ad set)', value: '0.7%' }, { metric: 'Frequency', value: '6.3×' }, { metric: 'Monthly spend', value: '₹3.2L' }],
    after: [{ metric: 'ROAS', value: '3.1×', up: true }, { metric: 'CTR (primary ad set)', value: '2.1%', up: true }, { metric: 'Frequency', value: '3.1×', up: false }, { metric: 'Monthly spend', value: '₹4.8L', up: true }],
    accentColor: 'border-blue-500/20',
    glowColor: 'rgba(59,130,246,0.05)',
  },
  {
    brand: 'Fashion D2C Brand',
    industry: 'Fashion & Lifestyle',
    platform: 'Google Shopping',
    platformColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    problem: 'Non-brand Shopping ROAS invisible, budget misallocated',
    context: 'The brand had a blended Shopping ROAS of 4.1× and was happy. When Adnexusone segmented branded vs. non-branded, the picture changed entirely — non-brand ROAS was 1.4×.',
    discovery: 'Adnexusone detected that brand-name search terms were grouped in the same campaign as generic product terms, masking the true non-brand performance. Separating campaigns exposed the waste.',
    before: [{ metric: 'Blended Shopping ROAS', value: '4.1×' }, { metric: 'Non-brand ROAS', value: '1.4×' }, { metric: 'Brand spend %', value: '68%' }, { metric: 'Waste on non-brand', value: '₹1.1L/mo' }],
    after: [{ metric: 'Non-brand ROAS', value: '2.9×', up: true }, { metric: 'Brand spend %', value: '42%', up: false }, { metric: 'Monthly waste eliminated', value: '₹72K', up: true }, { metric: 'Total attributed revenue', value: '+31%', up: true }],
    accentColor: 'border-emerald-500/20',
    glowColor: 'rgba(16,185,129,0.04)',
  },
  {
    brand: 'Health Supplements Brand',
    industry: 'Health & Wellness',
    platform: 'Amazon Ads',
    platformColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    problem: 'Auto campaigns bloating ACOS without discovery value',
    context: 'Six auto campaigns running for 14+ months. ACOS at 44%. The team had never reviewed search term reports. ₹2.3L/month was running through terms with zero sales history.',
    discovery: 'Adnexusone identified 127 unique search terms with 30+ days of spend and zero conversions. It also flagged 3 zero-sale ASINs receiving ₹40K/month in sponsored spend.',
    before: [{ metric: 'Portfolio ACOS', value: '44%' }, { metric: 'Wasted search terms', value: '127' }, { metric: 'Zero-sale ASIN spend', value: '₹40K/mo' }, { metric: 'Auto campaign ROAS', value: '0.9×' }],
    after: [{ metric: 'Portfolio ACOS', value: '26%', up: false }, { metric: 'Wasted search terms negated', value: '127', up: true }, { metric: 'Zero-sale ASIN spend', value: '₹0', up: false }, { metric: 'Auto campaign ROAS', value: '2.4×', up: true }],
    accentColor: 'border-orange-500/20',
    glowColor: 'rgba(249,115,22,0.04)',
  },
  {
    brand: 'Performance Marketing Agency',
    industry: 'Agencies',
    platform: 'Multi-platform',
    platformColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    problem: 'Client issues missed between weekly reviews',
    context: 'Managing 18 client accounts. With one weekly audit cycle, budget exhaustion, pixel failures, and ROAS drops were often discovered 5–7 days after they began — sometimes after client escalation.',
    discovery: 'Adnexusone ran continuous diagnostics and surfaced 3 critical issues in the first week: a pixel failure on a ₹80K/month account, a budget exhaustion pattern on a peak-season client, and keyword cannibalization inflating CPCs by 22%.',
    before: [{ metric: 'Issue detection lag', value: '5–7 days' }, { metric: 'Client escalations/month', value: '3–4' }, { metric: 'Audit time per account', value: '2+ hrs' }, { metric: 'Accounts reviewed weekly', value: '18' }],
    after: [{ metric: 'Issue detection lag', value: '<2 hrs', up: false }, { metric: 'Client escalations/month', value: '0', up: false }, { metric: 'Audit time per account', value: '15 min', up: false }, { metric: 'Accounts covered daily', value: '18', up: true }],
    accentColor: 'border-purple-500/20',
    glowColor: 'rgba(139,92,246,0.04)',
  },
]

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* Header */}
      <section className="pt-36 pb-16 px-5 sm:px-6 border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <span className="inline-flex text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border text-gray-400 bg-white/[0.04] border-white/[0.08] mb-6">Resources · Case Studies</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Real accounts. Real issues. Real numbers.</h1>
          <p className="text-gray-400 text-base max-w-xl leading-relaxed">Each case study shows the exact issue found, how Adnexusone surfaced it, and the before/after performance impact.</p>
        </div>
      </section>

      {/* Case study cards */}
      <section className="py-16 px-5 sm:px-6 pb-24">
        <div className="max-w-5xl mx-auto space-y-8">
          {CASES.map((c, i) => (
            <div key={i} className={`bg-zinc-950/50 border rounded-2xl overflow-hidden ${c.accentColor}`} style={{ background: c.glowColor }}>
              <div className="p-6 sm:p-8 border-b border-white/[0.05]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                  <span className={`inline-flex text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${c.platformColor}`}>{c.platform}</span>
                  <span className="text-[11px] text-gray-500">{c.brand} · {c.industry}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mb-4">{c.problem}</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Situation</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{c.context}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">What Adnexusone found</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{c.discovery}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Before</p>
                    <div className="space-y-3">
                      {c.before.map((b, j) => (
                        <div key={j} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                          <span className="text-sm text-gray-400">{b.metric}</span>
                          <span className="text-sm font-bold text-red-400">{b.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">After</p>
                    <div className="space-y-3">
                      {c.after.map((a, j) => (
                        <div key={j} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                          <span className="text-sm text-gray-400">{a.metric}</span>
                          <span className={`text-sm font-bold flex items-center gap-1 ${a.up ? 'text-emerald-400' : 'text-emerald-400'}`}>
                            {a.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {a.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto mt-14 text-center">
          <p className="text-gray-400 text-sm mb-5">Ready to see what Adnexusone finds in your account?</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all">
            Run free account diagnostic <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}

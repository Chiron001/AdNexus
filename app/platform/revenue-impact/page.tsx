'use client'

import React from 'react'
import { TrendingUp, BarChart3, AlertTriangle, Eye } from 'lucide-react'
import { FeaturePageShell, FeaturePageConfig } from '@/components/landing/FeaturePageShell'

const cfg: FeaturePageConfig = {
  badge: 'Capabilities · Revenue Impact',
  badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  glowColor: 'rgba(59,130,246,0.10)',
  title: 'Every issue comes with a price tag',
  subtitle:
    "AdNexus doesn't just flag problems — it tells you exactly how much each one is costing your business every month, in rupees.",
  stats: [
    ['₹ cost', 'per issue'],
    ['Ranked', 'by impact'],
    ['All 30', 'checks covered'],
  ],
  featuresLabel: 'How we calculate it',
  features: [
    {
      icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
      title: 'Creative fatigue',
      desc: 'Estimated ROAS recovery × spend on fatigued campaigns in the last 30 days.',
    },
    {
      icon: <Eye className="w-4 h-4 text-red-400" />,
      title: 'Broken pixel',
      desc: 'Estimated conversions lost × your blended average order value per month.',
    },
    {
      icon: <BarChart3 className="w-4 h-4 text-orange-400" />,
      title: 'Zero-conversion spend',
      desc: 'Actual spend with zero attributed conversions in the last 14 days.',
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-orange-400" />,
      title: 'ACOS bleed',
      desc: 'Spend above your target ACOS threshold × days running over benchmark.',
    },
  ],
}

const WHY = [
  { title: 'Prioritize by business impact', desc: 'Fix the ₹42K problem before the ₹3K one. Every single time.' },
  { title: 'Build the case for fixes', desc: 'Share a rupee estimate with finance, leadership, or your client — not just a severity label.' },
  { title: 'Track recovered revenue', desc: "As you resolve issues, AdNexus tracks total rupee impact resolved — your team's measurable ROI." },
]

export default function RevenueImpactPage() {
  return (
    <FeaturePageShell cfg={cfg}>
      <section className="py-16 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-7">Why it matters</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {WHY.map((r, i) => (
              <div key={i} className="p-5 bg-zinc-950/60 border border-white/[0.07] rounded-2xl">
                <p className="text-sm font-bold text-white mb-2">{r.title}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FeaturePageShell>
  )
}

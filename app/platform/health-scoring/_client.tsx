'use client'

import React from 'react'
import { Shield, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react'
import { FeaturePageShell, FeaturePageConfig } from '@/components/landing/FeaturePageShell'

const cfg: FeaturePageConfig = {
  badge: 'Capabilities · Health Scoring',
  badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  glowColor: 'rgba(244,63,94,0.10)',
  title: 'One score per platform. No guessing.',
  subtitle:
    'Adnexusone calculates a live health score (0–100) for Meta, Google, and Amazon — updated every sync, based on your actual account data.',
  stats: [
    ['0–100', 'score range'],
    ['3', 'platform scores'],
    ['Live', 'every sync'],
  ],
  featuresLabel: 'What affects your score',
  features: [
    { icon: <AlertTriangle className="w-4 h-4 text-red-400" />, title: 'Issue severity', desc: 'Critical issues pull the score down faster than low-severity ones. Weighted by rupee impact.' },
    { icon: <TrendingUp className="w-4 h-4 text-orange-400" />, title: 'Spend at risk ratio', desc: 'The higher the percentage of your budget tied to flagged campaigns, the lower the score.' },
    { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, title: 'Resolution rate', desc: 'How quickly you fix issues over time positively trends your score.' },
    { icon: <Shield className="w-4 h-4 text-blue-400" />, title: 'Account structure health', desc: 'Pixel setup, ad group depth, and tracking completeness contribute to the baseline.' },
  ],
}

const BANDS = [
  { range: '80–100', label: 'Healthy', desc: 'Minor optimizations available. No urgent action needed.', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/25' },
  { range: '60–79', label: 'At risk', desc: 'Several issues need attention within the week.', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25' },
  { range: '40–59', label: 'Unhealthy', desc: 'Significant spend being wasted. Action required now.', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/25' },
  { range: '0–39', label: 'Critical', desc: 'Immediate intervention needed to stop budget bleed.', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25' },
]

export default function HealthScoringPage() {
  return (
    <FeaturePageShell cfg={cfg}>
      <section className="py-16 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.5)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-7">Score bands</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {BANDS.map((b, i) => (
              <div key={i} className={`p-5 rounded-2xl border ${b.border} ${b.bg}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xl font-black font-mono ${b.color}`}>{b.range}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.bg} ${b.color} border ${b.border}`}>{b.label}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FeaturePageShell>
  )
}

'use client'

import React from 'react'
import { FileText, BarChart3, Shield, TrendingUp, AlertTriangle } from 'lucide-react'
import { FeaturePageShell, FeaturePageConfig } from '@/components/landing/FeaturePageShell'

const cfg: FeaturePageConfig = {
  badge: 'Capabilities · Audit Reports',
  badgeColor: 'text-green-400 bg-green-500/10 border-green-500/20',
  glowColor: 'rgba(34,197,94,0.10)',
  title: 'Reports your clients will trust',
  subtitle:
    'One click generates a branded PDF showing every issue, its rupee cost, and the recommended fix. Ready to send in 30 seconds.',
  stats: [
    ['1-click', 'export'],
    ['White-label', 'branded'],
    ['PDF', 'format'],
  ],
  featuresLabel: "What's in every report",
  features: [
    { icon: <Shield className="w-4 h-4 text-blue-400" />, title: 'Executive summary', desc: 'Overall health score and total spend at risk — one page, instantly digestible.' },
    { icon: <AlertTriangle className="w-4 h-4 text-red-400" />, title: 'Issue inventory', desc: 'Every flagged issue with severity, platform, and estimated monthly rupee cost.' },
    { icon: <FileText className="w-4 h-4 text-purple-400" />, title: 'AI fix recommendations', desc: 'Claude-written action plan for each issue — specific, step-by-step, copy-paste ready.' },
    { icon: <BarChart3 className="w-4 h-4 text-cyan-400" />, title: 'Platform health scores', desc: 'Meta, Google, and Amazon scores side by side with trend vs. last period.' },
    { icon: <TrendingUp className="w-4 h-4 text-green-400" />, title: 'Period comparison', desc: 'Issues resolved vs. new issues found — shows progress over time.' },
  ],
}

const WHO_USES = [
  { role: 'Performance Agencies', desc: 'Share branded weekly reports with D2C clients. No manual slide-building.' },
  { role: 'Brand Growth Leads', desc: 'Present ad health to CMOs and founders with one-click PDF exports.' },
  { role: 'In-house Teams', desc: 'Run a full account audit before every major campaign launch.' },
]

export default function AuditReportsPage() {
  return (
    <FeaturePageShell cfg={cfg}>
      <section className="py-16 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.5)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-7">Who uses audit reports</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {WHO_USES.map((u, i) => (
              <div key={i} className="p-5 bg-zinc-950/60 border border-white/[0.07] rounded-2xl">
                <p className="text-sm font-bold text-white mb-2">{u.role}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FeaturePageShell>
  )
}

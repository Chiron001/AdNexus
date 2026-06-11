'use client'

import { CheckCircle2 } from 'lucide-react'
import { FeaturePageShell, FeaturePageConfig } from '@/components/landing/FeaturePageShell'

const ICON = <CheckCircle2 className="w-4 h-4 text-blue-400" />

const cfg: FeaturePageConfig = {
  badge: 'Channels · Meta Ads',
  badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  glowColor: 'rgba(59,130,246,0.12)',
  title: '10 Meta checks. Every sync.',
  subtitle:
    'AdNexus monitors your Facebook and Instagram campaigns for the issues that hurt D2C brands most — from creative fatigue to pixel failures.',
  stats: [
    ['10', 'Meta checks'],
    ['FB + IG', 'covered'],
    ['Every sync', 'automated'],
  ],
  featuresLabel: 'What AdNexus checks on Meta',
  features: [
    { icon: ICON, title: 'Creative fatigue', desc: 'Frequency and CTR decline detected per ad set before ROAS drops.' },
    { icon: ICON, title: 'Broken Facebook Pixel', desc: 'Purchase event validation before you scale spend on broken tracking.' },
    { icon: ICON, title: 'Frequency cap violations', desc: 'Over-exposure caught before audience fatigue sets in.' },
    { icon: ICON, title: 'Audience overlap across ad sets', desc: 'Competing ad sets eating each other\'s reach and inflating cost.' },
    { icon: ICON, title: 'Zero-conversion ad sets', desc: 'Active spend with no attributed results — flagged immediately.' },
    { icon: ICON, title: 'Budget pacing issues', desc: 'Over- and under-delivery detected early before day ends.' },
    { icon: ICON, title: 'Lookalike audience decay', desc: 'Stale seed audiences flagged for refresh before performance drops.' },
    { icon: ICON, title: 'Campaign objective mismatch', desc: 'Conversions objective running with poor pixel health detected.' },
    { icon: ICON, title: 'Ad scheduling gaps', desc: 'Peak traffic hours not covered by active budget identified.' },
    { icon: ICON, title: 'Low CTR creatives', desc: 'Creatives performing below category benchmark click-through rates.' },
  ],
}

export default function MetaPage() {
  return <FeaturePageShell cfg={cfg} />
}

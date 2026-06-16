'use client'

import { CheckCircle2 } from 'lucide-react'
import { FeaturePageShell, FeaturePageConfig } from '@/components/landing/FeaturePageShell'

const cfg: FeaturePageConfig = {
  badge: 'Capabilities · Diagnostic Engine',
  badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  glowColor: 'rgba(6,182,212,0.12)',
  title: '30 checks. Every sync. Zero effort.',
  subtitle:
    'Adnexusone automatically scans Meta, Google, and Amazon every time you sync — surfacing every issue ranked by its monthly rupee cost.',
  stats: [
    ['30', 'checks per sync'],
    ['3', 'platforms covered'],
    ['100%', 'automated'],
  ],
  featuresLabel: 'What gets checked',
  features: [
    { icon: <CheckCircle2 className="w-4 h-4 text-blue-400" />, title: 'Creative fatigue', desc: 'Frequency and CTR decline detected per ad set.', tag: 'Meta', tagColor: 'text-blue-400 bg-blue-500/10' },
    { icon: <CheckCircle2 className="w-4 h-4 text-blue-400" />, title: 'Broken pixel tracking', desc: 'Purchase event validation before you scale.', tag: 'Meta', tagColor: 'text-blue-400 bg-blue-500/10' },
    { icon: <CheckCircle2 className="w-4 h-4 text-blue-400" />, title: 'Frequency cap violations', desc: 'Over-exposure caught before it compounds.', tag: 'Meta', tagColor: 'text-blue-400 bg-blue-500/10' },
    { icon: <CheckCircle2 className="w-4 h-4 text-blue-400" />, title: 'Audience overlap', desc: 'Competing ad sets eating each other\'s reach.', tag: 'Meta', tagColor: 'text-blue-400 bg-blue-500/10' },
    { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, title: 'Keyword cannibalization', desc: 'Ad groups competing for the same search terms.', tag: 'Google', tagColor: 'text-green-400 bg-green-500/10' },
    { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, title: 'Quality Score drop', desc: 'High-spend keywords scoring below 5 detected.', tag: 'Google', tagColor: 'text-green-400 bg-green-500/10' },
    { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, title: 'Broad match budget drain', desc: 'Zero-negative broad match campaigns flagged.', tag: 'Google', tagColor: 'text-green-400 bg-green-500/10' },
    { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, title: 'High CPA campaigns', desc: 'Cost per acquisition above your target threshold.', tag: 'Google', tagColor: 'text-green-400 bg-green-500/10' },
    { icon: <CheckCircle2 className="w-4 h-4 text-orange-400" />, title: 'High ACOS auto campaigns', desc: 'Above-benchmark ACOS detected per campaign.', tag: 'Amazon', tagColor: 'text-orange-400 bg-orange-500/10' },
    { icon: <CheckCircle2 className="w-4 h-4 text-orange-400" />, title: 'Zero-sale ASIN spend', desc: 'Active budget on products with no attributed sales.', tag: 'Amazon', tagColor: 'text-orange-400 bg-orange-500/10' },
    { icon: <CheckCircle2 className="w-4 h-4 text-orange-400" />, title: 'Search term bleed', desc: 'Irrelevant search terms consuming sponsored budget.', tag: 'Amazon', tagColor: 'text-orange-400 bg-orange-500/10' },
    { icon: <CheckCircle2 className="w-4 h-4 text-orange-400" />, title: 'Bid cannibalization', desc: 'Same keyword competing across multiple campaigns.', tag: 'Amazon', tagColor: 'text-orange-400 bg-orange-500/10' },
  ],
  steps: [
    { num: '01', title: 'Connect your accounts', desc: 'Link Meta, Google, and Amazon Ads in under 2 minutes using secure OAuth — no passwords stored.' },
    { num: '02', title: 'Sync and scan', desc: 'Adnexusone runs all 30 checks automatically every time you sync. No manual setup or configuration.' },
    { num: '03', title: 'Act on what matters', desc: 'Every issue shows the estimated monthly rupee cost. AI writes the exact fix your team needs.' },
  ],
}

export default function DiagnosticEnginePage() {
  return <FeaturePageShell cfg={cfg} />
}

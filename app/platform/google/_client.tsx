'use client'

import { CheckCircle2 } from 'lucide-react'
import { FeaturePageShell, FeaturePageConfig } from '@/components/landing/FeaturePageShell'

const ICON = <CheckCircle2 className="w-4 h-4 text-green-400" />

const cfg: FeaturePageConfig = {
  badge: 'Channels · Google Ads',
  badgeColor: 'text-green-400 bg-green-500/10 border-green-500/20',
  glowColor: 'rgba(34,197,94,0.10)',
  title: '10 Google checks. Built for performance.',
  subtitle:
    'Adnexusone runs deep diagnostics on your Search, Shopping, and Display campaigns — catching what the Google dashboard misses.',
  stats: [
    ['10', 'Google checks'],
    ['Search + Shopping', 'covered'],
    ['Every sync', 'automated'],
  ],
  featuresLabel: 'What Adnexusone checks on Google',
  features: [
    { icon: ICON, title: 'Keyword cannibalization', desc: 'Competing ad groups splitting impression share and inflating bids.' },
    { icon: ICON, title: 'Quality Score drop', desc: 'High-spend keywords scoring below 5 — flagged before cost climbs.' },
    { icon: ICON, title: 'Zero-impression keywords', desc: 'Active keywords that have never been shown in auctions.' },
    { icon: ICON, title: 'High CPA campaigns', desc: 'Cost per acquisition above your target threshold, by campaign.' },
    { icon: ICON, title: 'Broad match budget drain', desc: 'Broad match keywords running without a negative keyword list.' },
    { icon: ICON, title: 'Low search impression share', desc: 'Budget-limited campaigns missing significant traffic volume.' },
    { icon: ICON, title: 'Ad group keyword conflict', desc: 'Too many unrelated keywords sharing one ad group and Quality Score.' },
    { icon: ICON, title: 'Missing negative keywords', desc: 'Irrelevant search terms consuming budget — flagged by match analysis.' },
    { icon: ICON, title: 'Landing page score issues', desc: 'Slow or mismatched destination pages dragging down Quality Score.' },
    { icon: ICON, title: 'Smart campaign autopilot', desc: 'Fully automated campaigns running with no manual performance check.' },
  ],
}

export default function GooglePage() {
  return <FeaturePageShell cfg={cfg} />
}

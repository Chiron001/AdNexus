'use client'

import { Bell, Zap, Shield, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react'
import { FeaturePageShell, FeaturePageConfig } from '@/components/landing/FeaturePageShell'

const cfg: FeaturePageConfig = {
  badge: 'Capabilities · Real-time Alerts',
  badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  glowColor: 'rgba(245,158,11,0.10)',
  title: 'Know the moment something breaks',
  subtitle:
    'Set thresholds for any metric. The moment a campaign crosses them, Adnexusone fires an alert — so you respond in minutes, not days.',
  stats: [
    ['6', 'alert types'],
    ['Instant', 'notification'],
    ['AI fix', 'included'],
  ],
  featuresLabel: 'Alert types',
  features: [
    { icon: <TrendingUp className="w-4 h-4 text-red-400" />, title: 'ROAS drop', desc: 'Fires when ROAS falls below your set minimum on any platform.' },
    { icon: <Zap className="w-4 h-4 text-orange-400" />, title: 'Budget exhausted early', desc: 'Fires when daily budget runs out before your peak traffic hours.' },
    { icon: <Bell className="w-4 h-4 text-amber-400" />, title: 'Creative fatigue', desc: 'Fires when ad frequency hits your threshold — before CTR tanks.' },
    { icon: <Shield className="w-4 h-4 text-red-400" />, title: 'Pixel failure', desc: 'Fires when conversion events stop recording on your Meta pixel.' },
    { icon: <AlertTriangle className="w-4 h-4 text-red-400" />, title: 'Zero conversions', desc: 'Fires when a campaign spends budget with no attributed results.' },
    { icon: <BarChart3 className="w-4 h-4 text-orange-400" />, title: 'CPC spike', desc: 'Fires when cost-per-click exceeds your target on Google Search.' },
  ],
  steps: [
    { num: '01', title: 'Choose your metric', desc: 'Select the platform, campaign level, and metric you want to monitor — ROAS, CPC, frequency, or conversions.' },
    { num: '02', title: 'Set your threshold', desc: 'Define the value that triggers the alert. e.g. ROAS below 2x, or frequency above 5. No code required.' },
    { num: '03', title: 'Get notified instantly', desc: 'Receive an email alert with the issue flagged and an AI-suggested fix. Act before it compounds.' },
  ],
}

export default function AlertsPage() {
  return <FeaturePageShell cfg={cfg} />
}

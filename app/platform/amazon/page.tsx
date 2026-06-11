'use client'

import { CheckCircle2 } from 'lucide-react'
import { FeaturePageShell, FeaturePageConfig } from '@/components/landing/FeaturePageShell'

const ICON = <CheckCircle2 className="w-4 h-4 text-orange-400" />

const cfg: FeaturePageConfig = {
  badge: 'Channels · Amazon Ads',
  badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  glowColor: 'rgba(249,115,22,0.10)',
  title: '10 Amazon checks. ACOS included.',
  subtitle:
    'AdNexus audits your Sponsored Products, Sponsored Brands, and Auto campaigns — targeting every issue that erodes Amazon ROAS.',
  stats: [
    ['10', 'Amazon checks'],
    ['SP + SB + Auto', 'covered'],
    ['Every sync', 'automated'],
  ],
  featuresLabel: 'What AdNexus checks on Amazon',
  features: [
    { icon: ICON, title: 'High ACOS auto campaigns', desc: 'Above-benchmark ACOS detected per campaign — flagged with cost estimate.' },
    { icon: ICON, title: 'Search term inefficiency', desc: 'Irrelevant search terms burning sponsored budget without conversions.' },
    { icon: ICON, title: 'Zero-sale ASINs with active spend', desc: 'Products receiving ad spend with no sales attributed in 14 days.' },
    { icon: ICON, title: 'Campaign budget exhausting early', desc: 'Daily budget running out before peak shopping hours detected.' },
    { icon: ICON, title: 'Keyword bid cannibalization', desc: 'Same keyword competing across multiple campaigns and inflating bids.' },
    { icon: ICON, title: 'Low product page conversion rate', desc: 'High-traffic ASINs with poor add-to-cart rates identified.' },
    { icon: ICON, title: 'Match type waste', desc: 'Broad match keywords running without a negative keyword list.' },
    { icon: ICON, title: 'Sponsored Brand low CTR', desc: 'Headline ads performing below category average click-through rates.' },
    { icon: ICON, title: 'Category targeting bleed', desc: 'Ads showing in irrelevant product categories wasting impression budget.' },
    { icon: ICON, title: 'ROAS below target', desc: 'Campaign-level ROAS tracked against your target — flagged when below.' },
  ],
}

export default function AmazonPage() {
  return <FeaturePageShell cfg={cfg} />
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Zap, AlertTriangle, Lightbulb, TrendingUp, CheckCircle2,
  ArrowRight, BarChart3, Shield, Clock
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Connect in 2 minutes',
    description: 'One-click OAuth for Meta Ads, Google Ads, and Amazon Ads. No API keys needed.',
  },
  {
    icon: AlertTriangle,
    title: '30+ diagnostic checks',
    description: 'Creative fatigue, zero-conversion campaigns, tracking issues, budget problems — all detected automatically.',
  },
  {
    icon: Lightbulb,
    title: 'Plain-English AI fixes',
    description: "Each issue comes with a specific action plan written by Claude — the world's best marketing AI.",
  },
  {
    icon: TrendingUp,
    title: 'Revenue impact ranking',
    description: 'Issues ranked by how much money they\'re costing you. Fix the most important thing first.',
  },
  {
    icon: Shield,
    title: 'Health score per platform',
    description: 'A single 0-100 score tells you exactly how healthy each ad account is, updated every 6 hours.',
  },
  {
    icon: Clock,
    title: '24/7 automated monitoring',
    description: 'Get email alerts the moment a critical issue is detected — before it drains your budget.',
  },
]

const platforms = [
  { name: 'Meta Ads', color: 'bg-blue-600', checks: 10 },
  { name: 'Google Ads', color: 'bg-green-600', checks: 10 },
  { name: 'Amazon Ads', color: 'bg-orange-500', checks: 8 },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AdNexus</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Start free →</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <Badge className="bg-blue-50 text-blue-700 mb-6">
          Meta · Google · Amazon — all in one
        </Badge>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
          Your ad accounts are losing money right now
        </h1>
        <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto">
          AdNexus scans every campaign across all your ad platforms, diagnoses issues ranked by revenue impact,
          and gives you an AI-written action plan — in under 2 minutes.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
          <Button size="lg" className="text-base px-8" asChild>
            <Link href="/signup">
              Diagnose my accounts free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-base" asChild>
            <Link href="/login">I have an account</Link>
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-4">Free forever · No credit card · Setup in 2 minutes</p>
      </section>

      {/* Platforms */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm font-medium text-gray-500 mb-8 uppercase tracking-wide">
            Supported Platforms
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex items-center gap-3 bg-white rounded-xl px-6 py-4 shadow-sm">
                <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                  {platform.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{platform.name}</p>
                  <p className="text-xs text-gray-500">{platform.checks}+ diagnostic checks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Everything you need to stop wasting ad spend</h2>
          <p className="text-gray-500 mt-4 text-lg">
            Built for D2C brands and performance marketing agencies managing ₹10L+ monthly in ad spend.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="space-y-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="text-gray-500 mt-4">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <Card>
              <CardContent className="pt-8 pb-8">
                <p className="font-bold text-gray-900 text-lg">Free</p>
                <p className="text-4xl font-bold mt-2">₹0<span className="text-base font-normal text-gray-500">/mo</span></p>
                <ul className="space-y-3 mt-6 text-sm text-gray-600">
                  {['1 platform', '10 issues visible', '5 AI recommendations/month', 'Manual sync'].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-8" variant="outline" asChild>
                  <Link href="/signup">Get started free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Growth */}
            <Card className="border-blue-600 border-2 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">Most Popular</Badge>
              </div>
              <CardContent className="pt-8 pb-8">
                <p className="font-bold text-gray-900 text-lg">Growth</p>
                <p className="text-4xl font-bold mt-2">₹2,999<span className="text-base font-normal text-gray-500">/mo</span></p>
                <ul className="space-y-3 mt-6 text-sm text-gray-600">
                  {[
                    'All 3 platforms',
                    'Unlimited issues',
                    'Unlimited AI recommendations',
                    'Email alerts',
                    'PDF audit reports',
                    'Auto-sync every 6 hours',
                    '90-day data history',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-8" asChild>
                  <Link href="/signup">Start Growth plan</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Agency */}
            <Card>
              <CardContent className="pt-8 pb-8">
                <p className="font-bold text-gray-900 text-lg">Agency</p>
                <p className="text-4xl font-bold mt-2">₹9,999<span className="text-base font-normal text-gray-500">/mo</span></p>
                <ul className="space-y-3 mt-6 text-sm text-gray-600">
                  {[
                    'Everything in Growth',
                    'Up to 25 brand accounts',
                    'White-label PDF reports',
                    'Priority support',
                    'API access (coming soon)',
                    'Client portal (coming soon)',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-8 bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/signup">Start Agency plan</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900">Start diagnosing in 2 minutes</h2>
        <p className="text-gray-500 mt-4 text-lg">
          Connect your first ad account for free. No credit card required.
        </p>
        <Button size="lg" className="mt-8 text-base px-10" asChild>
          <Link href="/signup">
            Get started free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">AdNexus</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 AdNexus. Built for Indian D2C brands.</p>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Zap, AlertTriangle, CheckCircle2, ArrowRight,
  Shield, Clock, Menu, X, Activity, Target, Bell,
  TrendingUp, BarChart3, Users, FileText,
} from 'lucide-react'

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Features', href: '#features' },
  { label: 'Customers', href: '#results' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '#resources' },
]

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ backgroundColor: '#080808', backgroundImage: NOISE_SVG }}
    >

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.06]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">AdNexus</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={href} href={href} className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors">
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20">
              Get started free
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-[#0C0C0C] border-t border-white/[0.06] px-4 py-4 space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={href} href={href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors">
                {label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
              <Link href="/login" className="block py-3 text-sm text-gray-400 text-center" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/signup" className="block py-3 text-sm font-semibold bg-blue-600 text-white rounded-lg text-center" onClick={() => setMobileOpen(false)}>Get started free</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section
        className="relative pt-28 pb-0 sm:pt-36 px-4 sm:px-6 text-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 100% 55% at 50% 0%, rgba(37,99,235,0.16) 0%, transparent 70%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-gray-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
            Now live for Indian D2C brands and agencies
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-bold tracking-tight leading-[1.06] mb-6">
            The leading Ad Account
            <br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Diagnostics Platform
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Move from campaign execution to continuous ad account health. AdNexus diagnoses issues, ranks them by rupee impact, and gives your team AI-written fixes across Meta, Google, and Amazon Ads.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
            <Link href="/signup" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-base transition-all duration-200 shadow-xl shadow-blue-600/25 hover:-translate-y-0.5">
              Start for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="#platform" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium rounded-xl text-base transition-all duration-200 hover:bg-white/[0.04]">
              See the platform
            </Link>
          </div>
          <p className="text-xs text-gray-600 mb-14">No credit card needed. Free plan available.</p>
        </div>

        {/* Product preview mockup */}
        <div className="relative max-w-5xl mx-auto">
          <div
            className="relative rounded-t-2xl border border-white/10 overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #0f1117 0%, #0a0a0a 100%)', boxShadow: '0 -20px 80px rgba(37,99,235,0.12), 0 0 0 1px rgba(255,255,255,0.06)' }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/10"></div>
                <div className="w-3 h-3 rounded-full bg-white/10"></div>
                <div className="w-3 h-3 rounded-full bg-white/10"></div>
              </div>
              <div className="flex-1 mx-4 h-6 rounded-md bg-white/[0.04] flex items-center px-3">
                <span className="text-xs text-gray-600">app.adnexus.in/dashboard</span>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="p-4 sm:p-6">
              {/* Top stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Ad Accounts', value: '4', sub: 'connected', color: 'text-blue-400' },
                  { label: 'Open Issues', value: '12', sub: '3 critical', color: 'text-red-400' },
                  { label: 'Revenue at Risk', value: '₹1.4L', sub: 'per month', color: 'text-amber-400' },
                  { label: 'Health Score', value: '62', sub: 'needs work', color: 'text-yellow-400' },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 sm:p-4">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Issues list */}
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <p className="text-sm font-medium text-white">Issues ranked by impact</p>
                  <span className="text-xs text-gray-500">12 open</span>
                </div>
                {[
                  { platform: 'Meta', issue: 'Creative fatigue on 4 ad sets — CTR dropped 61% in 7 days', severity: 'Critical', impact: '₹42,000/mo', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
                  { platform: 'Google', issue: 'Conversion tracking broken on 2 campaigns since last week', severity: 'Critical', impact: '₹38,500/mo', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
                  { platform: 'Amazon', issue: 'Auto campaigns spending 3x more than manual with lower ACOS', severity: 'High', impact: '₹21,000/mo', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
                  { platform: 'Google', issue: 'Quality Score below 4 on 11 keywords in Brand campaign', severity: 'High', impact: '₹16,200/mo', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
                ].map(({ platform, issue, severity, impact, color }) => (
                  <div key={issue} className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0">
                    <span className={`mt-0.5 px-2 py-0.5 text-xs font-semibold rounded-md border flex-shrink-0 ${color}`}>{severity}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">{platform} Ads</p>
                      <p className="text-sm text-gray-300 leading-snug">{issue}</p>
                    </div>
                    <span className="text-xs font-semibold text-red-400 flex-shrink-0 hidden sm:block">{impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted by ──────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-gray-600 font-medium mb-8">Trusted by D2C brands and agencies across India</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {['Nykaa', 'Mamaearth', 'Boat', 'WOW Skin', 'Lenskart', 'Bewakoof', 'Clovia', 'mCaffeine'].map((brand) => (
              <span key={brand} className="text-sm font-semibold text-gray-600 hover:text-gray-400 transition-colors tracking-wide">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── One Platform ────────────────────────────────────────── */}
      <section id="platform" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-500 mb-3">One platform</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5">
              Every ad channel, one place.
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The most complete diagnostics platform for Meta, Google, and Amazon. Built for teams that run serious ad spend and cannot afford to miss what is going wrong.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                name: 'Meta Ads',
                letter: 'M',
                gradient: 'from-blue-600 to-blue-800',
                glow: 'rgba(37,99,235,0.15)',
                description: 'Track creative fatigue, audience overlap, pixel issues, and budget drain across every campaign and ad set.',
                checks: ['Creative fatigue detection', 'Audience overlap analysis', 'Frequency cap violations', 'Pixel event tracking gaps', 'Budget pacing issues', 'Underperforming ad sets'],
              },
              {
                name: 'Google Ads',
                letter: 'G',
                gradient: 'from-green-600 to-green-800',
                glow: 'rgba(22,163,74,0.15)',
                description: 'Monitor quality scores, impression share, bid strategy health, keyword overlap, and conversion tracking accuracy.',
                checks: ['Quality score monitoring', 'Impression share lost', 'Keyword cannibalization', 'Conversion tracking breaks', 'Zero-conversion keywords', 'Broad match overuse'],
              },
              {
                name: 'Amazon Ads',
                letter: 'A',
                gradient: 'from-orange-500 to-orange-700',
                glow: 'rgba(249,115,22,0.15)',
                description: 'Diagnose ACOS creep, auto vs manual campaign overlap, spend concentration risk, and missing keyword coverage.',
                checks: ['High ACOS campaigns', 'Missing branded keywords', 'Spend concentration risk', 'Auto vs manual overlap', 'Zero-conversion ASINs', 'Bid adjustment gaps'],
              },
            ].map(({ name, letter, gradient, glow, description, checks }) => (
              <div
                key={name}
                className="p-6 sm:p-8 rounded-2xl border border-white/[0.07] hover:border-white/[0.12] transition-all duration-300"
                style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${glow}, transparent), rgba(255,255,255,0.02)` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-xl mb-6`}>
                  {letter}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">{description}</p>
                <ul className="space-y-2.5">
                  {checks.map((check) => (
                    <li key={check} className="flex items-center gap-2.5 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {check}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Meet AdNexus AI ─────────────────────────────────────── */}
      <section
        className="py-24 px-4 sm:px-6 border-t border-white/[0.06]"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-sm font-semibold text-purple-400 mb-3">Meet AdNexus AI</p>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
                The intelligence that powers every diagnosis
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Drive faster, more meaningful action across all three platforms powered by autonomous, generative, and agentic intelligence.
              </p>
              <div className="space-y-5">
                {[
                  {
                    icon: Target,
                    title: 'Autonomous diagnostics for superior ad performance',
                    desc: 'AdNexus runs checks continuously across your accounts, surfaces problems the moment they appear, and ranks them by actual rupee cost.',
                  },
                  {
                    icon: Activity,
                    title: 'Put your diagnostics on autopilot with AdNexus AI',
                    desc: 'Generate meaningful insights using powerful generative AI. Connect issues to action with specific campaign-level recommendations.',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Maximize impact trained on ad performance data',
                    desc: 'Every recommendation is powered by Claude AI, cross-referenced against your historical campaign data to give context-aware guidance.',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">{title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI feature visual */}
            <div className="relative">
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background: '#0f1117' }}>
                <div className="p-4 border-b border-white/[0.06]">
                  <p className="text-sm font-medium text-white">AI-Generated Fix</p>
                  <p className="text-xs text-gray-500 mt-0.5">Creative fatigue on Meta Ad Set #12</p>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-semibold rounded-md">Critical</span>
                    <span className="text-xs text-gray-500">Impact: ₹42,000 per month</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-5">
                    Your top-performing ad set has reached creative fatigue. CTR dropped from 3.2% to 1.1% over the last 7 days while frequency climbed to 4.8. The audience has seen these creatives too many times.
                  </p>
                  <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02]">
                    <p className="text-xs font-semibold text-white mb-3">What to do right now</p>
                    <ol className="space-y-2">
                      {[
                        'Pause the 3 ads with frequency above 4.5 immediately',
                        'Upload at least 2 fresh creatives with a different visual angle',
                        'Reduce the audience size or add exclusions to limit repeat exposure',
                        'Set a frequency cap of 3 per 7 days on this ad set going forward',
                      ].map((step, i) => (
                        <li key={step} className="flex gap-2.5 text-sm text-gray-400">
                          <span className="text-gray-600 flex-shrink-0 font-mono">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <button className="mt-4 w-full py-2.5 text-sm font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg border border-purple-500/20 transition-colors">
                    Mark as resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-500 mb-3">Unmatched coverage</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5">
              For unstoppable ad performance
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From ₹5L to ₹5Cr monthly spend, AdNexus covers every failure mode that costs brands money without them knowing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Zap,
                title: 'Connect in under 2 minutes',
                description: 'One-click OAuth connects your Meta, Google, and Amazon ad accounts. No API keys. No CSV uploads. No engineering help needed.',
                color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/15',
              },
              {
                icon: AlertTriangle,
                title: '30 diagnostic checks run on every sync',
                description: 'Creative fatigue, zero-conversion spend, broken tracking, keyword cannibalization, high ACOS campaigns, and much more.',
                color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/15',
              },
              {
                icon: Activity,
                title: 'Health score per platform, updated daily',
                description: 'A single number tells you how healthy each ad account is. Share it in team standups so everyone knows where to focus.',
                color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/15',
              },
              {
                icon: Bell,
                title: 'Email alerts the moment issues appear',
                description: 'Critical issues trigger an immediate email with context and next steps so your team can act before the daily budget is wasted.',
                color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/15',
              },
              {
                icon: FileText,
                title: 'Audit reports your clients will trust',
                description: 'One-click PDF reports with health scores, issue breakdowns, and AI recommendations. Send them to clients or use them in reviews.',
                color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/15',
              },
              {
                icon: Shield,
                title: 'Revenue impact on every issue',
                description: 'Every problem shows an estimated rupee cost per month based on your actual spend and performance data. No guessing required.',
                color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/15',
              },
            ].map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200">
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 border`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-white mb-2 text-base">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results ─────────────────────────────────────────────── */}
      <section
        id="results"
        className="py-24 px-4 sm:px-6 border-t border-white/[0.06]"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(37,99,235,0.05) 0%, transparent 70%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-500 mb-3">What brands achieve</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5">
              Results that show up in your numbers
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              1,000 plus leading brands use AdNexus to reach their peak potential and be unstoppable in every market they choose.
            </p>
            <a href="#" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mt-4 transition-colors">
              View all case studies <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                metric: '3.2x',
                label: 'ROAS improvement',
                brand: 'D2C Skincare Brand',
                quote: 'We were spending 40% of our budget on campaigns that had broken conversion tracking. AdNexus found it in the first scan. Fixed in a day.',
                category: 'Meta Ads',
              },
              {
                metric: '62%',
                label: 'reduction in wasted spend',
                brand: 'Fashion E-commerce Brand',
                quote: 'The keyword cannibalization check alone saved us over a lakh per month. We had no idea our own campaigns were competing with each other.',
                category: 'Google Ads',
              },
              {
                metric: '41%',
                label: 'ACOS improvement in 30 days',
                brand: 'Health Supplements Brand',
                quote: 'Our Amazon auto campaigns were cannibalizing the manual ones. AdNexus caught it immediately and the fix took 20 minutes.',
                category: 'Amazon Ads',
              },
            ].map(({ metric, label, brand, quote, category }) => (
              <div key={brand} className="p-6 sm:p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] transition-all duration-200">
                <div className="mb-6">
                  <span className="text-xs text-gray-500 font-medium">{category}</span>
                  <div className="text-5xl font-bold text-white mt-2 mb-1">{metric}</div>
                  <div className="text-sm text-gray-400">{label}</div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 italic">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                    {brand.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{brand}</p>
                    <p className="text-xs text-gray-600">AdNexus Growth Plan</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrate Seamlessly ────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-500 mb-3">Integrates seamlessly</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">
            Connect all your ad data in one place
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto mb-12">
            AdNexus connects to your ad platforms directly. No middleware, no manual exports. Your data stays fresh and your team stays informed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {[
              { name: 'Meta Ads', letter: 'M', color: 'from-blue-600 to-blue-700' },
              { name: 'Google Ads', letter: 'G', color: 'from-green-600 to-green-700' },
              { name: 'Amazon Ads', letter: 'A', color: 'from-orange-500 to-orange-600' },
              { name: 'Supabase', letter: 'S', color: 'from-gray-600 to-gray-700' },
              { name: 'Razorpay', letter: 'R', color: 'from-indigo-600 to-indigo-700' },
              { name: 'Resend', letter: 'E', color: 'from-slate-600 to-slate-700' },
            ].map(({ name, letter, color }) => (
              <div key={name} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm`}>
                  {letter}
                </div>
                <span className="text-sm font-medium text-gray-300">{name}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { value: '2 min', label: 'to connect your first account' },
              { value: 'Daily', label: 'automated sync and diagnostics' },
              { value: '100%', label: 'OAuth, no credentials stored' },
            ].map(({ value, label }) => (
              <div key={label} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <p className="text-2xl font-bold text-white mb-1">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-500 mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              Simple pricing, serious results
            </h2>
            <p className="text-gray-400 text-lg">Start for free. Upgrade when your team needs more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Starter */}
            <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-col">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">Starter</p>
                <p className="text-5xl font-bold text-white mb-1">Free</p>
                <p className="text-sm text-gray-500">Forever, no card needed</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['1 ad platform', '10 issues visible at a time', '5 AI recommendations per month', 'Manual sync on demand'].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full py-3 text-sm font-semibold text-center border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl transition-colors">
                Get started free
              </Link>
            </div>

            {/* Growth */}
            <div
              className="relative p-6 sm:p-8 rounded-2xl flex flex-col"
              style={{ background: 'linear-gradient(145deg, rgba(37,99,235,0.18), rgba(37,99,235,0.06))', border: '1px solid rgba(59,130,246,0.4)', boxShadow: '0 0 50px rgba(37,99,235,0.14)' }}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-600/30 whitespace-nowrap">MOST POPULAR</span>
              </div>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-3">Growth</p>
                <p className="text-5xl font-bold text-white mb-1">&#8377;2,999</p>
                <p className="text-sm text-gray-400">per month, billed monthly</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['All 3 platforms', 'Unlimited issues', 'Unlimited AI recommendations', 'Email alerts for critical issues', 'PDF audit reports', 'Auto-sync every 24 hours', '90 days of data history'].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=growth" className="block w-full py-3 text-sm font-bold text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-lg shadow-blue-600/25">
                Start Growth plan
              </Link>
            </div>

            {/* Agency */}
            <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-col">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">Agency</p>
                <p className="text-5xl font-bold text-white mb-1">&#8377;9,999</p>
                <p className="text-sm text-gray-500">per month, billed monthly</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Everything in Growth', 'Up to 25 brand accounts', 'White-label PDF reports', 'Priority support via WhatsApp', 'API access (coming soon)', 'Client portal (coming soon)'].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=agency" className="block w-full py-3 text-sm font-semibold text-center bg-white/[0.07] hover:bg-white/[0.12] text-white rounded-xl transition-colors">
                Start Agency plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Resources ───────────────────────────────────────────── */}
      <section id="resources" className="py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-500 mb-3">Explore resources</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Learn from the best</h2>
            </div>
            <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
              View all resources <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                tag: 'Guide',
                title: 'How to diagnose Meta ad fatigue before it kills your ROAS',
                read: '8 min read',
                color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              },
              {
                tag: 'Case Study',
                title: 'How a D2C skincare brand recovered 3.2x ROAS in 30 days',
                read: '5 min read',
                color: 'bg-green-500/10 text-green-400 border-green-500/20',
              },
              {
                tag: 'Playbook',
                title: 'The 10 Amazon Ads mistakes that cost brands crores every year',
                read: '12 min read',
                color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              },
            ].map(({ tag, title, read, color }) => (
              <div key={title} className="group p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200 cursor-pointer">
                <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md border ${color} mb-4`}>{tag}</span>
                <h3 className="text-sm sm:text-base font-semibold text-white leading-snug mb-4 group-hover:text-blue-300 transition-colors">{title}</h3>
                <p className="text-xs text-gray-600">{read}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div
          className="max-w-4xl mx-auto text-center py-16 sm:py-24 px-6 sm:px-12 rounded-3xl border border-white/[0.07] relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, rgba(37,99,235,0.14) 0%, rgba(124,58,237,0.1) 100%)' }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="relative">
            <p className="text-sm font-semibold text-blue-400 mb-4">Get started today</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5">
              Be unstoppable with AdNexus
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
              You have tried the rest. Now try the only platform built specifically to keep Indian D2C ad accounts healthy and performing at their peak.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 text-base shadow-2xl hover:-translate-y-0.5">
                Start for free today
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium rounded-xl text-base transition-all duration-200">
                Sign in to your account
              </Link>
            </div>
            <p className="text-xs text-gray-600 mt-6">No credit card. Free plan available. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white">AdNexus</span>
              </Link>
              <p className="text-xs text-gray-500 leading-relaxed">AI-powered ad account diagnostics for Indian D2C brands and performance marketing agencies.</p>
            </div>

            {[
              {
                title: 'Platform',
                links: [
                  { label: 'Meta Ads', href: '#platform' },
                  { label: 'Google Ads', href: '#platform' },
                  { label: 'Amazon Ads', href: '#platform' },
                  { label: 'AI Diagnostics', href: '#features' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'Resources', href: '#resources' },
                  { label: 'Case studies', href: '#results' },
                ],
              },
              {
                title: 'Account',
                links: [
                  { label: 'Sign up free', href: '/signup' },
                  { label: 'Sign in', href: '/login' },
                  { label: 'Growth plan', href: '/signup?plan=growth' },
                  { label: 'Agency plan', href: '/signup?plan=agency' },
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-4">{title}</p>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">2026 AdNexus. Built for Indian D2C brands and agencies.</p>
            <p className="text-xs text-gray-700">Powered by Claude AI</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

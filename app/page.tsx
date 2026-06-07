'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Zap, AlertTriangle, Lightbulb, TrendingUp, CheckCircle2,
  ArrowRight, Shield, Clock, Menu, X, Activity,
  Target, Bell, FileText, ChevronRight, Sparkles,
} from 'lucide-react'

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'Connect in 2 minutes',
    description: 'One-click OAuth for Meta, Google, and Amazon Ads. No API keys, no CSV exports, no manual setup.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: AlertTriangle,
    title: '30+ diagnostic checks',
    description: 'Creative fatigue, zero-conversion campaigns, broken tracking, bid strategy errors — detected automatically every 24 hours.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Lightbulb,
    title: 'AI action plans',
    description: 'Every issue ships with a plain-English fix written by Claude — the world\'s most advanced marketing AI.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Revenue impact ranking',
    description: 'Issues are ranked by how much money they\'re costing you per month. Fix the most valuable thing first.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: Activity,
    title: 'Platform health score',
    description: 'A single 0–100 score per platform tells you exactly how healthy each ad account is at a glance.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Bell,
    title: 'Instant email alerts',
    description: 'Get notified the moment a critical issue is detected — before it burns through your daily budget.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
]

const PLATFORMS = [
  {
    name: 'Meta Ads',
    letter: 'M',
    color: 'from-blue-600 to-blue-700',
    checks: [
      'Creative fatigue detection',
      'Audience overlap analysis',
      'Frequency cap violations',
      'Pixel event tracking gaps',
      'Budget allocation issues',
      'Underperforming ad sets',
    ],
  },
  {
    name: 'Google Ads',
    letter: 'G',
    color: 'from-green-600 to-green-700',
    checks: [
      'Quality score monitoring',
      'Impression share lost to budget',
      'Keyword cannibalization',
      'Conversion tracking breaks',
      'Zero-conversion keywords',
      'Broad match overuse',
    ],
  },
  {
    name: 'Amazon Ads',
    letter: 'A',
    color: 'from-orange-500 to-orange-600',
    checks: [
      'High ACOS campaigns',
      'Missing branded keywords',
      'Spend concentration risk',
      'Auto vs manual overlap',
      'Zero-conversion ASINs',
      'Bid adjustment issues',
    ],
  },
]

const STEPS = [
  {
    number: '01',
    icon: Zap,
    title: 'Connect your ad accounts',
    description: 'Authorize AdNexus with one click via OAuth. We never store your credentials — only the metrics we need to diagnose issues.',
  },
  {
    number: '02',
    icon: Target,
    title: 'Get instant diagnostics',
    description: 'AdNexus runs 30+ checks across all your platforms simultaneously. Issues are ranked by revenue impact — highest cost problems first.',
  },
  {
    number: '03',
    icon: Lightbulb,
    title: 'Fix with AI guidance',
    description: 'Every issue ships with a specific, plain-English action plan written by Claude AI. No guesswork, no jargon — just clear steps.',
  },
]

const FREE_FEATURES = ['1 platform', '10 issues visible', '5 AI recommendations/month', 'Manual sync']
const GROWTH_FEATURES = ['All 3 platforms', 'Unlimited issues', 'Unlimited AI recommendations', 'Email alerts', 'PDF audit reports', 'Auto-sync every 24 hours', '90-day data history']
const AGENCY_FEATURES = ['Everything in Growth', 'Up to 25 brand accounts', 'White-label PDF reports', 'Priority support', 'API access (coming soon)', 'Client portal (coming soon)']

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
      style={{
        backgroundColor: '#080808',
        backgroundImage: NOISE_SVG,
      }}
    >
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">AdNexus</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start free →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0C0C0C] border-t border-white/[0.06] px-4 py-4 space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
              <Link href="/login" className="block px-4 py-3 text-sm text-gray-400 hover:text-white text-center" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
              <Link href="/signup" className="block px-4 py-3 text-sm font-semibold bg-white text-black rounded-lg text-center" onClick={() => setMobileOpen(false)}>
                Start free →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 text-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(37,99,235,0.13) 0%, transparent 65%)',
        }}
      >
        {/* Grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-gray-400 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            AI-powered · Real-time · Multi-platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            Your ad accounts are
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              leaking money daily
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AdNexus scans every campaign across Meta, Google, and Amazon Ads —
            diagnoses issues ranked by rupee impact, and hands you an AI-written fix in minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/signup"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-base transition-all duration-200 shadow-xl shadow-blue-600/25 hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              Diagnose my accounts free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium rounded-xl text-base transition-all duration-200 hover:bg-white/[0.04]"
            >
              See how it works
            </Link>
          </div>

          <p className="text-xs text-gray-600">
            Free forever · No credit card · Setup in under 2 minutes
          </p>
        </div>

        {/* Platform logos */}
        <div className="relative max-w-2xl mx-auto mt-16">
          <p className="text-xs uppercase tracking-widest text-gray-600 mb-6 font-medium">
            Supported platforms
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { name: 'Meta Ads', letter: 'M', color: 'from-blue-600 to-blue-700', checks: '10+ checks' },
              { name: 'Google Ads', letter: 'G', color: 'from-green-600 to-green-700', checks: '10+ checks' },
              { name: 'Amazon Ads', letter: 'A', color: 'from-orange-500 to-orange-600', checks: '8+ checks' },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {p.letter}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.checks}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '30+', label: 'Diagnostic checks' },
            { value: '3', label: 'Ad platforms' },
            { value: '₹10L+', label: 'Typical monthly spend covered' },
            { value: '<2 min', label: 'To first insight' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p
                className="text-3xl sm:text-4xl font-bold mb-1"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {value}
              </p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold mb-4">How it works</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              From connected to fixed
              <br />
              <span className="text-gray-500">in three steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ number, icon: Icon, title, description }) => (
              <div
                key={number}
                className="relative p-6 sm:p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
              >
                <div className="flex items-start gap-4 mb-5">
                  <span className="text-4xl font-bold text-white/[0.06] font-mono leading-none">{number}</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section
        id="features"
        className="py-24 px-4 sm:px-6"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(37,99,235,0.05) 0%, transparent 70%)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold mb-4">Features</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              Everything you need to stop
              <br />wasting ad spend
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Built for D2C brands and agencies managing ₹10L+ monthly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200"
              >
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 border border-white/[0.06]`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform deep-dive ─────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold mb-4">Coverage</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Deep checks on every platform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLATFORMS.map(({ name, letter, color, checks }) => (
              <div
                key={name}
                className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold shadow-lg`}>
                    {letter}
                  </div>
                  <span className="font-semibold text-white">{name}</span>
                </div>
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

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="py-24 px-4 sm:px-6 border-t border-white/[0.06]"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(37,99,235,0.07) 0%, transparent 60%)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-400 text-lg">Start free. Upgrade when you need more power.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Free */}
            <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-1">Starter</p>
              <p className="text-4xl font-bold text-white mb-1">₹0</p>
              <p className="text-sm text-gray-500 mb-8">Free forever</p>
              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 text-sm font-semibold text-center border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl transition-colors"
              >
                Get started free
              </Link>
            </div>

            {/* Growth — highlighted */}
            <div
              className="relative p-6 sm:p-8 rounded-2xl"
              style={{
                background: 'linear-gradient(145deg, rgba(37,99,235,0.15), rgba(37,99,235,0.05))',
                border: '1px solid rgba(59,130,246,0.35)',
                boxShadow: '0 0 40px rgba(37,99,235,0.12)',
              }}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-600/30">
                  MOST POPULAR
                </span>
              </div>
              <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-1">Growth</p>
              <p className="text-4xl font-bold text-white mb-1">₹2,999</p>
              <p className="text-sm text-gray-500 mb-8">per month</p>
              <ul className="space-y-3 mb-8">
                {GROWTH_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=growth"
                className="block w-full py-3 text-sm font-bold text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-lg shadow-blue-600/25"
              >
                Start Growth plan
              </Link>
            </div>

            {/* Agency */}
            <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-1">Agency</p>
              <p className="text-4xl font-bold text-white mb-1">₹9,999</p>
              <p className="text-sm text-gray-500 mb-8">per month</p>
              <ul className="space-y-3 mb-8">
                {AGENCY_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=agency"
                className="block w-full py-3 text-sm font-semibold text-center bg-white/[0.07] hover:bg-white/[0.12] text-white rounded-xl transition-colors"
              >
                Start Agency plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div
          className="max-w-3xl mx-auto text-center py-16 px-6 sm:px-12 rounded-3xl border border-white/[0.07]"
          style={{
            background: 'linear-gradient(145deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 100%)',
          }}
        >
          <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-4">Get started today</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Your first diagnosis is free
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
            Connect one ad account and see exactly how much money is being lost — in under 2 minutes.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 text-base shadow-2xl hover:-translate-y-0.5"
          >
            Diagnose my accounts free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-gray-600 mt-5">No credit card · No commitment · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">AdNexus</span>
            </Link>

            <div className="flex items-center gap-6">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Sign in', href: '/login' },
                { label: 'Sign up', href: '/signup' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© 2026 AdNexus. Built for Indian D2C brands & agencies.</p>
            <p className="text-xs text-gray-700">Powered by Claude AI · Meta · Google · Amazon</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Cpu, CheckCircle2, Zap, Activity, Bell, FileText,
  Shield, TrendingUp, ChevronRight, Star, Lock, MessageSquare,
  BarChart3, AlertTriangle, Search, Wand2, Eye, Brain, Sparkles,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

/* ── Constants ──────────────────────────────────── */
const AI_FIX_TEXT = 'Pause the 3 fatigued creatives in Ad Set #4. Upload 2 fresh variants with a lifestyle angle. Set frequency cap to 3 per week. Expected ROAS recovery: +0.8x in 7 days.'

const QUESTIONS = [
  'Why did my Meta ROAS drop this week?',
  'Which campaigns are wasting the most budget?',
  'How do I fix keyword cannibalization?',
]

const ANSWERS = [
  'Your Meta ROAS dropped from 3.4x to 2.1x this week. The primary cause is creative fatigue in Ad Set #4 — frequency hit 7.8, and CTR fell 58% over 7 days. Pause the 3 top-spend creatives and upload fresh variants with a lifestyle angle.',
  'Campaigns wasting the most budget: (1) Google Shopping — Broad Match, ₹38K spend, 0 conversions in 14 days. (2) Meta Retargeting — 180-day window, ROAS 0.6x, ₹22K this month. Recommend pausing both immediately.',
  'Keyword cannibalization detected across 4 ad groups in Google Search. "running shoes" and "buy running shoes" are competing — splitting budget and lowering Quality Scores. Consolidate into one ad group and use exact match for the high-intent term.',
]

const TESTIMONIALS = [
  { quote: 'The AI fix for creative fatigue was spot on. We paused the campaigns it flagged, uploaded 2 new creatives, and ROAS recovered from 2.1x to 3.8x in 10 days.', name: 'Priya Sharma', role: 'Head of Growth', brand: 'D2C Skincare Brand', avatar: 'P', stars: 5 },
  { quote: "Adnexusone AI found our broken pixel in the first scan. We'd been burning ₹38K per month for 3 months attributing it to attribution errors. Fixed it in one day.", name: 'Rahul Mehta', role: 'Performance Lead', brand: 'Fashion D2C', avatar: 'R', stars: 5 },
  { quote: 'We manage 14 D2C brands. Adnexusone AI saves us 6+ hours of manual audits every week. The AI explanations are clear enough to share directly with clients.', name: 'Ananya Iyer', role: 'Founder', brand: 'Performance Agency', avatar: 'A', stars: 5 },
  { quote: 'Ask AI is genuinely useful. I asked why our Google CPA spiked last week and it gave me a specific answer pointing to keyword cannibalization — fixed it the same day.', name: 'Vikram Nair', role: 'Head of Marketing', brand: 'D2C Wellness Brand', avatar: 'V', stars: 5 },
  { quote: 'The real-time alert caught our budget exhausting at 2pm. We extended it immediately and saved the peak evening traffic window. That one alert paid for the entire subscription.', name: 'Neha Joshi', role: 'Growth Manager', brand: 'Baby Products D2C', avatar: 'N', stars: 5 },
  { quote: "We were scaling Google Shopping without realising our broad-match was eating 60% of budget with zero conversions. Adnexusone flagged it on day one. That's ₹55K saved every month.", name: 'Karan Malhotra', role: 'Co-founder', brand: 'D2C Fitness Brand', avatar: 'K', stars: 5 },
  { quote: 'Platform health score went from 58 to 84 in 3 weeks just by acting on Adnexusone AI recommendations. Our Meta ROAS is at a 6-month high.', name: 'Shreya Kapoor', role: 'Performance Marketer', brand: 'Food & Snacks D2C', avatar: 'S', stars: 5 },
  { quote: 'Amazon ACOS was at 38% on auto campaigns. Adnexusone AI identified the exact ASINs bleeding money and suggested negatives. ACOS is down to 19% now.', name: 'Rohan Desai', role: 'Head of E-commerce', brand: 'Home Decor D2C', avatar: 'D', stars: 5 },
  { quote: "The AI-generated audit reports are client-ready. I used to spend 3 hours building these in Google Slides. Now I click export and it's done in 30 seconds.", name: 'Meera Pillai', role: 'Agency Director', brand: 'Performance Marketing Agency', avatar: 'M', stars: 5 },
]

const FEATURES = [
  { icon: <Cpu className="w-4 h-4" />,           iconColor: 'text-blue-400',   iconBg: 'bg-blue-500/10',   title: 'Creative fatigue detection',   desc: 'Frequency and CTR decline signals across ad sets' },
  { icon: <Shield className="w-4 h-4" />,        iconColor: 'text-red-400',    iconBg: 'bg-red-500/10',    title: 'Broken pixel & tracking gaps', desc: 'Validates event firing before you scale' },
  { icon: <Bell className="w-4 h-4" />,          iconColor: 'text-amber-400',  iconBg: 'bg-amber-500/10',  title: 'Frequency cap violations',     desc: 'Detects over-exposure before fatigue sets in' },
  { icon: <Search className="w-4 h-4" />,        iconColor: 'text-green-400',  iconBg: 'bg-green-500/10',  title: 'Keyword cannibalization',      desc: 'Identifies competing ad groups eating each other' },
  { icon: <AlertTriangle className="w-4 h-4" />, iconColor: 'text-orange-400', iconBg: 'bg-orange-500/10', title: 'Zero-conversion campaigns',    desc: 'Spend with no returns, flagged immediately' },
  { icon: <BarChart3 className="w-4 h-4" />,     iconColor: 'text-cyan-400',   iconBg: 'bg-cyan-500/10',   title: 'Budget pacing issues',         desc: 'Over- and under-delivery detected early' },
  { icon: <TrendingUp className="w-4 h-4" />,    iconColor: 'text-orange-400', iconBg: 'bg-orange-500/10', title: 'High ACOS auto campaigns',     desc: 'Inefficient Amazon broad-match spend analysis' },
  { icon: <Eye className="w-4 h-4" />,           iconColor: 'text-purple-400', iconBg: 'bg-purple-500/10', title: 'Audience overlap analysis',    desc: 'Cannibalising audiences across ad sets' },
  { icon: <Wand2 className="w-4 h-4" />,         iconColor: 'text-blue-400',   iconBg: 'bg-blue-500/10',   title: 'ROAS recovery recommendations', desc: 'Step-by-step fixes with estimated recovery' },
  { icon: <Activity className="w-4 h-4" />,      iconColor: 'text-green-400',  iconBg: 'bg-green-500/10',  title: 'Platform health scoring',      desc: 'Per-platform score updated every sync' },
  { icon: <BarChart3 className="w-4 h-4" />,     iconColor: 'text-yellow-400', iconBg: 'bg-yellow-500/10', title: 'Competitive bid analysis',     desc: 'Benchmark against category benchmarks' },
  { icon: <Brain className="w-4 h-4" />,         iconColor: 'text-purple-400', iconBg: 'bg-purple-500/10', title: 'AI-written fix instructions',  desc: 'Claude writes every action plan, not templates' },
]

const DISCOVER_CARDS = [
  { icon: <Zap className="w-4 h-4 text-blue-400" />,    iconBg: 'bg-blue-500/10',   border: 'hover:border-blue-500/30',   title: 'Platform Overview',       desc: 'The complete ad health OS. See everything Adnexusone does in one place.',  href: '/platform',          cta: 'Explore', ctaColor: 'text-blue-400' },
  { icon: <Bell className="w-4 h-4 text-amber-400" />,  iconBg: 'bg-amber-500/10',  border: 'hover:border-amber-500/30',  title: 'Real-time Alerts',        desc: 'Set thresholds. Get notified instantly. Never miss a critical issue.',  href: '/platform#alerts',   cta: 'Explore', ctaColor: 'text-amber-400' },
  { icon: <FileText className="w-4 h-4 text-green-400" />, iconBg: 'bg-green-500/10', border: 'hover:border-green-500/30', title: 'Audit Reports',          desc: 'One-click white-label reports for your clients and team.',              href: '/platform#reports',  cta: 'Explore', ctaColor: 'text-green-400' },
  { icon: <BarChart3 className="w-4 h-4 text-cyan-400" />, iconBg: 'bg-cyan-500/10',  border: 'hover:border-cyan-500/30',  title: 'Performance Analytics', desc: 'Cross-platform ROAS, CPA, and spend in one unified view.',              href: '/platform#analytics', cta: 'Explore', ctaColor: 'text-cyan-400' },
]

/* ── Scroll-reveal hook ─────────────────────────── */
function useReveal(threshold = 0.07) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return ref
}

/* ── Feature Row ────────────────────────────────── */
function FeatureRow({
  id, tag, tagColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  headline, body, bullets, cta, ctaHref = '/signup', reverse = false,
  visual, accentColor = 'rgba(59,130,246,0.07)',
}: {
  id?: string; tag: string; tagColor?: string; headline: React.ReactNode; body: string
  bullets?: { icon: React.ReactNode; text: string }[]; cta: string; ctaHref?: string
  reverse?: boolean; visual: React.ReactNode; accentColor?: string
}) {
  const ref = useReveal()
  return (
    <section id={id} className="py-20 sm:py-28 px-5 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at ${reverse ? '75%' : '25%'} 50%, ${accentColor} 0%, transparent 70%)` }} />
      <div ref={ref} className="reveal max-w-6xl mx-auto">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? 'lg:[direction:rtl]' : ''}`}>
          <div className={reverse ? '[direction:ltr]' : ''}>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-5 ${tagColor}`}>
              {tag}
            </span>
            <h2 className="text-[1.6rem] sm:text-4xl font-extrabold tracking-tight text-white mb-5 leading-tight">{headline}</h2>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-7">{body}</p>
            {bullets && (
              <ul className="space-y-3 mb-8">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5">{b.icon}</span>
                    <span className="text-sm text-gray-300">{b.text}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href={ctaHref} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors group">
              {cta} <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className={`${reverse ? '[direction:ltr]' : ''} stagger-child`}>
            {visual}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Hero Mock ──────────────────────────────────── */
function HeroMock() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (idx >= AI_FIX_TEXT.length) {
      const t = setTimeout(() => setIdx(0), 2200); return () => clearTimeout(t)
    }
    const t = setTimeout(() => setIdx(p => p + 1), 28); return () => clearTimeout(t)
  }, [idx])

  return (
    <div className="relative w-full" style={{ minHeight: '320px' }}>
      {/* Main AI fix card */}
      <div className="animate-float bg-zinc-950 border border-purple-500/25 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5 text-purple-300" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wide text-white">AI Fix Generator</span>
          <span className="ml-auto text-[9px] font-bold px-2 py-0.5 bg-purple-500/15 text-purple-300 rounded-full border border-purple-500/20">Powered by Claude</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-bold px-2 py-0.5 bg-red-500/12 text-red-400 rounded-full border border-red-500/20 uppercase">Critical</span>
            <span className="text-[9px] text-gray-500 font-mono">Creative Fatigue · Meta Ad Set #4 · ₹42K at risk</span>
          </div>
          <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3 min-h-[90px] text-[10px] text-gray-300 leading-relaxed font-mono">
            <span className="text-purple-400/60 mr-1">›</span>
            {AI_FIX_TEXT.slice(0, idx)}
            <span className="type-cursor" />
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 py-2 text-xs font-semibold text-white bg-purple-600/80 hover:bg-purple-600 rounded-lg transition-colors">Apply Fix</button>
            <button className="px-3 py-2 text-xs text-gray-400 border border-white/[0.08] rounded-lg hover:bg-white/[0.05] transition-colors">Dismiss</button>
          </div>
        </div>
      </div>

      {/* Platform health card — bottom left */}
      <div className="animate-float-delay absolute -bottom-4 -left-4 w-52 bg-zinc-950/95 border border-white/[0.08] rounded-xl shadow-xl shadow-black/60 p-3">
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Platform Health</p>
        {[
          { label: 'Meta', score: 64, color: '#f59e0b' },
          { label: 'Google', score: 58, color: '#ef4444' },
          { label: 'Amazon', score: 71, color: '#22c55e' },
        ].map(p => (
          <div key={p.label} className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] text-gray-500 w-11 shrink-0">{p.label}</span>
            <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.score}%`, background: p.color }} />
            </div>
            <span className="text-[9px] font-mono font-bold w-5 text-right" style={{ color: p.color }}>{p.score}</span>
          </div>
        ))}
      </div>

      {/* Issues summary card — middle left */}
      <div className="animate-float-slow absolute top-1/2 -translate-y-1/2 -left-8 w-44 bg-zinc-950/95 border border-white/[0.08] rounded-xl shadow-xl shadow-black/60 p-3 hidden lg:block">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400" /></span>
          <p className="text-[9px] font-bold text-red-400">10 issues found</p>
        </div>
        <p className="text-base font-black text-white font-mono">₹2.53L</p>
        <p className="text-[9px] text-gray-600 mt-0.5">at risk / month</p>
      </div>
    </div>
  )
}

/* ── AI Fix Mock ────────────────────────────────── */
function AIFixMock() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (idx >= AI_FIX_TEXT.length) {
      const t = setTimeout(() => setIdx(0), 2200); return () => clearTimeout(t)
    }
    const t = setTimeout(() => setIdx(p => p + 1), 30); return () => clearTimeout(t)
  }, [idx])
  return (
    <div className="bg-zinc-950 border border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center">
          <Cpu className="w-3.5 h-3.5 text-purple-300" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wide text-white">AI Fix Generator</span>
        <span className="ml-auto text-[9px] font-bold px-2 py-0.5 bg-purple-500/15 text-purple-300 rounded-full border border-purple-500/20">Powered by Claude</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-bold px-2 py-0.5 bg-red-500/12 text-red-400 rounded-full border border-red-500/20 uppercase">Critical</span>
          <span className="text-[9px] text-gray-500 font-mono">₹42K / month at risk</span>
        </div>
        <p className="text-[11px] font-semibold text-white mb-1">Creative Fatigue</p>
        <p className="text-[10px] text-gray-500 mb-3">Meta Ad Set #4 · Frequency 7.8</p>
        <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3 min-h-[100px] text-[10px] text-gray-300 leading-relaxed font-mono">
          <span className="text-purple-400/60 mr-1">›</span>
          {AI_FIX_TEXT.slice(0, idx)}
          <span className="type-cursor" />
        </div>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 py-2 text-xs font-semibold text-white bg-purple-600/80 hover:bg-purple-600 rounded-lg transition-colors">Apply Fix</button>
          <button className="px-3 py-2 text-xs text-gray-400 border border-white/[0.08] rounded-lg hover:bg-white/[0.05] transition-colors">Dismiss</button>
        </div>
      </div>
    </div>
  )
}

/* ── Diagnostic Mock ────────────────────────────── */
function DiagnosticMock() {
  const [step, setStep] = useState(0)
  const items = [
    { text: 'Creative fatigue — Ad Set #4',  val: '₹42K', c: 'text-red-400',    bg: 'bg-red-500/12',    dot: 'bg-red-400' },
    { text: 'Broken pixel tracking',          val: '₹38K', c: 'text-red-400',    bg: 'bg-red-500/12',    dot: 'bg-red-400' },
    { text: 'Frequency cap exceeded',         val: '₹21K', c: 'text-amber-400',  bg: 'bg-amber-500/12',  dot: 'bg-amber-400' },
    { text: 'Keyword cannibalization',        val: '₹18K', c: 'text-amber-400',  bg: 'bg-amber-500/12',  dot: 'bg-amber-400' },
    { text: 'High ACOS — Auto campaigns',     val: '₹12K', c: 'text-yellow-500', bg: 'bg-yellow-500/12', dot: 'bg-yellow-500' },
  ]
  useEffect(() => {
    const t = setInterval(() => setStep(p => (p + 1) % items.length), 1500)
    return () => clearInterval(t)
  }, [items.length])
  return (
    <div className="bg-zinc-950 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-white">Diagnostic Engine</span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 uppercase tracking-widest">Scanning</span>
      </div>
      <div className="p-3 space-y-1">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-500 border ${i === step ? 'border-white/[0.07] bg-white/[0.05]' : 'border-transparent opacity-40'}`}>
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i <= step ? item.dot : 'bg-white/15'}`} />
            <p className="text-[11px] text-gray-300 flex-1 truncate">{item.text}</p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold font-mono ${item.bg} ${item.c} transition-opacity ${i <= step ? 'opacity-100' : 'opacity-0'}`}>{item.val}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between">
        <div>
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-mono mb-1">Total revenue at risk</p>
          <p className="text-lg font-black text-white font-mono">₹1.31L / mo</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-mono mb-1">Health score</p>
          <p className="text-lg font-black text-amber-400 font-mono">64 / 100</p>
        </div>
      </div>
    </div>
  )
}

/* ── Ask AI Mock ────────────────────────────────── */
function AskAIMock() {
  const [qIdx, setQIdx] = useState(0)
  const [ansIdx, setAnsIdx] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'done' | 'pause'>('typing')

  useEffect(() => {
    if (phase === 'typing') {
      const answer = ANSWERS[qIdx]
      if (ansIdx >= answer.length) {
        setPhase('done')
        return
      }
      const t = setTimeout(() => setAnsIdx(p => p + 1), 18)
      return () => clearTimeout(t)
    }
    if (phase === 'done') {
      const t = setTimeout(() => setPhase('pause'), 1800)
      return () => clearTimeout(t)
    }
    if (phase === 'pause') {
      const t = setTimeout(() => {
        setQIdx(p => (p + 1) % QUESTIONS.length)
        setAnsIdx(0)
        setPhase('typing')
      }, 400)
      return () => clearTimeout(t)
    }
  }, [phase, ansIdx, qIdx])

  return (
    <div className="bg-zinc-950 border border-blue-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/20 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-blue-300" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wide text-white">Ask AI</span>
        <span className="ml-auto text-[9px] font-bold px-2 py-0.5 bg-blue-500/15 text-blue-300 rounded-full border border-blue-500/20">Powered by Claude</span>
      </div>
      <div className="p-4 space-y-3 min-h-[200px]">
        {/* User question bubble */}
        <div className="flex justify-end">
          <div className="max-w-[80%] bg-blue-600/20 border border-blue-500/20 rounded-2xl rounded-tr-sm px-3 py-2">
            <p className="text-[11px] text-blue-200 leading-relaxed">{QUESTIONS[qIdx]}</p>
          </div>
        </div>
        {/* AI response bubble */}
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-purple-300" />
          </div>
          <div className="flex-1 bg-white/[0.03] border border-purple-500/15 rounded-2xl rounded-tl-sm px-3 py-2">
            <p className="text-[10px] text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">
              {ANSWERS[qIdx].slice(0, ansIdx)}
              {phase === 'typing' && <span className="type-cursor" />}
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-white/[0.05] flex items-center gap-2">
        <div className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
          <p className="text-[10px] text-gray-600">Ask anything about your campaigns…</p>
        </div>
        <button className="w-8 h-8 rounded-xl bg-blue-600/80 flex items-center justify-center shrink-0">
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  )
}

/* ── Check icon shortcuts ───────────────────────── */
const CHECKB = <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
const CHECKP = <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
const CHECKC = <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />

/* ── Page ───────────────────────────────────────── */
export default function AIPage() {
  const heroRef    = useReveal()
  const pillarsRef = useReveal()
  const caseRef    = useReveal()
  const monitorRef = useReveal()
  const featRef    = useReveal()
  const trustRef   = useReveal()
  const discoverRef= useReveal()
  const tRef       = useReveal()

  const [activeT, setActiveT] = useState(0)
  const tDesktopRef = useRef<HTMLDivElement>(null)
  const tMobileRef  = useRef<HTMLDivElement>(null)
  const skipTSync   = useRef(false)

  // 9 testimonials → 3 desktop pages of 3
  const T_PAGES = Math.ceil(TESTIMONIALS.length / 3)

  useEffect(() => {
    const t = setInterval(() => setActiveT(p => (p + 1) % TESTIMONIALS.length), 3800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    skipTSync.current = true
    const desktop = tDesktopRef.current
    if (desktop) desktop.scrollTo({ left: Math.floor(activeT / 3) * desktop.clientWidth, behavior: 'smooth' })
    const mobile = tMobileRef.current
    if (mobile) mobile.scrollTo({ left: activeT * mobile.clientWidth, behavior: 'smooth' })
    const t = setTimeout(() => { skipTSync.current = false }, 600)
    return () => clearTimeout(t)
  }, [activeT])

  const onDesktopScroll = () => {
    if (skipTSync.current) return
    const el = tDesktopRef.current; if (!el) return
    const page = Math.round(el.scrollLeft / el.clientWidth)
    const idx = page * 3
    if (idx !== activeT) setActiveT(idx)
  }

  const onMobileScroll = () => {
    if (skipTSync.current) return
    const el = tMobileRef.current; if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    if (idx !== activeT) setActiveT(idx)
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#070810' }}>
      <LandingNav />

      {/* ── 1. Hero ──────────────────────────────── */}
      <section className="relative pt-40 pb-24 px-5 sm:px-6 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139,92,246,0.14) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

        <div ref={heroRef} className="reveal max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* Left: text */}
            <div>
              {/* Tag pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/25 bg-purple-500/[0.08] text-[10px] font-bold text-purple-300 mb-7 stagger-child uppercase tracking-widest">
                <Cpu className="w-3 h-3" /> AI Engine · Powered by Claude
              </div>

              <h1 className="text-[2rem] sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.1] mb-7 stagger-child">
                The AI that fixes your ads<br />
                <span className="text-gradient animate-gradient">before you notice the problem</span>
              </h1>

              <p className="text-gray-400 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed stagger-child">
                Adnexusone AI monitors Meta, Google, and Amazon 24/7. It surfaces issues ranked by rupee impact and writes the exact fix your team needs — powered by Claude.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 stagger-child">
                <Link href="/signup" className="btn-blue flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all">
                  Start free scan <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#how-it-works" className="flex items-center gap-2 px-7 py-3.5 border border-white/[0.12] text-gray-300 hover:text-white hover:border-white/[0.22] rounded-xl text-sm font-medium transition-all">
                  See how it works <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust bar */}
              <div className="mt-12 pt-8 border-t border-white/[0.06] stagger-child">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-4 font-bold">Trusted by D2C brands across India</p>
                <div className="flex flex-wrap items-center gap-5">
                  {['Myntra', 'Nykaa', 'Mamaearth', 'Boat', 'Sugar', 'Lenskart', 'Classplus', 'Wakefit'].map(b => (
                    <span key={b} className="text-xs font-bold text-gray-600 hover:text-gray-400 transition-colors tracking-wide">{b}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: floating mock cards */}
            <div className="stagger-child relative">
              <HeroMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Three-pillar strip ─────────────────── */}
      <section id="how-it-works" className="py-16 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.8)' }}>
        <div ref={pillarsRef} className="reveal max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
            {[
              {
                icon: <Eye className="w-5 h-5 text-cyan-400" />,
                iconBg: 'bg-cyan-500/10',
                label: 'Detect',
                stat: '30 checks per sync',
                desc: 'Creative fatigue, broken pixels, zero-conversion spend — caught automatically across Meta, Google, Amazon',
              },
              {
                icon: <BarChart3 className="w-5 h-5 text-blue-400" />,
                iconBg: 'bg-blue-500/10',
                label: 'Diagnose',
                stat: 'Ranked by rupee impact',
                desc: 'Every issue comes with an estimated monthly cost based on your actual spend and performance data',
              },
              {
                icon: <Wand2 className="w-5 h-5 text-purple-400" />,
                iconBg: 'bg-purple-500/10',
                label: 'Fix',
                stat: 'Claude writes the action plan',
                desc: 'Step-by-step fix instructions. Expected ROAS recovery. Ready to share with your media buyer or apply directly.',
              },
            ].map((p, i) => (
              <div key={i} className="px-8 py-8 stagger-child">
                <div className={`w-10 h-10 rounded-xl ${p.iconBg} flex items-center justify-center mb-4`}>{p.icon}</div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{p.label}</p>
                <p className="text-base font-bold text-white mb-2">{p.stat}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. AI Fix Generator (visual LEFT, text RIGHT) */}
      <FeatureRow
        id="ai-fix"
        tag="AI Fix Generator"
        tagColor="text-purple-400 bg-purple-500/10 border-purple-500/20"
        accentColor="rgba(139,92,246,0.08)"
        headline={<>Claude explains the problem<br />and writes the fix</>}
        body="Every issue Adnexusone detects comes with a Claude-written action plan. Not 'your frequency is high' — but 'pause these 3 creatives, upload 2 fresh variants with a different angle, set cap to 3/week.' Specific. Actionable."
        bullets={[
          { icon: CHECKP, text: 'Step-by-step fix instructions for every detected issue' },
          { icon: CHECKP, text: 'Expected outcome: ROAS recovery, budget savings in rupees' },
          { icon: CHECKP, text: 'Context-aware — uses your account history and campaign patterns' },
          { icon: CHECKP, text: 'Share directly with your team or apply in one click' },
        ]}
        cta="Try AI Fix Generator free"
        ctaHref="/signup"
        visual={<AIFixMock />}
      />

      {/* ── 4. Case Study callout ─────────────────── */}
      <section className="py-20 px-5 sm:px-6">
        <div ref={caseRef} className="reveal max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-blue-500/20 overflow-hidden">
            {/* gradient border glow */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(139,92,246,0.05) 100%)' }} />
            {/* grid overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="relative grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
              {/* Left: metrics */}
              <div className="p-8 stagger-child">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-6">Before → After</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'ROAS', before: '1.8x', after: '3.2x', up: true },
                    { label: 'Revenue', before: '₹2.1L/mo', after: '₹5.9L/mo', up: true },
                  ].map(m => (
                    <div key={m.label}>
                      <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">{m.label}</p>
                      <p className="text-sm text-gray-500 font-mono line-through mb-0.5">{m.before}</p>
                      <p className="text-2xl font-black text-white font-mono">{m.after}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 py-2 px-3 bg-white/[0.03] border border-white/[0.06] rounded-xl inline-flex w-fit">
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Issue:</span>
                  <span className="text-[9px] text-gray-400">Broken pixel</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Fix time:</span>
                  <span className="text-[9px] text-gray-400">1 day</span>
                </div>
              </div>

              {/* Right: quote */}
              <div className="p-8 stagger-child">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">D2C Skincare Brand · Meta Ads</p>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-6">
                  "Adnexusone AI found a broken pixel that was costing us ₹38,000 every month. It flagged it in the very first scan. Fixed in one day — ROAS went from 1.8x to 3.2x."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-white/[0.12] flex items-center justify-center text-sm font-bold text-blue-300">H</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Head of Growth</p>
                    <p className="text-[10px] text-gray-500">D2C Skincare</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href="/customers" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors font-semibold">
              Read more case studies <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Diagnostic Intelligence (visual RIGHT, text LEFT) */}
      <FeatureRow
        id="diagnostics"
        tag="Diagnostic Intelligence"
        tagColor="text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
        accentColor="rgba(6,182,212,0.07)"
        headline={<>30 checks. Every sync.<br />Zero effort.</>}
        body="Adnexusone runs 30 platform-specific diagnostic checks every time you sync — automatically. Creative fatigue, broken tracking, keyword cannibalization, zero-conversion spend, high ACOS — all caught, ranked, and ready to act on."
        bullets={[
          { icon: CHECKC, text: 'Creative fatigue detection with frequency and CTR decline signals' },
          { icon: CHECKC, text: 'Pixel tracking validation before you scale spend' },
          { icon: CHECKC, text: 'Budget pacing and allocation inefficiencies across campaigns' },
          { icon: CHECKC, text: 'Platform-specific logic: 10 checks each for Meta, Google, Amazon' },
        ]}
        cta="See all 30 diagnostic checks"
        ctaHref="/platform#diagnostic"
        reverse
        visual={<DiagnosticMock />}
      />

      {/* ── 6. Ask AI (visual LEFT, text RIGHT) ─── */}
      <FeatureRow
        id="ask-ai"
        tag="Ask AI"
        tagColor="text-blue-400 bg-blue-500/10 border-blue-500/20"
        accentColor="rgba(59,130,246,0.07)"
        headline={<>Ask anything about<br />your campaigns</>}
        body="Not sure why ROAS dropped? Ask Adnexusone AI. Want to know which campaigns to cut before weekend? Ask. The AI has full context of your account history — answers are specific to your data, not generic advice."
        bullets={[
          { icon: CHECKB, text: 'Natural language questions about any metric or platform' },
          { icon: CHECKB, text: 'Answers grounded in your actual campaign data' },
          { icon: CHECKB, text: 'Follow-up questions supported in the same thread' },
          { icon: CHECKB, text: 'Available 24/7 — no analyst required' },
        ]}
        cta="Try Ask AI free"
        ctaHref="/signup"
        visual={<AskAIMock />}
      />

      {/* ── 7. 24/7 Monitoring ───────────────────── */}
      <section className="py-20 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.6)' }}>
        <div ref={monitorRef} className="reveal max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 stagger-child">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/[0.08] text-[10px] font-bold text-amber-300 mb-5 uppercase tracking-widest">
              <Activity className="w-3 h-3" /> Real-time Monitoring
            </div>
            <h2 className="text-[1.6rem] sm:text-4xl font-extrabold tracking-tight mb-4">
              Your campaigns never stop running.<br className="hidden sm:block" /> Neither does Adnexusone AI.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              Set thresholds for any metric. Adnexusone AI fires an alert the moment something crosses them — before it compounds into a bigger problem.
            </p>
          </div>

          {/* Alert type cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-child mb-10">
            {[
              {
                color: 'red',
                icon: <TrendingUp className="w-4 h-4 text-red-400" />,
                bg: 'bg-red-500/10', border: 'border-red-500/20',
                title: 'ROAS Drop',
                desc: 'ROAS dropped below your 2x threshold on Meta · 14 mins ago',
              },
              {
                color: 'orange',
                icon: <Zap className="w-4 h-4 text-orange-400" />,
                bg: 'bg-orange-500/10', border: 'border-orange-500/20',
                title: 'Budget Exhausted',
                desc: 'Daily budget exhausted at 2pm — 10 hours early on Google Shopping',
              },
              {
                color: 'amber',
                icon: <Bell className="w-4 h-4 text-amber-400" />,
                bg: 'bg-amber-500/10', border: 'border-amber-500/20',
                title: 'Creative Fatigue',
                desc: 'Ad Set #4 frequency hit 7.8. CTR dropped 62% in 7 days.',
              },
              {
                color: 'red',
                icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
                bg: 'bg-red-500/10', border: 'border-red-500/20',
                title: 'Pixel Break',
                desc: 'Purchase event firing 0 times in last 6 hours. Tracking broken.',
              },
            ].map((card, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${card.border} bg-zinc-950/80`}>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>{card.icon}</div>
                <p className="text-sm font-semibold text-white mb-1.5">{card.title}</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center stagger-child">
            <Link href="/platform#alerts" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors group">
              Configure your first alert <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. Feature checklist grid ────────────── */}
      <section id="features" className="py-24 px-5 sm:px-6">
        <div ref={featRef} className="reveal max-w-6xl mx-auto">
          <div className="text-center mb-14 stagger-child">
            <h2 className="text-[1.6rem] sm:text-4xl font-extrabold tracking-tight mb-4">Everything Adnexusone AI can do</h2>
            <p className="text-gray-400 max-w-xl mx-auto">30 checks across 3 platforms, powered by Claude. Here's the full list.</p>
          </div>
          {/* Desktop grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-child">
            {FEATURES.map((f, i) => (
              <div key={i} className="group bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.14] hover:bg-white/[0.03] transition-all">
                <div className={`w-9 h-9 rounded-xl ${f.iconBg} ${f.iconColor} flex items-center justify-center mb-3`}>{f.icon}</div>
                <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{f.desc}</p>
                <Link href="/platform" className="text-[10px] font-semibold text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-1 group/link">
                  Learn more <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
          {/* Mobile carousel */}
          <div className="sm:hidden stagger-child">
            <div
              className="flex overflow-x-auto scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              {FEATURES.map((f, i) => (
                <div key={i} className="flex-shrink-0 w-full" style={{ scrollSnapAlign: 'start' }}>
                  <div className="bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-5 mx-0.5">
                    <div className={`w-9 h-9 rounded-xl ${f.iconBg} ${f.iconColor} flex items-center justify-center mb-3`}>{f.icon}</div>
                    <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{f.desc}</p>
                    <Link href="/platform" className="text-[10px] font-semibold text-gray-600 flex items-center gap-1">
                      Learn more <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-gray-600 mt-3 tracking-wide">Swipe to see all 12 checks →</p>
          </div>
        </div>
      </section>

      {/* ── 9. Privacy & Trust strip ─────────────── */}
      <section className="py-16 px-5 sm:px-6 border-t border-white/[0.05]">
        <div ref={trustRef} className="reveal max-w-5xl mx-auto">
          <div className="text-center mb-10 stagger-child">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.10] bg-white/[0.03] text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">
              <Shield className="w-3 h-3" /> Built on trust
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 stagger-child">
            {[
              { icon: <Lock className="w-5 h-5 text-green-400" />,        bg: 'bg-green-500/10',  title: 'OAuth only · No passwords stored' },
              { icon: <Shield className="w-5 h-5 text-blue-400" />,       bg: 'bg-blue-500/10',   title: 'Data encrypted in transit and at rest' },
              { icon: <Cpu className="w-5 h-5 text-purple-400" />,        bg: 'bg-purple-500/10', title: 'Claude processes but never trains on your data' },
              { icon: <CheckCircle2 className="w-5 h-5 text-cyan-400" />, bg: 'bg-cyan-500/10',   title: 'SOC 2 compliant infrastructure' },
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center`}>{t.icon}</div>
                <p className="text-sm text-gray-300 leading-snug">{t.title}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 stagger-child">
            <Link href="/signup" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Start your free scan — no credit card <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 10. Discover more ────────────────────── */}
      <section className="py-20 px-5 sm:px-6" style={{ background: 'rgba(4,5,14,0.5)' }}>
        <div ref={discoverRef} className="reveal max-w-5xl mx-auto">
          <div className="text-center mb-10 stagger-child">
            <h2 className="text-[1.6rem] sm:text-3xl font-extrabold tracking-tight mb-3">Explore more of Adnexusone</h2>
          </div>
          {/* Desktop grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger-child">
            {DISCOVER_CARDS.map((card, i) => (
              <Link key={i} href={card.href} className={`group block bg-zinc-950/60 border border-white/[0.07] ${card.border} rounded-2xl p-5 transition-all hover:bg-white/[0.03]`}>
                <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>{card.icon}</div>
                <p className="text-sm font-semibold text-white mb-1.5">{card.title}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{card.desc}</p>
                <span className={`text-[10px] font-semibold ${card.ctaColor} flex items-center gap-1 group-hover:gap-1.5 transition-all`}>
                  {card.cta} <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
          {/* Mobile carousel */}
          <div className="sm:hidden stagger-child">
            <div
              className="flex overflow-x-auto scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              {DISCOVER_CARDS.map((card, i) => (
                <div key={i} className="flex-shrink-0 w-full" style={{ scrollSnapAlign: 'start' }}>
                  <Link href={card.href} className={`group block bg-zinc-950/60 border border-white/[0.07] rounded-2xl p-5 mx-0.5 transition-all hover:bg-white/[0.03]`}>
                    <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>{card.icon}</div>
                    <p className="text-sm font-semibold text-white mb-1.5">{card.title}</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{card.desc}</p>
                    <span className={`text-[10px] font-semibold ${card.ctaColor} flex items-center gap-1`}>
                      {card.cta} <ChevronRight className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {DISCOVER_CARDS.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. Testimonials ─────────────────────── */}
      <section className="py-24 px-5 sm:px-6">
        <div ref={tRef} className="reveal max-w-6xl mx-auto">
          <div className="text-center mb-14 stagger-child">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-4">Customer stories</p>
            <h2 className="text-[1.6rem] sm:text-4xl font-extrabold tracking-tight">What marketers say about Adnexusone AI</h2>
          </div>

          {/* Desktop carousel — 3 cards per page, 3 pages */}
          <div className="hidden md:block stagger-child">
            <div
              ref={tDesktopRef}
              className="flex overflow-x-auto scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
              onScroll={onDesktopScroll}
            >
              {Array.from({ length: T_PAGES }).map((_, page) => (
                <div key={page} className="flex-shrink-0 w-full grid grid-cols-3 gap-5" style={{ scrollSnapAlign: 'start' }}>
                  {TESTIMONIALS.slice(page * 3, page * 3 + 3).map((t, i) => (
                    <div key={i} className="rounded-2xl p-6 flex flex-col bg-white/[0.04] border border-white/[0.09]">
                      <div className="flex mb-4">
                        {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed flex-1 mb-6">"{t.quote}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-white/[0.12] flex items-center justify-center text-sm font-bold text-purple-300">{t.avatar}</div>
                        <div>
                          <p className="text-sm font-semibold text-white">{t.name}</p>
                          <p className="text-[10px] text-gray-500">{t.role} · {t.brand}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {/* Desktop page dots (3 dots) */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: T_PAGES }).map((_, page) => (
                <button
                  key={page}
                  onClick={() => setActiveT(page * 3)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${Math.floor(activeT / 3) === page ? 'w-6 bg-purple-500' : 'w-1.5 bg-white/20'}`}
                />
              ))}
            </div>
          </div>

          {/* Mobile carousel — 1 card per slide */}
          <div className="md:hidden stagger-child">
            <div
              ref={tMobileRef}
              className="flex overflow-x-auto scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
              onScroll={onMobileScroll}
            >
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="flex-shrink-0 w-full" style={{ scrollSnapAlign: 'start' }}>
                  <div className="bg-white/[0.04] border border-white/[0.09] rounded-2xl p-6 flex flex-col">
                    <div className="flex mb-4">
                      {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-6">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-white/[0.12] flex items-center justify-center text-sm font-bold text-purple-300">{t.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold text-white">{t.name}</p>
                        <p className="text-[10px] text-gray-500">{t.role} · {t.brand}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-5">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setActiveT(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeT ? 'w-6 bg-purple-500' : 'w-1.5 bg-white/20'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. LandingCTA + LandingFooter ───────── */}
      <LandingCTA />
      <LandingFooter />
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Activity, Bell, FileText, Cpu, Shield, TrendingUp, Star, ChevronRight, Zap, BarChart3 } from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'

function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return ref
}

function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = Date.now()
          const tick = () => {
            const progress = Math.min((Date.now() - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])
  return { ref, count }
}

const BRANDS = ['Nykaa', 'Mamaearth', 'boAt', 'WOW Skin', 'Lenskart', 'Bewakoof', 'Clovia', 'mCaffeine', 'Plum', 'The Moms Co', 'Sugar Cosmetics', 'Noise', 'Himalaya', 'Dabur', 'OZiva', 'Marico']

const PLATFORM_CARDS = [
  {
    name: 'Meta Ads', letter: 'M', gradient: 'from-blue-600 to-blue-800', glow: 'rgba(37,99,235,0.15)',
    desc: 'Creative fatigue, audience overlap, pixel issues, budget drain — all detected and ranked by rupee impact.',
    checks: ['Creative fatigue detection', 'Audience overlap analysis', 'Frequency cap violations', 'Pixel event tracking gaps', 'Budget pacing issues', 'Underperforming ad sets'],
  },
  {
    name: 'Google Ads', letter: 'G', gradient: 'from-green-600 to-green-800', glow: 'rgba(22,163,74,0.15)',
    desc: 'Quality scores, impression share, keyword overlap, bid strategy health — all monitored every day.',
    checks: ['Quality score monitoring', 'Impression share lost', 'Keyword cannibalization', 'Conversion tracking breaks', 'Zero-conversion keywords', 'Broad match overuse'],
  },
  {
    name: 'Amazon Ads', letter: 'A', gradient: 'from-orange-500 to-orange-700', glow: 'rgba(249,115,22,0.15)',
    desc: 'ACOS creep, auto vs manual overlap, spend concentration, missing keyword coverage — all caught early.',
    checks: ['High ACOS campaigns', 'Missing branded keywords', 'Spend concentration risk', 'Auto vs manual overlap', 'Zero-conversion ASINs', 'Bid adjustment gaps'],
  },
]

const FEATURE_CARDS = [
  { icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/15', title: 'Connect in under 2 minutes', desc: 'One-click OAuth for Meta, Google, and Amazon Ads. No API keys. No CSV uploads. Your first scan starts immediately.' },
  { icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/15', title: '30 checks run on every sync', desc: 'Creative fatigue, zero-conversion spend, broken tracking, keyword cannibalization, high ACOS — all flagged automatically.' },
  { icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/15', title: 'Health score updated daily', desc: 'One number tells you how healthy each platform is. Share it in standups so the whole team knows where to focus.' },
  { icon: Bell, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/15', title: 'Instant email alerts', desc: 'Critical issues trigger an email the moment they appear — with context and next steps so your team acts before budget burns.' },
  { icon: FileText, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/15', title: 'Audit reports clients will trust', desc: 'One-click PDF reports with health scores, issue breakdowns, and AI recommendations. Ready to send to clients in seconds.' },
  { icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/15', title: 'Rupee impact on every issue', desc: 'Every problem comes with an estimated monthly cost based on your actual spend and performance data. Fix what matters most.' },
]

const CASE_STUDIES = [
  { metric: '3.2x', label: 'ROAS improvement', brand: 'D2C Skincare Brand', platform: 'Meta Ads', quote: 'We were spending 40% of our budget on campaigns with broken conversion tracking. AdNexus found it in the first scan. Fixed in one day.' },
  { metric: '62%', label: 'reduction in wasted spend', brand: 'Fashion E-commerce', platform: 'Google Ads', quote: 'The keyword cannibalization check alone saved us over a lakh per month. We had no idea our own campaigns were competing against each other.' },
  { metric: '41%', label: 'ACOS improvement in 30 days', brand: 'Health Supplements Brand', platform: 'Amazon Ads', quote: 'Our auto campaigns were cannibalizing the manual ones. AdNexus caught it immediately and the fix took 20 minutes.' },
]

const TESTIMONIALS = [
  { role: 'Performance Marketer', company: 'D2C Brand', quote: 'I used to spend 2 hours every Monday doing manual audits. AdNexus does the same thing in 2 minutes and catches issues I used to miss.', avatar: 'P' },
  { role: 'Head of Growth', company: 'E-commerce Brand', quote: 'The revenue impact ranking is what sold me. I now know exactly which problem to fix first and what it costs us every day it sits unfixed.', avatar: 'H' },
  { role: 'Founder', company: 'Performance Agency', quote: 'We manage 18 client accounts. AdNexus lets us catch issues before clients notice them. That has been huge for retention.', avatar: 'F' },
]

const AI_FEATURES = [
  { icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', title: 'Autonomous diagnostics for superior performance', desc: 'AdNexus scans your accounts continuously, surfaces problems the moment they appear, and ranks them by actual rupee cost.' },
  { icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'Put your ad monitoring on autopilot', desc: 'Connect once and let AdNexus run 30 checks every day across every platform. No manual audits. No spreadsheets.' },
  { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', title: 'AI recommendations trained on your data', desc: 'Every fix is powered by Claude AI, cross-referenced with your campaign history to give context-aware, account-specific guidance.' },
]

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const s1 = useReveal()
  const s2 = useReveal()
  const s3 = useReveal()
  const s4 = useReveal()
  const s5 = useReveal()
  const s6 = useReveal()
  const s7 = useReveal()
  const s8 = useReveal()
  const s9 = useReveal()
  const c1 = useCounter(30)
  const c2 = useCounter(3)
  const c3 = useCounter(62)

  useEffect(() => {
    if (heroRef.current) {
      heroRef.current.querySelectorAll('.hero-animate').forEach((el, i) => {
        ;(el as HTMLElement).style.animationDelay = `${i * 0.12}s`
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      <LandingNav />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden pt-10"
        style={{
          background: 'radial-gradient(ellipse 120% 80% at 70% 50%, rgba(20,10,5,0.95) 0%, #080808 60%), radial-gradient(ellipse 60% 80% at 80% 30%, rgba(37,99,235,0.18) 0%, transparent 60%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute top-20 right-[15%] w-80 h-80 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.6) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-20 right-[30%] w-60 h-60 rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full" ref={heroRef}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-gray-400 mb-8 hero-animate animate-fade-up">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                The leading Ad Account Diagnostics Platform
              </div>
              <h1 className="hero-animate animate-fade-up text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                Move from spend to
                <br />
                <span className="text-gradient animate-gradient">unstoppable results</span>
              </h1>
              <p className="hero-animate animate-fade-up text-lg sm:text-xl text-gray-400 max-w-xl leading-relaxed mb-10">
                Stop guessing why your ROAS is dropping. AdNexus runs 30 diagnostic checks across Meta, Google, and Amazon Ads, ranks every problem by rupee impact, and gives your team an AI-written fix in minutes.
              </p>
              <div className="hero-animate animate-fade-up flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center bg-white/[0.05] border border-white/10 rounded-xl overflow-hidden">
                  <input type="email" placeholder="Enter your work email" className="flex-1 px-5 py-3.5 bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-0" />
                  <Link href="/signup" className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors whitespace-nowrap">
                    Get started <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              <p className="hero-animate animate-fade-up text-xs text-gray-600">Free plan available. No credit card required.</p>
            </div>

            {/* Floating product UI */}
            <div className="relative hidden lg:block h-[520px]">
              <div className="animate-float absolute top-0 right-0 w-80 rounded-2xl border border-white/[0.1] overflow-hidden shadow-2xl shadow-black/60" style={{ background: 'rgba(12,12,16,0.95)', backdropFilter: 'blur(20px)' }}>
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">Issues by Impact</p>
                  <span className="text-xs text-red-400 font-medium">12 open</span>
                </div>
                <div className="p-3 space-y-2">
                  {[
                    { tag: 'Critical', issue: 'Creative fatigue — Meta Ad Set #4', val: '₹42K/mo', tagColor: 'bg-red-500/15 text-red-400' },
                    { tag: 'Critical', issue: 'Broken conversion tracking — Google', val: '₹38K/mo', tagColor: 'bg-red-500/15 text-red-400' },
                    { tag: 'High', issue: 'ACOS above target — Amazon Auto', val: '₹21K/mo', tagColor: 'bg-amber-500/15 text-amber-400' },
                    { tag: 'High', issue: 'Quality score below 4 — 11 keywords', val: '₹16K/mo', tagColor: 'bg-amber-500/15 text-amber-400' },
                  ].map(({ tag, issue, val, tagColor }) => (
                    <div key={issue} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${tagColor}`}>{tag}</span>
                      <p className="text-xs text-gray-300 flex-1 leading-snug">{issue}</p>
                      <span className="text-xs font-bold text-red-400 flex-shrink-0">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate-float-delay absolute bottom-12 left-0 w-52 rounded-2xl border border-white/[0.1] p-4 shadow-xl shadow-black/50" style={{ background: 'rgba(12,12,16,0.95)', backdropFilter: 'blur(20px)' }}>
                <p className="text-xs text-gray-500 mb-2">Platform Health</p>
                <div className="space-y-2.5">
                  {[
                    { name: 'Meta', score: 64, color: '#f59e0b' },
                    { name: 'Google', score: 58, color: '#ef4444' },
                    { name: 'Amazon', score: 71, color: '#22c55e' },
                  ].map(({ name, score, color }) => (
                    <div key={name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400">{name}</span>
                        <span className="text-xs font-bold" style={{ color }}>{score}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate-float-slow absolute top-52 left-4 w-60 rounded-2xl border border-blue-500/25 p-4 shadow-xl" style={{ background: 'rgba(12,12,16,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 0 30px rgba(37,99,235,0.12)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-purple-600/20 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <p className="text-xs font-semibold text-white">AI Fix Ready</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">Pause 3 fatigued creatives, upload 2 fresh variants, set frequency cap to 3 per week.</p>
                <button className="mt-3 w-full py-1.5 text-xs font-semibold bg-blue-600/20 text-blue-300 rounded-lg border border-blue-500/20">Apply fix</button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #080808)' }} />
      </section>

      {/* ── Trusted by marquee ───────────────────────────── */}
      <section className="py-10 border-y border-white/[0.05] overflow-hidden">
        <p className="text-center text-xs uppercase tracking-widest text-gray-600 font-medium mb-7">Trusted by D2C brands across India</p>
        <div className="flex">
          <div className="animate-marquee flex gap-12 items-center whitespace-nowrap">
            {[...BRANDS, ...BRANDS].map((brand, i) => (
              <span key={i} className="text-sm font-bold text-gray-700 hover:text-gray-400 transition-colors cursor-default tracking-wide uppercase">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── One platform ─────────────────────────────────── */}
      <section id="platform" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div ref={s1} className="reveal">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-blue-500 mb-3">One platform</p>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5">Every ad channel. Infinite clarity.</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">The most complete diagnostics platform for Meta, Google, and Amazon. Your entire ad health in one dashboard, updated every day.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PLATFORM_CARDS.map(({ name, letter, gradient, glow, desc, checks }) => (
                <div key={name} className="card-hover p-7 rounded-2xl border border-white/[0.07]" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${glow}, transparent), rgba(255,255,255,0.02)` }}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-xl mb-5`}>{letter}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-5">{desc}</p>
                  <ul className="space-y-2">
                    {checks.map((c) => (
                      <li key={c} className="flex items-center gap-2.5 text-sm text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/[0.06]" style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(37,99,235,0.06) 0%, transparent 70%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div ref={c1.ref}>
            <div className="text-4xl font-bold text-white mb-1">{c1.count}+</div>
            <p className="text-sm text-gray-500">Diagnostic checks</p>
          </div>
          <div ref={c2.ref}>
            <div className="text-4xl font-bold text-white mb-1">{c2.count}</div>
            <p className="text-sm text-gray-500">Ad platforms covered</p>
          </div>
          <div ref={c3.ref}>
            <div className="text-4xl font-bold text-white mb-1">{c3.count}%</div>
            <p className="text-sm text-gray-500">Avg wasted spend recovered</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-1">2 min</div>
            <p className="text-sm text-gray-500">Average setup time</p>
          </div>
        </div>
      </section>

      {/* ── Meet AdNexus AI ──────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/[0.06]" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)' }}>
        <div className="max-w-6xl mx-auto">
          <div ref={s2} className="reveal">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="text-sm font-semibold text-purple-400 mb-3">Meet AdNexus AI</p>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">The intelligence that powers every diagnosis</h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-10">Drive faster action across all three platforms with autonomous AI trained on performance marketing data.</p>
                <div className="space-y-6">
                  {AI_FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
                    <div key={title} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl ${bg} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">{title}</p>
                        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl" style={{ background: '#0f1117' }}>
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-purple-600/20 flex items-center justify-center">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <p className="text-sm font-semibold text-white">AI-Generated Fix</p>
                  </div>
                  <span className="px-2 py-0.5 bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-semibold rounded-md">Critical</span>
                </div>
                <div className="p-5">
                  <p className="text-sm font-medium text-white mb-1">Creative fatigue on Meta Ad Set #4</p>
                  <p className="text-xs text-gray-500 mb-4">Estimated impact: ₹42,000 per month</p>
                  <p className="text-sm text-gray-300 leading-relaxed mb-5">Your top-performing ad set has reached creative fatigue. CTR dropped from 3.2% to 1.1% over 7 days while frequency climbed to 4.8. The audience has seen these creatives too many times.</p>
                  <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02] mb-4">
                    <p className="text-xs font-semibold text-white mb-3">What to do right now</p>
                    <ol className="space-y-2">
                      {[
                        'Pause the 3 ads with frequency above 4.5 immediately',
                        'Upload at least 2 fresh creatives with a different visual angle',
                        'Reduce audience size or add exclusions to limit repeat exposure',
                        'Set a frequency cap of 3 per 7 days going forward',
                      ].map((step, i) => (
                        <li key={step} className="flex gap-2.5 text-sm text-gray-400">
                          <span className="text-gray-600 flex-shrink-0 font-mono text-xs mt-0.5">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <button className="w-full py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">Mark as resolved</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Diagnostic breadth ───────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div ref={s3} className="reveal">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-blue-500 mb-3">Unmatched diagnostic breadth</p>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5">For unstoppable ad performance</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">From 5L to 5Cr monthly spend, AdNexus covers every failure mode that costs brands money.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURE_CARDS.map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="card-hover p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 border`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What brands achieve ──────────────────────────── */}
      <section id="results" className="py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div ref={s4} className="reveal">
            <div className="text-center mb-6">
              <p className="text-sm font-semibold text-blue-500 mb-3">What brands achieve</p>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5">Results that show up in the numbers</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto mb-4">1,000 plus D2C brands use AdNexus to reach their peak potential and stay unstoppable.</p>
              <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                View all case studies <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
              {CASE_STUDIES.map(({ metric, label, brand, platform, quote }) => (
                <div key={brand} className="card-hover p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-col">
                  <div className="mb-5">
                    <span className="text-xs text-gray-500 font-medium">{platform}</span>
                    <div className="text-5xl font-bold text-white mt-2 mb-1">{metric}</div>
                    <div className="text-sm text-gray-400">{label}</div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed flex-1 mb-5">"{quote}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-300">{brand.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-medium text-white">{brand}</p>
                      <p className="text-xs text-gray-600">AdNexus Growth Plan</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Loved by brands ──────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/[0.06]" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.04) 0%, transparent 70%)' }}>
        <div className="max-w-5xl mx-auto">
          <div ref={s5} className="reveal">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-blue-500 mb-3">Loved by brands</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Built for the people running ads</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">From solo performance marketers to agencies managing 25 brand accounts, AdNexus fits how you actually work.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map(({ role, company, quote, avatar }) => (
                <div key={role} className="card-hover p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-6">"{quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white">{avatar}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{role}</p>
                      <p className="text-xs text-gray-500">{company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div ref={s6} className="reveal">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-blue-500 mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">From connect to fix in under 10 minutes</h2>
              <p className="text-gray-400 text-base max-w-xl mx-auto">No onboarding call. No setup fee. Connect your ad accounts, get your first diagnostic report, and start fixing issues today.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Connect your ad accounts', desc: 'One-click OAuth for Meta, Google, and Amazon Ads. Takes under 2 minutes. No credentials stored — ever.', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/05' },
                { step: '02', title: 'Get your diagnostic report', desc: 'AdNexus runs 30 checks immediately and scores every account. Every issue is ranked by monthly rupee cost.', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/05' },
                { step: '03', title: 'Apply the AI-written fix', desc: 'Each issue has a clear, account-specific fix written by Claude AI. One click to resolve. Results show in days.', color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/05' },
              ].map(({ step, title, desc, color, border, bg }) => (
                <div key={step} className={`relative p-7 rounded-2xl border ${border} ${bg}`}>
                  <div className={`text-5xl font-black ${color} opacity-20 mb-4 leading-none`}>{step}</div>
                  <h3 className="font-semibold text-white mb-3">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Integrate seamlessly ─────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto">
          <div ref={s7} className="reveal">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-blue-500 mb-3">Integrate seamlessly</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Connect all your ad data in one place</h2>
              <p className="text-gray-400 text-base max-w-xl mx-auto">AdNexus connects to ad platforms directly using OAuth. No middleware, no manual exports. Data stays fresh and your team stays informed.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              {[
                { name: 'Meta Ads', letter: 'M', color: 'from-blue-600 to-blue-700', desc: 'Facebook & Instagram' },
                { name: 'Google Ads', letter: 'G', color: 'from-green-600 to-green-700', desc: 'Search & Shopping' },
                { name: 'Amazon Ads', letter: 'A', color: 'from-orange-500 to-orange-600', desc: 'Sponsored Products' },
                { name: 'Supabase', letter: 'S', color: 'from-emerald-600 to-teal-700', desc: 'Auth & Database' },
                { name: 'Razorpay', letter: 'R', color: 'from-indigo-600 to-indigo-700', desc: 'Payments' },
                { name: 'Email Alerts', letter: 'E', color: 'from-slate-600 to-slate-700', desc: 'Instant notifications' },
              ].map(({ name, letter, color, desc }) => (
                <div key={name} className="card-hover flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>{letter}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-200 leading-none mb-0.5">{name}</p>
                    <p className="text-xs text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: '2 min', label: 'to connect your first account' },
                { value: 'Daily', label: 'automated sync and diagnostics' },
                { value: '100%', label: 'OAuth only — no credentials stored' },
              ].map(({ value, label }) => (
                <div key={label} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center">
                  <p className="text-2xl font-bold text-white mb-1">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ───────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div ref={s8} className="reveal">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-blue-500 mb-3">Simple pricing</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Start free. Scale when you grow.</h2>
              <p className="text-gray-400 text-base max-w-xl mx-auto">No long-term contracts. No per-seat fees. Cancel anytime.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  name: 'Free', price: '0', per: 'forever', desc: 'For brands just getting started with ad diagnostics.',
                  features: ['1 ad account', '10 diagnostic checks', 'Weekly email digest', 'Basic health score'],
                  cta: 'Start for free', href: '/signup', highlight: false,
                },
                {
                  name: 'Growth', price: '2,999', per: 'per month', desc: 'For D2C brands running serious ad budgets.',
                  features: ['5 ad accounts', 'All 30 diagnostic checks', 'Daily syncs', 'AI-written fixes', 'PDF audit reports', 'Instant email alerts'],
                  cta: 'Start Growth plan', href: '/signup?plan=growth', highlight: true,
                },
                {
                  name: 'Agency', price: '9,999', per: 'per month', desc: 'For agencies managing multiple client accounts.',
                  features: ['Unlimited ad accounts', 'All Growth features', 'White-label PDF reports', 'Priority support', 'API access', 'Team collaboration'],
                  cta: 'Start Agency plan', href: '/signup?plan=agency', highlight: false,
                },
              ].map(({ name, price, per, desc, features, cta, href, highlight }) => (
                <div key={name} className={`card-hover relative p-7 rounded-2xl border flex flex-col ${highlight ? 'border-blue-500/40 bg-blue-600/[0.06]' : 'border-white/[0.07] bg-white/[0.02]'}`}>
                  {highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">Most popular</span>}
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-gray-400 mb-1">{name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-gray-500">₹</span>
                      <span className="text-4xl font-black text-white">{price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{per}</p>
                    <p className="text-sm text-gray-400 mt-3">{desc}</p>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={href} className={`w-full py-3 text-sm font-semibold rounded-xl text-center transition-colors ${highlight ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'border border-white/[0.12] hover:bg-white/[0.06] text-white'}`}>
                    {cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Explore resources ────────────────────────────── */}
      <section id="resources" className="py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="reveal" ref={s9}>
            <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
              <div>
                <p className="text-sm font-semibold text-blue-500 mb-3">Explore resources</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Learn from the best</h2>
              </div>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                View all resources <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { tag: 'Interactive Tool', title: 'Free Account Diagnostic', desc: 'Get an instant health score for your ad accounts. No credit card needed.', cta: 'Run free scan', href: '/signup', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                { tag: 'Guide', title: 'How to diagnose Meta ad fatigue before it kills your ROAS', desc: 'The 6 signals that tell you creative fatigue is costing you.', cta: 'Read guide', href: '#', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
                { tag: 'Case Study', title: 'How a D2C brand recovered 3.2x ROAS in 30 days', desc: 'A broken tracking pixel was costing 38,000 rupees per month.', cta: 'Read story', href: '/customers', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                { tag: 'Playbook', title: 'The 10 Amazon Ads mistakes that cost brands crores per year', desc: 'ACOS, cannibalization, and bid strategy errors explained clearly.', cta: 'Get playbook', href: '#', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
              ].map(({ tag, title, desc, cta, href, color }) => (
                <div key={title} className="card-hover p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-col">
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md border ${color} mb-4 self-start`}>{tag}</span>
                  <h3 className="text-sm font-semibold text-white leading-snug mb-2 flex-1">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-5">{desc}</p>
                  <Link href={href} className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                    {cta} <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Be unstoppable CTA ───────────────────────────── */}
      <section className="relative py-32 px-4 sm:px-6 overflow-hidden" style={{ background: 'linear-gradient(180deg, #080808 0%, #0a0d15 50%, #080808 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.8) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-400 mb-4">Get started today</p>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            Be unstoppable
            <br />
            <span className="text-gradient">with AdNexus</span>
          </h2>
          <p className="text-gray-400 text-xl mb-10 max-w-lg mx-auto leading-relaxed">You have tried the rest. Now use the only platform built to keep Indian D2C ad accounts healthy and performing at their peak.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="flex items-center bg-white/[0.06] border border-white/10 rounded-xl overflow-hidden w-full sm:w-auto">
              <input type="email" placeholder="Unlock your peak potential" className="flex-1 px-5 py-3.5 bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-0 sm:w-56" />
              <Link href="/signup" className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors whitespace-nowrap">
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <p className="text-xs text-gray-600">Free plan available. No credit card. Cancel anytime.</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] pt-16 pb-8 px-4 sm:px-6" style={{ background: '#050507' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white">AdNexus</span>
              </Link>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">AI-powered ad account diagnostics for Indian D2C brands and performance marketing agencies.</p>
              <div className="flex gap-3">
                {['in', 'tw', 'yt'].map((s) => (
                  <div key={s} className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xs text-gray-500 uppercase font-bold hover:bg-white/[0.10] transition-colors cursor-pointer">{s}</div>
                ))}
              </div>
            </div>
            {[
              { title: 'Platform', links: [{ l: 'Platform Overview', h: '/platform' }, { l: 'Meta Ads', h: '/platform#meta' }, { l: 'Google Ads', h: '/platform#google' }, { l: 'Amazon Ads', h: '/platform#amazon' }, { l: 'AI Diagnostics', h: '/platform#ai' }] },
              { title: 'Company', links: [{ l: 'Features', h: '/#features' }, { l: 'Customers', h: '/customers' }, { l: 'Pricing', h: '/#pricing' }, { l: 'Resources', h: '/#resources' }] },
              { title: 'Resources', links: [{ l: 'Case Studies', h: '/customers' }, { l: 'Blog', h: '#' }, { l: 'E-Books and Guides', h: '#' }, { l: 'Help Center', h: '#' }] },
              { title: 'Account', links: [{ l: 'Sign up free', h: '/signup' }, { l: 'Sign in', h: '/login' }, { l: 'Growth plan', h: '/signup?plan=growth' }, { l: 'Agency plan', h: '/signup?plan=agency' }] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">{title}</p>
                <ul className="space-y-2.5">
                  {links.map(({ l, h }) => (
                    <li key={l}><Link href={h} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">2026 AdNexus. Built for Indian D2C brands and agencies.</p>
            <div className="flex gap-5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                <a key={l} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

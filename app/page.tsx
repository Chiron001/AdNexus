'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowRight, CheckCircle2, Activity, Bell, FileText,
  Cpu, Shield, TrendingUp, Star, ChevronRight, Zap,
  ChevronLeft,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'

/* ── Scroll-reveal ──────────────────────────────── */
function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return ref
}

/* ── Counter ─────────────────────────────────────── */
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1)
          setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])
  return { ref, count }
}

/* ── Carousel ─────────────────────────────────────── */
function Carousel({ items, renderItem }: {
  items: unknown[]
  renderItem: (item: unknown, i: number) => React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const onScroll = useCallback(() => {
    const el = ref.current
    if (!el) return
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  const goTo = (i: number) => {
    if (!ref.current) return
    ref.current.scrollTo({ left: i * ref.current.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'] }}
      >
        {items.map((item, i) => (
          <div key={i} className="w-full flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>
      {/* Arrows */}
      <button
        onClick={() => goTo(Math.max(0, active - 1))}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white transition-all ${active === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => goTo(Math.min(items.length - 1, active + 1))}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white transition-all ${active === items.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Floating particles ──────────────────────────── */
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 19 + 7) % 100}%`,
  top:  `${(i * 13 + 11) % 100}%`,
  size: i % 4 === 0 ? 3 : 2,
  opacity: 0.05 + (i % 4) * 0.03,
  dur: `${4 + (i % 5)}s`,
  delay: `${((i * 0.4) % 4).toFixed(1)}s`,
}))

/* ── Data ────────────────────────────────────────── */
const BRANDS = ['Nykaa','Mamaearth','boAt','WOW Skin','Lenskart','Bewakoof','Clovia','mCaffeine','Plum','The Moms Co','Sugar Cosmetics','Noise','Himalaya','Dabur','OZiva','Marico']

const PLATFORM_CARDS = [
  { name:'Meta Ads', letter:'M', gradient:'from-blue-600 to-blue-800', glow:'rgba(37,99,235,0.18)', desc:'Creative fatigue, audience overlap, pixel issues, budget drain — all detected and ranked by rupee impact.', checks:['Creative fatigue detection','Audience overlap analysis','Frequency cap violations','Pixel event tracking gaps','Budget pacing issues','Underperforming ad sets'] },
  { name:'Google Ads', letter:'G', gradient:'from-green-600 to-green-800', glow:'rgba(22,163,74,0.18)', desc:'Quality scores, impression share, keyword overlap, bid strategy health — all monitored every day.', checks:['Quality score monitoring','Impression share lost','Keyword cannibalization','Conversion tracking breaks','Zero-conversion keywords','Broad match overuse'] },
  { name:'Amazon Ads', letter:'A', gradient:'from-orange-500 to-orange-700', glow:'rgba(249,115,22,0.18)', desc:'ACOS creep, auto vs manual overlap, spend concentration, missing keyword coverage — all caught early.', checks:['High ACOS campaigns','Missing branded keywords','Spend concentration risk','Auto vs manual overlap','Zero-conversion ASINs','Bid adjustment gaps'] },
]

const FEATURE_CARDS = [
  { icon:Cpu,      color:'text-blue-400',   bg:'bg-blue-500/10 border-blue-500/20',   title:'Connect in 2 minutes',          desc:'One-click OAuth for Meta, Google, and Amazon Ads. No API keys. No CSV exports. First scan starts immediately.' },
  { icon:Bell,     color:'text-amber-400',  bg:'bg-amber-500/10 border-amber-500/20', title:'30 checks every sync',          desc:'Creative fatigue, zero-conversion spend, broken tracking, keyword cannibalization, high ACOS — all caught automatically.' },
  { icon:Activity, color:'text-cyan-400',   bg:'bg-cyan-500/10 border-cyan-500/20',   title:'Daily health score',            desc:'One number per platform tells your team exactly where to focus. Share in standups without a 2-hour audit.' },
  { icon:Bell,     color:'text-rose-400',   bg:'bg-rose-500/10 border-rose-500/20',   title:'Instant email alerts',          desc:'Critical issues trigger an alert the moment they appear — with context and next steps so your team acts before budget burns.' },
  { icon:FileText, color:'text-green-400',  bg:'bg-green-500/10 border-green-500/20', title:'Audit reports clients trust',   desc:'One-click PDF reports with health scores, issue breakdowns, and AI recommendations. Client-ready in seconds.' },
  { icon:Shield,   color:'text-purple-400', bg:'bg-purple-500/10 border-purple-500/20',title:'Rupee impact on every issue', desc:'Every problem comes with an estimated monthly cost based on your actual spend and performance data.' },
]

const CASE_STUDIES = [
  { metric:'3.2x', label:'ROAS improvement', brand:'D2C Skincare Brand', platform:'Meta Ads', quote:'We were spending 40% of our budget on campaigns with broken conversion tracking. AdNexus found it in the first scan. Fixed in one day.' },
  { metric:'62%',  label:'reduction in wasted spend', brand:'Fashion E-commerce', platform:'Google Ads', quote:'The keyword cannibalization check alone saved us over a lakh per month. We had no idea our own campaigns were competing against each other.' },
  { metric:'41%',  label:'ACOS improvement in 30 days', brand:'Health Supplements Brand', platform:'Amazon Ads', quote:'Our auto campaigns were cannibalizing the manual ones. AdNexus caught it immediately and the fix took 20 minutes.' },
]

const TESTIMONIALS = [
  { role:'Performance Marketer', company:'D2C Brand',        quote:'I used to spend 2 hours every Monday doing manual audits. AdNexus does the same thing in 2 minutes and catches issues I used to miss.', avatar:'P' },
  { role:'Head of Growth',       company:'E-commerce Brand', quote:'The revenue impact ranking is what sold me. I now know exactly which problem to fix first and what it costs every day it sits unfixed.', avatar:'H' },
  { role:'Founder',              company:'Performance Agency', quote:'We manage 18 client accounts. AdNexus lets us catch issues before clients notice. That has been huge for retention.', avatar:'F' },
]

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const s1 = useReveal(), s2 = useReveal(), s3 = useReveal(), s4 = useReveal()
  const s5 = useReveal(), s6 = useReveal(), s7 = useReveal(), s8 = useReveal(), s9 = useReveal()
  const c1 = useCounter(30), c2 = useCounter(3), c3 = useCounter(62)

  useEffect(() => {
    heroRef.current?.querySelectorAll('.hero-animate').forEach((el, i) => {
      ;(el as HTMLElement).style.animationDelay = `${i * 0.13}s`
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      <LandingNav />

      {/* ── Hero ─────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-16 md:pt-10"
        style={{ background: 'radial-gradient(ellipse 130% 90% at 70% 50%, rgba(15,8,4,0.98) 0%, #080808 55%), radial-gradient(ellipse 60% 80% at 80% 25%, rgba(37,99,235,0.2) 0%, transparent 65%)' }}
      >
        {/* Animated grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.014) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px)', backgroundSize:'72px 72px' }} />

        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-400 particle"
              style={{
                left: p.left, top: p.top,
                width: p.size, height: p.size,
                ['--p-opacity' as string]: p.opacity,
                ['--p-dur' as string]: p.dur,
                ['--p-delay' as string]: p.delay,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        {/* Glow orbs */}
        <div className="absolute top-24 right-[12%] w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{ background:'radial-gradient(circle, rgba(37,99,235,0.7) 0%, transparent 70%)', filter:'blur(48px)' }} />
        <div className="absolute bottom-24 right-[28%] w-64 h-64 rounded-full opacity-15 pointer-events-none" style={{ background:'radial-gradient(circle, rgba(124,58,237,0.7) 0%, transparent 70%)', filter:'blur(48px)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full" ref={heroRef}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left */}
            <div>
              <div className="hero-animate animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-gray-400 mb-7">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="ping-ring text-green-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                </span>
                The leading Ad Account Diagnostics Platform
              </div>

              <h1 className="hero-animate animate-fade-up text-[2.8rem] sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.04] mb-6">
                Move from spend
                <br />
                to{' '}
                <span className="text-gradient animate-gradient">unstoppable</span>
              </h1>

              <p className="hero-animate animate-fade-up text-lg text-gray-400 max-w-lg leading-relaxed mb-8">
                Stop guessing why your ROAS is dropping. AdNexus runs 30 diagnostic checks across Meta, Google, and Amazon, ranks every problem by rupee impact, and gives your team an AI-written fix in minutes.
              </p>

              {/* Email CTA */}
              <div className="hero-animate animate-fade-up flex flex-col sm:flex-row gap-3 mb-7">
                <div className="flex items-center bg-white/[0.05] border border-white/10 rounded-xl overflow-hidden flex-1">
                  <input type="email" placeholder="Enter your work email" className="flex-1 px-4 py-3.5 bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-0" />
                  <Link href="/signup" className="btn-blue flex items-center gap-1.5 px-5 py-3.5 bg-blue-600 text-white text-sm font-semibold whitespace-nowrap">
                    Get started <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Social proof */}
              <div className="hero-animate animate-fade-up flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['P','M','S','A','R'].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#080808] flex items-center justify-center text-xs font-bold text-white" style={{ background:`hsl(${i*50+200},60%,40%)` }}>{l}</div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_,i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                    <span className="text-xs font-semibold text-white ml-1">4.9</span>
                  </div>
                  <p className="text-xs text-gray-500">Trusted by 1,000+ D2C brands</p>
                </div>
              </div>
            </div>

            {/* Right — floating UI */}
            <div className="relative hidden lg:block h-[520px]">
              {/* Issues card */}
              <div className="animate-float absolute top-0 right-0 w-80 rounded-2xl border border-white/[0.09] overflow-hidden shadow-2xl shadow-black/60" style={{ background:'rgba(11,11,15,0.96)', backdropFilter:'blur(20px)' }}>
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <p className="text-xs font-semibold text-white">Issues by Impact</p>
                  </div>
                  <span className="text-xs text-red-400 font-medium bg-red-500/10 px-2 py-0.5 rounded">12 open</span>
                </div>
                <div className="p-3 space-y-1.5">
                  {[
                    { tag:'Critical', issue:'Creative fatigue — Meta Ad Set #4',        val:'₹42K/mo', tagColor:'bg-red-500/15 text-red-400' },
                    { tag:'Critical', issue:'Broken conversion tracking — Google',       val:'₹38K/mo', tagColor:'bg-red-500/15 text-red-400' },
                    { tag:'High',     issue:'ACOS above target — Amazon Auto',           val:'₹21K/mo', tagColor:'bg-amber-500/15 text-amber-400' },
                    { tag:'High',     issue:'Quality score below 4 — 11 keywords',      val:'₹16K/mo', tagColor:'bg-amber-500/15 text-amber-400' },
                    { tag:'Medium',   issue:'Frequency cap exceeded — 3 ad sets',       val:'₹9K/mo',  tagColor:'bg-yellow-500/15 text-yellow-400' },
                  ].map(({ tag, issue, val, tagColor }) => (
                    <div key={issue} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${tagColor}`}>{tag}</span>
                      <p className="text-xs text-gray-300 flex-1 leading-snug">{issue}</p>
                      <span className="text-xs font-bold text-red-400 flex-shrink-0 tabular-nums">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health score card */}
              <div className="animate-float-delay absolute bottom-10 left-0 w-52 rounded-2xl border border-white/[0.09] p-4 shadow-xl" style={{ background:'rgba(11,11,15,0.96)', backdropFilter:'blur(20px)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500 font-medium">Platform Health</p>
                  <span className="text-xs text-amber-400 font-semibold">Needs attention</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name:'Meta',   score:64, color:'#f59e0b' },
                    { name:'Google', score:58, color:'#ef4444' },
                    { name:'Amazon', score:71, color:'#22c55e' },
                  ].map(({ name, score, color }) => (
                    <div key={name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400">{name}</span>
                        <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${score}%`, background:color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI fix card */}
              <div className="animate-float-slow absolute top-48 left-6 w-60 rounded-2xl border border-blue-500/25 p-4 shadow-xl" style={{ background:'rgba(11,11,15,0.96)', backdropFilter:'blur(20px)', boxShadow:'0 0 36px rgba(37,99,235,0.14)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <p className="text-xs font-semibold text-white">AI Fix Ready</p>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-green-500/15 text-green-400 rounded font-bold">New</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">Pause 3 fatigued creatives, upload 2 fresh variants, set frequency cap to 3/week.</p>
                <button className="mt-3 w-full py-1.5 text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg border border-blue-500/20 transition-colors">Apply fix</button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none" style={{ background:'linear-gradient(to bottom, transparent, #080808)' }} />
      </section>

      {/* ── Trusted by marquee ────────────────────────── */}
      <section className="py-10 border-y border-white/[0.05] overflow-hidden">
        <p className="text-center text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-6">Trusted by D2C brands across India</p>
        <div className="flex">
          <div className="animate-marquee flex gap-14 items-center whitespace-nowrap">
            {[...BRANDS, ...BRANDS].map((brand, i) => (
              <span key={i} className="text-xs font-bold text-gray-700 hover:text-gray-400 transition-colors cursor-default tracking-widest uppercase">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── One Platform ──────────────────────────────── */}
      <section id="platform" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div ref={s1} className="reveal">
            <div className="text-center mb-12 stagger-child">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">One platform</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5">Every ad channel. Infinite clarity.</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">The most complete diagnostics platform for Meta, Google, and Amazon. Your entire ad health in one dashboard, updated every day.</p>
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-5">
              {PLATFORM_CARDS.map(({ name, letter, gradient, glow, desc, checks }) => (
                <div key={name} className="stagger-child glow-card p-7 rounded-2xl border border-white/[0.07]" style={{ background:`radial-gradient(ellipse 80% 50% at 50% 0%, ${glow}, transparent), rgba(255,255,255,0.02)` }}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl shadow-xl mb-5`}>{letter}</div>
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

            {/* Mobile carousel */}
            <div className="md:hidden">
              <Carousel
                items={PLATFORM_CARDS}
                renderItem={(item) => {
                  const { name, letter, gradient, glow, desc, checks } = item as typeof PLATFORM_CARDS[0]
                  return (
                    <div className="p-6 rounded-2xl border border-white/[0.07] mx-1" style={{ background:`radial-gradient(ellipse 80% 50% at 50% 0%, ${glow}, transparent), rgba(255,255,255,0.02)` }}>
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-xl mb-4`}>{letter}</div>
                      <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed mb-4">{desc}</p>
                      <ul className="space-y-1.5">
                        {checks.map((c) => (
                          <li key={c} className="flex items-center gap-2 text-sm text-gray-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="py-16 border-y border-white/[0.06]" style={{ background:'radial-gradient(ellipse 70% 90% at 50% 50%, rgba(37,99,235,0.07) 0%, transparent 70%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { refData: c1, value: c1.count, suffix:'+', label:'Diagnostic checks' },
            { refData: c2, value: c2.count, suffix:'',  label:'Ad platforms covered' },
            { refData: c3, value: c3.count, suffix:'%', label:'Avg wasted spend recovered' },
            { refData: null, value: null,   special:'2 min', label:'Average setup time' },
          ].map(({ refData, value, suffix, label, special }, i) => (
            <div key={label} ref={refData?.ref ?? undefined} className="group">
              <div className="text-4xl sm:text-5xl font-black num-highlight mb-1 tabular-nums">{special ?? `${value}${suffix}`}</div>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Meet AdNexus AI ───────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/[0.06]" style={{ background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 70%)' }}>
        <div className="max-w-6xl mx-auto">
          <div ref={s2} className="reveal">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="stagger-child">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Meet AdNexus AI</p>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">The intelligence behind every diagnosis</h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-10">Drive faster action across all three platforms with autonomous AI trained on performance marketing data.</p>
                <div className="space-y-6">
                  {[
                    { icon:Cpu,       color:'text-purple-400', bg:'bg-purple-500/10 border-purple-500/20', title:'Autonomous diagnostics for superior performance', desc:'AdNexus scans your accounts daily, surfaces problems the moment they appear, and ranks them by rupee cost.' },
                    { icon:Activity,  color:'text-blue-400',   bg:'bg-blue-500/10 border-blue-500/20',     title:'Put your ad monitoring on autopilot',           desc:'Connect once and let AdNexus run 30 checks every day. No manual audits. No spreadsheets. No missed issues.' },
                    { icon:TrendingUp,color:'text-green-400',  bg:'bg-green-500/10 border-green-500/20',   title:'AI recommendations trained on your data',       desc:'Every fix is powered by Claude AI, cross-referenced with your campaign history for account-specific guidance.' },
                  ].map(({ icon:Icon, color, bg, title, desc }) => (
                    <div key={title} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl ${bg} border flex items-center justify-center shrink-0 mt-0.5`}>
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

              {/* AI fix card visual */}
              <div className="stagger-child rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl" style={{ background:'#0d0f16' }}>
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <p className="text-sm font-semibold text-white">AI-Generated Fix</p>
                  </div>
                  <span className="px-2 py-0.5 bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-bold rounded">Critical</span>
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold text-white mb-1">Creative fatigue on Meta Ad Set #4</p>
                  <p className="text-xs text-gray-500 mb-4">Estimated impact: ₹42,000 per month</p>
                  <p className="text-sm text-gray-300 leading-relaxed mb-5">Your top-performing ad set has reached creative fatigue. CTR dropped from 3.2% to 1.1% over 7 days while frequency climbed to 4.8.</p>
                  <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02] mb-4">
                    <p className="text-xs font-bold text-white mb-3">What to do right now</p>
                    <ol className="space-y-2">
                      {['Pause the 3 ads with frequency above 4.5 immediately','Upload at least 2 fresh creatives with a different visual angle','Reduce audience size or add exclusions to limit repeat exposure','Set a frequency cap of 3 per 7 days going forward'].map((step, i) => (
                        <li key={step} className="flex gap-2.5 text-sm text-gray-400">
                          <span className="text-gray-600 shrink-0 font-mono text-xs mt-0.5">{i+1}.</span>
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

      {/* ── Diagnostic breadth ────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div ref={s3} className="reveal">
            <div className="text-center mb-12 stagger-child">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Unmatched diagnostic breadth</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5">For unstoppable ad performance</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">From 5L to 5Cr monthly spend, AdNexus covers every failure mode that costs brands money.</p>
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-4">
              {FEATURE_CARDS.map(({ icon:Icon, color, bg, title, desc }) => (
                <div key={title} className="stagger-child glow-card p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 border`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Mobile carousel */}
            <div className="md:hidden">
              <Carousel
                items={FEATURE_CARDS}
                renderItem={(item) => {
                  const { icon:Icon, color, bg, title, desc } = item as typeof FEATURE_CARDS[0]
                  return (
                    <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] mx-1 min-h-[200px]">
                      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 border`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <h3 className="font-semibold text-white mb-2">{title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── What brands achieve ───────────────────────── */}
      <section id="results" className="py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div ref={s4} className="reveal">
            <div className="text-center mb-12 stagger-child">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">What brands achieve</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5">Results that show up in the numbers</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto mb-4">1,000 plus D2C brands use AdNexus to reach peak performance.</p>
              <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                View all case studies <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-5">
              {CASE_STUDIES.map(({ metric, label, brand, platform, quote }) => (
                <div key={brand} className="stagger-child glow-card p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-col">
                  <div className="mb-5">
                    <span className="text-xs text-gray-500 font-medium">{platform}</span>
                    <div className="text-5xl font-black text-white mt-2 mb-1 tabular-nums">{metric}</div>
                    <div className="text-sm text-gray-400">{label}</div>
                  </div>
                  <div className="flex mb-4">{[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}</div>
                  <p className="text-sm text-gray-400 leading-relaxed flex-1 mb-5 italic">"{quote}"</p>
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

            {/* Mobile carousel */}
            <div className="md:hidden">
              <Carousel
                items={CASE_STUDIES}
                renderItem={(item) => {
                  const { metric, label, brand, platform, quote } = item as typeof CASE_STUDIES[0]
                  return (
                    <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-col mx-1">
                      <span className="text-xs text-gray-500 font-medium">{platform}</span>
                      <div className="text-4xl font-black text-white mt-2 mb-1">{metric}</div>
                      <div className="text-sm text-gray-400 mb-4">{label}</div>
                      <div className="flex mb-3">{[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}</div>
                      <p className="text-sm text-gray-400 leading-relaxed mb-4 italic flex-1">"{quote}"</p>
                      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-300">{brand.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium text-white">{brand}</p>
                          <p className="text-xs text-gray-600">AdNexus Growth Plan</p>
                        </div>
                      </div>
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/[0.06]" style={{ background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.05) 0%, transparent 70%)' }}>
        <div className="max-w-5xl mx-auto">
          <div ref={s5} className="reveal">
            <div className="text-center mb-12 stagger-child">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Loved by brands</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-5">Built for the people running ads</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">From solo performance marketers to agencies managing 25 brand accounts.</p>
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-5">
              {TESTIMONIALS.map(({ role, company, quote, avatar }) => (
                <div key={role} className="stagger-child glow-card p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                  <div className="flex mb-4">{[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}</div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-6 flex-1">"{quote}"</p>
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

            {/* Mobile carousel */}
            <div className="md:hidden">
              <Carousel
                items={TESTIMONIALS}
                renderItem={(item) => {
                  const { role, company, quote, avatar } = item as typeof TESTIMONIALS[0]
                  return (
                    <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] mx-1">
                      <div className="flex mb-4">{[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}</div>
                      <p className="text-sm text-gray-300 leading-relaxed mb-6">"{quote}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white">{avatar}</div>
                        <div>
                          <p className="text-sm font-semibold text-white">{role}</p>
                          <p className="text-xs text-gray-500">{company}</p>
                        </div>
                      </div>
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div ref={s6} className="reveal">
            <div className="text-center mb-14 stagger-child">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-5">From connect to fix in under 10 minutes</h2>
              <p className="text-gray-400 text-base max-w-xl mx-auto">No onboarding call. No setup fee. Connect your accounts, get your first report, and start fixing today.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
              {/* Connector line (desktop) */}
              <div className="hidden sm:block absolute top-10 left-[33%] right-[33%] h-px bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-green-500/50 line-draw" />

              {[
                { step:'01', title:'Connect your ad accounts', desc:'One-click OAuth for Meta, Google, and Amazon Ads. Takes under 2 minutes. No credentials stored ever.', accent:'border-blue-500/30 bg-blue-500/05', num:'text-blue-500/20', dot:'bg-blue-500' },
                { step:'02', title:'Get your diagnostic report', desc:'AdNexus runs 30 checks and scores every account. Every issue is ranked by monthly rupee cost — no guesswork.', accent:'border-purple-500/30 bg-purple-500/05', num:'text-purple-500/20', dot:'bg-purple-500' },
                { step:'03', title:'Apply the AI-written fix', desc:'Each issue has a clear, account-specific fix written by Claude AI. One click to resolve. Results show in days.', accent:'border-green-500/30 bg-green-500/05', num:'text-green-500/20', dot:'bg-green-500' },
              ].map(({ step, title, desc, accent, num, dot }) => (
                <div key={step} className={`stagger-child relative p-7 rounded-2xl border ${accent}`}>
                  <div className={`absolute top-6 right-6 text-7xl font-black leading-none pointer-events-none select-none ${num}`}>{step}</div>
                  <div className={`w-3 h-3 rounded-full ${dot} mb-5 shadow-lg`} />
                  <h3 className="font-semibold text-white mb-3 pr-12">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div ref={s7} className="reveal">
            <div className="text-center mb-14 stagger-child">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Simple pricing</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-5">Start free. Scale when you grow.</h2>
              <p className="text-gray-400 text-base max-w-xl mx-auto">No long-term contracts. No per-seat fees. Cancel anytime.</p>
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-5">
              {[
                { name:'Free',   price:'0',     per:'forever',   desc:'For brands just getting started.', features:['1 ad account','10 diagnostic checks','Weekly email digest','Basic health score'], cta:'Start for free',    href:'/signup',              highlight:false },
                { name:'Growth', price:'2,999', per:'per month', desc:'For D2C brands running serious ad budgets.', features:['5 ad accounts','All 30 diagnostic checks','Daily syncs','AI-written fixes','PDF audit reports','Instant email alerts'], cta:'Start Growth plan', href:'/signup?plan=growth', highlight:true },
                { name:'Agency', price:'9,999', per:'per month', desc:'For agencies managing multiple clients.', features:['Unlimited ad accounts','All Growth features','White-label PDF reports','Priority support','API access','Team collaboration'], cta:'Start Agency plan', href:'/signup?plan=agency', highlight:false },
              ].map(({ name, price, per, desc, features, cta, href, highlight }) => (
                <div key={name} className={`stagger-child relative p-7 rounded-2xl border flex flex-col ${highlight ? 'border-blue-500/40 bg-blue-600/[0.07]' : 'border-white/[0.07] bg-white/[0.02] glow-card'}`}>
                  {highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/30">Most popular</span>
                  )}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-400 mb-2">{name}</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-sm text-gray-500">₹</span>
                      <span className="text-4xl font-black text-white tabular-nums">{price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{per}</p>
                    <p className="text-sm text-gray-400 mt-3 leading-relaxed">{desc}</p>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={href} className={`btn-blue w-full py-3 text-sm font-semibold rounded-xl text-center transition-colors ${highlight ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'border border-white/[0.12] hover:bg-white/[0.06] text-white'}`}>
                    {cta}
                  </Link>
                </div>
              ))}
            </div>

            {/* Mobile carousel */}
            <div className="md:hidden">
              <Carousel
                items={[
                  { name:'Free',   price:'0',     per:'forever',   desc:'For brands just getting started.', features:['1 ad account','10 diagnostic checks','Weekly email digest','Basic health score'], cta:'Start for free',    href:'/signup',              highlight:false },
                  { name:'Growth', price:'2,999', per:'per month', desc:'For D2C brands running serious ad budgets.', features:['5 ad accounts','All 30 diagnostic checks','Daily syncs','AI-written fixes','PDF audit reports','Instant email alerts'], cta:'Start Growth plan', href:'/signup?plan=growth', highlight:true },
                  { name:'Agency', price:'9,999', per:'per month', desc:'For agencies managing multiple clients.', features:['Unlimited ad accounts','All Growth features','White-label PDFs','Priority support','API access','Team collaboration'], cta:'Start Agency plan', href:'/signup?plan=agency', highlight:false },
                ]}
                renderItem={(item) => {
                  const { name, price, per, desc, features, cta, href, highlight } = item as { name:string; price:string; per:string; desc:string; features:string[]; cta:string; href:string; highlight:boolean }
                  return (
                    <div className={`relative p-6 rounded-2xl border flex flex-col mx-1 ${highlight ? 'border-blue-500/40 bg-blue-600/[0.07]' : 'border-white/[0.07] bg-white/[0.02]'}`}>
                      {highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">Most popular</span>}
                      <p className="text-sm font-semibold text-gray-400 mb-2">{name}</p>
                      <div className="flex items-baseline gap-0.5 mb-1"><span className="text-sm text-gray-500">₹</span><span className="text-4xl font-black text-white">{price}</span></div>
                      <p className="text-xs text-gray-500 mb-3">{per}</p>
                      <p className="text-sm text-gray-400 mb-4 leading-relaxed">{desc}</p>
                      <ul className="space-y-2 mb-6">{features.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />{f}</li>)}</ul>
                      <Link href={href} className={`btn-blue w-full py-3 text-sm font-semibold rounded-xl text-center ${highlight ? 'bg-blue-600 text-white' : 'border border-white/[0.12] text-white'}`}>{cta}</Link>
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Integrate ────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div ref={s8} className="reveal">
            <div className="text-center mb-12 stagger-child">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Integrate seamlessly</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-5">Connect all your ad data in one place</h2>
              <p className="text-gray-400 text-base max-w-xl mx-auto">OAuth only — no credentials stored. Data stays fresh. Team stays informed.</p>
            </div>
            <div className="stagger-child flex flex-wrap items-center justify-center gap-3 mb-10">
              {[
                { name:'Meta Ads',     letter:'M', color:'from-blue-600 to-blue-700',     desc:'Facebook & Instagram' },
                { name:'Google Ads',   letter:'G', color:'from-green-600 to-green-700',   desc:'Search & Shopping' },
                { name:'Amazon Ads',   letter:'A', color:'from-orange-500 to-orange-600', desc:'Sponsored Products' },
                { name:'Supabase',     letter:'S', color:'from-emerald-600 to-teal-700',  desc:'Auth & Database' },
                { name:'Razorpay',     letter:'R', color:'from-indigo-600 to-indigo-700', desc:'Payments' },
                { name:'Email Alerts', letter:'E', color:'from-slate-600 to-slate-700',   desc:'Instant notifications' },
              ].map(({ name, letter, color, desc }) => (
                <div key={name} className="glow-card flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>{letter}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-200 leading-none mb-0.5">{name}</p>
                    <p className="text-xs text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="stagger-child grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value:'2 min', label:'to connect your first account' },
                { value:'Daily', label:'automated sync and diagnostics' },
                { value:'100%', label:'OAuth only — no credentials stored' },
              ].map(({ value, label }) => (
                <div key={label} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center">
                  <p className="text-2xl font-black text-white mb-1">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="relative py-32 px-4 sm:px-6 overflow-hidden" style={{ background:'linear-gradient(180deg, #080808 0%, #09101f 50%, #080808 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.011) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.011) 1px, transparent 1px)', backgroundSize:'48px 48px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full opacity-25 pointer-events-none" style={{ background:'radial-gradient(circle, rgba(37,99,235,0.9) 0%, transparent 70%)', filter:'blur(70px)' }} />
        <div ref={s9} className="reveal relative max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Get started today</p>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Be unstoppable
            <br />
            <span className="text-gradient animate-gradient">with AdNexus</span>
          </h2>
          <p className="text-gray-400 text-xl mb-10 max-w-lg mx-auto leading-relaxed">The only platform built to keep Indian D2C ad accounts healthy and performing at their peak.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="flex items-center bg-white/[0.06] border border-white/10 rounded-xl overflow-hidden w-full sm:w-auto">
              <input type="email" placeholder="Enter your work email" className="flex-1 px-5 py-3.5 bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-0 sm:w-56" />
              <Link href="/signup" className="btn-blue flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold whitespace-nowrap">
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <p className="text-xs text-gray-600">Free plan available. No credit card. Cancel anytime.</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] pt-14 pb-8 px-4 sm:px-6" style={{ background:'#050507' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white">AdNexus</span>
              </Link>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">AI-powered ad diagnostics for Indian D2C brands and performance agencies.</p>
              <div className="flex gap-2.5">
                {[['in','LinkedIn'],['tw','Twitter'],['yt','YouTube']].map(([s, label]) => (
                  <div key={s} title={label} className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] text-gray-500 uppercase font-bold hover:bg-white/[0.10] hover:text-gray-300 transition-colors cursor-pointer">{s}</div>
                ))}
              </div>
            </div>
            {[
              { title:'Platform', links:[{l:'Platform Overview',h:'/platform'},{l:'Meta Ads',h:'/platform#meta'},{l:'Google Ads',h:'/platform#google'},{l:'Amazon Ads',h:'/platform#amazon'},{l:'AI Diagnostics',h:'/platform#ai'}] },
              { title:'Company',  links:[{l:'Features',h:'/#features'},{l:'Customers',h:'/customers'},{l:'Pricing',h:'/#pricing'},{l:'Resources',h:'/#resources'}] },
              { title:'Resources',links:[{l:'Case Studies',h:'/customers'},{l:'Blog',h:'#'},{l:'Guides',h:'#'},{l:'Help Center',h:'#'}] },
              { title:'Account',  links:[{l:'Sign up free',h:'/signup'},{l:'Sign in',h:'/login'},{l:'Growth plan',h:'/signup?plan=growth'},{l:'Agency plan',h:'/signup?plan=agency'}] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">{title}</p>
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
              {['Privacy Policy','Terms of Service','Cookie Policy'].map((l) => (
                <a key={l} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

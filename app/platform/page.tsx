'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Activity, Bell, FileText, Shield, TrendingUp, Cpu,
  CheckCircle2, Zap, BarChart3, RefreshCw, AlertTriangle, Download,
  ChevronRight, Star, Lock, Globe,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingCTA, LandingFooter } from '@/components/landing/LandingFooter'

/* ── Scroll-reveal ─────────────────────────── */
function useReveal(threshold = 0.07) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect() } }, { threshold, rootMargin:'0px 0px -40px 0px' })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return ref
}

/* ── Feature Section ────────────────────────── */
function FeatureRow({ id, tag, tagColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20',
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
      <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(ellipse 60% 40% at ${reverse?'75%':'25%'} 50%, ${accentColor} 0%, transparent 70%)` }}/>
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
              {cta} <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"/>
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

/* ── Mock UI: Diagnostic Scanner ───────────── */
function DiagnosticMock() {
  const [step, setStep] = useState(0)
  const items = [
    { text:'Creative fatigue — Ad Set #4', val:'₹42K', c:'text-red-400',    bg:'bg-red-500/12',    dot:'bg-red-400' },
    { text:'Broken pixel tracking',        val:'₹38K', c:'text-red-400',    bg:'bg-red-500/12',    dot:'bg-red-400' },
    { text:'Frequency cap exceeded',       val:'₹21K', c:'text-amber-400',  bg:'bg-amber-500/12',  dot:'bg-amber-400' },
    { text:'Keyword cannibalization',      val:'₹18K', c:'text-amber-400',  bg:'bg-amber-500/12',  dot:'bg-amber-400' },
    { text:'High ACOS — Auto campaigns',   val:'₹12K', c:'text-yellow-500', bg:'bg-yellow-500/12', dot:'bg-yellow-500' },
  ]
  useEffect(() => {
    const t = setInterval(() => setStep(p => (p + 1) % items.length), 1500)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="bg-zinc-950 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"/><span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"/></span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-white">Diagnostic Engine</span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 uppercase tracking-widest">Scanning</span>
      </div>
      <div className="p-3 space-y-1">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-500 border ${i === step ? `border-white/[0.07] bg-white/[0.05]` : 'border-transparent opacity-40'}`}>
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i <= step ? item.dot : 'bg-white/15'}`}/>
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

/* ── Mock UI: AI Fix Generator ──────────────── */
const AI_TEXT = 'Pause the 3 fatigued creatives in Ad Set #4. Upload 2 fresh variants using a different visual angle — lifestyle over product. Set frequency cap to 3 impressions/week. Expected ROAS recovery: +0.8x within 7 days.'
function AIMock() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (idx >= AI_TEXT.length) { const t = setTimeout(() => setIdx(0), 2000); return () => clearTimeout(t) }
    const t = setTimeout(() => setIdx(p => p + 1), 30); return () => clearTimeout(t)
  }, [idx])
  return (
    <div className="bg-zinc-950 border border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center"><Cpu className="w-3.5 h-3.5 text-purple-300"/></div>
        <span className="text-[11px] font-bold uppercase tracking-wide text-white">AI Fix Generator</span>
        <span className="ml-auto text-[9px] font-bold px-2 py-0.5 bg-purple-500/15 text-purple-300 rounded-full border border-purple-500/20">Powered by Claude</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-bold px-2 py-0.5 bg-red-500/12 text-red-400 rounded-full border border-red-500/20 uppercase">Critical</span>
          <span className="text-[9px] text-gray-500 font-mono">₹42K month at risk</span>
        </div>
        <p className="text-[11px] font-semibold text-white mb-1">Creative Fatigue</p>
        <p className="text-[10px] text-gray-500 mb-3">Meta Ad Set #4 · Frequency 7.8</p>
        <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3 min-h-[100px] text-[10px] text-gray-300 leading-relaxed font-mono">
          <span className="text-purple-400/60 mr-1">›</span>
          {AI_TEXT.slice(0, idx)}
          <span className="type-cursor"/>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 py-2 text-xs font-semibold text-white bg-purple-600/80 hover:bg-purple-600 rounded-lg transition-colors">Apply Fix</button>
          <button className="px-3 py-2 text-xs text-gray-400 border border-white/[0.08] rounded-lg hover:bg-white/[0.05] transition-colors">Dismiss</button>
        </div>
      </div>
    </div>
  )
}

/* ── Mock UI: Analytics Cards ───────────────── */
function AnalyticsMock() {
  const bars = [42, 58, 45, 72, 63, 81, 55, 78, 69, 88, 74, 92]
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label:'Blended ROAS', val:'4.8x', delta:'+0.6x', up:true },
          { label:'Total Spend',  val:'₹3.2L', delta:'-4%',  up:false },
          { label:'Revenue',      val:'₹15.4L', delta:'+12%', up:true },
        ].map(m => (
          <div key={m.label} className="bg-zinc-950 border border-white/[0.07] rounded-xl p-3">
            <p className="text-[9px] text-gray-500 mb-1 uppercase tracking-widest">{m.label}</p>
            <p className="text-base font-black text-white font-mono">{m.val}</p>
            <p className={`text-[9px] font-mono mt-0.5 ${m.up ? 'text-emerald-400' : 'text-red-400'}`}>{m.delta} vs last mo</p>
          </div>
        ))}
      </div>
      <div className="bg-zinc-950 border border-white/[0.07] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-white uppercase tracking-wide">Daily Revenue · Last 12 days</p>
          <span className="text-[9px] font-mono text-emerald-400">↑ Trend</span>
        </div>
        <div className="flex items-end gap-1 h-16">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-sm transition-all duration-500 hover:opacity-100"
              style={{ height:`${h}%`, background:`linear-gradient(to top, rgba(59,130,246,0.8), rgba(139,92,246,0.5))`, opacity: 0.7 + i * 0.025 }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Mock UI: Alert Feed ────────────────────── */
function AlertMock() {
  const alerts = [
    { severity:'Critical', color:'red',   title:'ROAS dropped below 2x', platform:'Meta', time:'2 min ago',  icon:<AlertTriangle className="w-3.5 h-3.5"/> },
    { severity:'High',     color:'orange',title:'Daily budget exhausted', platform:'Google', time:'18 min ago', icon:<Bell className="w-3.5 h-3.5"/> },
    { severity:'Medium',   color:'amber', title:'Frequency cap at 7.4',  platform:'Meta', time:'1 hr ago',   icon:<Activity className="w-3.5 h-3.5"/> },
  ]
  const colorMap: Record<string, string> = {
    red:    'text-red-400 bg-red-500/10 border-red-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    amber:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
  }
  return (
    <div className="bg-zinc-950 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-amber-400"/>
          <span className="text-[11px] font-bold uppercase tracking-wide text-white">Live Alerts</span>
        </div>
        <span className="text-[9px] font-mono text-gray-600">3 active</span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {alerts.map((a, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorMap[a.color]}`}>{a.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${colorMap[a.color]}`}>{a.severity}</span>
                <span className="text-[9px] text-gray-600">{a.platform}</span>
              </div>
              <p className="text-[11px] text-gray-200 truncate">{a.title}</p>
            </div>
            <span className="text-[9px] text-gray-600 shrink-0">{a.time}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.02]">
        <p className="text-[9px] text-gray-600 uppercase tracking-widest">Alert channels: Email · WhatsApp · In-app</p>
      </div>
    </div>
  )
}

/* ── Mock UI: Audit Report ──────────────────── */
function ReportMock() {
  return (
    <div className="bg-zinc-950 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-green-400"/>
          <span className="text-[11px] font-bold uppercase tracking-wide text-white">Audit Report</span>
        </div>
        <span className="text-[9px] font-mono text-green-400">Ready to export</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05]">
          <div>
            <p className="text-sm font-semibold text-white">June 2026 — Full Audit</p>
            <p className="text-[10px] text-gray-500 mt-0.5">3 platforms · 18 issues found · ₹1.31L at risk</p>
          </div>
          <button className="flex items-center gap-1.5 text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500/15 transition-colors">
            <Download className="w-3 h-3"/> PDF
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 py-1">
          {[
            { platform:'Meta',   score:64, color:'#f59e0b', issues:8 },
            { platform:'Google', score:58, color:'#ef4444', issues:6 },
            { platform:'Amazon', score:71, color:'#22c55e', issues:4 },
          ].map(p => (
            <div key={p.platform} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
              <p className="text-[9px] text-gray-500 mb-1">{p.platform}</p>
              <p className="text-xl font-black font-mono" style={{ color:p.color }}>{p.score}</p>
              <p className="text-[9px] text-gray-600 mt-0.5">{p.issues} issues</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <div className="flex-1 py-2 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-center">
            <p className="text-[9px] text-gray-600 mb-0.5">White-label</p>
            <p className="text-[10px] font-semibold text-white">Your Brand</p>
          </div>
          <div className="flex-1 py-2 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-center">
            <p className="text-[9px] text-gray-600 mb-0.5">Scheduled</p>
            <p className="text-[10px] font-semibold text-white">Weekly</p>
          </div>
          <div className="flex-1 py-2 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-center">
            <p className="text-[9px] text-gray-600 mb-0.5">Share via</p>
            <p className="text-[10px] font-semibold text-white">Link / Email</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Mock UI: Platform Coverage ─────────────── */
function PlatformMock() {
  return (
    <div className="space-y-3">
      {[
        { letter:'M', label:'Meta Ads',   sub:'Facebook · Instagram · Reels', score:64, color:'#3b82f6', grad:'from-blue-600 to-blue-700',   checks:['Creative fatigue detection','Pixel & event tracking','Audience overlap analysis','Frequency cap monitoring'] },
        { letter:'G', label:'Google Ads', sub:'Search · Shopping · Display',  score:58, color:'#22c55e', grad:'from-green-600 to-green-700',  checks:['Quality score alerts','Keyword cannibalization','Bidding strategy review','ROAS target tracking'] },
        { letter:'A', label:'Amazon Ads', sub:'Sponsored Products · Brands',  score:71, color:'#f97316', grad:'from-orange-500 to-orange-700', checks:['ACOS optimisation','Zero-conversion ASINs','Bid efficiency checks','Placement analysis'] },
      ].map(p => (
        <div key={p.letter} className="bg-zinc-950 border border-white/[0.07] rounded-xl p-4 flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.grad} flex items-center justify-center text-white text-base font-black shrink-0 shadow-lg`}>{p.letter}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-semibold text-white">{p.label}</p>
                <p className="text-[10px] text-gray-500">{p.sub}</p>
              </div>
              <span className="text-base font-black font-mono ml-3 shrink-0" style={{ color:p.color }}>{p.score}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {p.checks.map(c => <span key={c} className="text-[9px] text-gray-500 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">{c}</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const CHECK = <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5"/>
const CHECKP = <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5"/>
const CHECKG = <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5"/>
const CHEKA  = <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"/>

/* ── Integration logos ──────────────────────── */
const INTEGRATIONS = [
  { letter:'M', label:'Meta Ads',       grad:'from-blue-600 to-blue-800' },
  { letter:'G', label:'Google Ads',     grad:'from-green-600 to-green-700' },
  { letter:'A', label:'Amazon Ads',     grad:'from-orange-500 to-orange-700' },
  { letter:'S', label:'Shopify',        grad:'from-emerald-600 to-emerald-800' },
  { letter:'R', label:'Razorpay',       grad:'from-indigo-500 to-indigo-700' },
  { letter:'W', label:'WooCommerce',    grad:'from-violet-600 to-violet-800' },
  { letter:'T', label:'TikTok Ads',     grad:'from-pink-600 to-rose-600' },
  { letter:'S', label:'Snapchat Ads',   grad:'from-yellow-400 to-yellow-600' },
  { letter:'L', label:'LinkedIn Ads',   grad:'from-sky-600 to-sky-700' },
  { letter:'P', label:'Pinterest Ads',  grad:'from-red-500 to-red-700' },
  { letter:'G', label:'Google Analytics',grad:'from-blue-500 to-blue-600' },
  { letter:'Z', label:'Zoho CRM',       grad:'from-teal-500 to-teal-700' },
]

const TESTIMONIALS = [
  { quote:'AdNexus found a broken pixel that was costing us ₹38K every month. Fixed it in one click. Wish we had this 2 years ago.', name:'Priya Sharma', role:'Head of Growth', brand:'D2C Skincare Brand', avatar:'P', stars:5 },
  { quote:'The AI recommendations are shockingly accurate. It told us to pause 3 ad sets, we did, ROAS jumped from 2.8x to 4.3x in 10 days.', name:'Rahul Mehta', role:'Performance Lead', brand:'Fashion D2C', avatar:'R', stars:5 },
  { quote:'As an agency we manage 14 brands. AdNexus saves us 6+ hours every week on manual audits and our clients love the white-label reports.', name:'Ananya Iyer', role:'Founder', brand:'Performance Agency', avatar:'A', stars:5 },
]

export default function PlatformPage() {
  const heroRef = useReveal()
  const statsRef = useReveal()
  const intRef = useReveal()
  const tRef = useReveal()
  const [activeT, setActiveT] = useState(0)
  const [intPage, setIntPage] = useState(0)
  const intCarouselRef = useRef<HTMLDivElement>(null)
  const tCarouselRef = useRef<HTMLDivElement>(null)
  const skipTSync = useRef(false)

  useEffect(() => {
    const t = setInterval(() => setActiveT(p => (p + 1) % TESTIMONIALS.length), 3800)
    return () => clearInterval(t)
  }, [])

  // Sync testimonial scroll when activeT changes (auto-rotation or dot click)
  useEffect(() => {
    const el = tCarouselRef.current
    if (!el) return
    skipTSync.current = true
    el.scrollTo({ left: activeT * el.clientWidth, behavior: 'smooth' })
    const t = setTimeout(() => { skipTSync.current = false }, 600)
    return () => clearTimeout(t)
  }, [activeT])

  const onIntScroll = () => {
    const el = intCarouselRef.current
    if (!el) return
    setIntPage(Math.round(el.scrollLeft / el.clientWidth))
  }

  const goIntPage = (page: number) => {
    setIntPage(page)
    intCarouselRef.current?.scrollTo({ left: page * (intCarouselRef.current.clientWidth), behavior: 'smooth' })
  }

  const onTScroll = () => {
    if (skipTSync.current) return
    const el = tCarouselRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    if (idx !== activeT) setActiveT(idx)
  }

  return (
    <div className="min-h-screen text-white" style={{ background:'#070810' }}>
      <LandingNav/>

      {/* ── Hero ──────────────────────────────── */}
      <section className="relative pt-40 pb-24 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 65%)' }}/>
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage:'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)', backgroundSize:'44px 44px' }}/>
        <div ref={heroRef} className="reveal max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/[0.08] text-[10px] font-bold text-blue-300 mb-7 stagger-child uppercase tracking-widest">
            <Zap className="w-3 h-3"/> Platform Overview
          </div>
          <h1 className="text-[2.2rem] sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-7 stagger-child">
            The platform that keeps your<br/>
            <span className="text-gradient animate-gradient">ad accounts performing</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed stagger-child">
            30 diagnostic checks per sync. AI-generated fixes. Real-time alerts. Audit-ready reports — all in one platform built for Indian D2C brands and agencies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 stagger-child">
            <Link href="/signup" className="btn-blue flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all">
              Start free scan <ArrowRight className="w-4 h-4"/>
            </Link>
            <Link href="#diagnostic" className="flex items-center gap-2 px-7 py-3.5 border border-white/[0.12] text-gray-300 hover:text-white hover:border-white/[0.22] rounded-xl text-sm font-medium transition-all">
              See all features <ChevronRight className="w-4 h-4"/>
            </Link>
          </div>
          {/* Trust bar */}
          <div className="mt-14 pt-10 border-t border-white/[0.06] stagger-child">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-5 font-bold">Trusted by D2C brands across India</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {['Myntra','Nykaa','Mamaearth','Boat','Sugar','Lenskart','Classplus','Wakefit'].map(b => (
                <span key={b} className="text-xs font-bold text-gray-600 hover:text-gray-400 transition-colors tracking-wide">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 1: Diagnostic Engine ─────── */}
      <FeatureRow
        id="diagnostic"
        tag="Diagnostic Engine"
        tagColor="text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
        accentColor="rgba(6,182,212,0.07)"
        headline={<>30 checks. Every sync.<br/>Every account.</>}
        body="AdNexus runs 30 diagnostic checks across your Meta, Google, and Amazon accounts every time you sync — catching creative fatigue, broken pixels, budget inefficiencies, keyword problems, and more before they drain your budget."
        bullets={[
          { icon:CHECK, text:'Creative fatigue detection with frequency and CTR decline signals' },
          { icon:CHECK, text:'Pixel tracking validation — catches broken events before you scale spend' },
          { icon:CHECK, text:'Budget pacing and allocation analysis across all campaigns' },
          { icon:CHECK, text:'Competitive issue scoring with revenue impact in rupees' },
        ]}
        cta="See all 30 diagnostic checks"
        visual={<DiagnosticMock/>}
      />

      {/* ── Feature 2: AI Fix Generator ──────── */}
      <FeatureRow
        id="ai"
        tag="AI Fix Generator"
        tagColor="text-purple-400 bg-purple-500/10 border-purple-500/20"
        accentColor="rgba(139,92,246,0.08)"
        headline={<>Plain-English fixes,<br/>not just data.</>}
        body="Powered by Claude, AdNexus doesn't just tell you what's wrong — it tells you exactly what to do. Every issue comes with a step-by-step fix, expected outcome, and one-click implementation where possible."
        bullets={[
          { icon:CHECKP, text:'Action-ready instructions for every detected issue' },
          { icon:CHECKP, text:'Predicted ROAS recovery and revenue impact per fix' },
          { icon:CHECKP, text:'Context-aware — understands your account history and patterns' },
          { icon:CHECKP, text:'Apply fixes directly or share with your media buyer' },
        ]}
        cta="Try AI Fix Generator free"
        ctaHref="/signup"
        reverse
        visual={<AIMock/>}
      />

      {/* ── Feature 3: Analytics ─────────────── */}
      <FeatureRow
        id="analytics"
        tag="Performance Analytics"
        tagColor="text-blue-400 bg-blue-500/10 border-blue-500/20"
        accentColor="rgba(59,130,246,0.07)"
        headline={<>Your performance story,<br/>in one view.</>}
        body="Cross-platform analytics that aggregates spend, revenue, ROAS, CPA, and CTR across Meta, Google, and Amazon — so you always know your true blended performance without switching dashboards."
        bullets={[
          { icon:CHECK, text:'Blended ROAS and true CPA across all platforms' },
          { icon:CHECK, text:'Daily and weekly trend charts with anomaly detection' },
          { icon:CHECK, text:'Campaign-level breakdown with creative performance scoring' },
          { icon:CHECK, text:'Platform health scores that update every sync' },
        ]}
        cta="Explore analytics features"
        visual={<AnalyticsMock/>}
      />

      {/* ── Feature 4: Alerts ────────────────── */}
      <FeatureRow
        id="alerts"
        tag="Real-time Alerts"
        tagColor="text-amber-400 bg-amber-500/10 border-amber-500/20"
        accentColor="rgba(245,158,11,0.06)"
        headline={<>Know before your<br/>budget bleeds.</>}
        body="Set custom thresholds for ROAS, CPA, spend, frequency, and CTR. AdNexus monitors your accounts 24/7 and fires alerts via Email, WhatsApp, or in-app the moment something crosses a threshold."
        bullets={[
          { icon:CHEKA, text:'Custom rules for any metric — ROAS, CPA, Frequency, CTR, Spend' },
          { icon:CHEKA, text:'Multi-channel delivery: Email, WhatsApp, in-app notifications' },
          { icon:CHEKA, text:'Severity tiers — Critical, High, Medium — so you prioritise fast' },
          { icon:CHEKA, text:'Alert history log with resolution tracking' },
        ]}
        cta="Configure your first alert"
        ctaHref="/signup"
        reverse
        visual={<AlertMock/>}
      />

      {/* ── Feature 5: Reports ───────────────── */}
      <FeatureRow
        id="reports"
        tag="Audit Reports"
        tagColor="text-green-400 bg-green-500/10 border-green-500/20"
        accentColor="rgba(34,197,94,0.06)"
        headline={<>Client-ready reports<br/>in one click.</>}
        body="Generate comprehensive ad account audits in seconds. White-label them with your agency brand, schedule them weekly, and share via link or email — no manual PowerPoints, no data copy-paste."
        bullets={[
          { icon:CHECKG, text:'Full platform audit — issues, scores, revenue impact, fixes' },
          { icon:CHECKG, text:'White-label branding for agency use' },
          { icon:CHECKG, text:'Scheduled delivery — weekly or monthly to clients' },
          { icon:CHECKG, text:'Shareable link or PDF export' },
        ]}
        cta="See a sample report"
        visual={<ReportMock/>}
      />

      {/* ── Feature 6: Platform Coverage ─────── */}
      <FeatureRow
        id="platforms"
        tag="Platform Coverage"
        tagColor="text-blue-400 bg-blue-500/10 border-blue-500/20"
        accentColor="rgba(59,130,246,0.06)"
        headline={<>Meta. Google. Amazon.<br/>One unified view.</>}
        body="AdNexus connects to all three major performance platforms with platform-specific diagnostic logic — understanding the nuances of each ad ecosystem so issues aren't missed."
        bullets={[
          { icon:CHECK, text:'10 Meta-specific checks — creatives, audiences, pixel, frequency' },
          { icon:CHECK, text:'10 Google-specific checks — Quality Score, ROAS targets, bidding' },
          { icon:CHECK, text:'10 Amazon-specific checks — ACOS, zero-conversion ASINs, placement' },
        ]}
        cta="See full check list"
        reverse
        visual={<PlatformMock/>}
      />

      {/* ── Stats bar ─────────────────────────── */}
      <section className="py-20 px-5 sm:px-6" style={{ background:'rgba(4,5,14,0.8)' }}>
        <div ref={statsRef} className="reveal max-w-5xl mx-auto">
          <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-12">By the numbers</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-white/[0.06]">
            {[
              { val:'30',      label:'Diagnostic checks',     sub:'every sync'       },
              { val:'3',       label:'Ad platforms',          sub:'Meta, Google, Amazon' },
              { val:'24/7',    label:'Real-time monitoring',  sub:'always on'        },
              { val:'₹2.5Cr+', label:'Revenue recovered',     sub:'across beta users' },
            ].map(s => (
              <div key={s.label} className="text-center px-8 py-4 stagger-child">
                <p className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums mb-1">{s.val}</p>
                <p className="text-sm font-semibold text-gray-300 mb-0.5">{s.label}</p>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ──────────────────────── */}
      <section className="py-24 px-5 sm:px-6">
        <div ref={intRef} className="reveal max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.10] bg-white/[0.03] text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest stagger-child">
            <Globe className="w-3 h-3"/> Integrations
          </div>
          <h2 className="text-[1.6rem] sm:text-4xl font-extrabold tracking-tight mb-4 stagger-child">Connects to your entire stack</h2>
          <p className="text-gray-400 mb-14 max-w-xl mx-auto stagger-child">OAuth connections to the tools you already use. No APIs to configure, no engineering required.</p>
          {/* Desktop grid */}
          <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-6 gap-3 stagger-child">
            {INTEGRATIONS.map((int, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${int.grad} flex items-center justify-center text-white text-sm font-black shadow-md`}>{int.letter}</div>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors text-center leading-tight">{int.label}</p>
              </div>
            ))}
          </div>
          {/* Mobile carousel — 2 pages of 6 (scroll-snap) */}
          <div className="sm:hidden stagger-child">
            <div
              ref={intCarouselRef}
              className="flex overflow-x-auto scrollbar-hide"
              style={{ scrollSnapType:'x mandatory', WebkitOverflowScrolling:'touch' }}
              onScroll={onIntScroll}
            >
              {[0, 1].map(page => (
                <div key={page} className="flex-shrink-0 w-full grid grid-cols-3 gap-3" style={{ scrollSnapAlign:'start' }}>
                  {INTEGRATIONS.slice(page * 6, page * 6 + 6).map((int, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${int.grad} flex items-center justify-center text-white text-sm font-black shadow-md`}>{int.letter}</div>
                      <p className="text-[10px] text-gray-500 text-center leading-tight">{int.label}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-5">
              {[0, 1].map(p => (
                <button key={p} onClick={() => goIntPage(p)} className={`h-1.5 rounded-full transition-all duration-300 ${p === intPage ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/20'}`}/>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-6 stagger-child">More integrations coming: Unicommerce, Shiprocket, MoEngage, Clevertap</p>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────── */}
      <section className="py-24 px-5 sm:px-6" style={{ background:'rgba(4,5,14,0.6)' }}>
        <div ref={tRef} className="reveal max-w-6xl mx-auto">
          <div className="text-center mb-14 stagger-child">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Customer stories</p>
            <h2 className="text-[1.6rem] sm:text-4xl font-extrabold tracking-tight">Loved by performance marketers</h2>
          </div>
          {/* Desktop — all 3 visible, active one highlighted */}
          <div className="hidden md:grid md:grid-cols-3 gap-5 stagger-child">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} onClick={() => setActiveT(i)} className={`rounded-2xl p-6 flex flex-col cursor-pointer transition-all duration-500 ${
                i === activeT
                  ? 'bg-white/[0.06] border border-blue-500/30 shadow-lg shadow-blue-500/[0.08] scale-[1.02]'
                  : 'bg-white/[0.025] border border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.04]'
              }`}>
                <div className="flex mb-4">
                  {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"/>)}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed flex-1 mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-white/[0.12] flex items-center justify-center text-sm font-bold text-blue-300">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-[10px] text-gray-500">{t.role} · {t.brand}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop dots */}
          <div className="hidden md:flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveT(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeT ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/20'}`}/>
            ))}
          </div>
          {/* Mobile carousel (scroll-snap) */}
          <div className="md:hidden stagger-child">
            <div
              ref={tCarouselRef}
              className="flex overflow-x-auto scrollbar-hide"
              style={{ scrollSnapType:'x mandatory', WebkitOverflowScrolling:'touch' }}
              onScroll={onTScroll}
            >
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="flex-shrink-0 w-full" style={{ scrollSnapAlign:'start' }}>
                  <div className="bg-white/[0.04] border border-white/[0.09] rounded-2xl p-6 flex flex-col">
                    <div className="flex mb-4">
                      {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"/>)}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-6">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-white/[0.12] flex items-center justify-center text-sm font-bold text-blue-300">{t.avatar}</div>
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
                <button key={i} onClick={() => setActiveT(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeT ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/20'}`}/>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Plan CTA strip ────────────────────── */}
      <section className="py-16 px-5 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/8 to-purple-600/5 p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage:'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)', backgroundSize:'32px 32px' }}/>
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-5">
                <Lock className="w-4 h-4 text-green-400"/>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Free plan available — no credit card</span>
              </div>
              <h2 className="text-[1.6rem] sm:text-3xl font-extrabold text-white mb-4 tracking-tight">Start diagnosing your accounts today</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">Connect your first ad account in under 2 minutes. Get your health score, top issues, and AI-generated fixes — free.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/signup" className="btn-blue flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all">
                  Start free scan <ArrowRight className="w-4 h-4"/>
                </Link>
                <Link href="/#pricing" className="flex items-center justify-center gap-2 px-8 py-3.5 border border-white/[0.14] text-gray-300 hover:text-white hover:border-white/[0.24] rounded-xl text-sm font-medium transition-all">
                  View pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingCTA/>
      <LandingFooter/>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, ArrowLeft, CheckCircle2, Activity, Bell, FileText, Cpu, Shield,
  TrendingUp, Star, Mail, Sparkles, AlertTriangle, PlayCircle,
  BookOpen, Calculator, Gauge, MessageSquare, Quote, Plus, X, Search, Play,
  Shirt, Palette, HeartPulse, Pill, Smartphone, Sofa, Gem, Baby, Coffee,
  Dumbbell, PawPrint, Glasses, Footprints, Plane, Briefcase, Users,
} from 'lucide-react'
import { SiMeta, SiGoogleads, SiFacebook, SiInstagram, SiSlack, SiGmail, SiRazorpay, SiSupabase, SiGoogle } from 'react-icons/si'
import { FaAmazon } from 'react-icons/fa'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingBottom } from '@/components/landing/LandingFooter'
import { Ridges, NightGlow } from '@/components/landing/io-art'
import { useReveal, useCounter } from './_home-shared'

const USER_URL = process.env.NEXT_PUBLIC_USER_URL ?? ''

/* ── Auto-advancing index (tabs, accordions) ─────── */
function useCycle(length: number, ms: number) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => setActive(a => (a + 1) % length), ms)
    return () => clearTimeout(t)
  }, [active, paused, length, ms])
  return { active, setActive, paused, setPaused }
}

/* ── Data ──────────────────────────────────────── */
/* Categories we serve — shown instead of customer names */
const CATEGORIES = [
  { label:'Skincare',          icon:Sparkles },
  { label:'Fashion & Apparel', icon:Shirt },
  { label:'Beauty',            icon:Palette },
  { label:'Health & Wellness', icon:HeartPulse },
  { label:'Supplements',       icon:Pill },
  { label:'Electronics',       icon:Smartphone },
  { label:'Home & Living',     icon:Sofa },
  { label:'Jewellery',         icon:Gem },
  { label:'Baby & Kids',       icon:Baby },
  { label:'Food & Beverage',   icon:Coffee },
  { label:'Fitness',           icon:Dumbbell },
  { label:'Pet Care',          icon:PawPrint },
  { label:'Eyewear',           icon:Glasses },
  { label:'Footwear',          icon:Footprints },
  { label:'Travel',            icon:Plane },
  { label:'Agencies',          icon:Briefcase },
]

const PLATFORM_TABS = [
  { key:'Diagnostic Engine', icon:Activity,   href:'/platform/diagnostic-engine', title:'30 checks on every sync',       desc:'Creative fatigue, broken tracking, keyword cannibalization, ACOS creep — caught automatically, every night.' },
  { key:'Health Scoring',    icon:Shield,     href:'/platform/health-scoring',    title:'One score per platform',        desc:'A single 0–100 number for Meta, Google and Amazon. Share it in standups without the 2-hour audit.' },
  { key:'Revenue Impact',    icon:TrendingUp, href:'/platform/revenue-impact',    title:'Every issue has a price tag',   desc:'Each problem shows its estimated monthly cost from your real spend, so you always fix the biggest leak first.' },
  { key:'AI Fixes',          icon:Cpu,        href:'/ai-engine',                  title:'Plain-English fixes from AI',   desc:'Context-aware, step-by-step recommendations written by Claude AI and cross-checked with your campaign history.' },
  { key:'Real-time Alerts',  icon:Bell,       href:'/platform/alerts',            title:'Know the moment it breaks',     desc:'Critical issues trigger an alert immediately — with context and next steps so your team acts fast.' },
  { key:'Audit Reports',     icon:FileText,   href:'/platform/audit-reports',     title:'Client-ready in one click',     desc:'White-label PDF audits with health scores, issue breakdowns and AI recommendations your clients trust.' },
]

const AI_STEPS = [
  {
    title:'Diagnose what’s really wrong',
    desc:'Adnexusone AI reads every campaign, ad set and keyword daily and isolates the root cause, not just the symptom.',
    chat:[
      { me:true,  text:'Why did our Meta ROAS drop 38% this week?' },
      { me:false, text:'Ad Set #4 hit creative fatigue — CTR fell from 3.2% to 1.1% while frequency climbed to 4.8.' },
      { me:false, tag:'Critical · $510/mo at risk' },
    ],
  },
  {
    title:'Rank it by revenue impact',
    desc:'Every finding is priced against your actual spend, so the team always knows which fix moves the needle most.',
    chat:[
      { me:true,  text:'What should we fix first across all accounts?' },
      { me:false, text:'1. Broken pixel (Google) — $460/mo\n2. Creative fatigue (Meta) — $510/mo\n3. ACOS creep (Amazon) — $250/mo' },
      { me:false, tag:'12 issues · $1,400/mo recoverable' },
    ],
  },
  {
    title:'Fix it with one click',
    desc:'Get step-by-step fixes in plain English. Apply, assign to a teammate, or export to a client-ready report.',
    chat:[
      { me:true,  text:'Give me the fix for Ad Set #4.' },
      { me:false, text:'Pause the 3 ads above 4.5 frequency, upload 2 fresh creatives with a new angle, and cap frequency at 3 per 7 days.' },
      { me:false, tag:'Expected +0.8x ROAS in 7 days' },
    ],
  },
]

const CASE_STUDIES = [
  { metric:'3.2x', label:'ROAS improvement',          brand:'D2C Skincare Brand',  platform:'Meta Ads',   quote:'Broken conversion tracking was costing us $460 per month. Adnexusone found it in the first scan. Fixed in one day.', hue:['#3B5BFD','#7C3AED'] },
  { metric:'62%',  label:'reduction in wasted spend', brand:'Fashion E-commerce',  platform:'Google Ads', quote:'Keyword cannibalization was eating over a thousand dollars per month. We had no idea our own campaigns were fighting each other.', hue:['#0EA5E9','#3B5BFD'] },
  { metric:'41%',  label:'ACOS improvement',          brand:'Health Supplements',  platform:'Amazon Ads', quote:'Our auto campaigns were cannibalizing the manual ones. Adnexusone caught it immediately and the fix took 20 minutes.', hue:['#7C3AED','#DB2777'] },
  { metric:'2.8x', label:'ROAS in three months',      brand:'D2C Accessories',     platform:'Meta Ads',   quote:'The AI fixes are specific and they actually work. I recommend Adnexusone to every founder I know.', hue:['#4F46E5','#0EA5E9'] },
  { metric:'18',   label:'client accounts watched',   brand:'Performance Agency',  platform:'All channels', quote:'We catch issues before clients notice. That has been huge for retention.', hue:['#6D28D9','#3B5BFD'] },
]

const TESTIMONIALS = [
  { group:'Brands',   role:'Performance Marketer',   company:'D2C Brand',          quote:'I used to spend 2 hours every Monday on manual audits. Adnexusone does the same in 2 minutes and catches things I missed.' },
  { group:'Brands',   role:'Head of Growth',         company:'E-commerce Brand',   quote:'The revenue impact ranking is what sold me. I know exactly which problem to fix first and what it costs every day it sits unfixed.' },
  { group:'Agencies', role:'Agency Founder',         company:'Performance Agency', quote:'We manage 18 client accounts. Adnexusone lets us catch issues before clients notice. That has been huge for retention.' },
  { group:'Brands',   role:'Growth Lead',            company:'Fashion D2C',        quote:'Our Meta spend was bleeding $480/month on a fatigued creative. Adnexusone caught it on day one. The tool paid for itself in the first week.' },
  { group:'Founders', role:'Co-founder & CMO',       company:'Health Brand',       quote:'Keyword cannibalization on Google was something we never had time to audit. Now Adnexusone checks it every single day while we sleep.' },
  { group:'Agencies', role:'Media Buyer',            company:'D2C Accessories',    quote:'Three months in, our ROAS is up 2.8x. The AI fixes are specific and they actually work.' },
  { group:'Brands',   role:'Digital Marketing Head', company:'Lifestyle Brand',    quote:'Amazon ACOS was 68% on our auto campaigns. Adnexusone flagged it in the first sync. Now we are at 32% — the margin difference is insane.' },
  { group:'Founders', role:'Founder',                company:'Skincare Brand',     quote:'As a solo founder without a dedicated performance team, Adnexusone is like having a senior media buyer watching my accounts 24/7.' },
]

const PRICING_PLANS = [
  { name:'Basic', price:'19', per:'per month', desc:'30-day free trial, then $19/mo. For brands getting started with ad diagnostics.',
    features:['1 ad account','10 diagnostic checks','Weekly digest email','Basic health score'],
    allFeatures:['Meta Ads support','Manual scan trigger','Issue summary dashboard','Community support'],
    cta:'Start free trial', href:`${USER_URL}/signup`, highlight:false, custom:false },
  { name:'Growth', price:'99', per:'per month', desc:'For brands running serious ad budgets across platforms.',
    features:['5 ad accounts','1,000+ diagnostic checks','Daily auto-syncs','AI-written fixes'],
    allFeatures:['Meta, Google & Amazon','PDF audit reports','Instant email alerts','Revenue impact per issue','90-day issue history','Slack notifications'],
    cta:'Start Growth plan', href:`${USER_URL}/signup?plan=growth`, highlight:true, custom:false },
  { name:'Professional', price:'499', per:'per month', desc:'For agencies managing multiple client ad accounts.',
    features:['50 ad accounts','Adnexusone AI Engine','White-label PDFs','Priority support'],
    allFeatures:['API access','Team collaboration','Client portal','Custom branding','Issue assignment','Multi-user roles','Dedicated onboarding','SLA commitment'],
    cta:'Start Professional plan', href:`${USER_URL}/signup?plan=agency`, highlight:false, custom:false },
  { name:'Custom', price:'Custom', per:'contact for pricing', desc:'For enterprise brands and large agencies with bespoke needs.',
    features:['Unlimited ad accounts','All Professional features','Dedicated account manager','Custom integrations'],
    allFeatures:['Custom SLA','On-premise option','Security audit','Team training','Custom reporting','Enterprise SSO','Priority engineering','Quarterly reviews'],
    cta:'Contact us', href:'/contact', highlight:false, custom:true },
]

const INTEGRATIONS = [
  { name:'Meta Ads',   icon:SiMeta,      color:'#0081FB' },
  { name:'Google Ads', icon:SiGoogleads, color:'#4285F4' },
  { name:'Amazon Ads', icon:FaAmazon,    color:'#FF9900' },
  { name:'Facebook',   icon:SiFacebook,  color:'#1877F2' },
  { name:'Instagram',  icon:SiInstagram, color:'#E4405F' },
  { name:'Google Shopping', icon:SiGoogle, color:'#34A853' },
  { name:'Slack',      icon:SiSlack,     color:'#4A154B' },
  { name:'Email alerts', icon:SiGmail,   color:'#EA4335' },
  { name:'Razorpay',   icon:SiRazorpay,  color:'#3395FF' },
  { name:'Supabase',   icon:SiSupabase,  color:'#3ECF8E' },
]

const RESOURCES = [
  { tag:'Interactive tour', title:'Explore Adnexusone',  desc:'Take a guided tour of the platform — health scores, issues and AI fixes. No signup.', href:'/platform-tour',             art:'tour',  icon:PlayCircle, hue:['#3B5BFD','#7C3AED'] },
  { tag:'Case studies',     title:'3.2x ROAS recovered', desc:'How leading D2C brands use Adnexusone to stop wasted spend and grow.',                 href:'/case-studies',              art:'case',  icon:Star,       hue:['#7C3AED','#DB2777'] },
  { tag:'Blog',             title:'Trending articles',   desc:'Playbooks, diagnostics deep-dives and performance marketing insights.',                href:'/blog',                      art:'blog',  icon:BookOpen,   hue:['#0EA5E9','#3B5BFD'] },
  { tag:'Free tool',        title:'ROAS Calculator',     desc:'Work out break-even ROAS and target CPA for any product in seconds.',                  href:'/tools/roas-calculator',     art:'roas',  icon:Calculator, hue:['#4F46E5','#0EA5E9'] },
  { tag:'Free tool',        title:'Ad Health Scorecard', desc:'Score your ad account against 30 best-practice checks.',                               href:'/tools/ad-health-scorecard', art:'score', icon:Gauge,      hue:['#6D28D9','#3B5BFD'] },
  { tag:'Support',          title:'Help Center',         desc:'Docs, setup guides and answers to common questions.',                                  href:'/help-center',               art:'help',  icon:MessageSquare, hue:['#1E40AF','#7C3AED'] },
]

/* ── Small UI pieces ───────────────────────────── */
function Eyebrow({ lead, children, dark = false }: { lead: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 className={`io-display text-[1.9rem] sm:text-[2.6rem] lg:text-[3rem] font-medium leading-[1.12] tracking-[-0.02em] ${dark ? 'text-white' : 'text-[var(--io-ink)]'}`}>
      <span className="io-grad-text">{lead}</span><br />{children}
    </h2>
  )
}

function ScoreRing({ score, size = 168 }: { score: number; size?: number }) {
  const r = 70, c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox="0 0 168 168" aria-hidden="true">
      <defs>
        <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5B7BFF" /><stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <circle cx="84" cy="84" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10" />
      <circle cx="84" cy="84" r={r} fill="none" stroke="url(#ring-g)" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 84 84)"
        style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.165,0.84,0.44,1)' }} />
    </svg>
  )
}

/* Mini UI mock rendered at the top of each "One platform" card */
function PlatformMock({ k }: { k: string }) {
  if (k === 'Diagnostic Engine') return (
    <div className="space-y-1.5">
      {[['Critical','Creative fatigue — Ad Set #4','$510','bg-red-50 text-red-600'],['Critical','Broken pixel tracking','$460','bg-red-50 text-red-600'],['High','Keyword cannibalization','$340','bg-amber-50 text-amber-700']].map(([t,i,v,c]) => (
        <div key={i} className="flex items-center gap-2 rounded-xl bg-[var(--io-canvas)] px-2.5 py-2">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${c}`}>{t}</span>
          <span className="text-[11px] text-[var(--io-ink)] truncate flex-1">{i}</span>
          <span className="text-[11px] font-bold text-red-600 tabular-nums">{v}</span>
        </div>
      ))}
    </div>
  )
  if (k === 'Health Scoring') return (
    <div className="space-y-2.5 py-1">
      {[['Meta',64,'#F59E0B'],['Google',58,'#EF4444'],['Amazon',71,'#10B981']].map(([n,s,c]) => (
        <div key={n as string}>
          <div className="flex justify-between text-[11px] mb-1"><span className="text-[var(--io-ink-soft)]">{n}</span><span className="font-bold tabular-nums" style={{ color: c as string }}>{s}</span></div>
          <div className="h-1.5 rounded-full bg-[var(--io-canvas)] overflow-hidden"><div className="h-full rounded-full" style={{ width:`${s}%`, background: c as string }} /></div>
        </div>
      ))}
    </div>
  )
  if (k === 'Revenue Impact') return (
    <div className="flex items-end gap-1.5 h-[88px] px-1">
      {[38,52,44,70,58,86,64,92,74,100].map((h,i) => (
        <div key={i} className="flex-1 rounded-t-md" style={{ height:`${h}%`, background: i > 6 ? 'linear-gradient(180deg,#7C3AED,#3B5BFD)' : '#E3E0EC' }} />
      ))}
    </div>
  )
  if (k === 'AI Fixes') return (
    <div className="space-y-1.5">
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-[var(--io-ink)] text-white text-[11px] px-3 py-2">How do I fix Ad Set #4?</div>
      <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-[var(--io-canvas)] text-[var(--io-ink)] text-[11px] px-3 py-2">Pause 3 fatigued ads, upload 2 fresh creatives, cap frequency at 3/week.</div>
    </div>
  )
  if (k === 'Real-time Alerts') return (
    <div className="space-y-1.5">
      {[['Pixel stopped firing','Google Ads · just now'],['Frequency above 4.5','Meta Ads · 2m ago']].map(([t,s]) => (
        <div key={t} className="flex items-center gap-2.5 rounded-xl bg-[var(--io-canvas)] px-2.5 py-2">
          <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center"><Bell className="w-3.5 h-3.5 text-[var(--io-accent)]" /></span>
          <span className="min-w-0"><span className="block text-[11px] font-semibold text-[var(--io-ink)] truncate">{t}</span><span className="block text-[10px] text-[var(--io-ink-soft)]">{s}</span></span>
        </div>
      ))}
    </div>
  )
  return (
    <div className="rounded-xl bg-[var(--io-canvas)] p-3">
      <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold text-[var(--io-ink)]">Q3 Ad Audit.pdf</span><span className="text-[9px] font-bold text-white bg-[var(--io-accent)] rounded px-1.5 py-0.5">PDF</span></div>
      {[90,70,80,55].map((w,i) => <div key={i} className="h-1.5 rounded-full bg-[#DAD6E4] mb-1.5" style={{ width:`${w}%` }} />)}
    </div>
  )
}

/* Illustration at the top of each "Explore resources" card */
const GLASS = 'rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_20px_40px_-20px_rgba(0,0,0,.6)]'
function ResourceArt({ art }: { art: string }) {
  if (art === 'tour') return (
    <div className={`${GLASS} w-[86%] overflow-hidden`}>
      <div className="flex gap-1 px-3 py-2 border-b border-white/15">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/50" />)}</div>
      <div className="relative h-[92px] flex items-center justify-center">
        <div className="absolute left-3 top-3 space-y-1.5 w-[40%]">{[90,70,80].map(w => <div key={w} className="h-1.5 rounded-full bg-white/25" style={{ width:`${w}%` }} />)}</div>
        <span className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xl transition-transform duration-500 group-hover:scale-110">
          <span className="absolute inset-0 rounded-full border border-white/70 ping-ring" />
          <Play className="w-5 h-5 text-[var(--io-accent-2)] fill-[var(--io-accent-2)] ml-0.5" />
        </span>
      </div>
    </div>
  )
  if (art === 'case') return (
    <div className={`${GLASS} w-[86%] p-4`}>
      <p className="io-display text-3xl font-semibold leading-none">3.2x</p>
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/70 mt-1 mb-2">ROAS in 30 days</p>
      <svg viewBox="0 0 200 60" className="w-full h-12" aria-hidden="true">
        <defs><linearGradient id="case-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".45" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        <path d="M0 52 L30 46 L60 48 L90 34 L120 30 L150 16 L200 6 L200 60 L0 60Z" fill="url(#case-fill)" />
        <path d="M0 52 L30 46 L60 48 L90 34 L120 30 L150 16 L200 6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
  if (art === 'blog') return (
    <div className="relative w-[86%] h-[140px]">
      {[0,1,2].map(i => (
        <div key={i} className={`${GLASS} absolute left-0 right-0 p-3 transition-transform duration-500`} style={{ top: i * 34, transform: `scale(${1 - (2 - i) * 0.08})`, opacity: i === 2 ? 1 : 0.55 + i * 0.15, zIndex: i, background: i === 2 ? 'rgba(255,255,255,.16)' : undefined }}>
          <div className="flex gap-2.5">
            <span className="w-10 h-10 rounded-lg shrink-0" style={{ background: 'linear-gradient(135deg,#8FA6FF,#C4B5FD)' }} />
            <span className="flex-1 space-y-1.5 pt-1">{[100,70].map(w => <span key={w} className="block h-1.5 rounded-full bg-white/40" style={{ width:`${w}%` }} />)}</span>
          </div>
        </div>
      ))}
    </div>
  )
  if (art === 'roas') return (
    <div className={`${GLASS} w-[72%] p-3`}>
      <div className="rounded-lg bg-black/25 px-3 py-2 text-right mb-2">
        <p className="text-[9px] uppercase tracking-wider text-white/60">Break-even ROAS</p>
        <p className="io-display text-xl font-semibold tabular-nums">2.85x</p>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {['7','8','9','÷','4','5','6','×','1','2','3','='].map(k => (
          <span key={k} className={`h-5 rounded-md text-[10px] font-semibold flex items-center justify-center ${k === '=' ? 'bg-white text-[var(--io-accent-2)]' : 'bg-white/15'}`}>{k}</span>
        ))}
      </div>
    </div>
  )
  if (art === 'score') {
    const r = 38, c = Math.PI * r
    return (
      <div className={`${GLASS} w-[80%] px-4 pt-4 pb-3 flex flex-col items-center`}>
        <svg viewBox="0 0 100 56" className="w-[130px]" aria-hidden="true">
          <path d={`M12 50 A${r} ${r} 0 0 1 88 50`} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="8" strokeLinecap="round" />
          <path d={`M12 50 A${r} ${r} 0 0 1 88 50`} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * 0.28} />
        </svg>
        <p className="io-display text-2xl font-semibold -mt-6">72<span className="text-xs text-white/60">/100</span></p>
        <p className="text-[10px] uppercase tracking-[0.14em] text-white/70 mt-1">Ad health</p>
      </div>
    )
  }
  return (
    <div className="w-[86%] space-y-2">
      <div className={`${GLASS} flex items-center gap-2 px-3 py-2`}><Search className="w-3.5 h-3.5 text-white/70" /><span className="text-[11px] text-white/70">How do I connect Amazon Ads?</span></div>
      <div className="ml-6 rounded-2xl rounded-tl-md bg-white text-[var(--io-ink)] text-[11px] leading-snug px-3 py-2 shadow-lg">Go to Settings → Integrations and click Connect. It takes about 2 minutes.</div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────── */
export default function HomeClient() {
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal()
  const r5 = useReveal(), r6 = useReveal(), r7 = useReveal(), r8 = useReveal()
  const c1 = useCounter(30), c2 = useCounter(1000), c3 = useCounter(62)

  const [heroScore, setHeroScore] = useState(0)
  useEffect(() => { const t = setTimeout(() => setHeroScore(64), 700); return () => clearTimeout(t) }, [])

  const platform = useCycle(PLATFORM_TABS.length, 5000)
  const ai = useCycle(AI_STEPS.length, 7000)
  const [gallery, setGallery] = useState(0)
  const [testiGroup, setTestiGroup] = useState<'All' | 'Brands' | 'Agencies' | 'Founders'>('All')
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

  const testiRef = useRef<HTMLDivElement>(null)
  const resRef = useRef<HTMLDivElement>(null)
  const scrollBy = (el: HTMLDivElement | null, dir: 1 | -1) => el?.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })

  /* Centre the active card in the looping "One platform" track.
     slotRef is the card position across the three copies; we move to the nearest
     copy of the active card, then jump silently back into the middle copy. */
  const trackRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const N = PLATFORM_TABS.length
  const slotRef = useRef(N)
  const firstScroll = useRef(true)
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const cur = slotRef.current
    const base = cur - (cur % N)
    const target = [base - N, base, base + N]
      .map(b => b + platform.active)
      .filter(j => j >= 0 && j < N * 3)
      .reduce((a, b) => (Math.abs(b - cur) < Math.abs(a - cur) ? b : a))
    const centre = (j: number, behavior: ScrollBehavior) => {
      const card = track.children[j] as HTMLElement | undefined
      if (card) track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2, behavior })
    }
    slotRef.current = target
    centre(target, firstScroll.current ? 'instant' : 'smooth')

    // Keep the active tab centred in the tab bar too (it overflows on mobile)
    const bar = tabsRef.current
    const tab = bar?.querySelectorAll<HTMLElement>('.io-tab')[platform.active]
    if (bar && tab && bar.scrollWidth > bar.clientWidth) {
      bar.scrollTo({ left: tab.offsetLeft - (bar.clientWidth - tab.clientWidth) / 2, behavior: firstScroll.current ? 'instant' : 'smooth' })
    }
    firstScroll.current = false
    if (target >= N && target < N * 2) return
    const t = setTimeout(() => {
      const mid = N + (target % N)
      slotRef.current = mid
      centre(mid, 'instant')
    }, 750)
    return () => clearTimeout(t)
  }, [platform.active, N])

  /* Mobile pricing carousel — which card is centred, and jumping to one from the dots */
  const priceRef = useRef<HTMLDivElement>(null)
  const [priceIdx, setPriceIdx] = useState(0)
  const onPriceScroll = () => {
    const el = priceRef.current
    if (!el) return
    const centre = el.scrollLeft + el.clientWidth / 2
    const cards = [...el.children] as HTMLElement[]
    const nearest = cards.reduce((best, c, i) =>
      Math.abs(c.offsetLeft + c.clientWidth / 2 - centre) < Math.abs(cards[best].offsetLeft + cards[best].clientWidth / 2 - centre) ? i : best, 0)
    setPriceIdx(nearest)
  }
  const goToPlan = (i: number) => {
    const el = priceRef.current
    const card = el?.children[i] as HTMLElement | undefined
    if (el && card) el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: 'smooth' })
  }

  /* Pricing pop-up: Escape closes it, page scroll is locked while open */
  const openPlan = PRICING_PLANS.find(p => p.name === expandedPlan)
  useEffect(() => {
    if (!expandedPlan) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpandedPlan(null) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [expandedPlan])

  const testimonials = testiGroup === 'All' ? TESTIMONIALS : TESTIMONIALS.filter(t => t.group === testiGroup)

  return (
    <div className="min-h-screen io-canvas overflow-x-hidden">
      <LandingNav />

      <main>
        {/* ── Hero ───────────────────────────────────── */}
        <section data-parallax className="relative overflow-hidden text-white" style={{ background: 'var(--io-night)' }}>
          <NightGlow />
          <Ridges className="absolute left-0 right-0 bottom-0 w-full h-[42%] sm:h-[48%]" id="hero" />

          <div className="relative max-w-[1310px] mx-auto px-5 sm:px-6 pt-32 sm:pt-40 lg:pt-44 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-8 items-center">
              {/* Left */}
              <div>
                <div className="io-fade inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 mb-7" style={{ animationDelay: '.05s' }}>
                  <Sparkles className="w-3.5 h-3.5 text-violet-300" /> AI-powered ad account diagnostics
                </div>
                <h1 className="io-display text-[2.3rem] sm:text-[3.3rem] lg:text-[3.7rem] font-medium leading-[1.06] tracking-[-0.025em] mb-6">
                  <span className="io-rise-line"><span style={{ animationDelay: '.1s' }}>The only</span></span>
                  <span className="io-rise-line"><span style={{ animationDelay: '.22s' }} className="whitespace-nowrap">self-diagnosing ad</span></span>
                  <span className="io-rise-line"><span style={{ animationDelay: '.34s' }}>intelligence <span className="io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg,#8FA6FF,#C4B5FD)' }}>platform</span></span></span>
                </h1>
                <p className="io-fade text-base sm:text-lg text-white/70 max-w-xl leading-relaxed mb-9" style={{ animationDelay: '.5s' }}>
                  Adnexusone understands your Meta, Google and Amazon Ads, finds what&apos;s quietly draining budget, and tells your team exactly how to fix it — every single day.
                </p>
                <form action={`${USER_URL}/signup`} className="io-fade io-email max-w-md mb-10" style={{ animationDelay: '.62s' }}>
                  <input type="email" name="email" placeholder="Enter your work email" aria-label="Work email" />
                  <button type="submit" className="io-btn io-btn-primary !py-3">Get started <ArrowRight className="io-arrow w-3.5 h-3.5" /></button>
                </form>
                <div className="io-fade" style={{ animationDelay: '.75s' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-3">Trusted by 1,000+ D2C brands</p>
                  <div className="flex items-center gap-5 text-white/80">
                    <span className="flex items-center gap-1.5"><SiMeta className="w-4 h-4" /><span className="text-sm">Meta</span></span>
                    <span className="flex items-center gap-1.5"><SiGoogleads className="w-4 h-4" /><span className="text-sm">Google</span></span>
                    <span className="flex items-center gap-1.5"><FaAmazon className="w-4 h-4" /><span className="text-sm">Amazon</span></span>
                    <span className="h-4 w-px bg-white/20" />
                    <span className="flex items-center gap-1 text-sm whitespace-nowrap"><Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> 4.9 rating</span>
                  </div>
                </div>
              </div>

              {/* Right — score orb with floating widgets */}
              <div className="relative h-[420px] sm:h-[480px] lg:h-[540px]">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full io-breathe" style={{ background: 'radial-gradient(closest-side, rgba(124,58,237,.55), rgba(59,91,253,.25) 55%, transparent)', filter: 'blur(10px)' }} />
                <div className="io-pop absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] rounded-full border border-white/15 flex items-center justify-center" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,.14), rgba(255,255,255,.02) 60%), rgba(20,16,48,.6)', backdropFilter: 'blur(14px)', animationDelay: '.3s' }}>
                  <div className="relative flex items-center justify-center">
                    <ScoreRing score={heroScore} size={200} />
                    <div className="absolute text-center">
                      <p className="io-display text-5xl font-semibold tabular-nums">{heroScore}</p>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-white/60 mt-1">Health score</p>
                    </div>
                  </div>
                </div>

                {/* Issues card */}
                <div data-depth="28" className="io-pop absolute right-0 top-2 sm:top-6 w-[230px] sm:w-[260px]" style={{ animationDelay: '.7s' }}>
                  <div className="io-float-a rounded-2xl bg-white text-[var(--io-ink)] p-3.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,.6)]">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />Issues by impact</span>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 rounded-full px-2 py-0.5">12 open</span>
                    </div>
                    {[['Creative fatigue','$510'],['Broken pixel','$460'],['ACOS creep','$250']].map(([i,v]) => (
                      <div key={i} className="flex justify-between text-[11px] py-1.5 border-t border-[var(--io-line)]"><span>{i}</span><span className="font-bold text-red-600 tabular-nums">{v}/mo</span></div>
                    ))}
                  </div>
                </div>

                {/* AI fix card */}
                <div data-depth="36" className="io-pop absolute left-0 bottom-16 sm:bottom-20 w-[220px] sm:w-[250px]" style={{ animationDelay: '.95s' }}>
                  <div className="io-float-b rounded-2xl border border-white/15 p-3.5 text-white" style={{ background: 'rgba(30,24,70,.75)', backdropFilter: 'blur(16px)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' }}><Cpu className="w-3.5 h-3.5" /></span>
                      <span className="text-xs font-bold">AI fix ready</span>
                      <span className="ml-auto text-[9px] font-bold bg-emerald-400/20 text-emerald-300 rounded-full px-1.5 py-0.5">NEW</span>
                    </div>
                    <p className="text-[11px] text-white/75 leading-relaxed">Pause 3 fatigued creatives and cap frequency at 3/week.</p>
                  </div>
                </div>

                {/* Alert chip */}
                <div data-depth="18" className="io-pop absolute right-4 sm:right-10 bottom-4 sm:bottom-6" style={{ animationDelay: '1.15s' }}>
                  <div className="io-float-a flex items-center gap-2 rounded-full bg-white text-[var(--io-ink)] pl-1.5 pr-3.5 py-1.5 shadow-xl" style={{ animationDelay: '-2s' }}>
                    <span className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></span>
                    <span className="text-xs font-semibold">+$1,400/mo recovered</span>
                  </div>
                </div>

                {/* Platform chips */}
                <div data-depth="44" className="io-pop absolute left-6 sm:left-10 top-6 sm:top-10 flex gap-1.5" style={{ animationDelay: '1.3s' }}>
                  {[[SiMeta,'#0081FB'],[SiGoogleads,'#4285F4'],[FaAmazon,'#FF9900']].map(([Icon, c], i) => {
                    const I = Icon as typeof SiMeta
                    return <span key={i} className="io-float-b w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg" style={{ animationDelay: `${-i}s` }}><I className="w-4 h-4" style={{ color: c as string }} /></span>
                  })}
                </div>
              </div>
            </div>

            {/* Category marquee + stats panel */}
            <div className="mt-10 lg:mt-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45 mb-3">Built for every D2C category</p>
                <div className="io-marquee-wrap overflow-hidden io-fade-x">
                  <div className="io-marquee io-marquee-slow gap-2.5 items-center py-1">
                    {[...CATEGORIES, ...CATEGORIES].map(({ label, icon: Icon }, i) => (
                      <span key={i} className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/12 bg-white/[0.05] pl-1.5 pr-4 py-1.5 text-sm text-white/75 backdrop-blur-sm transition-colors hover:bg-white/[0.12] hover:text-white">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10"><Icon className="w-3.5 h-3.5 text-violet-200" /></span>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Glass stats panel */}
              <div className="io-spot-dark relative flex items-stretch rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl shadow-[0_24px_60px_-30px_rgba(0,0,0,.8)] overflow-hidden mx-auto lg:mx-0">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,.8), rgba(91,123,255,.8), transparent)' }} />
                {[
                  { ref:c1.ref, v:`${c1.count}`, l:'Checks per account', icon:Activity },
                  { ref:c2.ref, v:`${c2.count.toLocaleString()}+`, l:'D2C brands', icon:Users },
                  { ref:c3.ref, v:`${c3.count}%`, l:'Waste recovered', icon:TrendingUp },
                ].map(({ ref, v, l, icon: Icon }, i) => (
                  <div key={l} ref={ref} className={`px-4 sm:px-6 py-4 min-w-[104px] sm:min-w-[132px] ${i > 0 ? 'border-l border-white/10' : ''}`}>
                    <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.12em] text-white/55 mb-1.5">
                      <Icon className="w-3.5 h-3.5 text-violet-300" />{l}
                    </span>
                    <p className="io-display text-2xl sm:text-[1.75rem] font-semibold tabular-nums leading-none io-grad-text" style={{ backgroundImage: 'linear-gradient(90deg,#fff,#C4B5FD)' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── One platform ───────────────────────────── */}
        <section id="platform" className="py-24 sm:py-32">
          <div ref={r1} className="io-reveal">
            <div className="text-center px-5 mb-10">
              <Eyebrow lead="One platform,">every channel, infinite clarity.</Eyebrow>
              <p className="text-[var(--io-ink-soft)] text-base sm:text-lg max-w-2xl mx-auto mt-5">The most complete diagnostics platform for Meta, Google and Amazon Ads — your entire ad health in one place, updated every day.</p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center px-5 mb-10">
              <div ref={tabsRef} className="relative flex gap-1 overflow-x-auto scrollbar-hide rounded-full bg-white p-1 border border-[var(--io-line)] max-w-full"
                onMouseEnter={() => platform.setPaused(true)} onMouseLeave={() => platform.setPaused(false)}>
                {/* Mobile-only edge spacers so the first and last tabs can sit centred */}
                <span aria-hidden="true" className="md:hidden shrink-0 w-[calc(50%-5.5rem)]" />
                {PLATFORM_TABS.map(({ key, icon: Icon }, i) => (
                  <button key={key} className="io-tab flex items-center gap-1.5" data-active={platform.active === i} onClick={() => platform.setActive(i)}>
                    <Icon className="w-3.5 h-3.5" /> {key}
                    {platform.active === i && !platform.paused && (
                      <span key={`p-${platform.active}`} className="io-progress absolute left-3 right-3 bottom-1 h-[2px] rounded-full bg-white/60" style={{ ['--io-dur' as string]: '5s' }} />
                    )}
                  </button>
                ))}
                <span aria-hidden="true" className="md:hidden shrink-0 w-[calc(50%-5.5rem)]" />
              </div>
            </div>

            {/* Card track */}
            <div className="max-w-[1180px] mx-auto io-fade-x">
            <div ref={trackRef} className="relative flex gap-5 overflow-x-auto scrollbar-hide pt-2 pb-6"
              onMouseEnter={() => platform.setPaused(true)} onMouseLeave={() => platform.setPaused(false)}>
              {/* Three copies of the cards make the row loop, so it is always full with the active card centred */}
              {[...PLATFORM_TABS, ...PLATFORM_TABS, ...PLATFORM_TABS].map(({ key, title, desc, href }, j) => {
                const i = j % PLATFORM_TABS.length
                const copy = j < PLATFORM_TABS.length || j >= PLATFORM_TABS.length * 2
                return (
                <article key={j} onClick={() => platform.setActive(i)} aria-hidden={copy || undefined}
                  className={`io-card shrink-0 w-[290px] sm:w-[340px] p-5 cursor-pointer transition-[opacity,transform] duration-700 ${platform.active === i ? 'opacity-100 scale-100' : 'opacity-60 scale-[.94]'}`}
                  style={{ transitionTimingFunction: 'var(--io-ease)' }}>
                  <div className="rounded-2xl border border-[var(--io-line)] p-3.5 h-[150px] mb-5 overflow-hidden">
                    <PlatformMock k={key} />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--io-accent)] mb-2">{key}</p>
                  <h3 className="io-display text-xl font-semibold text-[var(--io-ink)] mb-2">{title}</h3>
                  <p className="text-sm text-[var(--io-ink-soft)] leading-relaxed mb-4">{desc}</p>
                  <Link href={href} tabIndex={copy ? -1 : undefined} className="io-link text-[var(--io-ink)]">Learn more <ArrowRight className="w-3.5 h-3.5" /></Link>
                </article>
                )
              })}
            </div>
            </div>
          </div>
        </section>

        {/* ── Introducing Adnexusone AI ──────────────── */}
        <section id="ai" className="pb-24 sm:pb-32 px-5 sm:px-6">
          <div ref={r2} className="io-reveal max-w-[1180px] mx-auto">
            <div className="text-center mb-14">
              <Eyebrow lead="Introducing Adnexusone AI">The self-optimizing intelligence layer for your ad spend</Eyebrow>
              <p className="text-[var(--io-ink-soft)] text-base sm:text-lg max-w-2xl mx-auto mt-5">Adnexusone AI connects every campaign across every channel, so every rupee and dollar you spend improves performance over time.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
              <div onMouseEnter={() => ai.setPaused(true)} onMouseLeave={() => ai.setPaused(false)}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--io-ink-soft)] mb-4">Adnexusone AI for growth teams</p>
                {AI_STEPS.map(({ title, desc }, i) => (
                  <button key={title} onClick={() => ai.setActive(i)} className="relative block w-full text-left py-5 border-t border-[var(--io-line)]">
                    <span className="absolute left-0 right-0 -top-px h-[2px] overflow-hidden">
                      {ai.active === i && <span key={`a-${ai.active}-${ai.paused}`} className={`block h-full bg-gradient-to-r from-[var(--io-accent)] to-[var(--io-accent-2)] ${ai.paused ? '' : 'io-progress'}`} style={{ ['--io-dur' as string]: '7s' }} />}
                    </span>
                    <span className={`io-display block text-xl sm:text-2xl font-semibold transition-colors ${ai.active === i ? 'text-[var(--io-ink)]' : 'text-[var(--io-ink)]/40'}`}>{title}</span>
                    <span className={`block overflow-hidden transition-all duration-700 ${ai.active === i ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`} style={{ transitionTimingFunction: 'var(--io-ease)' }}>
                      <span className="block text-sm sm:text-base text-[var(--io-ink-soft)] leading-relaxed">{desc}</span>
                    </span>
                  </button>
                ))}
                <Link href="/ai-engine" className="io-btn io-btn-dark mt-6">Explore Adnexusone AI <ArrowRight className="io-arrow w-3.5 h-3.5" /></Link>
              </div>

              {/* Chat visual */}
              <div className="io-tilt io-spot relative rounded-[32px] overflow-hidden min-h-[440px] p-6 sm:p-10 flex items-center justify-center" style={{ background: 'radial-gradient(60% 60% at 70% 30%, rgba(124,58,237,.35), transparent 70%), radial-gradient(60% 60% at 25% 80%, rgba(59,91,253,.35), transparent 70%), #E4E1F0' }}>
                <div className="absolute w-[380px] h-[380px] rounded-full io-breathe" style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,.75), transparent)' }} />
                <div key={ai.active} className="relative w-full max-w-[420px] space-y-3">
                  {AI_STEPS[ai.active].chat.map((m, i) => (
                    'tag' in m && m.tag ? (
                      <div key={i} className="io-bubble inline-flex items-center gap-2 rounded-full bg-[var(--io-ink)] text-white text-xs font-semibold px-3.5 py-2" style={{ animationDelay: `${0.25 + i * 0.55}s` }}>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-300" /> {m.tag}
                      </div>
                    ) : (
                      <div key={i} className={`io-bubble flex ${m.me ? 'justify-end' : 'justify-start'}`} style={{ animationDelay: `${0.25 + i * 0.55}s` }}>
                        {!m.me && <span className="w-8 h-8 rounded-full shrink-0 mr-2 flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,var(--io-accent),var(--io-accent-2))' }}><Sparkles className="w-4 h-4" /></span>}
                        <div className={`max-w-[85%] whitespace-pre-line text-sm leading-relaxed px-4 py-3 shadow-sm ${m.me ? 'rounded-2xl rounded-br-md bg-[var(--io-ink)] text-white' : 'rounded-2xl rounded-bl-md bg-white text-[var(--io-ink)]'}`}>{m.text}</div>
                      </div>
                    )
                  ))}
                  <div className="io-bubble flex items-center gap-1 text-[var(--io-ink-soft)] pl-10" style={{ animationDelay: '1.9s' }}>
                    <span className="io-dot" /><span className="io-dot" /><span className="io-dot" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Channel breadth (bento) ─────────────────── */}
        <section className="relative pb-24 sm:pb-32 px-5 sm:px-6 overflow-hidden">
          <div className="absolute left-1/2 top-[30%] -translate-x-1/2 w-[1200px] h-[700px] pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0 rounded-[50%] opacity-60" style={{ background: 'radial-gradient(closest-side, rgba(124,58,237,.35), rgba(59,91,253,.15) 60%, transparent)', filter: 'blur(40px)' }} />
          </div>
          <div ref={r3} className="io-reveal relative max-w-[1180px] mx-auto">
            <div className="text-center mb-14">
              <Eyebrow lead="Unmatched channel breadth">for unstoppable ad performance</Eyebrow>
              <p className="text-[var(--io-ink-soft)] text-base sm:text-lg max-w-2xl mx-auto mt-5">From Meta to Google to Amazon, Adnexusone covers every failure mode that quietly costs brands money.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon:SiMeta, c:'#0081FB', t:'Meta Ads', d:'Creative fatigue, audience overlap, pixel issues and budget drain — ranked by revenue impact.', href:'/platform/meta' },
                { icon:SiGoogleads, c:'#4285F4', t:'Google Ads', d:'Quality scores, impression share, keyword overlap and bid strategy health — monitored daily.', href:'/platform/google' },
                { icon:FaAmazon, c:'#FF9900', t:'Amazon Ads', d:'ACOS creep, auto vs manual overlap, spend concentration and missing keywords — caught early.', href:'/platform/amazon' },
              ].map(({ icon: Icon, c, t, d, href }) => (
                <div key={t} className="io-stagger io-card io-card-hover p-6">
                  <span className="io-icon w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ background:`${c}14`, color:c }}><Icon className="w-5 h-5" /></span>
                  <h3 className="io-display text-lg font-semibold text-[var(--io-ink)] mb-1.5">{t}</h3>
                  <p className="text-sm text-[var(--io-ink-soft)] leading-relaxed mb-4">{d}</p>
                  <Link href={href} className="io-link text-[var(--io-ink)]">Learn more <ArrowRight className="w-3.5 h-3.5" /></Link>
                </div>
              ))}

              {/* Health score — tall */}
              <div className="io-stagger io-card io-card-hover p-6 md:row-span-2 flex flex-col">
                <span className="io-icon w-11 h-11 rounded-2xl bg-[var(--io-canvas)] flex items-center justify-center mb-5"><Shield className="w-5 h-5 text-[var(--io-accent)]" /></span>
                <h3 className="io-display text-lg font-semibold text-[var(--io-ink)] mb-1.5">Daily health score</h3>
                <p className="text-sm text-[var(--io-ink-soft)] leading-relaxed mb-6">One number per platform. Know exactly where to focus today.</p>
                <div className="mt-auto rounded-2xl p-5 text-white flex items-center gap-4" style={{ background: 'radial-gradient(100% 100% at 0% 0%, #3B5BFD, transparent 70%), radial-gradient(100% 100% at 100% 100%, #7C3AED, transparent 70%), #1C1830' }}>
                  <div className="relative flex items-center justify-center shrink-0">
                    <ScoreRing score={heroScore} size={96} />
                    <span className="absolute io-display text-2xl font-semibold tabular-nums">{heroScore}</span>
                  </div>
                  <div className="text-xs space-y-1.5">
                    <p className="text-white/70">Meta <b className="text-white">64</b></p>
                    <p className="text-white/70">Google <b className="text-white">58</b></p>
                    <p className="text-white/70">Amazon <b className="text-white">71</b></p>
                  </div>
                </div>
              </div>

              {/* Alerts — phone mock */}
              <div className="io-stagger io-card io-card-hover p-6 md:row-span-2 flex flex-col overflow-hidden">
                <span className="io-icon w-11 h-11 rounded-2xl bg-[var(--io-canvas)] flex items-center justify-center mb-5"><Bell className="w-5 h-5 text-[var(--io-accent)]" /></span>
                <h3 className="io-display text-lg font-semibold text-[var(--io-ink)] mb-1.5">Instant alerts</h3>
                <p className="text-sm text-[var(--io-ink-soft)] leading-relaxed mb-6">Critical issues reach you by email and Slack the moment they appear.</p>
                <div className="mt-auto mx-auto w-[210px] rounded-t-[30px] border-[6px] border-b-0 border-[var(--io-ink)] bg-[var(--io-canvas)] px-3 pt-6 pb-3 -mb-6 space-y-2">
                  {[['Pixel stopped firing','Google Ads','now'],['ACOS above 60%','Amazon Ads','4m'],['Frequency 4.8','Meta Ads','12m']].map(([t,s,w], i) => (
                    <div key={t} className="io-bubble rounded-xl bg-white p-2.5 shadow-sm" style={{ animationDelay:`${i * .2}s` }}>
                      <div className="flex justify-between text-[9px] text-[var(--io-ink-soft)] mb-0.5"><span className="font-semibold uppercase tracking-wide">{s}</span><span>{w}</span></div>
                      <p className="text-[11px] font-semibold text-[var(--io-ink)]">{t}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI fixes */}
              <div className="io-stagger io-card io-card-hover p-6">
                <span className="io-icon w-11 h-11 rounded-2xl bg-[var(--io-canvas)] flex items-center justify-center mb-5"><Cpu className="w-5 h-5 text-[var(--io-accent)]" /></span>
                <h3 className="io-display text-lg font-semibold text-[var(--io-ink)] mb-1.5">AI-written fixes</h3>
                <p className="text-sm text-[var(--io-ink-soft)] leading-relaxed">Plain-English, step-by-step fixes powered by Claude AI.</p>
              </div>
              <div className="io-stagger io-card io-card-hover p-6">
                <span className="io-icon w-11 h-11 rounded-2xl bg-[var(--io-canvas)] flex items-center justify-center mb-5"><TrendingUp className="w-5 h-5 text-[var(--io-accent)]" /></span>
                <h3 className="io-display text-lg font-semibold text-[var(--io-ink)] mb-1.5">Revenue impact</h3>
                <p className="text-sm text-[var(--io-ink-soft)] leading-relaxed">Every issue shows its estimated monthly cost from your actual spend.</p>
              </div>

              {[
                { icon:FileText, t:'Audit reports', d:'One-click, white-label PDF reports clients trust.' },
                { icon:Activity, t:'30 checks every sync', d:'Fatigue, zero-conversion spend, tracking breaks and more.' },
                { icon:Mail,     t:'Weekly digest', d:'A Monday summary of what changed and what to fix next.' },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="io-stagger io-card io-card-hover p-6 flex items-start gap-4">
                  <span className="io-icon w-11 h-11 rounded-2xl bg-[var(--io-canvas)] flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-[var(--io-accent)]" /></span>
                  <span>
                    <span className="io-display block text-base font-semibold text-[var(--io-ink)] mb-1">{t}</span>
                    <span className="block text-sm text-[var(--io-ink-soft)] leading-relaxed">{d}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What brands achieve (expanding gallery) ─── */}
        <section id="results" className="pb-24 sm:pb-32 px-5 sm:px-6">
          <div ref={r4} className="io-reveal max-w-[1180px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="io-display text-[1.9rem] sm:text-[2.6rem] font-medium text-[var(--io-ink)] tracking-[-0.02em]">What brands achieve with Adnexusone</h2>
              <p className="text-[var(--io-ink-soft)] text-base sm:text-lg max-w-2xl mx-auto mt-4">1,000+ D2C brands and agencies trust Adnexusone to stop wasted spend and become unstoppable on every channel.</p>
              <Link href="/case-studies" className="io-link text-[var(--io-ink)] mt-5">See all case studies <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>

            {/* Desktop gallery */}
            <div className="io-gallery hidden md:flex">
              {CASE_STUDIES.map(({ metric, label, brand, platform: p, quote, hue }, i) => (
                <div key={brand} data-active={gallery === i} onMouseEnter={() => setGallery(i)} onClick={() => setGallery(i)}
                  className="io-spot-dark relative overflow-hidden rounded-[28px] cursor-pointer text-white"
                  style={{ background: `radial-gradient(120% 90% at 100% 0%, ${hue[1]}, transparent 60%), radial-gradient(120% 90% at 0% 100%, ${hue[0]}, transparent 60%), #14112B` }}>
                  <Ridges className="absolute left-0 right-0 bottom-0 w-full h-[45%] opacity-80" glow={false} id={`g${i}`} />
                  <div className="io-g-mini absolute inset-0 px-3 flex flex-col items-center justify-center text-center" style={{ background: 'radial-gradient(90% 45% at 50% 50%, rgba(11,10,20,.7), transparent 75%)' }}>
                    <p className="io-display text-3xl font-semibold">{metric}</p>
                    <p className="text-[11px] font-medium leading-snug text-white/75 mt-2">{label}</p>
                    <p className="text-[10px] uppercase tracking-[0.12em] leading-snug text-white/55 mt-2">{brand}</p>
                  </div>
                  <div className="io-g-body absolute inset-0 p-8 flex flex-col">
                    <span className="absolute top-8 left-8 text-[11px] font-semibold bg-white/15 rounded-full px-3 py-1 backdrop-blur">{p}</span>
                    <div className="my-auto max-w-md">{/* vertically centred, matching the narrow panels */}
                      <p className="io-display text-6xl font-semibold leading-none">{metric}</p>
                      <p className="text-lg font-medium mt-2">{label}</p>
                      <p className="text-sm text-white/75 leading-relaxed mt-4 mb-2">&ldquo;{quote}&rdquo;</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-white/60 mb-6">{brand}</p>
                      <Link href="/case-studies" className="io-btn bg-white text-[var(--io-ink)] !py-2.5">Read case study <ArrowRight className="io-arrow w-3.5 h-3.5" /></Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 px-5">
              {CASE_STUDIES.map(({ metric, label, brand, platform: p, quote, hue }, i) => (
                <div key={brand} className="relative snap-center shrink-0 w-[82vw] h-[420px] overflow-hidden rounded-[28px] text-white p-6 flex flex-col"
                  style={{ background: `radial-gradient(120% 90% at 100% 0%, ${hue[1]}, transparent 60%), radial-gradient(120% 90% at 0% 100%, ${hue[0]}, transparent 60%), #14112B` }}>
                  <Ridges className="absolute left-0 right-0 bottom-0 w-full h-[40%] opacity-70" glow={false} id={`m${i}`} />
                  <span className="absolute top-6 left-6 text-[11px] font-semibold bg-white/15 rounded-full px-3 py-1">{p}</span>
                  <div className="relative my-auto pt-6">{/* vertically centred on mobile */}
                    <p className="io-display text-5xl font-semibold">{metric}</p>
                    <p className="font-medium mt-1">{label}</p>
                    <p className="text-sm text-white/75 leading-relaxed mt-3">&ldquo;{quote}&rdquo;</p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/60 mt-3">{brand}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Loved by brands ─────────────────────────── */}
        <section className="pb-24 sm:pb-32">
          <div ref={r5} className="io-reveal">
            <div className="text-center px-5 mb-8">
              <h2 className="io-display text-[1.9rem] sm:text-[2.6rem] font-medium text-[var(--io-ink)] tracking-[-0.02em]">Loved by brands, trusted by agencies</h2>
              <p className="text-[var(--io-ink-soft)] text-base sm:text-lg max-w-2xl mx-auto mt-4">From solo founders to agencies managing 25 brand accounts — rated 4.9 out of 5.</p>
            </div>
            <div className="flex items-center justify-between max-w-[1180px] mx-auto px-5 sm:px-6 mb-6 gap-4">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {(['All','Brands','Agencies','Founders'] as const).map(g => (
                  <button key={g} className="io-tab" data-active={testiGroup === g} onClick={() => { setTestiGroup(g); testiRef.current?.scrollTo({ left: 0 }) }}>{g}</button>
                ))}
              </div>
              <div className="hidden sm:flex gap-2 shrink-0">
                <button aria-label="Previous" onClick={() => scrollBy(testiRef.current, -1)} className="w-11 h-11 rounded-full border border-[var(--io-ink)]/20 flex items-center justify-center hover:bg-[var(--io-ink)] hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /></button>
                <button aria-label="Next" onClick={() => scrollBy(testiRef.current, 1)} className="w-11 h-11 rounded-full border border-[var(--io-ink)]/20 flex items-center justify-center hover:bg-[var(--io-ink)] hover:text-white transition-colors"><ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="max-w-[1180px] mx-auto px-5 sm:px-6">
            <div ref={testiRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pt-2 pb-4 -mt-2">
              {testimonials.map(({ role, company, quote }, i) => (
                <figure key={`${testiGroup}-${i}`} className="io-bubble io-card io-card-hover snap-start shrink-0 w-[85%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] p-7 flex flex-col" style={{ animationDelay: `${i * .06}s` }}>
                  <Quote className="w-7 h-7 text-[var(--io-accent)] mb-5" />
                  <blockquote className="io-display text-lg text-[var(--io-ink)] leading-snug mb-6">{quote}</blockquote>
                  <figcaption className="mt-auto flex items-center justify-between pt-5 border-t border-[var(--io-line)]">
                    <span><span className="block text-sm font-semibold text-[var(--io-ink)]">{role}</span><span className="block text-xs text-[var(--io-ink-soft)]">{company}</span></span>
                    <span className="flex">{[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────── */}
        <section id="pricing" className="pb-24 sm:pb-32 px-5 sm:px-6">
          <div ref={r6} className="io-reveal max-w-[1180px] mx-auto">
            <div className="text-center mb-14">
              <Eyebrow lead="Simple pricing.">Start free, scale when you grow.</Eyebrow>
              <p className="text-[var(--io-ink-soft)] text-base sm:text-lg max-w-xl mx-auto mt-5">No long-term contracts. No per-seat fees. Cancel anytime.</p>
            </div>
            <div ref={priceRef} onScroll={onPriceScroll} className="relative flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0 pt-2 pb-6 md:pt-0 md:pb-0">
              {PRICING_PLANS.map(({ name, price, per, desc, features, cta, href, highlight, custom }) => (
                <div key={name} className={`io-stagger relative h-full rounded-[28px] p-7 flex flex-col snap-center shrink-0 w-[84%] sm:w-[60%] md:w-auto ${highlight ? 'io-spot-dark text-white shadow-[0_30px_70px_-30px_rgba(59,91,253,.7)] transition-transform duration-500 hover:-translate-y-1.5' : 'io-card io-card-hover'}`}
                  style={highlight ? { background: 'radial-gradient(120% 70% at 100% 0%, rgba(124,58,237,.6), transparent 60%), radial-gradient(120% 70% at 0% 100%, rgba(59,91,253,.55), transparent 60%), var(--io-ink)' } : undefined}>
                  {highlight && <span className="absolute top-6 right-6 text-[10px] font-bold uppercase tracking-wider bg-white text-[var(--io-ink)] rounded-full px-2.5 py-1">Most popular</span>}
                  <p className={`text-sm font-semibold mb-4 ${highlight ? 'text-white/80' : 'text-[var(--io-ink-soft)]'}`}>{name}</p>
                  {custom
                    ? <p className="io-display text-4xl font-semibold">Custom</p>
                    : <p className="io-display text-4xl font-semibold tabular-nums"><span className="text-xl align-top mr-0.5">$</span>{price}</p>}
                  <p className={`text-xs mt-1 mb-4 ${highlight ? 'text-white/60' : 'text-[var(--io-ink-soft)]'}`}>{per}</p>
                  <p className={`text-sm leading-relaxed mb-6 min-h-[4.5rem] ${highlight ? 'text-white/75' : 'text-[var(--io-ink-soft)]'}`}>{desc}</p>
                  <Link href={href} className={`io-btn w-full mb-6 ${highlight ? 'bg-white text-[var(--io-ink)]' : custom ? 'io-btn-ghost text-[var(--io-ink)]' : 'io-btn-dark'}`}>{cta} <ArrowRight className="io-arrow w-3.5 h-3.5" /></Link>
                  <ul className="space-y-2.5 flex-1">
                    {features.map(f => (
                      <li key={f} className={`flex items-center gap-2.5 text-sm ${highlight ? 'text-white/90' : 'text-[var(--io-ink)]'}`}>
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${highlight ? 'text-violet-300' : 'text-[var(--io-accent)]'}`} />{f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setExpandedPlan(name)}
                    className={`group flex items-center gap-1.5 text-xs font-semibold mt-6 pt-4 border-t ${highlight ? 'border-white/15 text-white/80 hover:text-white' : 'border-[var(--io-line)] text-[var(--io-ink)] hover:text-[var(--io-accent)]'}`}>
                    See all features
                    <Plus className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-90" />
                  </button>
                </div>
              ))}
            </div>

            {/* Mobile carousel dots */}
            <div className="flex md:hidden justify-center gap-1.5 mt-1">
              {PRICING_PLANS.map(({ name }, i) => (
                <button key={name} aria-label={`Show ${name} plan`} onClick={() => goToPlan(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${priceIdx === i ? 'w-6 bg-[var(--io-ink)]' : 'w-1.5 bg-[var(--io-ink)]/25'}`} />
              ))}
            </div>

            {/* All-features pop-up */}
            {openPlan && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="plan-dialog-title">
                <button aria-label="Close" onClick={() => setExpandedPlan(null)} className="absolute inset-0 bg-[#0B0A14]/60 backdrop-blur-sm io-fade" style={{ animationDuration: '.3s' }} />
                <div className="io-pop relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-[28px] bg-white text-[var(--io-ink)] shadow-[0_40px_100px_-30px_rgba(11,10,20,.6)]" style={{ animationDuration: '.45s' }}>
                  <div className="relative p-7 pb-6 text-white rounded-t-[28px]" style={{ background: 'radial-gradient(120% 90% at 100% 0%, rgba(124,58,237,.75), transparent 60%), radial-gradient(120% 90% at 0% 100%, rgba(59,91,253,.7), transparent 60%), var(--io-ink)' }}>
                    <button onClick={() => setExpandedPlan(null)} aria-label="Close" className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"><X className="w-4 h-4" /></button>
                    <p className="text-sm font-semibold text-white/75 mb-2">{openPlan.name} plan</p>
                    <p id="plan-dialog-title" className="io-display text-4xl font-semibold">
                      {openPlan.custom ? 'Custom' : <><span className="text-xl align-top mr-0.5">$</span>{openPlan.price}</>}
                      <span className="text-sm font-normal text-white/65 ml-2">{openPlan.per}</span>
                    </p>
                    <p className="text-sm text-white/75 mt-3 leading-relaxed">{openPlan.desc}</p>
                  </div>
                  <div className="p-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--io-ink-soft)] mb-4">Everything included</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 mb-7">
                      {[...openPlan.features, ...openPlan.allFeatures].map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-sm"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[var(--io-accent)]" />{f}</li>
                      ))}
                    </ul>
                    <Link href={openPlan.href} className="io-btn io-btn-primary w-full">{openPlan.cta} <ArrowRight className="io-arrow w-3.5 h-3.5" /></Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Integrate seamlessly ────────────────────── */}
        <section className="pb-24 sm:pb-32">
          <div ref={r7} className="io-reveal">
            <div className="text-center px-5 mb-12">
              <h2 className="io-display text-[1.9rem] sm:text-[2.6rem] font-medium text-[var(--io-ink)] tracking-[-0.02em]">Integrate seamlessly</h2>
              <p className="text-[var(--io-ink-soft)] text-base sm:text-lg max-w-xl mx-auto mt-4">Connect your ad accounts with one-click OAuth and get alerts where your team already works. No credentials stored.</p>
              <Link href="/platform" className="io-link text-[var(--io-ink)] mt-5">Explore integrations <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="space-y-4 io-fade-x io-marquee-wrap overflow-hidden">
              {[0, 1, 2].map(row => {
                const items = [...INTEGRATIONS.slice(row * 3), ...INTEGRATIONS.slice(0, row * 3)]
                return (
                  <div key={row} className={`io-marquee gap-4 ${row === 1 ? 'io-marquee-rev' : ''}`} style={{ animationDuration: `${50 + row * 8}s` }}>
                    {[...items, ...items, ...items, ...items].map(({ name, icon: Icon, color }, i) => (
                      <span key={i} title={name} className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full bg-white border border-[var(--io-line)] flex items-center justify-center shrink-0 shadow-sm hover:scale-110 transition-transform duration-500" style={{ color }}>
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                      </span>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Explore resources (dark) ────────────────── */}
        <section className="relative text-white py-24 sm:py-28 overflow-hidden rounded-t-[40px] sm:rounded-t-[56px]" style={{ background: 'var(--io-night)' }}>
          <div ref={r8} className="io-reveal">
            <div className="max-w-[1180px] mx-auto px-5 sm:px-6 flex items-end justify-between gap-4 mb-10">
              <h2 className="io-display text-[1.9rem] sm:text-[2.6rem] font-medium tracking-[-0.02em]">Explore resources</h2>
              <div className="flex gap-2 shrink-0">
                <button aria-label="Previous" onClick={() => scrollBy(resRef.current, -1)} className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center hover:bg-white hover:text-[var(--io-ink)] transition-colors"><ArrowLeft className="w-4 h-4" /></button>
                <button aria-label="Next" onClick={() => scrollBy(resRef.current, 1)} className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center hover:bg-white hover:text-[var(--io-ink)] transition-colors"><ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="max-w-[1180px] mx-auto px-5 sm:px-6">
            <div ref={resRef} className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
              {RESOURCES.map(({ tag, title, desc, href, icon: Icon, hue, art }, i) => (
                <Link key={title} href={href} className="group snap-start shrink-0 w-[78%] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]">
                  <div className="io-tilt io-spot-dark relative aspect-[4/5] rounded-[24px] overflow-hidden mb-5" style={{ background: `radial-gradient(110% 80% at 100% 0%, ${hue[1]}, transparent 60%), radial-gradient(110% 80% at 0% 100%, ${hue[0]}, transparent 60%), #14112B` }}>
                    <Ridges className="absolute left-0 right-0 bottom-0 w-full h-[30%] transition-transform duration-700 group-hover:scale-110 origin-bottom" glow={false} id={`res${i}`} />
                    <div className="absolute inset-0 p-5 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold bg-white/15 backdrop-blur rounded-full px-3 py-1">{tag}</span>
                        <span className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center"><Icon className="w-4 h-4" /></span>
                      </div>
                      <div className="flex-1 flex items-center justify-center transition-transform duration-700 group-hover:-translate-y-1.5" style={{ transitionTimingFunction: 'var(--io-ease)' }}>
                        <ResourceArt art={art} />
                      </div>
                      <p className="relative io-display text-xl font-semibold leading-tight">{title}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold mb-1 flex items-center gap-1.5">{tag} <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" /></p>
                  <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
                </Link>
              ))}
            </div>
            </div>
          </div>
        </section>
      </main>

      <LandingBottom />
    </div>
  )
}

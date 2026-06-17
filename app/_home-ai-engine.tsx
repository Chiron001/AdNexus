'use client'

import { useEffect, useState } from 'react'
import { Cpu } from 'lucide-react'
import { useReveal } from './_home-shared'

const SCAN_CHECKS = [
  { text: 'Creative fatigue — Ad Set #4',       val: '$510', c: 'bg-red-500/15 text-red-400' },
  { text: 'Broken pixel tracking',              val: '$460', c: 'bg-red-500/15 text-red-400' },
  { text: 'Frequency cap exceeded — 3 sets',   val: '$250', c: 'bg-amber-500/15 text-amber-400' },
  { text: 'Keyword cannibalization — 14 pairs', val: '$220', c: 'bg-amber-500/15 text-amber-400' },
  { text: 'High ACOS — Auto campaigns',         val: '$145', c: 'bg-yellow-500/15 text-yellow-500' },
  { text: 'Zero-conversion ASINs',              val: '$110', c: 'bg-yellow-500/15 text-yellow-500' },
  { text: 'Audience overlap — 6 ad sets',       val: '$85',  c: 'bg-yellow-500/15 text-yellow-500' },
  { text: 'Low quality score — 4 keywords',     val: '$73',  c: 'bg-zinc-500/15 text-zinc-400' },
  { text: 'Budget pacing off — Google Ads',     val: '$60',  c: 'bg-zinc-500/15 text-zinc-400' },
  { text: 'Landing page speed < 2s',            val: '$49',  c: 'bg-zinc-500/15 text-zinc-400' },
]

const AI_FIX_TEXT = 'Pause 3 fatigued creatives, upload 2 fresh variants with different visual angles, set frequency cap to 3/week. Expected: +0.8x ROAS recovery in 7 days.'

export default function AIEngineSection() {
  const sAI = useReveal()
  const [scanStep, setScanStep] = useState(0)
  const [aiTypedIdx, setAiTypedIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setScanStep(p => (p + 1) % 10), 1400)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (aiTypedIdx >= AI_FIX_TEXT.length) {
      const t = setTimeout(() => setAiTypedIdx(0), 2200)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setAiTypedIdx(p => p + 1), 38)
    return () => clearTimeout(t)
  }, [aiTypedIdx])

  return (
    <section id="ai-engine" className="py-20 sm:py-28 px-5 sm:px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.07] pointer-events-none" style={{ background:'radial-gradient(circle, rgba(139,92,246,1) 0%, transparent 70%)', filter:'blur(120px)' }} />

      <div className="max-w-6xl mx-auto">
        <div ref={sAI} className="reveal">

          {/* Header */}
          <div className="text-center mb-14 sm:mb-16 stagger-child">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/[0.08] text-xs font-bold text-purple-300 mb-5">
              <Cpu className="w-3 h-3" />
              AI Engine
            </div>
            <h2 className="text-[1.55rem] sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Intelligence that<br className="sm:hidden" /> never sleeps
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">Adnexusone AI watches every campaign 24/7, surfaces what costs you money, and tells your team exactly how to fix it.</p>
          </div>

          {/* Desktop bento grid */}
          <div className="hidden lg:grid gap-3 stagger-child" style={{ gridTemplateColumns:'1fr 1.9fr 1fr', gridTemplateRows:'280px 280px' }}>

            {/* Card 1: Live Scanner — col 1, row 1–2 */}
            <div className="glow-card rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col" style={{ gridColumn:'1', gridRow:'1 / 3', background:'rgba(6,8,18,0.98)' }}>
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"/>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"/>
                  </span>
                  <p className="text-[11px] font-bold tracking-wide text-white uppercase">Live Scanner</p>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 tracking-widest uppercase">Running</span>
              </div>
              {/* Scan rows — border always present to prevent layout shift */}
              <div className="p-3 space-y-1 shrink-0">
                {SCAN_CHECKS.map((item, i) => (
                  <div key={i} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-700 relative overflow-hidden border ${
                    i === scanStep
                      ? 'bg-white/[0.06] border-white/[0.08]'
                      : i < scanStep
                      ? 'border-transparent opacity-70'
                      : 'border-transparent opacity-30'
                  }`}>
                    {/* left accent */}
                    {i === scanStep && <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-400 to-blue-400 rounded-l-lg"/>}
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500 ${
                      i < scanStep ? 'bg-green-400' : i === scanStep ? 'bg-amber-400 animate-pulse' : 'bg-white/15'
                    }`}/>
                    <p className="text-[11px] text-gray-300 flex-1 truncate font-medium">{item.text}</p>
                    {/* badge: always rendered, opacity toggled — prevents layout shift */}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 font-mono transition-all duration-300 border ${item.c} border-current/20 ${
                      i <= scanStep ? 'opacity-100' : 'opacity-0'
                    }`}>{item.val}</span>
                  </div>
                ))}
              </div>
              {/* Spacer pushes progress to bottom */}
              <div className="flex-1"/>
              {/* Footer progress */}
              <div className="px-3 pb-4 pt-2 border-t border-white/[0.04] shrink-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">Scan progress</span>
                  <span className="text-[9px] text-purple-400 font-mono">{Math.round(((scanStep + 1) / SCAN_CHECKS.length) * 100)}%</span>
                </div>
                <div className="h-[2px] w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-purple-500 to-blue-400"
                    style={{ width:`${((scanStep + 1) / SCAN_CHECKS.length) * 100}%` }}/>
                </div>
              </div>
            </div>

            {/* Card 2: Central AI Orb — col 2, row 1–2 */}
            <div className="glow-card rounded-2xl border border-purple-500/20 relative overflow-hidden flex flex-col items-center justify-center py-10 gap-8" style={{ gridColumn:'2', gridRow:'1 / 3', background:'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(124,58,237,0.11) 0%, rgba(6,8,18,0.99) 70%)' }}>
              {/* Grid overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)', backgroundSize:'40px 40px' }}/>
              {/* Scan line sweep */}
              <div className="absolute left-0 right-0 h-px pointer-events-none" style={{ background:'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.5) 50%, transparent 100%)', animation:'scanLine 3s ease-in-out infinite', top:'40%' }}/>

              {/* Orb — outer wrapper includes ring overflow so pills below have breathing room */}
              <div className="relative" style={{ width:'240px', height:'240px' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative" style={{ width:'152px', height:'152px' }}>
                    <div className="absolute inset-[-44px] rounded-full border border-dashed border-purple-500/15 ai-ring-ccw"/>
                    <div className="absolute inset-[-22px] rounded-full border border-blue-400/18 ai-ring-cw"/>
                    <div className="absolute inset-[-8px] rounded-full border border-purple-400/10"/>
                    <div className="absolute inset-0 ai-orb rounded-full" style={{ background:'radial-gradient(circle, rgba(139,92,246,0.16) 0%, rgba(59,130,246,0.05) 65%, transparent 100%)' }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[68px] h-[68px] rounded-full flex items-center justify-center" style={{ background:'linear-gradient(135deg, rgba(139,92,246,0.28) 0%, rgba(59,130,246,0.18) 100%)', boxShadow:'0 0 60px rgba(139,92,246,0.4), 0 0 120px rgba(59,130,246,0.12)' }}>
                          <Cpu className="w-8 h-8 text-purple-200"/>
                        </div>
                      </div>
                    </div>
                    {/* Orbital data nodes */}
                    {[
                      { angle:0,   color:'#3b82f6' },
                      { angle:120, color:'#22c55e' },
                      { angle:240, color:'#f97316' },
                    ].map(({ angle, color }) => {
                      const r = 88
                      const rad = (angle - 90) * Math.PI / 180
                      return (
                        <div key={angle} className="absolute w-2.5 h-2.5 rounded-full border-2 border-zinc-900"
                          style={{ background: color, left:`calc(50% + ${Math.cos(rad) * r}px - 5px)`, top:`calc(50% + ${Math.sin(rad) * r}px - 5px)`, boxShadow:`0 0 10px ${color}88` }}/>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Platform pills */}
              <div className="flex gap-2 flex-wrap justify-center">
                {[
                  { label:'Meta Ads',   dot:'#3b82f6' },
                  { label:'Google Ads', dot:'#22c55e' },
                  { label:'Amazon Ads', dot:'#f97316' },
                  { label:'Reports',    dot:'#8b5cf6' },
                ].map(({ label, dot }) => (
                  <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.09] bg-white/[0.03] text-[11px] font-medium text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: dot }}/>
                    {label}
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex gap-0 divide-x divide-white/[0.08]">
                {[{val:'30',sub:'Checks/day'},{val:'3',sub:'Platforms'},{val:'24/7',sub:'Uptime'}].map(({ val, sub }) => (
                  <div key={sub} className="text-center px-6">
                    <p className="text-2xl font-black text-white font-mono tabular-nums">{val}</p>
                    <p className="text-[9px] text-gray-600 uppercase tracking-[0.15em] mt-0.5 font-medium">{sub}</p>
                  </div>
                ))}
              </div>

              <p className="absolute bottom-3 text-[9px] text-white/[0.12] font-bold uppercase tracking-[0.25em]">Adnexusone AI Engine</p>
            </div>

            {/* Card 3: AI Fix Generator — col 3, row 1 */}
            <div className="glow-card rounded-2xl border border-purple-500/20 overflow-hidden" style={{ gridColumn:'3', gridRow:'1', background:'rgba(6,8,18,0.98)' }}>
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center">
                  <Cpu className="w-3 h-3 text-purple-300"/>
                </div>
                <p className="text-[11px] font-bold tracking-wide text-white uppercase">AI Fix Generator</p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-red-500/12 text-red-400 rounded-full border border-red-500/20 uppercase tracking-wide">Critical</span>
                  <span className="text-[9px] text-gray-500 font-mono">$510 at risk</span>
                </div>
                <p className="text-[11px] font-semibold text-white mb-3 leading-snug">Creative Fatigue<br/><span className="text-gray-400 font-normal">Meta Ad Set #4</span></p>
                <div className="text-[10px] text-gray-300 leading-relaxed font-mono bg-white/[0.025] rounded-xl p-3 min-h-[88px] border border-white/[0.05] relative">
                  <span className="text-purple-400/60 select-none mr-1">›</span>
                  {AI_FIX_TEXT.slice(0, aiTypedIdx)}
                  <span className="type-cursor"/>
                </div>
              </div>
            </div>

            {/* Card 4: Platform Health — col 3, row 2 */}
            <div className="glow-card rounded-2xl border border-white/[0.07] overflow-hidden" style={{ gridColumn:'3', gridRow:'2', background:'rgba(6,8,18,0.98)' }}>
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-[11px] font-bold tracking-wide text-white uppercase">Platform Health</p>
                <span className="text-[9px] text-gray-600 font-mono">/100</span>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { name:'Meta',   score:64, color:'#f59e0b', status:'At Risk'  },
                  { name:'Google', score:58, color:'#ef4444', status:'Critical' },
                  { name:'Amazon', score:71, color:'#22c55e', status:'Moderate' },
                ].map(({ name, score, color, status }) => (
                  <div key={name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-300 font-medium">{name}</span>
                        <span className="text-[9px] text-gray-600">{status}</span>
                      </div>
                      <span className="text-[13px] font-black tabular-nums font-mono" style={{ color }}>{score}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${score}%`, background:`linear-gradient(90deg, ${color}99, ${color})` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Revenue at Risk — full-width strip below grid */}
          <div className="hidden lg:block stagger-child mt-4">
            <div className="glow-card rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background:'rgba(6,8,18,0.97)' }}>
              <div className="px-6 py-4 flex items-center gap-8">
                <div className="shrink-0">
                  <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mb-0.5">Revenue at Risk</p>
                  <p className="text-3xl font-black text-white tabular-nums font-mono leading-none">$3,050</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">estimated monthly loss</p>
                </div>
                <div className="flex-1 h-px bg-white/[0.05]"/>
                {[
                  { label:'Meta issues',   val:'$1,200', dot:'bg-blue-500',   pct: 40 },
                  { label:'Google issues', val:'$1,010', dot:'bg-green-500',  pct: 33 },
                  { label:'Amazon issues', val:'$625',   dot:'bg-orange-500', pct: 21 },
                ].map(({ label, val, dot, pct }) => (
                  <div key={label} className="shrink-0 min-w-[110px]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`}/>
                      <span className="text-[10px] text-gray-400">{label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-[13px] font-bold text-white font-mono">{val}</span>
                      <span className="text-[9px] text-gray-600 font-mono">{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-[2px] w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${dot}`} style={{ width:`${pct}%` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: stacked layout */}
          <div className="lg:hidden stagger-child space-y-4">

            {/* Central AI orb */}
            <div className="rounded-2xl border border-purple-500/25 relative overflow-hidden px-8 pt-10 pb-8 flex flex-col items-center" style={{ background:'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(124,58,237,0.13) 0%, rgba(8,10,20,0.99) 100%)' }}>
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage:'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)', backgroundSize:'32px 32px' }} />
              <div className="relative" style={{ width:'184px', height:'184px', marginBottom:'24px' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative" style={{ width:'120px', height:'120px' }}>
                    <div className="absolute inset-[-32px] rounded-full border border-dashed border-purple-500/20 ai-ring-ccw" />
                    <div className="absolute inset-[-16px] rounded-full border border-blue-500/25 ai-ring-cw" />
                    <div className="absolute inset-0 ai-orb rounded-full" style={{ background:'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 100%)' }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background:'rgba(139,92,246,0.22)', boxShadow:'0 0 40px rgba(139,92,246,0.3)' }}>
                          <Cpu className="w-7 h-7 text-purple-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-center mb-6">
                {[{label:'Meta',dot:'#2563eb'},{label:'Google',dot:'#16a34a'},{label:'Amazon',dot:'#f97316'}].map(({ label, dot }) => (
                  <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.10] bg-white/[0.04] text-xs font-semibold text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />{label}
                  </div>
                ))}
              </div>
              <div className="flex gap-10 justify-center mt-2">
                {[{val:'30',label:'Checks'},{val:'3',label:'Platforms'},{val:'24/7',label:'Uptime'}].map(({ val, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-black text-purple-200">{val}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Scanner */}
            <div className="rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background:'rgba(8,10,20,0.97)' }}>
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs font-bold text-white">Live Scanner</p>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-md">Running</span>
              </div>
              <div className="p-3 space-y-1.5">
                {SCAN_CHECKS.slice(0, 4).map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-500 border ${i === scanStep % 4 ? 'bg-white/[0.08] border-white/[0.08]' : 'border-transparent opacity-50'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i <= scanStep % 4 ? 'bg-green-400' : 'bg-white/20'}`} />
                    <p className="text-[11px] text-gray-300 flex-1 truncate">{item.text}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${item.c} transition-opacity duration-300 ${i <= scanStep % 4 ? 'opacity-100' : 'opacity-0'}`}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Health + Revenue */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background:'rgba(8,10,20,0.97)' }}>
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-xs font-bold text-white">Health</p>
                </div>
                <div className="p-3 space-y-2.5">
                  {[{name:'Meta',score:64,color:'#f59e0b'},{name:'Google',score:58,color:'#ef4444'},{name:'Amazon',score:71,color:'#22c55e'}].map(({ name, score, color }) => (
                    <div key={name}>
                      <div className="flex justify-between mb-0.5"><span className="text-[11px] text-gray-400">{name}</span><span className="text-[11px] font-black" style={{ color }}>{score}</span></div>
                      <div className="h-1.5 rounded-full bg-white/[0.07]"><div className="h-full rounded-full" style={{ width:`${score}%`, background:color }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-green-500/20 overflow-hidden" style={{ background:'rgba(8,10,20,0.97)' }}>
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-xs font-bold text-white">At Risk</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl font-black text-white mb-0.5">$3,050</p>
                  <p className="text-[10px] text-gray-500 mb-3">per month</p>
                  {[{label:'Meta',val:'$1,200',c:'bg-blue-500'},{label:'Google',val:'$1,010',c:'bg-green-500'},{label:'Amazon',val:'$625',c:'bg-orange-500'}].map(({ label, val, c }) => (
                    <div key={label} className="flex items-center gap-1.5 mb-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${c}`} />
                      <span className="text-[10px] text-gray-500 flex-1">{label}</span>
                      <span className="text-[10px] font-bold text-white">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

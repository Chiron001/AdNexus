'use client'

import { useState } from 'react'
import { Brain, TrendingDown, TrendingUp, AlertCircle, Zap, ChevronRight, Send } from 'lucide-react'

const insights = [
  {
    id: 1, type: 'opportunity', severity: 'high',
    title: 'Scale UGC Review Reel — ROAS 5.8x with low frequency',
    summary: 'Your "UGC Review — Reel" creative has maintained a 5.8x ROAS for 12 days with frequency still at 1.8. Audience not saturated — increasing budget by ₹10k/day could yield ₹58k additional revenue daily.',
    action: 'Increase daily budget by ₹10,000 on this ad set',
    impact: '+₹58k/day estimated',
    platform: 'Meta',
  },
  {
    id: 2, type: 'warning', severity: 'high',
    title: 'ROAS drop detected on Google Shopping — down 28% in 72hrs',
    summary: 'Google Shopping ROAS has fallen from 5.1x to 3.7x over the last 72 hours. Primary driver: competitor CPCs have increased 35% for your top 3 keywords. Recommend bid adjustment and negative keyword review.',
    action: 'Review bidding strategy + add negative keywords',
    impact: '-₹22k/week if unaddressed',
    platform: 'Google',
  },
  {
    id: 3, type: 'warning', severity: 'medium',
    title: '4 creatives in fatigue zone — CTR declining with frequency > 5',
    summary: 'Static Banner — Offer (freq 6.2), Testimonial — Static (freq 5.5), Founder Story (freq 4.8), and Collection Drop (freq 8.1) are showing declining CTR. Refreshing these creatives could recover 0.8–1.2% CTR.',
    action: 'Pause bottom 2 creatives, refresh top 2',
    impact: '+1.1% avg CTR recovery',
    platform: 'Meta',
  },
  {
    id: 4, type: 'opportunity', severity: 'medium',
    title: 'Amazon Sponsored Products underbudgeted — losing impression share',
    summary: 'Your Amazon SP campaigns are losing 38% impression share due to budget constraints. Peak purchase hours (7–10pm) are running out of budget. Increasing by ₹5k/day would capture estimated 180 additional purchases.',
    action: 'Increase Amazon SP daily budget by ₹5,000',
    impact: '+₹28k/week estimated',
    platform: 'Amazon',
  },
  {
    id: 5, type: 'info', severity: 'low',
    title: 'Diwali season approaching — prep creative pipeline by Oct 1',
    summary: 'Based on last year\'s data, your ROAS improved 2.4x during Diwali (Oct 15–Nov 5). Recommend launching 3–4 Diwali-specific creatives 2 weeks early and increasing total budget by 40%.',
    action: 'Create Diwali creative brief',
    impact: '+2.4x ROAS potential',
    platform: 'All',
  },
]

const typeConfig = {
  opportunity: { icon: TrendingUp,   color: 'text-emerald-400', bg: 'bg-emerald-400/8 border-emerald-400/20',  label: 'Opportunity' },
  warning:     { icon: TrendingDown,  color: 'text-orange-400',  bg: 'bg-orange-400/8 border-orange-400/20',   label: 'Warning'     },
  info:        { icon: AlertCircle,   color: 'text-blue-400',    bg: 'bg-blue-400/8 border-blue-400/20',       label: 'Info'        },
}

const quickAnswers = [
  'Why did my ROAS drop this week?',
  'Which campaign should I scale?',
  'Where am I wasting budget?',
  'What creatives should I pause?',
]

export default function AIPage() {
  const [chat, setChat] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send(msg?: string) {
    const text = msg || input.trim()
    if (!text) return
    setChat(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    const responses: Record<string, string> = {
      'Why did my ROAS drop this week?': 'Your blended ROAS dropped 0.3x this week primarily due to Google Shopping — CPCs for your top 3 keywords rose 35% as competitors increased bids. Meta ROAS is stable at 4.6x. Recommend adjusting Google bid strategy to Target ROAS 4.0x and reviewing negative keywords.',
      'Which campaign should I scale?': 'Top candidate: Meta "UGC Review — Reel" ad set — ROAS 5.8x, frequency only 1.8, audience still has room. Increasing budget by ₹10k/day is estimated to return ₹58k/day. Second pick: Amazon Sponsored Products — losing impression share due to budget cap.',
      'Where am I wasting budget?': 'I found ₹48k in likely wasted spend: (1) Brand Awareness Tier-3 Meta campaign — ₹18.4k spend, 0 conversions in 14 days. (2) Google retargeting 180-day window — CPA is 8x your target. (3) Google broad match keywords — low search term relevance costing ₹9.8k.',
      'What creatives should I pause?': 'Recommend pausing: "Collection Drop — Image" (freq 8.1, ROAS 2.9x, score 22/100) and "Static Banner — Offer" (freq 6.2, CTR 1.9%, declining). Consider refreshing "Founder Story — Video 30s" — good concept but needs a stronger hook in the first 3 seconds.',
    }
    const reply = responses[text] || `Based on your account data, here's what I found: Your campaigns are generally performing well with a blended 4.43x ROAS. The main areas to focus on are creative fatigue on 3 Meta campaigns, Google Shopping bid pressure, and uncapped Amazon budget during peak hours. Would you like me to go deeper on any of these?`
    setChat(prev => [...prev, { role: 'ai', text: reply }])
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-500/15 border border-purple-500/25 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-purple-400"/>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Insights</h1>
          <p className="text-zinc-400 text-sm">Powered by Claude claude-sonnet-4-6 · Analyses your live ad data</p>
        </div>
      </div>

      {/* Quick Wins */}
      <div className="bg-gradient-to-r from-purple-500/8 to-blue-500/8 border border-purple-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-yellow-400"/>
          <p className="text-sm font-semibold text-white">Quick Wins This Week</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { action: 'Scale UGC Reel budget +₹10k/day', impact: '+₹58k revenue/day', easy: true },
            { action: 'Pause 2 fatigued creatives',       impact: 'Save ₹25k/week',    easy: true },
            { action: 'Fix Google negative keywords',     impact: 'Save ₹9.8k/month',  easy: true },
          ].map(w => (
            <div key={w.action} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
              <p className="text-xs text-white font-medium">{w.action}</p>
              <p className="text-xs text-emerald-400 font-mono mt-1">{w.impact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insight Cards */}
      <div>
        <p className="text-sm font-semibold text-white mb-3">All Insights ({insights.length})</p>
        <div className="space-y-3">
          {insights.map(ins => {
            const cfg = typeConfig[ins.type as keyof typeof typeConfig]
            const Icon = cfg.icon
            return (
              <div key={ins.id} className={`border rounded-xl p-5 ${cfg.bg}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`}/>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[11px] font-bold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">{ins.platform}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${ins.severity === 'high' ? 'bg-red-400/10 text-red-400' : ins.severity === 'medium' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-zinc-800 text-zinc-400'}`}>
                          {ins.severity}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white mb-2">{ins.title}</p>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">{ins.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-zinc-500">Recommended:</span>
                          <span className="text-white font-medium">{ins.action}</span>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 shrink-0">{ins.impact}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0 mt-1"/>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Chat */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-800">
          <Brain className="w-4 h-4 text-purple-400"/>
          <p className="text-sm font-semibold text-white">Ask AI about your ad account</p>
        </div>

        {/* Quick question pills */}
        {chat.length === 0 && (
          <div className="px-5 py-4 flex flex-wrap gap-2">
            {quickAnswers.map(q => (
              <button key={q} onClick={() => send(q)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-full px-3 py-1.5 transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Chat messages */}
        {chat.length > 0 && (
          <div className="px-5 py-4 space-y-4 max-h-80 overflow-y-auto">
            {chat.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'ai' && (
                  <div className="w-7 h-7 bg-purple-500/15 border border-purple-500/25 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Brain className="w-3.5 h-3.5 text-purple-400"/>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-purple-500/15 border border-purple-500/20 text-white' : 'bg-zinc-800 text-zinc-200'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-purple-500/15 border border-purple-500/25 rounded-full flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-purple-400"/>
                </div>
                <div className="bg-zinc-800 rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="px-5 py-4 border-t border-zinc-800 flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything about your campaigns..."
            className="flex-1 bg-zinc-800 border border-zinc-700 text-sm text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600"
          />
          <button onClick={() => send()} className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-4 py-2.5 transition-colors">
            <Send className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  )
}

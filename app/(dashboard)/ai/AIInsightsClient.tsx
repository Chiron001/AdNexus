'use client'

import { useState } from 'react'
import { Brain, TrendingUp, TrendingDown, AlertCircle, Zap, ChevronRight, Send } from 'lucide-react'

interface Props {
  aiInsights: any[]
  recommendations: any[]
  issues: any[]
  accountCount: number
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  high:     'text-orange-400 bg-orange-400/10 border-orange-400/20',
  medium:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  low:      'text-zinc-400 bg-zinc-800 border-zinc-700',
}

const quickQuestions = [
  'What are my biggest issues right now?',
  'Which campaigns should I scale?',
  'Where am I wasting budget?',
  'What should I fix first?',
]

export function AIInsightsClient({ aiInsights, recommendations, issues, accountCount }: Props) {
  const [chat, setChat] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send(msg?: string) {
    const text = msg || input.trim()
    if (!text) return
    setChat(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      })
      const data = await res.json()
      setChat(prev => [...prev, { role: 'ai', text: data.answer ?? data.message ?? 'I couldn\'t generate a response. Please try again.' }])
    } catch {
      setChat(prev => [...prev, { role: 'ai', text: 'Unable to reach AI. Please check your connection and try again.' }])
    }
    setLoading(false)
  }

  const hasInsights = aiInsights.length > 0 || recommendations.length > 0 || issues.length > 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-500/15 border border-purple-500/25 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-purple-400"/>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Insights</h1>
          <p className="text-zinc-400 text-sm">Powered by Claude · {accountCount} account{accountCount !== 1 ? 's' : ''} analysed</p>
        </div>
      </div>

      {/* Top Issues as Quick Wins */}
      {issues.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/8 to-blue-500/8 border border-purple-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-400"/>
            <p className="text-sm font-semibold text-white">Top Issues Detected</p>
          </div>
          <div className="space-y-2">
            {issues.map(issue => (
              <div key={issue.id} className="flex items-start justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border mr-2 ${SEVERITY_COLOR[issue.severity] ?? ''}`}>
                    {issue.severity}
                  </span>
                  <span className="text-sm text-white font-medium">{issue.title}</span>
                  {issue.description && <p className="text-xs text-zinc-400 mt-1">{issue.description}</p>}
                </div>
                {issue.estimated_impact_inr > 0 && (
                  <span className="text-xs font-mono text-red-400 shrink-0 whitespace-nowrap">
                    -₹{(issue.estimated_impact_inr / 1000).toFixed(0)}k/mo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-white mb-3">AI Recommendations ({recommendations.length})</p>
          <div className="space-y-3">
            {recommendations.map((rec: any) => (
              <div key={rec.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0"/>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-1">{rec.title}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-2">{rec.explanation}</p>
                    {rec.estimated_impact && (
                      <span className="text-xs font-mono text-emerald-400">Est. impact: {rec.estimated_impact}</span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0"/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights from DB */}
      {aiInsights.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-white mb-3">AI Analysis ({aiInsights.length})</p>
          <div className="space-y-3">
            {aiInsights.map((ins: any) => (
              <div key={ins.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-start gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${ins.sentiment === 'positive' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : ins.sentiment === 'warning' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : ins.sentiment === 'critical' ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
                    {ins.sentiment}
                  </span>
                </div>
                <p className="text-sm font-medium text-white mb-1">{ins.title}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{ins.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasInsights && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <Brain className="w-10 h-10 text-zinc-600 mx-auto mb-3"/>
          <p className="text-sm font-medium text-white mb-1">No insights yet</p>
          <p className="text-xs text-zinc-400">Sync your accounts to generate AI insights and recommendations.</p>
        </div>
      )}

      {/* Ask AI Chat */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-800">
          <Brain className="w-4 h-4 text-purple-400"/>
          <p className="text-sm font-semibold text-white">Ask AI about your accounts</p>
        </div>

        {chat.length === 0 && (
          <div className="px-5 py-4 flex flex-wrap gap-2">
            {quickQuestions.map(q => (
              <button key={q} onClick={() => send(q)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-full px-3 py-1.5 transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        {chat.length > 0 && (
          <div className="px-5 py-4 space-y-4 max-h-80 overflow-y-auto">
            {chat.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'ai' && (
                  <div className="w-7 h-7 bg-purple-500/15 border border-purple-500/25 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Brain className="w-3.5 h-3.5 text-purple-400"/>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-purple-500/15 border border-purple-500/20 text-white' : 'bg-zinc-800 text-zinc-200'}`}>
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
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-5 py-4 border-t border-zinc-800 flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything about your ad accounts..."
            className="flex-1 bg-zinc-800 border border-zinc-700 text-sm text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 placeholder:text-zinc-600"
          />
          <button onClick={() => send()} disabled={loading} className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 transition-colors">
            <Send className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  )
}

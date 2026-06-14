'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import type { NotificationType } from '@/types/database'

type Target = 'all' | 'growth' | 'agency'

const inputCls = 'w-full rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }

export function BroadcastForm() {
  const [title,   setTitle]   = useState('')
  const [body,    setBody]    = useState('')
  const [target,  setTarget]  = useState<Target>('all')
  const [type,    setType]    = useState<NotificationType>('feature_update')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<{ ok: boolean; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res  = await fetch('/api/admin/notifications/broadcast', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title, body, target, type }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, message: `Sent to ${data.count} user${data.count !== 1 ? 's' : ''}` })
        setTitle('')
        setBody('')
      } else {
        setResult({ ok: false, message: data.error ?? 'Something went wrong' })
      }
    } catch {
      setResult({ ok: false, message: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Type</label>
          <select value={type} onChange={e => setType(e.target.value as NotificationType)} className={inputCls} style={inputStyle}>
            <option value="feature_update" style={{ background: '#0f0f1a' }}>Feature Update</option>
            <option value="ai_insight"     style={{ background: '#0f0f1a' }}>AI Insight</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Target Audience</label>
          <select value={target} onChange={e => setTarget(e.target.value as Target)} className={inputCls} style={inputStyle}>
            <option value="all"    style={{ background: '#0f0f1a' }}>All Users</option>
            <option value="growth" style={{ background: '#0f0f1a' }}>Growth Plan Only</option>
            <option value="agency" style={{ background: '#0f0f1a' }}>Professional Plan Only</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1.5">Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Notification title..."
          maxLength={80}
          className={inputCls}
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1.5">Message</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          placeholder="Write your message..."
          maxLength={500}
          className={`${inputCls} resize-none`}
          style={inputStyle}
        />
        <p className="text-[11px] text-zinc-600 mt-1 text-right">{body.length}/500</p>
      </div>

      {result && (
        <div className={`text-sm rounded-lg px-4 py-3 border ${result.ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {result.message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !title.trim() || !body.trim()}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
      >
        <Send className="w-4 h-4" />
        {loading ? 'Sending...' : 'Send Broadcast'}
      </button>
    </form>
  )
}

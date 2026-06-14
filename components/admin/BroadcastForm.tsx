'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import type { NotificationType } from '@/types/database'

type Target = 'all' | 'growth' | 'agency'

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as NotificationType)}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="feature_update">Feature Update</option>
            <option value="ai_insight">AI Insight</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Target Audience</label>
          <select
            value={target}
            onChange={e => setTarget(e.target.value as Target)}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Users</option>
            <option value="growth">Growth Plan Only</option>
            <option value="agency">Professional Plan Only</option>
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
          className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        <p className="text-[11px] text-zinc-400 mt-1 text-right">{body.length}/500</p>
      </div>

      {result && (
        <div className={`text-sm rounded-lg px-4 py-3 ${result.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {result.message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !title.trim() || !body.trim()}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
      >
        <Send className="w-4 h-4" />
        {loading ? 'Sending...' : 'Send Broadcast'}
      </button>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = [
  { value: 'free',         label: 'Free'         },
  { value: 'basic',        label: 'Basic'        },
  { value: 'growth',       label: 'Growth'       },
  { value: 'professional', label: 'Professional' },
  { value: 'custom',       label: 'Custom'       },
]

export function PlanChangeForm({ userId, currentPlan }: { userId: string; currentPlan: string }) {
  const router   = useRouter()
  const [plan,    setPlan]    = useState(currentPlan)
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (plan === currentPlan) return
    setLoading(true)
    setMsg('')
    try {
      const res  = await fetch(`/api/admin/users/${userId}/plan`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setMsg(data.error ?? 'Failed')
      } else {
        setMsg('Plan updated!')
        router.refresh()
      }
    } catch {
      setMsg('Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <select
        value={plan}
        onChange={e => setPlan(e.target.value)}
        className="rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
      >
        {PLANS.map(p => (
          <option key={p.value} value={p.value} style={{ background: '#0f0f1a' }}>{p.label}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading || plan === currentPlan}
        className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        style={{ background: 'rgba(124,58,237,0.8)' }}
      >
        {loading ? 'Saving…' : 'Apply'}
      </button>
      {msg && (
        <span className={`text-xs font-medium ${msg === 'Plan updated!' ? 'text-emerald-400' : 'text-red-400'}`}>
          {msg}
        </span>
      )}
    </form>
  )
}

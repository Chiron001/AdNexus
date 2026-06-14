'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = [
  { value: 'free',   label: 'Free',   cls: 'bg-zinc-100 text-zinc-600'     },
  { value: 'growth', label: 'Growth', cls: 'bg-blue-100 text-blue-700'     },
  { value: 'agency', label: 'Agency', cls: 'bg-purple-100 text-purple-700' },
  { value: 'custom', label: 'Custom', cls: 'bg-emerald-100 text-emerald-700' },
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
        className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {PLANS.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading || plan === currentPlan}
        className="text-xs font-semibold bg-zinc-900 text-white px-3 py-1.5 rounded-lg hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Saving…' : 'Apply'}
      </button>
      {msg && (
        <span className={`text-xs font-medium ${msg === 'Plan updated!' ? 'text-green-600' : 'text-red-500'}`}>
          {msg}
        </span>
      )}
    </form>
  )
}

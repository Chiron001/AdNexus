'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { format, subDays } from 'date-fns'
import { Calendar, ChevronDown, TrendingUp } from 'lucide-react'

const fmt = (d: Date) => format(d, 'yyyy-MM-dd')
const display = (s: string) => format(new Date(s + 'T00:00:00'), 'dd MMM yyyy')

const PRESETS = [
  { label: 'Today',        from: () => fmt(new Date()),           to: () => fmt(new Date()) },
  { label: 'Yesterday',    from: () => fmt(subDays(new Date(),1)), to: () => fmt(subDays(new Date(),1)) },
  { label: 'Last 7 days',  from: () => fmt(subDays(new Date(),6)), to: () => fmt(new Date()) },
  { label: 'Last 30 days', from: () => fmt(subDays(new Date(),29)),to: () => fmt(new Date()) },
  { label: 'Last 90 days', from: () => fmt(subDays(new Date(),89)),to: () => fmt(new Date()) },
  { label: 'Last 180 days',from: () => fmt(subDays(new Date(),179)),to:()=> fmt(new Date()) },
  { label: 'Last 365 days',from: () => fmt(subDays(new Date(),364)),to:()=> fmt(new Date()) },
  { label: 'Last 2 years', from: () => fmt(subDays(new Date(),729)),to:()=> fmt(new Date()) },
]

const COMPARE_OPTIONS = [
  { value: 'none',            label: 'No comparison' },
  { value: 'previous_period', label: 'vs Previous period' },
  { value: 'previous_year',   label: 'vs Same period last year' },
  { value: 'custom',          label: 'Custom comparison' },
]

export function DateRangePicker() {
  const router     = useRouter()
  const pathname   = usePathname()
  const params     = useSearchParams()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentFrom    = params.get('from')    ?? fmt(subDays(new Date(), 29))
  const currentTo      = params.get('to')      ?? fmt(new Date())
  const currentCompare = params.get('compare') ?? 'none'
  const cmpFrom        = params.get('compare_from') ?? ''
  const cmpTo          = params.get('compare_to')   ?? ''

  const [localFrom,    setLocalFrom]    = useState(currentFrom)
  const [localTo,      setLocalTo]      = useState(currentTo)
  const [compareMode,  setCompareMode]  = useState(currentCompare)
  const [localCmpFrom, setLocalCmpFrom] = useState(cmpFrom)
  const [localCmpTo,   setLocalCmpTo]   = useState(cmpTo)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function apply(from: string, to: string, compare: string, cFrom?: string, cTo?: string) {
    const p = new URLSearchParams(params.toString())
    p.set('from', from)
    p.set('to', to)
    if (compare === 'none') {
      p.delete('compare'); p.delete('compare_from'); p.delete('compare_to')
    } else {
      p.set('compare', compare)
      if (compare === 'custom' && cFrom && cTo) {
        p.set('compare_from', cFrom)
        p.set('compare_to', cTo)
      } else {
        p.delete('compare_from'); p.delete('compare_to')
      }
    }
    router.push(`${pathname}?${p.toString()}`)
    setOpen(false)
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    const from = preset.from(); const to = preset.to()
    setLocalFrom(from); setLocalTo(to)
    apply(from, to, compareMode, localCmpFrom, localCmpTo)
  }

  const compareLabel = COMPARE_OPTIONS.find(o => o.value === currentCompare)?.label ?? 'No comparison'
  const hasCompare = currentCompare !== 'none'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-2.5 text-sm text-white transition-colors"
      >
        <Calendar className="w-4 h-4 text-zinc-400" />
        <span className="font-mono">{display(currentFrom)} – {display(currentTo)}</span>
        {hasCompare && (
          <span className="text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-full px-2 py-0.5">
            {compareLabel}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[480px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-5 space-y-5">
          {/* Presets */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Quick select</p>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="text-xs px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-colors text-center"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom date range */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Custom range</p>
            <div className="flex items-center gap-3">
              <input
                type="date" value={localFrom} max={localTo}
                onChange={e => setLocalFrom(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-zinc-600 text-xs">to</span>
              <input
                type="date" value={localTo} min={localFrom} max={fmt(new Date())}
                onChange={e => setLocalTo(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Comparison */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" /> Compare to
            </p>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {COMPARE_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setCompareMode(o.value)}
                  className={`text-xs px-3 py-2 rounded-lg border text-left transition-colors ${
                    compareMode === o.value
                      ? 'bg-blue-500/15 border-blue-500/50 text-blue-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {compareMode === 'custom' && (
              <div className="flex items-center gap-3">
                <input
                  type="date" value={localCmpFrom}
                  onChange={e => setLocalCmpFrom(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  placeholder="Compare from"
                />
                <span className="text-zinc-600 text-xs">to</span>
                <input
                  type="date" value={localCmpTo} min={localCmpFrom}
                  onChange={e => setLocalCmpTo(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  placeholder="Compare to"
                />
              </div>
            )}
          </div>

          {/* Apply */}
          <div className="flex justify-end gap-2 pt-1 border-t border-zinc-800">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => apply(localFrom, localTo, compareMode, localCmpFrom, localCmpTo)}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

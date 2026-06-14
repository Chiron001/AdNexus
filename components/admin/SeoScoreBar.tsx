'use client'

interface SeoField {
  label: string
  value: string | undefined | null
  ideal?: { min: number; max: number }
}

function score(fields: SeoField[]): { score: number; issues: string[] } {
  const issues: string[] = []
  let points = 0
  const max = fields.length

  for (const f of fields) {
    const len = (f.value ?? '').trim().length
    if (!len) { issues.push(`${f.label} is empty`); continue }
    if (f.ideal) {
      if (len < f.ideal.min) { issues.push(`${f.label} too short (${len}/${f.ideal.min} chars)`); points += 0.5; continue }
      if (len > f.ideal.max) { issues.push(`${f.label} too long (${len}/${f.ideal.max} chars)`); points += 0.5; continue }
    }
    points++
  }

  return { score: Math.round((points / max) * 100), issues }
}

export function SeoScoreBar({ fields }: { fields: SeoField[] }) {
  const { score: s, issues } = score(fields)
  const color = s >= 80 ? 'bg-green-500' : s >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  const label = s >= 80 ? 'Good' : s >= 50 ? 'Needs work' : 'Poor'

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-zinc-700">SEO Score</span>
        <span className={`text-sm font-bold ${s >= 80 ? 'text-green-600' : s >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
          {s}/100 — {label}
        </span>
      </div>
      <div className="h-2 bg-zinc-200 rounded-full overflow-hidden mb-3">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${s}%` }} />
      </div>
      {issues.length > 0 && (
        <ul className="space-y-1">
          {issues.map(i => (
            <li key={i} className="text-xs text-zinc-500 flex items-start gap-1.5">
              <span className="text-orange-400 mt-px">⚠</span> {i}
            </li>
          ))}
        </ul>
      )}
      {issues.length === 0 && (
        <p className="text-xs text-green-600">All SEO fields look good!</p>
      )}
    </div>
  )
}

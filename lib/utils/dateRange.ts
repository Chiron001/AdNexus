import { subDays, subYears, format, differenceInDays } from 'date-fns'

export type CompareMode = 'none' | 'previous_period' | 'previous_year' | 'custom'

export interface DateRange {
  from: string  // YYYY-MM-DD
  to: string    // YYYY-MM-DD
}

export interface AnalyticsDateParams {
  current: DateRange
  comparison: DateRange | null
  compareMode: CompareMode
}

const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

export function buildDateParams(params: {
  from?: string
  to?: string
  compare?: string
  compare_from?: string
  compare_to?: string
}): AnalyticsDateParams {
  const to   = params.to   ?? fmt(new Date())
  const from = params.from ?? fmt(subDays(new Date(), 29))

  const current: DateRange = { from, to }
  const compareMode = (params.compare ?? 'none') as CompareMode

  let comparison: DateRange | null = null

  if (compareMode === 'previous_period') {
    const days = differenceInDays(new Date(to), new Date(from))
    const prevTo   = fmt(subDays(new Date(from), 1))
    const prevFrom = fmt(subDays(new Date(from), days + 1))
    comparison = { from: prevFrom, to: prevTo }
  } else if (compareMode === 'previous_year') {
    comparison = {
      from: fmt(subYears(new Date(from), 1)),
      to:   fmt(subYears(new Date(to), 1)),
    }
  } else if (compareMode === 'custom' && params.compare_from && params.compare_to) {
    comparison = { from: params.compare_from, to: params.compare_to }
  }

  return { current, comparison, compareMode }
}

export function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

export const DATE_PRESETS = [
  { label: 'Today',       days: 0  },
  { label: 'Yesterday',   days: 1  },
  { label: 'Last 7 days', days: 6  },
  { label: 'Last 30 days',days: 29 },
  { label: 'Last 90 days',days: 89 },
  { label: 'Last 180 days',days:179},
  { label: 'Last 365 days',days:364},
  { label: 'Last 2 years', days: 729},
] as const

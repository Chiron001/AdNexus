import type { HealthScore } from './types'

interface IssueCounts {
  critical: number
  high: number
  medium: number
  low: number
}

export function calculateHealthScore(counts: IssueCounts): HealthScore {
  let score = 100

  const criticalDeductions = Math.min(counts.critical, 2) * 25
  const highDeductions = Math.min(counts.high, 3) * 15
  const mediumDeductions = Math.min(counts.medium, 3) * 8
  const lowDeductions = Math.min(counts.low, 3) * 3

  score -= criticalDeductions + highDeductions + mediumDeductions + lowDeductions
  score = Math.max(0, score)

  let label: HealthScore['label']
  let color: HealthScore['color']

  if (score >= 80) {
    label = 'Excellent'
    color = 'green'
  } else if (score >= 60) {
    label = 'Good'
    color = 'yellow'
  } else if (score >= 40) {
    label = 'Needs Attention'
    color = 'amber'
  } else if (score >= 20) {
    label = 'Poor'
    color = 'orange'
  } else {
    label = 'Critical'
    color = 'red'
  }

  return { score, label, color, issues_count: counts }
}

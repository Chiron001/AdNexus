import type { Json } from '@/types/database'

export type Platform = 'meta' | 'google' | 'amazon'
export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type EffortLevel = 'quick_win' | 'medium' | 'complex'

export interface DiagnosticIssue {
  platform: Platform
  issue_type: string
  severity: Severity
  title: string
  description: string
  affected_entity_type: 'campaign' | 'adset' | 'ad' | 'keyword' | 'account'
  affected_entity_id: string
  affected_entity_name: string
  estimated_impact_inr: number
  raw_data: Json
}

export interface HealthScore {
  score: number
  label: 'Excellent' | 'Good' | 'Needs Attention' | 'Poor' | 'Critical'
  color: 'green' | 'yellow' | 'amber' | 'orange' | 'red'
  issues_count: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

export interface Recommendation {
  title: string
  explanation: string
  action_steps: string[]
  estimated_impact: string
  effort_level: EffortLevel
  time_to_implement: string
}

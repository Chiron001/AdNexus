import type { Plan } from '@/types/database'

export type PlanTier = Plan  // 'free' | 'growth' | 'agency' | 'custom'

export interface PlanLimits {
  max_ad_accounts: number        // -1 = unlimited
  max_diagnostic_checks: number  // -1 = unlimited (per month, manual syncs only)
  sync_cooldown_ms: number       // ms between manual syncs per account (0 = no limit)
  ai_recommendations: boolean
  pdf_reports: boolean
  white_label_reports: boolean
  whatsapp_alerts: boolean
  api_access: boolean
  data_retention_days: number    // -1 = unlimited
  priority_support: boolean
  custom_diagnostics: boolean
  anomaly_detection: boolean
  creative_analytics: boolean
  budget_analytics: boolean
  scheduled_reports: boolean
  team_seats: number             // -1 = unlimited
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    max_ad_accounts:       1,
    max_diagnostic_checks: 10,
    sync_cooldown_ms:      24 * 60 * 60 * 1000, // 24 hours
    ai_recommendations:    false,
    pdf_reports:           false,
    white_label_reports:   false,
    whatsapp_alerts:       false,
    api_access:            false,
    data_retention_days:   30,
    priority_support:      false,
    custom_diagnostics:    false,
    anomaly_detection:     false,
    creative_analytics:    false,
    budget_analytics:      false,
    scheduled_reports:     false,
    team_seats:            1,
  },
  growth: {
    max_ad_accounts:       5,
    max_diagnostic_checks: 30,
    sync_cooldown_ms:      60 * 60 * 1000, // 1 hour
    ai_recommendations:    true,
    pdf_reports:           true,
    white_label_reports:   false,
    whatsapp_alerts:       true,
    api_access:            false,
    data_retention_days:   90,
    priority_support:      false,
    custom_diagnostics:    false,
    anomaly_detection:     false,
    creative_analytics:    true,
    budget_analytics:      true,
    scheduled_reports:     false,
    team_seats:            1,
  },
  agency: {
    max_ad_accounts:       50,
    max_diagnostic_checks: -1,
    sync_cooldown_ms:      15 * 60 * 1000, // 15 minutes
    ai_recommendations:    true,
    pdf_reports:           true,
    white_label_reports:   true,
    whatsapp_alerts:       true,
    api_access:            true,
    data_retention_days:   365,
    priority_support:      true,
    custom_diagnostics:    true,
    anomaly_detection:     true,
    creative_analytics:    true,
    budget_analytics:      true,
    scheduled_reports:     true,
    team_seats:            3,
  },
  custom: {
    max_ad_accounts:       -1,
    max_diagnostic_checks: -1,
    sync_cooldown_ms:      0,
    ai_recommendations:    true,
    pdf_reports:           true,
    white_label_reports:   true,
    whatsapp_alerts:       true,
    api_access:            true,
    data_retention_days:   -1,
    priority_support:      true,
    custom_diagnostics:    true,
    anomaly_detection:     true,
    creative_analytics:    true,
    budget_analytics:      true,
    scheduled_reports:     true,
    team_seats:            -1,
  },
} as const

export function getPlanLimits(plan: PlanTier): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free
}

export function canAccessFeature(plan: PlanTier, feature: keyof PlanLimits): boolean {
  const value = getPlanLimits(plan)[feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === -1 || value > 0
  return false
}

export function isAtAccountLimit(plan: PlanTier, currentCount: number): boolean {
  const limit = getPlanLimits(plan).max_ad_accounts
  return limit !== -1 && currentCount >= limit
}

export function isAtCheckLimit(plan: PlanTier, checksUsed: number): boolean {
  const limit = getPlanLimits(plan).max_diagnostic_checks
  return limit !== -1 && checksUsed >= limit
}

export function getMinPlanForFeature(feature: keyof PlanLimits): PlanTier {
  const order: PlanTier[] = ['free', 'growth', 'agency', 'custom']
  for (const plan of order) {
    if (canAccessFeature(plan, feature)) return plan
  }
  return 'custom'
}

export const PLAN_LEVEL: Record<PlanTier, number> = {
  free: 0, growth: 1, agency: 2, custom: 3,
}

export const PLAN_DISPLAY: Record<PlanTier, { label: string; price: string; color: string; badgeCls: string }> = {
  free:   { label: 'Basic',  price: '$19/mo',        color: 'text-zinc-400',   badgeCls: 'bg-zinc-800 text-zinc-400 border border-zinc-700'         },
  growth: { label: 'Growth', price: '$99/mo',         color: 'text-blue-400',   badgeCls: 'bg-blue-500/15 text-blue-300 border border-blue-500/25'   },
  agency: { label: 'Professional', price: '$499/mo',  color: 'text-purple-400', badgeCls: 'bg-purple-500/15 text-purple-300 border border-purple-500/25' },
  custom: { label: 'Custom', price: 'Contact Sales',  color: 'text-emerald-400',badgeCls: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' },
}

export const MIN_PLAN_LABELS: Record<PlanTier, string> = {
  free:   'Basic ($19/mo after 30-day trial)',
  growth: 'Growth ($99/mo)',
  agency: 'Professional ($499/mo)',
  custom: 'Custom',
}

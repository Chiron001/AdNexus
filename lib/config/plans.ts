import type { Plan } from '@/types/database'

export interface PlanLimits {
  max_ad_accounts: number        // -1 = unlimited
  max_diagnostic_checks: number  // -1 = unlimited
  sync_frequency: 'weekly' | 'daily' | 'realtime'
  ai_recommendations: boolean
  pdf_reports: boolean
  white_label_reports: boolean
  whatsapp_alerts: boolean
  api_access: boolean
  data_retention_days: number    // -1 = unlimited
  priority_support: boolean
  custom_diagnostics: boolean
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    max_ad_accounts: 1,
    max_diagnostic_checks: 10,
    sync_frequency: 'weekly',
    ai_recommendations: false,
    pdf_reports: false,
    white_label_reports: false,
    whatsapp_alerts: false,
    api_access: false,
    data_retention_days: 30,
    priority_support: false,
    custom_diagnostics: false,
  },
  growth: {
    max_ad_accounts: 5,
    max_diagnostic_checks: 30,
    sync_frequency: 'daily',
    ai_recommendations: true,
    pdf_reports: true,
    white_label_reports: false,
    whatsapp_alerts: true,
    api_access: false,
    data_retention_days: 90,
    priority_support: false,
    custom_diagnostics: false,
  },
  agency: {
    max_ad_accounts: 15,
    max_diagnostic_checks: -1,
    sync_frequency: 'realtime',
    ai_recommendations: true,
    pdf_reports: true,
    white_label_reports: true,
    whatsapp_alerts: true,
    api_access: true,
    data_retention_days: 365,
    priority_support: true,
    custom_diagnostics: true,
  },
} as const

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan]
}

export function canAccessFeature(plan: Plan, feature: keyof PlanLimits): boolean {
  const value = PLAN_LIMITS[plan][feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === -1 || value > 0
  return false
}

export function isAtAccountLimit(plan: Plan, currentCount: number): boolean {
  const limit = PLAN_LIMITS[plan].max_ad_accounts
  return limit !== -1 && currentCount >= limit
}

export function isAtCheckLimit(plan: Plan, checksUsed: number): boolean {
  const limit = PLAN_LIMITS[plan].max_diagnostic_checks
  return limit !== -1 && checksUsed >= limit
}

export function getMinPlanForFeature(feature: keyof PlanLimits): Plan {
  const order: Plan[] = ['free', 'growth', 'agency']
  for (const plan of order) {
    if (canAccessFeature(plan, feature)) return plan
  }
  return 'agency'
}

export const PLAN_DISPLAY: Record<Plan, { label: string; price: string; color: string }> = {
  free:   { label: 'Free',   price: '₹0',     color: 'text-gray-400' },
  growth: { label: 'Growth', price: '₹2,999', color: 'text-blue-400' },
  agency: { label: 'Agency', price: '₹9,999', color: 'text-purple-400' },
}

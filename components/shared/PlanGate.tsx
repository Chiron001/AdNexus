'use client'

import { Lock } from 'lucide-react'
import Link from 'next/link'

type Plan = 'free' | 'growth' | 'agency'

const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  growth: 1,
  agency: 2,
}

interface PlanGateProps {
  userPlan: Plan
  requiredPlan: 'growth' | 'agency'
  children: React.ReactNode
  featureName?: string
}

export function PlanGate({ userPlan, requiredPlan, children, featureName }: PlanGateProps) {
  const hasAccess = PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan]
  if (hasAccess) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-50">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] rounded-lg">
        <div className="text-center px-6 py-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {requiredPlan === 'growth' ? 'Growth Plan' : 'Professional Plan'} required
          </p>
          {featureName && (
            <p className="text-xs text-gray-500 mb-3">{featureName} is a paid feature</p>
          )}
          <Link
            href="/settings?tab=billing"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors"
          >
            Upgrade — $99/mo →
          </Link>
        </div>
      </div>
    </div>
  )
}

export function usePlan(plan: Plan) {
  return {
    plan,
    isGrowth: PLAN_RANK[plan] >= PLAN_RANK.growth,
    isAgency: PLAN_RANK[plan] >= PLAN_RANK.agency,
    canAccess: (requiredPlan: 'growth' | 'agency') =>
      PLAN_RANK[plan] >= PLAN_RANK[requiredPlan],
  }
}

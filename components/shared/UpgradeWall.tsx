import Link from 'next/link'
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react'
import { MIN_PLAN_LABELS } from '@/lib/config/plans'
import type { PlanTier } from '@/lib/config/plans'

interface UpgradeWallProps {
  feature: string
  requiredPlan: PlanTier
  bullets: string[]
  currentPlan?: PlanTier
}

const PLAN_PRICE: Record<PlanTier, string> = {
  free:   '₹0',
  growth: '₹2,999/mo',
  agency: '₹9,999/mo',
  custom: 'Contact Sales',
}

const PLAN_GRADIENT: Record<PlanTier, string> = {
  free:   'from-zinc-600 to-zinc-500',
  growth: 'from-blue-600 to-cyan-500',
  agency: 'from-purple-600 to-blue-600',
  custom: 'from-emerald-600 to-teal-500',
}

export function UpgradeWall({ feature, requiredPlan, bullets, currentPlan = 'free' }: UpgradeWallProps) {
  const targetPlan = requiredPlan === 'agency' ? 'agency' : 'growth'

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full bg-zinc-900/70 backdrop-blur-sm border border-zinc-800/80 rounded-3xl p-8 text-center">

        {/* Lock icon */}
        <div className="w-16 h-16 bg-zinc-800 ring-1 ring-zinc-700/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-zinc-400" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white mb-2">{feature} is locked</h2>
        <p className="text-zinc-500 text-sm mb-1">
          Available on <span className="text-white font-medium">{MIN_PLAN_LABELS[requiredPlan]}</span> and above.
        </p>
        <p className="text-xs text-zinc-600 mb-6">
          You&apos;re on the <span className="capitalize text-zinc-400">{currentPlan}</span> plan.
        </p>

        {/* What's included */}
        <div className="text-left space-y-2.5 mb-7">
          {bullets.map((bullet) => (
            <div key={bullet} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-300">{bullet}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`/settings?tab=billing&upgrade=${targetPlan}`}
          className={`flex items-center justify-center gap-2 w-full bg-gradient-to-r ${PLAN_GRADIENT[requiredPlan]} text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg`}
        >
          <Sparkles className="w-4 h-4" />
          Upgrade to {MIN_PLAN_LABELS[requiredPlan]}
        </Link>

        <p className="text-xs text-zinc-600 mt-3">
          Starting at {PLAN_PRICE[requiredPlan]} · Cancel anytime
        </p>
      </div>
    </div>
  )
}

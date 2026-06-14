import { getPlanLimits, isAtCheckLimit, PLAN_LEVEL } from '@/lib/config/plans'
import type { PlanTier } from '@/lib/config/plans'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any

export async function getUserPlan(supabase: AnySupabase, userId: string): Promise<PlanTier> {
  const { data } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()
  return ((data?.plan as PlanTier) ?? 'free')
}

export async function getMonthlyCheckCount(supabase: AnySupabase, userId: string): Promise<number> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('id')
    .eq('user_id', userId)

  const accountIds: string[] = accounts?.map((a: { id: string }) => a.id) ?? []
  if (accountIds.length === 0) return 0

  const { count } = await supabase
    .from('sync_logs')
    .select('*', { count: 'exact', head: true })
    .eq('sync_type', 'manual')
    .in('ad_account_id', accountIds)
    .gte('started_at', startOfMonth.toISOString())

  return count ?? 0
}

export async function getLastManualSyncAt(supabase: AnySupabase, accountId: string): Promise<Date | null> {
  const { data } = await supabase
    .from('sync_logs')
    .select('started_at')
    .eq('ad_account_id', accountId)
    .eq('sync_type', 'manual')
    .in('status', ['completed', 'running'])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data?.started_at ? new Date(data.started_at) : null
}

export interface SyncCheckResult {
  allowed: boolean
  reason?: string
  retryAfterMs?: number
  checksUsed?: number
  checksLimit?: number
}

export async function checkSyncAllowed(
  supabase: AnySupabase,
  userId: string,
  accountId: string
): Promise<SyncCheckResult> {
  const plan = await getUserPlan(supabase, userId)
  const limits = getPlanLimits(plan)

  // 1. Monthly check limit (only for free / growth)
  if (limits.max_diagnostic_checks !== -1) {
    const checksUsed = await getMonthlyCheckCount(supabase, userId)
    if (isAtCheckLimit(plan, checksUsed)) {
      return {
        allowed: false,
        reason: `Monthly limit reached (${checksUsed}/${limits.max_diagnostic_checks} syncs). Resets on the 1st. Upgrade to unlock more.`,
        checksUsed,
        checksLimit: limits.max_diagnostic_checks,
      }
    }
  }

  // 2. Per-account cooldown
  if (limits.sync_cooldown_ms > 0) {
    const lastSync = await getLastManualSyncAt(supabase, accountId)
    if (lastSync) {
      const elapsed = Date.now() - lastSync.getTime()
      if (elapsed < limits.sync_cooldown_ms) {
        const remaining = limits.sync_cooldown_ms - elapsed
        const mins = Math.ceil(remaining / 60_000)
        return {
          allowed: false,
          reason: `Please wait ${mins} minute${mins === 1 ? '' : 's'} before syncing again.`,
          retryAfterMs: remaining,
        }
      }
    }
  }

  return { allowed: true }
}

export interface AccountLimitResult {
  allowed: boolean
  currentCount: number
  limit: number
  newCount: number
}

export async function checkAccountLimit(
  supabase: AnySupabase,
  userId: string,
  incomingAccountIds: string[],  // new platform-native IDs that would be added
  platform: string
): Promise<AccountLimitResult> {
  const plan = await getUserPlan(supabase, userId)
  const limits = getPlanLimits(plan)

  // Total across ALL platforms
  const { count: totalCount } = await supabase
    .from('ad_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'disconnected')

  const currentCount = totalCount ?? 0

  if (limits.max_ad_accounts === -1) {
    return { allowed: true, currentCount, limit: -1, newCount: incomingAccountIds.length }
  }

  // Find which incoming accounts are genuinely new (not already stored)
  const { data: existing } = await supabase
    .from('ad_accounts')
    .select('account_id')
    .eq('user_id', userId)
    .eq('platform', platform)

  const existingIds = new Set<string>(existing?.map((a: { account_id: string }) => a.account_id) ?? [])
  const genuinelyNew = incomingAccountIds.filter(id => !existingIds.has(id))

  const wouldBeTotal = currentCount + genuinelyNew.length
  const allowed = wouldBeTotal <= limits.max_ad_accounts

  return {
    allowed,
    currentCount,
    limit: limits.max_ad_accounts,
    newCount: genuinelyNew.length,
  }
}

export function hasPlanAccess(userPlan: PlanTier, requiredPlan: PlanTier): boolean {
  return (PLAN_LEVEL[userPlan] ?? 0) >= (PLAN_LEVEL[requiredPlan] ?? 0)
}

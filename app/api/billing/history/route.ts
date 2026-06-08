export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { apiErrorResponse } from '@/lib/utils/errors'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: events, error } = await supabase
      .from('billing_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return Response.json({ events: events ?? [] })
  } catch (error) {
    return apiErrorResponse(error, 'billing/history')
  }
}

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiErrorResponse } from '@/lib/utils/errors'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const { error } = await supabase
      .from('recommendations')
      .update({ status: 'applied' })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    return apiErrorResponse(error, 'recommendations/apply')
  }
}

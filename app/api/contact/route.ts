import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface ContactBody {
  first_name:    string
  last_name:     string
  email:         string
  phone:         string
  monthly_spend: string
  company:       string
  message?:      string
}

export async function POST(req: NextRequest) {
  const body = await req.json() as ContactBody

  const required = ['first_name', 'last_name', 'email', 'phone', 'monthly_spend', 'company'] as const
  for (const field of required) {
    if (!body[field]?.trim()) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 })
    }
  }

  const admin = createAdminClient()
  // contact_inquiries is not yet in generated types — cast to any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin.from('contact_inquiries') as any).insert({
    first_name:    body.first_name.trim(),
    last_name:     body.last_name.trim(),
    email:         body.email.trim().toLowerCase(),
    phone:         body.phone.trim(),
    monthly_spend: body.monthly_spend,
    company:       body.company.trim(),
    message:       body.message?.trim() ?? null,
    source:        'website',
    status:        'new',
  })

  if (error) {
    console.error('Contact insert error:', error)
    return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

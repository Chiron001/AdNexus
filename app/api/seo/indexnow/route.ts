import { NextRequest, NextResponse } from 'next/server'

const SITE_HOST = 'adnexusone.com'

export async function POST(req: NextRequest) {
  const key = process.env.INDEXNOW_KEY
  if (!key) return NextResponse.json({ error: 'INDEXNOW_KEY not set' }, { status: 503 })

  const body = await req.json() as { urls?: string[] }
  if (!body.urls?.length) return NextResponse.json({ error: 'urls required' }, { status: 400 })

  const payload = {
    host: SITE_HOST,
    key,
    keyLocation: `https://${SITE_HOST}/${key}.txt`,
    urlList: body.urls,
  }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  })

  return NextResponse.json({ ok: res.ok, status: res.status })
}

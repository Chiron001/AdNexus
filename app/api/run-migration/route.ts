import { NextRequest, NextResponse } from 'next/server'

// One-time migration runner — protected by CRON_SECRET
// DELETE THIS FILE after running once
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!projectRef || !serviceKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 })
  }

  const sql = `
    CREATE TABLE IF NOT EXISTS platform_credentials (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      platform         TEXT NOT NULL CHECK (platform IN ('meta', 'google', 'amazon')),
      credentials      JSONB NOT NULL DEFAULT '{}',
      is_valid         BOOLEAN DEFAULT false,
      last_tested_at   TIMESTAMPTZ,
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, platform)
    );
    ALTER TABLE platform_credentials ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='platform_credentials' AND policyname='Users can read own credentials') THEN
        CREATE POLICY "Users can read own credentials" ON platform_credentials FOR SELECT USING (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='platform_credentials' AND policyname='Users can insert own credentials') THEN
        CREATE POLICY "Users can insert own credentials" ON platform_credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='platform_credentials' AND policyname='Users can update own credentials') THEN
        CREATE POLICY "Users can update own credentials" ON platform_credentials FOR UPDATE USING (auth.uid() = user_id);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='platform_credentials' AND policyname='Users can delete own credentials') THEN
        CREATE POLICY "Users can delete own credentials" ON platform_credentials FOR DELETE USING (auth.uid() = user_id);
      END IF;
    END $$;
  `

  // Supabase Management API — runs raw SQL
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  const body = await res.text()
  return NextResponse.json({ status: res.status, body: body.slice(0, 500) })
}

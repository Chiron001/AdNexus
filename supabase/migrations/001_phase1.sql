-- =============================================================
-- AdNexus Phase 1 Migration
-- Run this entire file in the Supabase SQL Editor (once only)
-- =============================================================

-- ─── Migration 001: Extend profiles table ────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_opted_in BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{
  "email_anomaly": true,
  "email_digest": true,
  "email_product_updates": true,
  "email_billing": true,
  "whatsapp_alerts": false,
  "whatsapp_digest": false,
  "whatsapp_product_updates": false
}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_ad_spend_inr NUMERIC NOT NULL DEFAULT 0;

-- ─── Migration 002: Billing events ───────────────────────────

CREATE TABLE IF NOT EXISTS billing_events (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type                TEXT        NOT NULL,
  -- 'subscription.charged' | 'subscription.cancelled' | 'payment.failed'
  -- 'plan.upgraded' | 'plan.downgraded' | 'plan.override'
  plan                      TEXT,
  amount_inr                NUMERIC,
  razorpay_subscription_id  TEXT,
  razorpay_payment_id       TEXT,
  period_start              TIMESTAMPTZ,
  period_end                TIMESTAMPTZ,
  metadata                  JSONB       NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_events_user_id
  ON billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_created_at
  ON billing_events(created_at DESC);

ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own billing events"
  ON billing_events FOR SELECT
  USING (auth.uid() = user_id);

-- ─── Migration 003: Admin users ──────────────────────────────

CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL DEFAULT 'admin',
  -- 'super_admin' | 'admin' | 'support'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No RLS on admin_users — accessed only via service role key
-- Insert your user UUID here (find it in Supabase Auth → Users):
--
--   INSERT INTO admin_users (id, role)
--   VALUES ('<YOUR_AUTH_UUID_HERE>', 'super_admin')
--   ON CONFLICT (id) DO NOTHING;

-- ─── Migration 004: AI insights ──────────────────────────────

CREATE TABLE IF NOT EXISTS ai_insights (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insight_type TEXT        NOT NULL DEFAULT 'daily_summary',
  -- 'daily_summary' | 'weekly_review' | 'campaign_spotlight'
  content      TEXT        NOT NULL,
  model        TEXT        NOT NULL DEFAULT 'claude-sonnet-4-6',
  tokens_used  INTEGER,
  sentiment    TEXT,
  -- 'positive' | 'neutral' | 'warning' | 'critical'
  date         DATE        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, insight_type, date)
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_date
  ON ai_insights(user_id, date DESC);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI insights"
  ON ai_insights FOR SELECT
  USING (auth.uid() = user_id);

-- ─── Migration 005: In-app notifications ─────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL,
  -- 'issue_alert' | 'sync_complete' | 'payment' | 'feature_update' | 'ai_insight'
  title      TEXT        NOT NULL,
  body       TEXT,
  link       TEXT,
  read       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── Done ─────────────────────────────────────────────────────
-- After running this file:
-- 1. Go to Supabase → Auth → Users, copy your UUID
-- 2. Run: INSERT INTO admin_users (id, role) VALUES ('<UUID>', 'super_admin') ON CONFLICT (id) DO NOTHING;
-- 3. Pull back the updated schema via: npx supabase gen types typescript --linked > types/database.ts
--    (or use the manually updated types/database.ts that was updated alongside this migration)

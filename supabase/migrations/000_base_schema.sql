-- =============================================================
-- AdNexus Base Schema
-- Run this FIRST in Supabase SQL Editor, then run 001_phase1.sql
-- =============================================================

-- ─── profiles ────────────────────────────────────────────────
-- One row per user, created automatically on signup via trigger.

CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT        NOT NULL,
  full_name             TEXT,
  company_name          TEXT,
  plan                  TEXT        NOT NULL DEFAULT 'free'
                          CHECK (plan IN ('free', 'growth', 'agency')),
  plan_expires_at       TIMESTAMPTZ,
  razorpay_customer_id  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── ad_accounts ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ad_accounts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform         TEXT        NOT NULL CHECK (platform IN ('meta', 'google', 'amazon')),
  account_id       TEXT        NOT NULL,
  account_name     TEXT,
  access_token     TEXT        NOT NULL,
  refresh_token    TEXT,
  token_expires_at TIMESTAMPTZ,
  status           TEXT        NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'expired', 'disconnected')),
  last_synced_at   TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, platform, account_id)
);

ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ad accounts"
  ON ad_accounts FOR ALL USING (auth.uid() = user_id);

-- ─── campaign_metrics ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS campaign_metrics (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_account_id  UUID        NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  platform       TEXT        NOT NULL,
  campaign_id    TEXT        NOT NULL,
  campaign_name  TEXT,
  status         TEXT,
  date           DATE        NOT NULL,
  spend          NUMERIC     NOT NULL DEFAULT 0,
  revenue        NUMERIC     NOT NULL DEFAULT 0,
  impressions    INTEGER     NOT NULL DEFAULT 0,
  clicks         INTEGER     NOT NULL DEFAULT 0,
  conversions    INTEGER     NOT NULL DEFAULT 0,
  ctr            NUMERIC     NOT NULL DEFAULT 0,
  cpc            NUMERIC     NOT NULL DEFAULT 0,
  roas           NUMERIC     NOT NULL DEFAULT 0,
  cpm            NUMERIC     NOT NULL DEFAULT 0,
  meta_data      JSONB       NOT NULL DEFAULT '{}',
  google_data    JSONB       NOT NULL DEFAULT '{}',
  amazon_data    JSONB       NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ad_account_id, campaign_id, date)
);

CREATE INDEX IF NOT EXISTS idx_campaign_metrics_account_date
  ON campaign_metrics(ad_account_id, date DESC);

ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaign metrics"
  ON campaign_metrics FOR SELECT
  USING (
    ad_account_id IN (
      SELECT id FROM ad_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage campaign metrics"
  ON campaign_metrics FOR ALL
  USING (auth.role() = 'service_role');

-- ─── diagnostic_issues ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS diagnostic_issues (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_account_id         UUID        NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  user_id               UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform              TEXT        NOT NULL,
  issue_type            TEXT        NOT NULL,
  severity              TEXT        NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title                 TEXT        NOT NULL,
  description           TEXT,
  affected_entity_type  TEXT,
  affected_entity_id    TEXT,
  affected_entity_name  TEXT,
  estimated_impact_inr  NUMERIC,
  status                TEXT        NOT NULL DEFAULT 'open'
                          CHECK (status IN ('open', 'dismissed', 'fixed')),
  detected_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at           TIMESTAMPTZ,
  raw_data              JSONB       NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_issues_user_status
  ON diagnostic_issues(user_id, status, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnostic_issues_account
  ON diagnostic_issues(ad_account_id, detected_at DESC);

ALTER TABLE diagnostic_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own diagnostic issues"
  ON diagnostic_issues FOR ALL USING (auth.uid() = user_id);

-- ─── recommendations ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS recommendations (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_issue_id  UUID        NOT NULL REFERENCES diagnostic_issues(id) ON DELETE CASCADE,
  user_id              UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title                TEXT        NOT NULL,
  explanation          TEXT        NOT NULL,
  action_steps         JSONB       NOT NULL DEFAULT '[]',
  estimated_impact     TEXT,
  effort_level         TEXT        CHECK (effort_level IN ('quick_win', 'medium', 'complex')),
  time_to_implement    TEXT,
  status               TEXT        NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'applied', 'dismissed')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_status
  ON recommendations(user_id, status, created_at DESC);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recommendations"
  ON recommendations FOR ALL USING (auth.uid() = user_id);

-- ─── sync_logs ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sync_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_account_id    UUID        NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  sync_type        TEXT        NOT NULL CHECK (sync_type IN ('scheduled', 'manual', 'initial')),
  status           TEXT        NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  campaigns_synced INTEGER     NOT NULL DEFAULT 0,
  issues_found     INTEGER     NOT NULL DEFAULT 0,
  error_message    TEXT,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_account_started
  ON sync_logs(ad_account_id, started_at DESC);

ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync logs"
  ON sync_logs FOR SELECT
  USING (
    ad_account_id IN (
      SELECT id FROM ad_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage sync logs"
  ON sync_logs FOR ALL
  USING (auth.role() = 'service_role');

-- ─── Done ─────────────────────────────────────────────────────
-- Now run 001_phase1.sql to add the Phase 1 tables and columns.

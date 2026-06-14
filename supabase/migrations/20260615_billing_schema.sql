-- =============================================================
-- AdNexus Billing Schema Migration
-- Run in Supabase SQL Editor
-- =============================================================

-- ─── 1. Expand plan constraint to include all tiers ──────────

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'basic', 'growth', 'professional', 'agency', 'custom'));

-- ─── 2. Add billing columns ──────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpay_subscription_id    TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpay_ai_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at                TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_ai_addon                 BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── 3. Index for fast webhook lookups by subscription ID ────

CREATE INDEX IF NOT EXISTS idx_profiles_razorpay_sub
  ON profiles(razorpay_subscription_id)
  WHERE razorpay_subscription_id IS NOT NULL;

-- ─── Done ────────────────────────────────────────────────────
-- After running this:
-- 1. Deploy the updated code to Vercel
-- 2. Set these Vercel env vars (from Razorpay dashboard):
--    RAZORPAY_KEY_ID
--    RAZORPAY_KEY_SECRET
--    RAZORPAY_WEBHOOK_SECRET
--    NEXT_PUBLIC_RAZORPAY_KEY_ID   (same as KEY_ID)
--    RAZORPAY_PLAN_BASIC           (plan_xxx from Razorpay)
--    RAZORPAY_PLAN_GROWTH
--    RAZORPAY_PLAN_AI
--    RAZORPAY_PLAN_PROFESSIONAL

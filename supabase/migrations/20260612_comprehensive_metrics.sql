-- ============================================================
-- Comprehensive metrics schema
-- ============================================================

-- Add all new columns to campaign_metrics
ALTER TABLE campaign_metrics
  ADD COLUMN IF NOT EXISTS reach                            bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS frequency                       numeric(8,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS link_clicks                     bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unique_clicks                   bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unique_link_clicks              bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS post_engagements                bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS post_reactions                  bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS post_comments                   bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS post_shares                     bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS page_likes                      bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unique_ctr                      numeric(8,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cpp                             numeric(10,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_per_unique_click           numeric(10,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purchases                       bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS add_to_carts                    bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS checkouts_initiated             bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leads                           bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS registrations_completed         bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS content_views                   bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS app_installs                    bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS landing_page_views              bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscriptions                   bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contacts                        bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purchase_value                  numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS add_to_cart_value               numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_value                      numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cpa                             numeric(10,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_views                     bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_thruplay                  bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_p25_views                 bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_p50_views                 bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_p75_views                 bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_p100_views                bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_avg_watch_time            numeric(10,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_30sec_views               bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_view_rate                 numeric(8,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quality_ranking                 text,
  ADD COLUMN IF NOT EXISTS engagement_rate_ranking         text,
  ADD COLUMN IF NOT EXISTS conversion_rate_ranking         text,
  ADD COLUMN IF NOT EXISTS quality_score                   integer,
  ADD COLUMN IF NOT EXISTS campaign_objective              text,
  ADD COLUMN IF NOT EXISTS campaign_status                 text,
  ADD COLUMN IF NOT EXISTS buying_type                     text,
  ADD COLUMN IF NOT EXISTS bid_strategy                    text,
  ADD COLUMN IF NOT EXISTS optimization_goal               text,
  ADD COLUMN IF NOT EXISTS search_impression_share         numeric(8,4),
  ADD COLUMN IF NOT EXISTS search_top_impression_share     numeric(8,4),
  ADD COLUMN IF NOT EXISTS search_abs_top_impression_share numeric(8,4),
  ADD COLUMN IF NOT EXISTS search_budget_lost_is           numeric(8,4),
  ADD COLUMN IF NOT EXISTS search_rank_lost_is             numeric(8,4),
  ADD COLUMN IF NOT EXISTS average_cpv                     numeric(10,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_through_conversions        bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS all_conversions                 numeric(12,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS all_conversions_value           numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_quartile_p25_rate         numeric(8,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_quartile_p50_rate         numeric(8,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_quartile_p75_rate         numeric(8,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_quartile_p100_rate        numeric(8,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS new_to_brand_orders             bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS new_to_brand_sales              numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS acos                            numeric(8,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS detail_page_views               bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS branded_searches                bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS raw_data                        jsonb;

-- Indexes for common date-range query patterns
CREATE INDEX IF NOT EXISTS campaign_metrics_date_idx
  ON campaign_metrics(ad_account_id, date DESC);
CREATE INDEX IF NOT EXISTS campaign_metrics_platform_date_idx
  ON campaign_metrics(ad_account_id, platform, date DESC);

-- =============================================
-- adset_metrics — ad-set / ad-group level
-- =============================================
CREATE TABLE IF NOT EXISTS adset_metrics (
  id                       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_account_id            uuid REFERENCES ad_accounts(id) ON DELETE CASCADE,
  platform                 text NOT NULL CHECK (platform IN ('meta','google','amazon')),
  date                     date NOT NULL,
  campaign_id              text NOT NULL,
  campaign_name            text,
  adset_id                 text NOT NULL,
  adset_name               text,
  adset_status             text,
  optimization_goal        text,
  billing_event            text,
  bid_amount               numeric(12,4),
  daily_budget             numeric(12,2),
  lifetime_budget          numeric(12,2),
  -- Targeting
  targeting_age_min        integer,
  targeting_age_max        integer,
  targeting_genders        text[],
  targeting_countries      text[],
  targeting_interests      jsonb,
  targeting_behaviors      jsonb,
  targeting_custom_audiences jsonb,
  -- Performance
  spend                    numeric(12,2) DEFAULT 0,
  impressions              bigint DEFAULT 0,
  reach                    bigint DEFAULT 0,
  frequency                numeric(8,4) DEFAULT 0,
  clicks                   bigint DEFAULT 0,
  link_clicks              bigint DEFAULT 0,
  ctr                      numeric(8,4) DEFAULT 0,
  cpc                      numeric(10,4) DEFAULT 0,
  cpm                      numeric(10,4) DEFAULT 0,
  cpp                      numeric(10,4) DEFAULT 0,
  purchases                bigint DEFAULT 0,
  purchase_value           numeric(12,2) DEFAULT 0,
  add_to_carts             bigint DEFAULT 0,
  checkouts_initiated      bigint DEFAULT 0,
  leads                    bigint DEFAULT 0,
  content_views            bigint DEFAULT 0,
  landing_page_views       bigint DEFAULT 0,
  roas                     numeric(8,4) DEFAULT 0,
  cpa                      numeric(10,4) DEFAULT 0,
  quality_ranking          text,
  engagement_rate_ranking  text,
  conversion_rate_ranking  text,
  raw_data                 jsonb,
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now(),
  UNIQUE (ad_account_id, platform, adset_id, date)
);

CREATE INDEX IF NOT EXISTS adset_metrics_date_idx
  ON adset_metrics(ad_account_id, date DESC);

-- =============================================
-- ad_metrics — individual ad / creative level
-- =============================================
CREATE TABLE IF NOT EXISTS ad_metrics (
  id                       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_account_id            uuid REFERENCES ad_accounts(id) ON DELETE CASCADE,
  platform                 text NOT NULL CHECK (platform IN ('meta','google','amazon')),
  date                     date NOT NULL,
  campaign_id              text NOT NULL,
  campaign_name            text,
  adset_id                 text,
  adset_name               text,
  ad_id                    text NOT NULL,
  ad_name                  text,
  ad_status                text,
  creative_id              text,
  creative_type            text,
  -- Performance
  spend                    numeric(12,2) DEFAULT 0,
  impressions              bigint DEFAULT 0,
  reach                    bigint DEFAULT 0,
  frequency                numeric(8,4) DEFAULT 0,
  clicks                   bigint DEFAULT 0,
  link_clicks              bigint DEFAULT 0,
  ctr                      numeric(8,4) DEFAULT 0,
  unique_ctr               numeric(8,4) DEFAULT 0,
  cpc                      numeric(10,4) DEFAULT 0,
  cpm                      numeric(10,4) DEFAULT 0,
  purchases                bigint DEFAULT 0,
  purchase_value           numeric(12,2) DEFAULT 0,
  add_to_carts             bigint DEFAULT 0,
  checkouts_initiated      bigint DEFAULT 0,
  leads                    bigint DEFAULT 0,
  content_views            bigint DEFAULT 0,
  landing_page_views       bigint DEFAULT 0,
  roas                     numeric(8,4) DEFAULT 0,
  cpa                      numeric(10,4) DEFAULT 0,
  video_views              bigint DEFAULT 0,
  video_thruplay           bigint DEFAULT 0,
  video_p25_views          bigint DEFAULT 0,
  video_p50_views          bigint DEFAULT 0,
  video_p75_views          bigint DEFAULT 0,
  video_p100_views         bigint DEFAULT 0,
  video_avg_watch_time     numeric(10,4) DEFAULT 0,
  video_view_rate          numeric(8,4) DEFAULT 0,
  quality_ranking          text,
  engagement_rate_ranking  text,
  conversion_rate_ranking  text,
  raw_data                 jsonb,
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now(),
  UNIQUE (ad_account_id, platform, ad_id, date)
);

CREATE INDEX IF NOT EXISTS ad_metrics_date_idx
  ON ad_metrics(ad_account_id, date DESC);

-- =============================================
-- sync_logs — track every sync run
-- =============================================
CREATE TABLE IF NOT EXISTS sync_logs (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_account_id    uuid REFERENCES ad_accounts(id) ON DELETE CASCADE,
  sync_type        text NOT NULL DEFAULT 'manual',
  status           text NOT NULL DEFAULT 'running',
  campaigns_synced integer DEFAULT 0,
  adsets_synced    integer DEFAULT 0,
  ads_synced       integer DEFAULT 0,
  issues_found     integer DEFAULT 0,
  error_message    text,
  started_at       timestamptz DEFAULT now(),
  completed_at     timestamptz
);

-- =============================================
-- RLS
-- =============================================
ALTER TABLE adset_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_metrics    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS adset_metrics_owner ON adset_metrics;
CREATE POLICY adset_metrics_owner ON adset_metrics
  USING (ad_account_id IN (SELECT id FROM ad_accounts WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS ad_metrics_owner ON ad_metrics;
CREATE POLICY ad_metrics_owner ON ad_metrics
  USING (ad_account_id IN (SELECT id FROM ad_accounts WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS sync_logs_owner ON sync_logs;
CREATE POLICY sync_logs_owner ON sync_logs
  USING (ad_account_id IN (SELECT id FROM ad_accounts WHERE user_id = auth.uid()));

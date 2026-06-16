-- Run this in your Supabase SQL editor

-- 1. Site config: stores robots.txt and llm.txt content (and any other key-value site settings)
CREATE TABLE IF NOT EXISTS public.site_config (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- 2. URL Redirects: 301/302 redirects managed from admin panel
CREATE TABLE IF NOT EXISTS public.url_redirects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path      TEXT NOT NULL UNIQUE,   -- e.g. /platform/amazon
  destination_path TEXT NOT NULL,          -- e.g. /platform/amazon-ads
  redirect_type    INTEGER NOT NULL DEFAULT 301,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  hits             INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.url_redirects ENABLE ROW LEVEL SECURITY;

-- 3. Site scripts: tracking JS injected into every page head/body
CREATE TABLE IF NOT EXISTS public.site_scripts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  script_html TEXT NOT NULL,             -- raw <script>...</script> or just the JS
  position    TEXT NOT NULL DEFAULT 'head', -- 'head' | 'body_start' | 'body_end'
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.site_scripts ENABLE ROW LEVEL SECURITY;

-- 4. Hit counter function (called by middleware on each redirect match)
CREATE OR REPLACE FUNCTION public.increment_redirect_hits(p_source TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.url_redirects
  SET hits = hits + 1, updated_at = now()
  WHERE source_path = p_source AND is_active = true;
$$;

-- Pre-populate robots.txt with sensible defaults so the editor has initial content
INSERT INTO public.site_config (key, value, updated_at)
VALUES (
  'robots_txt',
  E'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /dashboard\nDisallow: /accounts\nDisallow: /auth/\n\nUser-agent: GPTBot\nAllow: /\nAllow: /platform\nAllow: /ai-engine\nAllow: /pricing\nAllow: /blog/\nDisallow: /api/\nDisallow: /admin/\n\nUser-agent: ClaudeBot\nAllow: /\nAllow: /platform\nAllow: /ai-engine\nAllow: /pricing\nDisallow: /api/\nDisallow: /admin/\n\nUser-agent: AhrefsBot\nDisallow: /\n\nUser-agent: SemrushBot\nDisallow: /\n\nSitemap: https://adnexusone.com/sitemap.xml',
  now()
)
ON CONFLICT (key) DO NOTHING;

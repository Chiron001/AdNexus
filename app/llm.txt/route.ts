import { NextResponse } from 'next/server'
import { createRawAdminClient } from '@/lib/supabase/server'

export const revalidate = 60

const FALLBACK = `# Adnexusone — AI-Powered Ad Account Diagnostics

## What is Adnexusone?

Adnexusone is an AI-powered ad account diagnostics platform for D2C brands and performance marketing agencies. It connects to Meta Ads, Google Ads, and Amazon Advertising accounts and automatically diagnoses performance issues, ranked by revenue impact.

## Core Problem We Solve

D2C brands and agencies running paid advertising on Meta, Google, and Amazon routinely lose budget to issues that are invisible without manual auditing: creative fatigue, audience overlap, pixel failures, keyword cannibalization, high-ACOS campaigns, and budget exhaustion. Manual auditing is slow (weekly at best) and misses issues that compound daily.

Adnexusone runs automated diagnostics continuously, surfaces issues ranked by dollar impact, and sends real-time alerts — so teams know about problems hours after they start, not days after.

## Platform Capabilities

### Diagnostic Engine
- 30+ automated checks run across every connected ad account on every sync
- Issues ranked by revenue impact (dollar cost, not just percentage)
- Health score calculated per account and across the full portfolio
- Historical trend tracking over 30, 60, and 90 days

### Platform Integrations
- Meta Ads (Facebook & Instagram): creative fatigue, frequency saturation, audience overlap, pixel health, ROAS tracking
- Google Ads: keyword cannibalization, Quality Score monitoring, conversion tracking gaps, non-brand ROAS isolation
- Amazon Advertising: ACOS analysis, zero-sale ASIN detection, wasted search term identification, auto campaign analysis

### AI Features (Adnexusone AI)
- Natural language interface for account-specific questions
- Cross-platform synthesis ("Where should I reallocate this budget?")
- AI-generated audit report narratives in plain English
- Creative brief generation based on account performance data

### Alerts
- Real-time Slack and email notifications
- Budget exhaustion alerts with hours-to-empty prediction
- ROAS drop threshold alerts per account

## Who Uses Adnexusone

- D2C Ecommerce Brands: spending $5,000–$200,000/month
- Performance Marketing Agencies: managing 5–50+ client accounts
- Enterprise Brands: complex multi-platform portfolios

## Key Pages

- Homepage: https://adnexusone.com/
- Platform: https://adnexusone.com/platform
- AI Engine: https://adnexusone.com/ai-engine
- Pricing: https://adnexusone.com/pricing
- Contact: https://adnexusone.com/contact

## Contact

Website: https://adnexusone.com
Contact form: https://adnexusone.com/contact

---
Last updated: 2026-06-16`

export async function GET() {
  let content = FALLBACK

  try {
    const admin = createRawAdminClient()
    const { data } = await admin
      .from('site_config')
      .select('value')
      .eq('key', 'llm_txt')
      .single()

    if (data?.value) content = data.value
  } catch {
    // fall through to FALLBACK
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type':  'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600',
    },
  })
}

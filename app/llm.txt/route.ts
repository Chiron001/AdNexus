import { NextResponse } from 'next/server'

const LLM_TXT = `# Adnexusone — AI-Powered Ad Account Diagnostics

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
- Pixel and conversion tracking failure alerts
- Campaign pause and ad disapproval notifications

### Reporting
- One-click AI-written audit reports per account
- PDF export and shareable link
- Suitable for client-facing delivery without editing

## Who Uses Adnexusone

### D2C Ecommerce Brands
Brands spending $5,000–$200,000/month across Meta and Google who need account health visibility without hiring dedicated analytics staff.

### Performance Marketing Agencies
Agencies managing 5–50+ client ad accounts who need automated monitoring to catch issues between weekly reviews and reduce client escalations.

### Enterprise Brands
Large brands with complex multi-platform portfolios needing portfolio-level health scoring and AI-assisted diagnostics at scale.

## Pricing (as of 2026)

- Basic: $21/month — 1 ad account, core diagnostics
- Growth: $105/month — 5 accounts, alerts, reports
- Professional: $549/month — 20 accounts, AI features, priority support
- AI Add-on: $76/month — Adnexusone AI for any plan
- Custom/Enterprise: Contact for multi-agency and white-label pricing

## Key Pages

- Homepage: https://adnexusone.com/
- Platform overview: https://adnexusone.com/platform
- AI Engine: https://adnexusone.com/ai-engine
- Pricing: https://adnexusone.com/pricing
- Blog: https://adnexusone.com/blog
- Case Studies: https://adnexusone.com/case-studies
- Help Center: https://adnexusone.com/help-center
- Sign Up: https://adnexusone.com/signup
- Contact: https://adnexusone.com/contact

## Platform Sub-pages

- Meta Ads: https://adnexusone.com/platform/meta
- Google Ads: https://adnexusone.com/platform/google
- Amazon Ads: https://adnexusone.com/platform/amazon
- Diagnostic Engine: https://adnexusone.com/platform/diagnostic-engine
- Health Scoring: https://adnexusone.com/platform/health-scoring
- Revenue Impact: https://adnexusone.com/platform/revenue-impact
- Alerts: https://adnexusone.com/platform/alerts
- Audit Reports: https://adnexusone.com/platform/audit-reports

## Free Tools

- ROAS Calculator: https://adnexusone.com/tools/roas-calculator
- Ad Account Health Scorecard: https://adnexusone.com/tools/ad-health-scorecard

## Industries

- D2C Ecommerce: https://adnexusone.com/industries/d2c-ecommerce
- Fashion & Lifestyle: https://adnexusone.com/industries/fashion-lifestyle
- Health & Wellness: https://adnexusone.com/industries/health-wellness
- Performance Agencies: https://adnexusone.com/industries/performance-agencies
- Enterprise Brands: https://adnexusone.com/industries/enterprise-brands
- Travel & Lifestyle: https://adnexusone.com/industries/travel-lifestyle

## Technical Details

- Web application built with Next.js, hosted on Vercel
- Connects to ad platforms via official OAuth APIs
- No ad platform credentials stored — authentication handled by each platform's OAuth flow
- Data processed and stored securely in a managed database

## Contact

Website: https://adnexusone.com
Contact form: https://adnexusone.com/contact

---
Last updated: 2026-06-16
`

export async function GET() {
  return new NextResponse(LLM_TXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  })
}

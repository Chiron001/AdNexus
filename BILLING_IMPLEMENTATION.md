# AdNexus — Subscription Billing with Paddle
## 30-day free trial → auto-charge · Indian business · USD billing

---

## Why Paddle Works for Indian Founders

- ✅ Indian businesses accepted (no RBI license needed)
- ✅ Charges customers in USD (they see $19, $99, $499)
- ✅ You receive payouts in INR to your Indian bank account
- ✅ Paddle is Merchant of Record — they handle GST/VAT globally, you don't
- ✅ Native trial period support (`trial_period_days`)
- ✅ Hosted checkout overlay — card never touches your server (PCI compliant)
- ✅ Webhooks identical to Stripe in concept
- ✅ npm SDK available (`@paddle/paddle-node-sdk`)

---

## How the Complete Flow Works

```
User signs up (email/Google/Microsoft)
        │
        ▼
Account created in Supabase
        │
        ▼
Redirect → /onboarding/payment
"Start your 30-day free trial — no charge today"
        │
        ▼
Paddle.js opens inline checkout overlay on YOUR page
User enters card details (card stays on Paddle's servers)
        │
        ▼
Paddle creates:
  - Customer record
  - Subscription (Basic $19/mo, trial_period_days: 30)
  Status: "trialing" — card NOT charged
        │
        ▼
Paddle fires webhook: subscription.created (status: trialing)
We save to Supabase profiles:
  - paddle_customer_id
  - paddle_subscription_id
  - subscription_status = 'trialing'
  - trial_ends_at = now + 30 days
        │
        ▼
User enters dashboard — sees trial banner
"🎉 28 days left in your free trial"
        │
        ▼  (Paddle handles this automatically — zero code from us)
Day 27: Paddle fires subscription.updated (trial_will_end)
        → We send email: "Your trial ends in 3 days"
        │
        ▼
Day 30: Paddle charges card $19
        → Paddle fires transaction.completed
        → We update: subscription_status = 'active'
        → We log to billing_events
        │
        ▼
Every month: Paddle auto-charges $19, fires webhook
User can upgrade/downgrade/cancel anytime via Paddle Portal
```

---

## What YOU Need to Do in Paddle Dashboard

### Step 1 — Create Paddle Account
- Go to paddle.com/billing → Sign up
- Complete business verification:
  - Business type (individual or company)
  - PAN card / business registration
  - Indian bank account for payouts
- Approval takes 1–3 business days

### Step 2 — Switch to Sandbox First (for testing)
- Paddle Dashboard → top-left toggle → **Sandbox**
- Build and test everything in sandbox
- Switch to Live when ready to launch

### Step 3 — Create Products & Prices
Paddle Dashboard → **Catalog** → **Products** → **New product**

**Product 1: Basic**
- Name: `Basic`
- Description: `1 ad account · 10 diagnostic checks · 30-day free trial`
- Add price:
  - Amount: `$19.00`
  - Billing period: Monthly
  - Trial period: `30` days
  - Save → copy **Price ID** (`pri_...`)

**Product 2: Growth**
- Name: `Growth`
- Description: `5 ad accounts · 1,000+ diagnostic checks · AI recommendations`
- Add price:
  - Amount: `$99.00`
  - Billing period: Monthly
  - No trial
  - Save → copy **Price ID** (`pri_...`)

**Product 3: Professional**
- Name: `Professional`
- Description: `50 ad accounts · AI Engine included · White-label reports`
- Add price:
  - Amount: `$499.00`
  - Billing period: Monthly
  - No trial
  - Save → copy **Price ID** (`pri_...`)

### Step 4 — Add Webhook Endpoint
Paddle Dashboard → **Developer tools** → **Notifications** → **New destination**

- URL: `https://ad-nexus-virid.vercel.app/api/paddle/webhook`
- Notification type: Webhook
- Select these events:
  - `subscription.created`
  - `subscription.updated`
  - `subscription.activated`
  - `subscription.cancelled`
  - `subscription.past_due`
  - `transaction.completed`
  - `transaction.payment_failed`
- Save → copy **Webhook Secret Key**

### Step 5 — Get API Keys
Paddle Dashboard → **Developer tools** → **Authentication**

Copy:
- **API Key** (server-side secret — never expose to browser)
- **Client-side token** (safe to use in browser — for Paddle.js)
- **Seller ID** (your account ID — shown in dashboard)

### Step 6 — Add to Vercel Environment Variables
Vercel Dashboard → Project → Settings → Environment Variables

```
PADDLE_API_KEY                = pdl_live_...
PADDLE_WEBHOOK_SECRET         = pdlntfy_...
PADDLE_SELLER_ID              = 12345
PADDLE_PRICE_BASIC            = pri_...
PADDLE_PRICE_GROWTH           = pri_...
PADDLE_PRICE_AGENCY           = pri_...
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN = cli_...
NEXT_PUBLIC_PADDLE_ENV          = production
```

### Step 7 — Run DB Migration in Supabase
Supabase Dashboard → SQL Editor → Run:

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS paddle_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status    TEXT DEFAULT 'trialing',
  ADD COLUMN IF NOT EXISTS trial_ends_at          TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_paddle_customer
  ON profiles(paddle_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_paddle_sub
  ON profiles(paddle_subscription_id);

ALTER TABLE billing_events
  ADD COLUMN IF NOT EXISTS paddle_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS amount_usd            NUMERIC(10,2);
```

---

## Files to Build (Implementation Checklist)

### Install package
```bash
npm install @paddle/paddle-node-sdk @paddle/paddle-js
```

### New Files

| File | Purpose |
|------|---------|
| `lib/paddle/client.ts` | Paddle server SDK singleton |
| `lib/paddle/prices.ts` | Price ID constants from env vars |
| `app/api/paddle/webhook/route.ts` | Receives & verifies all Paddle events |
| `app/api/paddle/cancel/route.ts` | Cancels a subscription |
| `app/api/paddle/portal/route.ts` | Generates Paddle Customer Portal URL |
| `app/(auth)/onboarding/payment/page.tsx` | Trial activation page with Paddle checkout |
| `components/billing/PaddleCheckout.tsx` | Loads Paddle.js + opens checkout overlay |
| `components/dashboard/TrialBanner.tsx` | "X days left in trial" banner |

### Modified Files

| File | Change |
|------|--------|
| `app/(auth)/signup/page.tsx` | After account creation → redirect to /onboarding/payment |
| `app/(dashboard)/layout.tsx` | Pass subscription_status + trial_ends_at to children |
| `app/(dashboard)/billing/page.tsx` | Show real Paddle subscription data |
| `app/(dashboard)/settings/page.tsx` | "Manage billing" button → Paddle Portal |
| `components/dashboard/Topbar.tsx` | Show trial days remaining |

---

## Security Model

```
Browser
  │
  │  User types card in Paddle's overlay (hosted by paddle.com)
  │  Card NEVER reaches your Next.js server
  ▼
Paddle.js (loaded from cdn.paddle.com)
  │
  │  Returns: subscription created confirmation
  ▼
Your /onboarding/payment page
  │
  │  Receives Paddle's client-side success callback
  │  Redirects user to /dashboard
  ▼
Paddle Webhook → /api/paddle/webhook
  │  Verifies PADDLE_WEBHOOK_SECRET (HMAC signature)
  │  Updates Supabase profiles + billing_events
  └→ Single source of truth for subscription state
```

**What we store:**
- ✅ `paddle_customer_id` — safe opaque ID
- ✅ `paddle_subscription_id` — safe opaque ID
- ✅ `subscription_status` — trialing / active / past_due / cancelled
- ✅ `trial_ends_at` — timestamp
- ❌ Card number — NEVER
- ❌ CVV — NEVER

---

## Trial UX

| State | What user sees |
|-------|---------------|
| Days 1–27 | Green banner: "🎉 X days left in your free trial" |
| Days 27–30 | Amber banner: "⚠️ Trial ends in 3 days — card will be charged $19" |
| Day 30+ (active) | No banner |
| Payment failed | Red banner: "❌ Payment failed — update your card" + link to Paddle Portal |
| Cancelled | Downgrade to Basic read-only mode |

---

## Upgrade / Downgrade Flow

User clicks "Upgrade to Growth" in Settings:
```
Our API → Paddle: subscription.update(new_price_id)
Paddle prorates immediately
Paddle webhook → we update profiles.plan
```

No new checkout needed — Paddle handles proration on the stored card.

---

## Test Cards (Sandbox)

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Always succeeds |
| `4000 0000 0000 0002` | Always declined |
| `4000 0027 6000 3184` | Requires 3D Secure |

Any future expiry date, any CVV.

---

## Build Order

1. DB migration (Supabase)
2. `lib/paddle/client.ts` + `lib/paddle/prices.ts`
3. `app/api/paddle/webhook/route.ts` (most critical — source of truth)
4. `app/(auth)/onboarding/payment/page.tsx` + `PaddleCheckout` component
5. Modify signup page redirect
6. `TrialBanner` component + wire into dashboard layout
7. Billing page + Settings page updates
8. Test end-to-end in sandbox
9. Switch env vars to production → go live

---

## Ready to Build?

Once you confirm:
1. ✅ Paddle account approved
2. ✅ Products & prices created
3. ✅ Webhook endpoint registered
4. ✅ All env vars added to Vercel
5. ✅ DB migration run

Share the 3 Price IDs:
```
Basic price ID:        pri_...
Growth price ID:       pri_...
Professional price ID: pri_...
```
And I'll implement everything immediately.

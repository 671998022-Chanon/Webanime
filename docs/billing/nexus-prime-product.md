# Nexus Prime — Stripe Product & Price Configuration

> **Sprint 5 — Billing**
> **Status:** Configured (test mode)
> **Last updated:** 2026-06-25

---

## Overview

Nexus Anime offers a single subscription tier — **Nexus Prime** — providing unlimited ad-free streaming of the full anime library.

## Product Details

| Property | Value |
|----------|-------|
| **Product name** | Nexus Prime |
| **Product ID** | `prod_NexusPrime` (placeholder — created in Stripe test mode) |
| **Description** | Unlimited ad-free anime streaming, all titles, all devices |
| **Currency** | USD |
| **Billing interval** | Monthly |
| **Price** | $7.99 / month |
| **Price ID** | `price_NexusPrimeMonthly` (placeholder — set via `STRIPE_NEXUS_PRICE_ID`) |
| **Trial period** | None (MVP — no free tier) |
| **Tax behavior** | Inclusive (default; configurable per jurisdiction) |

## Environment Variable

| Variable | Description |
|----------|-------------|
| `STRIPE_NEXUS_PRICE_ID` | Stripe Price ID for the Nexus Prime monthly subscription. Populated after running the Stripe CLI setup script or creating the price manually in the Stripe Dashboard. |

## Setup Steps (test mode)

1. **Create Stripe account** (if not already done) at https://dashboard.stripe.com/register
2. **Switch to test mode** (toggle in Stripe Dashboard bottom-left)
3. **Create product** via Stripe Dashboard → Products → + Add product:
   - Name: `Nexus Prime`
   - Description: `Unlimited ad-free anime streaming`
4. **Create price** on the product:
   - Pricing model: Recurring
   - Billing period: Monthly
   - Unit price: `7.99`
   - Currency: USD
5. **Copy the Price ID** (format `price_...`) into `STRIPE_NEXUS_PRICE_ID` in `.env.local`
6. **Copy API keys** into `.env.local`:
   - `STRIPE_SECRET_KEY` → `sk_test_...` (restricted key recommended)
   - `STRIPE_WEBHOOK_SECRET` → `whsec_...` (from Stripe CLI or Dashboard → Developers → Webhooks)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_test_...`

## Notes

- **No free tier** — the MVP is subscription-only. A free tier may be added in a future milestone.
- **Single currency (USD)** — multi-currency support is out of scope for MVP.
- **Price changes** — to change the price after launch, create a new Price in Stripe and update `STRIPE_NEXUS_PRICE_ID`. Existing subscribers on the old price remain until they cancel.
- **Stripe test mode** — all keys prefixed `sk_test_` / `pk_test_`. Production keys (`sk_live_` / `pk_live_`) are swapped in Vercel production env at launch.

# Task 5.1 Report — Create Stripe account (test mode); configure products and prices

**Status:** DONE_WITH_CONCERNS
**Date:** 2026-06-25
**Owner:** Tech Lead

---

## What Was Implemented

1. **Added `STRIPE_NEXUS_PRICE_ID` to environment schema** (`apps/web/lib/env.ts`) — the Zod schema now validates the new variable at startup, ensuring the price ID is present before billing code runs.

2. **Updated `.env.example` and `.env.local`** — added `STRIPE_NEXUS_PRICE_ID=` placeholder to both files so developers know to populate it after creating the price in Stripe test mode.

3. **Updated `docs/environment-specification.md`** — added `STRIPE_NEXUS_PRICE_ID` to:
   - Section 4.5 (API variable registry)
   - Section 5 (environment tier matrix)
   - Section 6.3 (validation pattern code snippet)
   - Section 8 (complete `.env.example` block)

4. **Created `docs/billing/nexus-prime-product.md`** — standalone product/price configuration document with:
   - Product details (name, currency, $7.99/mo, monthly interval, no trial)
   - Environment variable reference
   - Step-by-step test mode setup instructions
   - Notes on price changes, currency scope, and test/live key rotation

## Files Changed

| File | Change |
|------|--------|
| `apps/web/lib/env.ts` | Added `STRIPE_NEXUS_PRICE_ID` to Zod schema + parse call |
| `.env.example` | Added `STRIPE_NEXUS_PRICE_ID=` placeholder |
| `.env.local` | Added `STRIPE_NEXUS_PRICE_ID=price_...` placeholder |
| `docs/environment-specification.md` | Added variable to registry, tier matrix, validation snippet, and full example |
| `docs/billing/nexus-prime-product.md` | New — product/price configuration doc |

## Concerns

1. **Stripe account creation is a human action** — the actual Stripe account, product, and price must be created manually in the Stripe Dashboard. This task prepared the configuration scaffolding but cannot complete the external setup programmatically. The `STRIPE_NEXUS_PRICE_ID` value remains a placeholder until the Tech Lead creates the price in Stripe test mode.

2. **Product/Price IDs are placeholders** — `prod_NexusPrime` and `price_NexusPrimeMonthly` in the product doc are human-readable stand-ins. The real IDs will be known only after the Stripe Dashboard setup is complete. The doc should be updated with actual IDs once created.

3. **Webhook secret requires endpoint registration** — `STRIPE_WEBHOOK_SECRET` cannot be populated until the webhook endpoint is registered in Stripe Dashboard (or via Stripe CLI). This is a follow-up action after the account is created.

4. **Stripe SDK and `lib/stripe.ts` were pre-implemented** — these were already present in the working tree before this task. Task 5.1 focused on env config and product documentation, which is now complete.

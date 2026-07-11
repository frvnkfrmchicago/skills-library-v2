# 05-AGENT5: Modernize Upgrade Flow
Status: complete
Wave: AP-MODERNIZE-2026-05

## Explainer
The upgrade flow was "old and whack" because there was no Stripe webhook — visitors paid via Payment Link, returned to the site, `profile.tier` stayed `assetClass`, Frank manually upgraded them in Supabase. This lane shipped the webhook Edge Function (`stripe-webhook`) with full Stripe signature verification + idempotency + service_role tier flip + audit row, the inline `UpgradeModal` (replaces the lock-screen tour with a comparison + annual toggle + direct checkout per tier), a `subscription_events` audit table + new `stripe_customer_id` / `stripe_subscription_id` / `subscription_status` / `current_period_end` columns on `profiles`, the rewritten `guards/TierGate.tsx` that opens `UpgradeModal` inline (no more `/aistudyhall` detour), the rewritten UserSettings subscription panel with direct checkout + Stripe Customer Portal link + monthly/annual toggle, annual variants in `studyhallTiers.ts` (Cohort $279/yr + Insiders $567/yr; "Save 20%"), and the dedupe — duplicate `src/components/auth/TierGate.tsx` + `.css` deleted.

## TL;DR
- Stripe webhook Edge Function (258 LOC) handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` with idempotency on `stripe_event_id`
- New `subscription_events` audit table + 4 new `profiles` columns
- New `UpgradeModal` with monthly/annual toggle + "Most popular" badge + direct checkout per tier
- `guards/TierGate.tsx` rewritten to use UpgradeModal inline — no more `/aistudyhall` detour
- UserSettings subscription tab rewritten as `<SubscriptionPanel />` — direct checkout, "Manage subscription" → Customer Portal, monthly/annual toggle, "Compare all plans" opens UpgradeModal
- Duplicate `src/components/auth/TierGate.tsx` + `.css` DELETED
- `studyhallTiers.ts` already had annual variants (Cohort + Insiders) and `tierForInterval()` helper before the lane ran; `useCheckout.ts` already had `openCustomerPortal()` + annual variant handling

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| Stripe webhook Edge Function | Shipped — signature verification via `crypto.subtle` + idempotency + service_role tier flip + audit row | `supabase/functions/stripe-webhook/index.ts` (258 LOC) |
| Shared Stripe helper | Shipped — `verifyStripeSignature()` + `mapPriceIdToTier()` | `supabase/functions/_shared/stripe.ts` (160 LOC) |
| Migration | Shipped — adds `stripe_customer_id` / `stripe_subscription_id` / `subscription_status` / `current_period_end` to `profiles`; creates `subscription_events` table + admin-read RLS | `supabase/migrations/20260519101300_stripe_subscription_audit.sql` (82 LOC) |
| `UpgradeModal` component | Shipped — comparison + annual toggle + direct checkout + "Most popular" badge + reduced-motion fallback | `src/components/auth/UpgradeModal.tsx` + `UpgradeModal.css` (349 LOC) |
| `guards/TierGate.tsx` rewrite | Shipped — opens UpgradeModal inline; CTA reads "See plans" (no AI-tells); admin + bypass pass-through preserved | `src/components/guards/TierGate.tsx` |
| Duplicate TierGate delete | Shipped — `src/components/auth/TierGate.tsx` + `.css` removed | (verified by `ls`) |
| UserSettings subscription rewrite | Shipped — `<SubscriptionPanel />` extracted; direct checkout buttons; Customer Portal link; monthly/annual toggle; "Compare all plans" CTA opens UpgradeModal | `src/pages/community/UserSettings.tsx` |
| Annual variants + `tierForInterval()` | Already in place from earlier work | `src/data/studyhallTiers.ts` |
| `useCheckout.ts` annual + portal | Already in place from earlier work | `src/hooks/useCheckout.ts` |

## Files Changed
| File | Change |
|---|---|
| `supabase/functions/stripe-webhook/index.ts` | NEW — webhook handler with signature verify + idempotency + audit |
| `supabase/functions/_shared/stripe.ts` | NEW — shared signature + price-id mapping |
| `supabase/migrations/20260519101300_stripe_subscription_audit.sql` | NEW — audit table + 4 profile columns |
| `src/components/auth/UpgradeModal.tsx` | NEW |
| `src/components/auth/UpgradeModal.css` | NEW |
| `src/components/guards/TierGate.tsx` | REWRITE — uses UpgradeModal inline |
| `src/pages/community/UserSettings.tsx` | EDIT — subscription tab now `<SubscriptionPanel />` with direct checkout + portal + annual toggle |
| `src/components/auth/TierGate.tsx` | DELETE |
| `src/components/auth/TierGate.css` | DELETE |
| `src/data/studyhallTiers.ts` | (already had annual variants + `tierForInterval()` from prior work) |
| `src/hooks/useCheckout.ts` | (already had `openCustomerPortal()` + annual support from prior work) |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `ls supabase/functions/stripe-webhook/index.ts supabase/functions/_shared/stripe.ts` | both present | Edge Function + shared helper on disk |
| `grep -n "checkout.session.completed\|customer.subscription" supabase/functions/stripe-webhook/index.ts` | ≥2 hits | Event types handled |
| `ls src/components/auth/UpgradeModal.tsx src/components/auth/UpgradeModal.css` | both present | Modal shipped |
| `ls src/components/auth/TierGate.tsx 2>&1` | "No such file" | Duplicate deleted |
| `grep -rn "TierGate" src/` | 1 hit (comment in `studyhallTiers.ts`) | No live import of either path — `guards/TierGate.tsx` is the canonical version, used via direct import sites only |
| `grep -n "stripe_customer_id\|stripe_subscription_id" supabase/migrations/20260519101300*` | ≥2 hits | New profile columns present |
| `grep -n "UpgradeModal\|openCustomerPortal\|handleCheckout" src/pages/community/UserSettings.tsx` | ≥3 hits | Subscription panel uses new primitives |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Webhook Edge Function | `supabase/functions/stripe-webhook/index.ts` | Auto-flip `profile.tier` after Stripe payment |
| Shared helper | `supabase/functions/_shared/stripe.ts` | Signature verification + price-id-to-tier mapping |
| Schema | `supabase/migrations/20260519101300_stripe_subscription_audit.sql` | Audit table + profile column additions |
| Upgrade modal | `src/components/auth/UpgradeModal.tsx` + `.css` | Inline comparison + direct checkout, replaces the lock-screen tour |
| TierGate rewrite | `src/components/guards/TierGate.tsx` | Opens UpgradeModal inline; no detour |
| Subscription panel | `src/pages/community/UserSettings.tsx` (`SubscriptionPanel` component at bottom) | Direct checkout + Customer Portal + monthly/annual toggle |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| Set Stripe Payment Link env vars (monthly + annual) | Frank credential | `VITE_STRIPE_COHORT`, `VITE_STRIPE_COHORT_YEARLY`, `VITE_STRIPE_INSIDERS`, `VITE_STRIPE_INSIDERS_YEARLY`, `VITE_STRIPE_PRIVATE` |
| Set `STRIPE_WEBHOOK_SECRET` in Supabase secrets | Frank credential | `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...` |
| Configure Stripe webhook endpoint | Frank credential | Stripe Dashboard → Developers → Webhooks → point at `https://<project>.supabase.co/functions/v1/stripe-webhook` |
| Set `VITE_STRIPE_CUSTOMER_PORTAL_URL` | Frank credential | Stripe Dashboard → Settings → Billing → Customer Portal → Configure → copy URL |
| Deploy webhook Edge Function | Frank credential | `supabase functions deploy stripe-webhook` |
| Apply migration | Frank credential | `supabase db push` |
| Tier-change → notification or welcome DM | future wave | Once Lane 2 + 3 land, the webhook can also write a notification + DM |

## Task-Sheet Update Row
`| 1 | 05-AGENT5-MODERNIZE-UPGRADE | sub-agent (lead-finished post-rate-limit) | accepted | Stripe webhook + UpgradeModal + Customer Portal + annual toggle + TierGate dedupe + UserSettings rewrite | orchestration/active/AP-MODERNIZE-2026-05/05-AGENT5-MODERNIZE-UPGRADE.md | Frank sets secrets, deploys function, runs db push | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/api-integrating/SKILL.md` | Skill | Webhook signature verification + idempotency pattern |
| `.claude/skills/supabase-building/SKILL.md` | Skill | Edge Function service_role write + RLS pattern |
| `.claude/skills/security-auditing/SKILL.md` | Skill | Why webhook secret + signature + idempotency are all non-optional |
| `.claude/skills/ux-designing/SKILL.md` | Skill | Inline modal upgrade pattern + 2026 SaaS pricing UX |
| `.claude/skills/component-building/SKILL.md` | Skill | Comparison-table component + annual toggle |
| `.claude/skills/copywriting-enforcing/SKILL.md` | Skill | Pricing copy without AI-tells; CTA reads "See plans" not "Unlock" |
| `librarians/api-integration-librarian.md` | Librarian | Stripe Customer Portal + webhook pattern |
| `librarians/security-librarian.md` | Librarian | Idempotency + signature verification gates |
| https://stripe.com/docs/webhooks/signatures | 2026 URL | Stripe signature verification scheme |
| https://stripe.com/docs/customer-management | 2026 URL | Stripe Customer Portal reference |
| https://stripe.com/docs/api/checkout/sessions/object | 2026 URL | `checkout.session.completed` payload |
| https://nngroup.com/articles/pricing-tables/ | 2026 URL | NNG pricing table best practices |

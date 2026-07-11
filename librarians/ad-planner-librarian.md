---
name: ad-planner-librarian
description: Plug-into-any-app first-party ad network — scan the app for ad-eligible surfaces, derive placements, preview creatives Facebook-style across every placement, run state/age/geo-compliant delivery, accumulate impression/click/outcome data, and recommend the best placements over time. Three tiers (advertiser / admin / system), theme-adaptive to the host app, payment-rail pluggable (ACH for cannabis, Stripe for everything else).
last_updated: 2026-06-13
version: v1.0
sibling: app-scanner-librarian
---

# Ad Planner Librarian

**Role**: You turn any app into its own first-party ad network. You do for ADS what the App Scanner Librarian does for SCREENS: point yourself at an app, discover where ads can legally and natively live, and stand up the full advertiser→delivery→measurement→optimization loop — adapted to that app's theme, vertical, and payment rails.

**Context**: Cannabis (and many other verticals) can't use Google/Meta/TikTok. Hooking up a hosted network (the Kevel / AdButler / "plug-it-in-and-run-ads-on-your-site" category) means surrendering placement control, theming, and first-party data. This librarian builds the network INSIDE the app instead: the publisher owns the surfaces (70–90% margin, no exchange tax), the creative shapes, the compliance gate, and the data. The same engine re-points at the next app by swapping config, not code.

**Goal**: A working ad network with three tiers and six subsystems, reusable across apps:
- **Advertiser tier** (`/ads`) — self-serve: pick a format, author + preview a creative across every placement, target, fund a wallet, launch, watch outcomes.
- **Admin tier** (`/admin/ads`) — connected to the host app's existing admin (role = the app's admin flag): moderate/approve/pause/refund, run house ads, support cases, monitor every advertiser's ads + outcomes platform-wide.
- **System tier** (`lib/ads/*`) — the engine: scan, placement map, decisioning, measurement, settlement, recommendations.

---

## The six subsystems (what to build, where it lives)

| # | Subsystem | What it does | Canonical module (GrazzHopper reference impl) |
|---|---|---|---|
| 1 | **Surface scan → placement** | Read the app-scanner manifest, classify every screen for ad-eligibility, derive the placement map. Adaptable: classification rules are per-app config, not hardcoded. | `lib/ads/surface-scanner.ts` → `lib/ads/placement-map.ts`; live proof `GET /api/v1/ads/placements/coverage` |
| 2 | **Templates + preview** | A typed format registry (native, vertical/story, carousel, interstitial, reco-rail, live-segment) rendered render-once in both the live app AND a Facebook-style placement-aware preview. | `lib/ads/templates/**`, `components/ads/preview/AdPreviewStudio.tsx` (`/ads/preview`) |
| 3 | **Decisioning + delivery** | Per request, pick the best eligible ad: compliance gate FIRST (state/age/geo fail-closed), then habitat/interest targeting, budget, frequency cap; serve via a generic `<AdSlot>` on any surface; house ads fill unsold inventory. | `lib/ads/decisioning.ts`, `components/ads/AdSlot.tsx`, `lib/ads/house-ads.ts` |
| 4 | **Measurement** | Three ledgers — impressions (served), clicks (engaged), outcomes (results that matter to the vertical). | `lib/ads/outcomes.ts`, `gh_ad_impressions` / `gh_ad_clicks` / `gh_ad_outcomes` |
| 5 | **Money** | Prepaid wallet + settlement, on a **pluggable payment rail** (see below). | `lib/ads/billing.ts`, `lib/ads/settlement.ts`, `lib/ads/payment-rails.ts` |
| 6 | **Optimization** | Accumulate the ledgers over time and RECOMMEND: best placements for a campaign, underperformers to cut, undersold inventory to push. This is the "gets smarter the longer it runs" layer. | `lib/ads/recommendations.ts` |

---

## Adapt to any platform (the reusability contract)

This is the whole point — same engine, different app, by config:

| Dimension | How it adapts | Rule |
|---|---|---|
| **Theme (colors / type / experience)** | Templates + slots use the HOST app's design tokens (CSS variables), never literal hex. Drop the engine into another app and the ads inherit that app's palette and typography automatically. | NEVER hardcode brand color in a template — read the host token. The chrome is quiet; color comes from the host theme + the creative. |
| **Motion / ambient background** | Ambient motion (subtle moving background) is a host-theme concern the surface owns; ads themselves stay calm and native. Opt-in per app via a token/flag; default to restrained (engaging, never distracting). | Ads do not fight the page. One accent, calm motion, no seizure-grade animation. |
| **Surfaces** | The surface scanner reads that app's screen manifest; classification rules (which groups are ad-eligible, which are fail-closed: auth/checkout/compliance/admin) are per-app config. | Scan first, classify by config, never reuse one app's group names on another. |
| **Vertical + compliance** | A `vertical` config (cannabis | alcohol | finance | general) drives the delivery compliance gate (e.g. cannabis = state + 21+ fail-closed, no health claims). | Compliance is the FIRST delivery gate, fail-closed, config-driven per vertical. |
| **Payment rail** | Config selects the rail (below). | The vertical pins the rail; a cannabis app can NEVER fall back to a card network. |
| **Outcomes** | Which outcomes "matter" is per-vertical config (cannabis: store visits, menu views, directions, age-verified reach; ecommerce: add-to-cart, purchase). | Report the vertical's real KPIs, never generic vanity metrics. |

---

## Payment rails (pluggable)

The wallet/settlement call a rail abstraction (`lib/ads/payment-rails.ts`), selected by the app's `vertical`/config:

| Rail | When | Providers |
|---|---|---|
| **ACH / pay-by-bank** | Cannabis and any vertical card networks ban | Aeropay, CanPay, Payrio (via the host's payment-orchestrator) |
| **Card (Stripe)** | Every other vertical | Stripe (register a Stripe adapter on the non-cannabis app) |

**Hard rule:** a cannabis app is pinned to ACH and MUST reject a card rail — Stripe/Square/PayPal freeze cannabis MCC accounts. The abstraction exists so the SAME engine runs Stripe on a general-vertical app and ACH on a cannabis app, chosen by config, never by editing the engine.

---

## Tiers in detail (advertiser / admin / system)

- **Advertiser (user):** signs in with the host app's advertiser/business role, funds a wallet, builds compliant campaigns with live multi-placement preview + an outcome forecast, sees only their own campaigns + outcomes.
- **Admin:** IS the host app's admin (same role flag — on GrazzHopper, `gh_profiles.is_admin`). Reviews/approves/pauses/refunds any campaign, runs house ads, handles **support cases** (sees any advertiser's campaigns, creatives, spend, outcomes), and monitors platform-wide performance + the recommendation insights.
- **System:** the engine — scans, decides, measures, settles, recommends. No human in the loop per request; sub-50ms decisioning convention.

---

## Data accumulation → recommendations (the "learns over time" loop)

Every served ad writes an impression; every tap a click; every downstream result an outcome — each attributed to `(campaign, placement zone)`. `lib/ads/recommendations.ts` reads those ledgers and produces:
- **Best placements for a campaign** — rank zones by historical CTR / conversion / cost-per-outcome for similar targeting + template.
- **Underperformers** — zones spending budget with poor outcomes (cut or re-bid).
- **Undersold inventory** — eligible surfaces with low fill the platform should push (house ads or discounting).
- **"Good ad → good place" suggestions** — surfaced to the advertiser in the wizard and to admin platform-wide.

All from REAL accumulated rows. With no data yet, recommendations return an honest "not enough data yet," never a fabricated suggestion.

---

## How to apply this librarian to a NEW app

1. **Scan** — point the surface scanner at the app's screen manifest (run the App Scanner Librarian first if there's no manifest). Configure ad-eligibility + fail-closed rules for that app's groups.
2. **Theme** — confirm the templates read the host app's design tokens. No new palette.
3. **Vertical** — set the vertical (drives compliance gate + which outcomes matter + payment rail).
4. **Rail** — register the payment rail (ACH providers, or a Stripe adapter for non-cannabis).
5. **Tiers** — bind the advertiser role + admin role to the host app's existing auth.
6. **Run** — seed REAL placement inventory (config, not mock), connect the wallet, go live. Ads run once connected.
7. **Optimize** — let the ledgers accumulate; the recommendation engine improves placement suggestions over time.

---

## NEVER

- **NEVER** hardcode a brand color/font in a template — read the host app's design tokens, or the engine won't adapt to the next app.
- **NEVER** let a cannabis-vertical app use a card rail (Stripe/Square/PayPal) — it must be pinned to ACH and reject cards.
- **NEVER** seed mock/demo/sample campaigns, creatives, outcomes, or house promos — verify on real data, report honest zeros. (Sibling rule: no mock data, ever.)
- **NEVER** serve an ad on a fail-closed surface (auth, onboarding, checkout/payment, age/identity verify, compliance, admin, settings, legal) or to a viewer whose compliance state is unknown.
- **NEVER** skip the compliance gate as the FIRST delivery check — it precedes targeting, budget, and frequency.
- **NEVER** fabricate a placement recommendation — if the ledgers lack data, say "not enough data yet."
- **NEVER** reuse one app's surface-classification rules on another — scan first, classify by that app's config.

---

## Related

| Resource | Path |
|---|---|
| App Scanner Librarian (the surface-discovery sibling — run first) | `librarians/app-scanner-librarian.md` |
| Orchestration Librarian (multi-agent build of the six subsystems) | `librarians/orchestration-librarian.md` |
| SAD Librarian (the 5-gate front gate before building) | `librarians/sad-librarian.md` |
| Store Compliance Librarian (vertical compliance gates) | `librarians/store-compliance-librarian.md` |
| UX / Experience Designer Librarians (the engaging, non-tedious console + preview) | `librarians/ux-design-librarian.md`, `librarians/experience-designer-librarian.md` |
| Database Librarian (the measurement ledgers + recommendation reads) | `librarians/database-librarian.md` |

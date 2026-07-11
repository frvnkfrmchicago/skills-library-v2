---
name: ad-planner
description: Install a first-party ad network into any app — scan its surfaces for ad-eligible placements, render compliant creatives with Facebook-style multi-placement preview, run state/age/vertical-gated delivery, accumulate impression/click/outcome data, and recommend the best placements over time. Three tiers (advertiser / admin / system), theme-adaptive, actor-model + payment-rail configurable per app. Use when a user wants to "run ads on my app", "add an ad system", "monetize with ads", "build a self-serve ad platform", or "turn my app into an ad network".
librarian: librarians/ad-planner-librarian.md
last_updated: 2026-06-13
version: v1.0
---

# Ad Planner — Installable Ad Network Skill

Read `librarians/ad-planner-librarian.md` in full first — it is the architecture spec. This SKILL is the install/apply procedure. Reference implementation: GrazzHopper (`grazzhopper-landing/lib/ads/**`).

## What you get (one engine, configured per app)

Three tiers — **advertiser** (`/ads`), **admin** (host app's admin role), **system** (`lib/ads/*`) — over six subsystems: surface-scan→placement, templates+preview, decisioning+delivery, measurement, money, optimization. Everything that differs per app lives in ONE config; the engine code never changes.

## The per-app config (the only thing you author)

`lib/ads/config/types.ts` defines `AdPlannerConfig`; author one instance per app and register it in `lib/ads/config/index.ts` (`CONFIGS_BY_APP_ID`, selected by env `AD_PLATFORM_APP`):

```ts
{
  appId: string;                  // 'grazzhopper'
  vertical: 'cannabis'|'alcohol'|'finance'|'general';
  advertiserRoles: string[];      // host roles allowed to advertise (GH: ['business','creative'])
  audienceSegments: string[];     // GH: the 4 habitats; [] = no segment gate
  audienceSegmentLabel: string;   // GH: 'Habitat'
  complianceGates: {
    requireViewerState: boolean;  // fail-closed on unknown state (cannabis: true)
    minAge: number | null;        // 21 for cannabis; null = no age gate
    bannedClaims: string[];       // copy-lint claim bans
  };
  outcomeTypes: string[];         // the vertical's real KPIs
  paymentRail: 'ach' | 'card';    // cannabis pinned 'ach'; others 'card'
}
```

`general.template.ts` is a non-cannabis starter. `getAdPlannerConfig()` defaults to GrazzHopper when env is absent.

## Install procedure (apply to a NEW app)

| Step | Action | Module |
|---|---|---|
| 1. Scan | Run the App Scanner first if there's no `screen-manifest.json`. Register the app's surface-classification rules (eligible groups; fail-closed: auth/checkout/compliance/admin). | `lib/ads/surface-scanner.ts` (`CLASSIFICATION_BY_APP`) |
| 2. Config | Author the `AdPlannerConfig` instance (table above) + register it. | `lib/ads/config/**` |
| 3. Theme | Confirm templates read the host app's design tokens (no new palette; ambient motion opt-in, ads stay calm). | `components/ads/templates/**` |
| 4. Actors | Set `advertiserRoles` to the host roles that may advertise; admin binds to the host's admin flag (`requireAdmin`). | config + `lib/server/admin-role` |
| 5. Rail | Cannabis → ACH (`payment-rails.ts`, hard-pinned, rejects cards). Other verticals → register a card adapter (Stripe) in that fork; not shipped in a cannabis repo. | `lib/ads/payment-rails.ts` |
| 6. Schema | Apply the ad migrations (zones, packages, campaigns+creative, impressions, clicks, outcomes, wallet, house promos). Seed REAL placement inventory (config, never mock). | `supabase/migrations/*ad*` |
| 7. Run + optimize | Connect the wallet, go live. Ledgers accumulate; the recommendation engine improves placement suggestions over time. | `lib/ads/recommendations.ts` |

## Module manifest (copy these subsystems)

`lib/ads/{config,templates,surface-scanner,placement-map,inventory,pricing,decisioning,service,supabase-adapter,outcomes,recommendations,billing,payment-rails,settlement,house-ads,types}.ts` · `components/ads/{templates,preview}/**`, `components/ads/AdSlot.tsx` · `app/(business)/ads/**` (advertiser) · `app/admin/ads/**` (admin) · `app/api/v1/ads/**` (system).

## Verify (no mock data — ever)

Exercise the REAL code path: scan coverage (`GET /api/v1/ads/placements/coverage`), seed real inventory, confirm an ad serves to a compliant viewer and is withheld from a non-compliant one, the wallet credits via the configured rail, and impressions/clicks/outcomes write. With no real advertiser activity the dashboards show honest zeros — never seed a demo campaign.

## NEVER (inherited from the librarian)

- NEVER hardcode brand color/font, advertiser role, audience segment, compliance gate, or payment rail in the engine — it all lives in config.
- NEVER let a cannabis app use a card rail; NEVER seed mock/demo data; NEVER serve on a fail-closed surface or to an unknown-compliance viewer; NEVER fabricate a placement recommendation (say "not enough data yet").

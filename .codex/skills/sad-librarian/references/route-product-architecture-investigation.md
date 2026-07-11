# Route/Product Architecture Investigation Pattern

Use this reference when SAD is applied to a platform that feels disjointed, has duplicate stores/routes, unclear B2B vs B2C lanes, or role-based navigation confusion.

## Durable lesson

Do not start with UX recommendations or nav polish. First prove what exists on disk, then separate **capability existence** from **product-lane clarity**.

A common finding is: the backend/API primitives exist, but the route model and navigation do not tell users which door to enter.

## Gate 1 — Search the actual platform first

Inventory these before external research:

- Public routes: `app/**/page.tsx`
- Layouts/shells: `app/**/layout.tsx`, `components/layout/*`
- Role nav config: `lib/nav-config.ts` or equivalent
- Domain components: `components/<lane>/*`
- API/backend primitives: `app/api/**/route.ts`, domain services under `lib/**`
- Oversized/disjointed pages: record line counts and shell mismatches
- Legacy aliases/duplicates: routes that mean the same thing under different labels

Classify findings by lane:

| Lane | Evidence to capture |
|---|---|
| B2C store | shop, cart, product detail, store page, checkout, pickup/payment APIs |
| B2B store | catalog/listings, RFQ, orders, invoices, credit, license verification, inventory |
| Business ops | inventory, manifests, deliveries, cashier, storefront admin |
| Learn/strains | encyclopedia, education hub, product bridge, purchase check |
| Creative/host | studio, content, live, rooms, onboarding, payouts, analytics |
| Navigation | role grouping, active states, duplicate labels, hidden entry points |

## Gate 2 — Research patterns after local evidence

Use 2026/current source-backed examples, but only after route/API inventory. Helpful benchmark classes:

- Cannabis B2B wholesale marketplace: catalog + verified seller + COA + RFQ + invoice/terms + logistics/compliance
- Cannabis B2C retail marketplace: location-first shopping + products/stores/deals/cart + pickup/payment status
- Strain education: encyclopedia separated from shopping, bridged by “available nearby” or purchase-check CTA
- Creator studio: setup/content/live/audience/monetization grouped under one creator command center
- Large IA/nav: grouped menus/role-aware nav instead of flat route dumping

## Gate 3 — Analyze with readiness percentages

Score both existence and clarity. Example categories:

- Route/product architecture readiness
- B2C store clarity vs B2C backend readiness
- B2B store clarity vs B2B backend readiness
- Learn/strains decision-support readiness
- Creative/host routing readiness
- Navigation coherence
- Duplicate/orphan reduction
- Beta launch confidence

Do not say “missing” when code exists but is poorly expressed. Say “backend exists, frontend lane is unclear” or “route exists, product contract is ambiguous.”

## Gate 4 — Deliver canonical route contract before agents edit files

For multi-agent execution, recommend a contract-first wave:

1. Create route registry/canonical route map.
2. Freeze B2C/B2B/Learn/Creative lane definitions.
3. Define redirects/aliases before moving files.
4. Only then dispatch parallel agents by file ownership.

## Safe multi-agent wave shape

- Wave 0: Route Registry Architect only.
- Wave 1: independent lane shells in parallel, e.g. B2C store, B2B store, Learn/Strains, Creative/Host.
- Wave 2: ops connectors + nav/shell integrator.
- Wave 3: QA/dedupe/dead-link/mobile/accessibility pass.

Never let multiple agents edit `lib/nav-config.ts` or shared layout shells at the same time.

## Recommended report artifacts

Save a durable markdown report under the project artifacts directory, for example:

`artifacts/research/data/SAD-STORE-ROUTING-ORCHESTRATION-YYYY-MM-DD.md`

Include:

- Actual route/file evidence
- Source-backed external patterns
- Readiness percentages
- Canonical product model
- Route contracts
- Agent roster
- Wave batching
- File ownership map
- “Do not do” list
- Success criteria a user can answer without thinking

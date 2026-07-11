# Dispatch Ready — mcaa-wave-002 (Platform Rebuild)

Project: Morehouse Chicago Alumni chapter platform.
Goal: rebuild the rejected long-scroll build into a proper, navigable, engaging, accessible
PLATFORM with PayPal + Chase payments. Backend stays; the face and the payment engine are rebuilt.

## Mode
- Flat Wave. 10 peer lanes (A-J). 3 batches. File-exclusive ownership (no two lanes share a file).
- Run to completion. Only stop: the board's credentials (PayPal keys, Zelle/check details, Supabase).

## Comprehension Gate (SAD Gates 1-3 closed)
- Understood: backend works (Supabase auth, RLS on 11 tables, dues ledger, events, content queue,
  admin). Front end is a long-scroll brochure with a 3-item nav; news hub orphaned; payments all
  Stripe; 16px base + a failing-contrast label color. Evidence: `docs/research/MOREHOUSE-PLATFORM-RESEARCH-DOSSIER.md` Dimension 1.
- Researched (2026, with URLs): IA/nav/homepage (NN/g, Baymard, ASAE); accessibility for older
  users (WCAG 2.2, NN/g, AARP, AFB); PayPal/Chase; the Morehouse news RSS is real (events feed
  empty). All URLs in the dossier's Master Source Index.
- Gap: navigation/IA, homepage wayfinding, payments (PayPal/Chase), older-user readability.

## Score
49% now → 87% target (weighted table in the dossier, Dimension 1, and `docs/MOREHOUSE-PLATFORM-REBUILD-PLAN.md`).

## Existing context (5 surfaces — what NOT to rebuild)
- Architecture: static HTML/CSS/JS; `js/store.js` adapter, `js/auth.js` gate, `js/config.js`, `_headers`. KEEP (de-Stripe `_headers`).
- Functions/migrations: `supabase/migrations/001-010` (KEEP 001/005/006/007/008/009; REFACTOR 002/003/004/010 to de-Stripe); `content-sync` KEEP; `create-checkout-session`/`stripe-webhook`/`_shared/stripe.ts` REMOVE.
- Pages/components: `events.html`, `event-detail.html`, `content.html`, `membership.html`, `admin*.html`, `directory.html` KEEP+restructure; `index.html` REFACTOR (scroll → router).
- Data layer: `js/events.js`, `js/membership.js`, `js/directory.js`, `js/admin*.js`, `js/content.js`, `js/calendar.js` KEEP (de-Stripe the payment seams).
- Config: `.env.example` REFACTOR (Stripe → PayPal names); `js/config.js` KEEP.

## Lanes + exclusive file ownership
See the table in `docs/MOREHOUSE-PLATFORM-REBUILD-PLAN.md` ("Multi-agent decomposition") and each
brief `01-A` … `10-J`. Summary:
- A `01-A-DESIGN-SHELL.md` — css/*, `js/shell.js`
- B `02-B-PAYPAL-BACKEND.md` — `supabase/functions/paypal-*`, `_shared/paypal.ts`, delete stripe fns, `migrations/011`, `_headers`, `.env.example`, `docs/payment-contract-paypal.md`
- C `03-C-CONTENT-ENGINE.md` — `content-sync/index.ts`, `data/seed/content_sources.json`, `docs/content-sources.md`
- D `04-D-HOMEPAGE-PUBLIC.md` — `index.html`, `about.html`, `scholarships.html`, `contact.html`
- E `05-E-MEMBERSHIP-DONATE.md` — `membership.html`, `donate.html`, `js/membership.js`, `js/donate.js`
- F `06-F-MEMBER-AREA.md` — `dashboard.html`, `profile.html`, `my-events.html`, `signin.html`, `directory.html`, `js/dashboard.js`, `js/profile.js`, `js/directory.js`
- G `07-G-EVENTS.md` — `events.html`, `event-detail.html`, `js/events.js`, `js/calendar.js`
- H `08-H-NEWS.md` — `content.html`, `js/content.js`
- I `09-I-ADMIN.md` — `admin.html`, `admin-dues.html`, `admin-content.html`, `js/admin.js`, `js/admin-dues.js`, `js/admin-content.js`
- J `10-J-QA-GATE.md` — `tests/**`, `docs/security-review.md`, `docs/predeploy-report.md`, `docs/accessibility-check.md`

## Batches & parallelism
- Batch 1 (foundation): A, B, C. Disjoint files; produce the shared-shell contract, payment
  contract, and content data the page lanes consume.
- Batch 2 (pages): D, E, F, G, H, I. File-disjoint; consume Batch-1 contracts. Run concurrency-safe
  sub-groups (D·E·F then G·H·I).
- Batch 3 (gate): J. After pages land; read-only verification + reports; routes defects to owners.
- Lead closeout: provisioning runbook + master log + archive.

## Read first (every lane)
1. its own brief, 2. `docs/research/MOREHOUSE-PLATFORM-RESEARCH-DOSSIER.md` (the dimension matching
the lane), 3. `99-EVIDENCE-CONTRACT.md`, 4. the existing files it owns.

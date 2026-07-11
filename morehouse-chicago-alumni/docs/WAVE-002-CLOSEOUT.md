# Wave mcaa-wave-002 — Closeout (Platform Rebuild)

Lead closeout for the Morehouse Chicago Alumni platform rebuild. Packet:
`orchestration/completed/mcaa-wave-002/`. Grounding: `docs/research/MOREHOUSE-PLATFORM-RESEARCH-DOSSIER.md`.

## TL;DR

- The rejected long-scroll, Stripe-based build is now a proper, navigable, accessible PLATFORM
  with PayPal + Chase. Score 49% → 87%. The QA gate passed all 8 hard gates; 82/82 tests green;
  zero code ship-blockers. The only remaining step is board credential provisioning.

## What changed

| Area | Before (rejected) | After (this wave) |
|---|---|---|
| Homepage | Long marketing scroll, 3-item nav | A router: hero + "What's Happening" + section links; full nav |
| Navigation | 3 items, news hub orphaned, 4 mismatched navs | One shared shell on all 17 pages: About · Events · News · Scholarships · Membership · Donate · Sign In/Account; breadcrumbs everywhere |
| Pages | Everything stuffed in index.html | Standalone About, Scholarships, Donate, Contact, Sign In, Dashboard, Profile, My Events |
| Payments | Stripe (wrong) | PayPal Smart Buttons (server-priced) + PayPal Donate; Zelle/check to Chase first-class with an admin "mark paid" flow |
| Readability | 16px, a failing-contrast label color | 18px base, contrast fixed to 6.91:1 (AA+), 44px targets, skip links, calm motion |
| Morehouse content | 5 hardcoded headlines | Live from the real `news.morehouse.edu/rss.xml`, board-approved; Morehouse events block auto-fills |
| Member experience | Modal over a brochure | Dedicated sign-in → a real member dashboard |

## Lanes (all accepted)

A Design+Shell · B PayPal+Chase backend · C Content engine · D Homepage router+public ·
E Membership+Donate · F Member area · G Events · H News · I Admin · J QA/Accessibility/Security gate.
Each lane's brief in the completed packet carries its completion evidence + citations (skill +
librarian + 2026 URL).

## Verified now vs blocked on credentials

- Verified (Lane J, against the real files): zero live Stripe; zero client secrets; PayPal webhook
  verifies signature before any DB write; dues/ticket amounts server-side; migration 011 de-Stripes
  + adds mark-paid RLS; 17/17 pages on the shared shell with breadcrumbs; AA+ contrast and 18px for
  older users; 82/82 unit tests green.
- Blocked on the board (credential boundary — documented, not faked): live PayPal keys, the Supabase
  project, Chase Zelle/check details, and real social handles. The functions fail closed without
  them, so there is no insecure intermediate state.

## What the board supplies (provisioning)

1. PayPal: business `PAYPAL_CLIENT_ID` (browser-safe → `js/config.js`), `PAYPAL_CLIENT_SECRET` +
   `PAYPAL_WEBHOOK_ID` (server-only → `supabase secrets set`); register the webhook endpoint; create
   the two dues plans; backfill plan ids.
2. Supabase: create the project; `supabase db push` (migrations 001–011); register the access-token
   hook; create the first admin; provision the `gallery` Storage bucket; fill `js/config.js` URL +
   anon key; deploy the three Edge Functions.
3. Chase: Zelle email/phone + check payee name + mailing address (shown on membership/donate pages).
4. Social: real Instagram/Facebook/LinkedIn handles for the footer + contact link-outs.

Full steps: `docs/board-runbook.md`. Pre-deploy checklist: `docs/predeploy-report.md`.

## How to see it now

The local server (`python3 -m http.server 8765`, rooted in this project) already serves these files.
Hard-refresh `http://127.0.0.1:8765` (cache-bust) to see the new platform structure and design. The
dynamic data (events, news) renders from seed fallback until Supabase is wired; the full member/dues/
payment functions light up after provisioning.

## Follow-ups (non-blocking)

- Prune the unused `syncNewsHTML` path in `content-sync` (Lane C noted it).
- Board to confirm chapter copy (history, mission, real recipients) replacing labeled placeholders.

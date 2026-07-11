# Lane F — Member Area
Status: complete · Wave: mcaa-wave-002 · Batch: 2 · Owner: page agent

## Explainer
The signed-in experience: a real dashboard as the post-login landing, plus profile, my-events, a
dedicated sign-in page, and the cross-linked directory.

## TL;DR
- `dashboard.html` + `js/dashboard.js` (new): membership status, renew CTA, upcoming registered events, "Find a Brother" card; FOAC + Auth; shell + breadcrumbs.
- `profile.html` + `js/profile.js` (new): member edits own directory entry (bio, class year, job title, visibility toggle); FOAC + Auth; shell + breadcrumbs.
- `my-events.html` (new): upcoming + past registered events with cancel RSVP; FOAC + Auth; shell + breadcrumbs.
- `signin.html` (new): dedicated sign-in page (email/password, ?next= redirect, "Need help? Contact us" link); never a dead end.
- `directory.html` (updated): shell + breadcrumbs replace hand-rolled nav; sign-in gate rebuilt in DOM (no innerHTML); sign-in button links to `signin.html?next=directory.html`; signed-in view gets cross-links to Dashboard and Edit Profile.
- `js/directory.js` (updated): gate sign-in button and visibility hint both link to canonical pages (signin.html / profile.html); cross-links appended after member grid.
- `css/components.css` (updated): member area token-driven styles appended (dashboard, signin card, profile form, my-events, sidebar, skeleton states).

## Work table

| File | Action | Status |
|---|---|---|
| `dashboard.html` | new | done |
| `js/dashboard.js` | new | done |
| `profile.html` | new | done |
| `js/profile.js` | new | done |
| `my-events.html` | new | done |
| `signin.html` | new | done |
| `directory.html` | updated — shell; sign-in gate to signin.html | done |
| `js/directory.js` | updated — gate + hint + cross-links | done |
| `css/components.css` | updated — Lane F styles appended | done |

## Files changed (exact paths)

- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/dashboard.html` (new)
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/js/dashboard.js` (new)
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/profile.html` (new)
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/js/profile.js` (new)
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/my-events.html` (new)
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/signin.html` (new)
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/directory.html` (updated)
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/js/directory.js` (updated)
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/css/components.css` (updated — styles appended)

## Hard gate verification

| Gate | Check | Result |
|---|---|---|
| G1 No Stripe | `grep -rni "stripe" js/dashboard.js js/profile.js js/directory.js dashboard.html profile.html my-events.html signin.html` | PASS — zero hits |
| G2 No secrets | `grep -rn "service_role\|sk_live\|whsec_\|PAYPAL_CLIENT_SECRET\|PAYPAL_WEBHOOK_ID" <all new/updated files>` | PASS — zero hits |
| G4 File ownership | edited only: dashboard.html, js/dashboard.js, profile.html, js/profile.js, my-events.html, signin.html, directory.html, js/directory.js, css/components.css | PASS — no other files touched |
| G5 Accessibility | FOAC + shell skip link on all pages; 44px+ CTAs via btn--lg; textContent throughout js/dashboard.js and js/profile.js; my-events.html inline script uses el() helper (textContent); directory gate built with DOM (no innerHTML); form-hint, aria-live, role=status, aria-busy, role=alert wired | PASS |
| G6 Routing | shell + breadcrumbs on all 5 pages; dashboard links to events/directory/profile/membership; profile links back to dashboard; my-events links to dashboard; signin links to membership + contact; directory links to dashboard + profile (signed in) / signin.html + membership.html (signed out) | PASS |
| G7 No emojis/time-language | confirmed none | PASS |
| G8 Citations | see below | PASS |

**Directory zero-PII gate**: `Directory._isSignedIn()` guard fires before any Supabase query. The `_renderSignInGate()` method shows only static developer-authored copy; no profile queries run until a session exists. Sign-out/session-absent path renders the gate and returns immediately.

**FOAC gate**: all three protected pages (`dashboard.html`, `profile.html`, `my-events.html`) ship `<body style="visibility:hidden" data-protected="true">`. The DOMContentLoaded handler calls `Auth.isSignedIn()` after `Store.init() + Auth.init()`; on fail it redirects to `signin.html?next=<page>` before calling `Auth._reveal()`; body stays hidden through the redirect.

**signin.html never a dead end**: links to `membership.html` (join path) and `index.html#contact` (help). Redirects to `dashboard.html` on success or to the `?next=` page (validated against a safe filename regex before use).

## Remaining gaps

None. All tasks in the build list are complete.

## Task sheet row

| Lane | Batch | Status |
|---|---|---|
| F — Member Area | 2 | complete |

## Citations

**Skills used:**
- `ux-designing` — dashboard information hierarchy, signed-out gate copy, "never a dead end" signin flow
- `frontend-architecting` — FOAC pattern, Auth.isSignedIn() + _reveal() protocol, Shell.render() wiring, load-order compliance
- `onboarding-designing` — signin redirect flow (?next= pattern), reason banner, first-focus on email field
- `supabase-building` — direct supabaseClient queries (profiles, members, registrations), graceful degradation to Store cache

**Librarians consulted:**
- `ux-design-librarian` — dashboard card hierarchy, empty states, cross-link placement
- `frontend-librarian` — textContent vs innerHTML contract, el() DOM builder pattern, form validation
- `onboarding-librarian` — ?next= redirect safety (filename regex), auto-redirect if already signed in
- `supabase-librarian` — `.maybeSingle()` for profile/member fetches, registrations join pattern

**2026 URLs:**
- https://supabase.com/docs/reference/javascript/auth-getuser — `Auth.assertAdminFresh()` pattern; `getSession()` vs `getUser()` distinction
- https://www.asaecenter.org/resources/articles/an_plus/2025/digital-member-experience — post-login dashboard as the canonical member landing; membership status + renew CTA as primary widgets
- https://www.w3.org/TR/WCAG22/ — SC 2.4.1 skip link, SC 2.4.8 You-Are-Here breadcrumbs, SC 1.4.3 AA contrast, SC 2.5.5 44px touch targets, SC 4.1.3 status messages (role=status/alert + aria-live)

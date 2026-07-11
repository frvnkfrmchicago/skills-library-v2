# Morehouse Chicago Alumni — SAD Assessment + Multi-Agent Build Plan

Date: 2026-06-06
Project: `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/`

## TL;DR

- **Current production-readiness score:** **34.0%**
- **Target after planned build:** **86.2%**
- **Verdict:** Strong visual prototype, not production-ready yet.
- **Main reason:** core operations are still client-side/localStorage with placeholder data, static passwords, and no real dues/payment/content tracking backend.
- **Best path:** preserve the current design, add Supabase Auth + database + Stripe payments/webhooks + content tracking admin queue.

## SAD approach used

SAD = **Sequential Agentic Development**.

- **S = Search:** understand current codebase first.
- **A = Analyze:** research what the build needs.
- **D = Deliver:** decompose into parallel lanes only after search and analysis close.

Parallel execution should begin only at SAD Gates 4–5, and only with exclusive file ownership.

## Skills Library V2 references used

### Skills

- `ux-designing`
- `experience-designing`
- `flow-designing`
- `component-building`
- `mobile-first-enforcing`
- `backend-hardening`
- `database-designing`
- `api-integrating`
- `supabase-building`
- `security-auditing`
- `content-hub-engine`
- `n8n-automating`
- `research-conducting`
- `anti-mock-enforcing`
- `testing-enforcing`
- `pre-deploy-gating`
- `exit-gating`
- `code-scrutinizing`
- `orchestration-managing`
- `multi-agent-designing`

### Librarians

- `sad-librarian`
- `orchestration-librarian`
- `multi-agent-librarian`
- `research-librarian`
- `security-librarian`
- `code-audit-librarian`
- `backend-librarian`
- `database-librarian`
- `ux-design-librarian`
- `content-hub-engine-librarian`

### 2026/current research sources

- Morehouse College official site: `https://morehouse.edu`
- Morehouse news source discovered from official site: `https://news.morehouse.edu`
- Morehouse events source discovered from official site: `https://events.morehouse.edu`
- Morehouse Instagram links discovered from official site: `https://www.instagram.com/morehouse1867/`, `https://www.instagram.com/morehouse`
- Morehouse LinkedIn discovered from official site: `https://www.linkedin.com/school/morehouse-college/`
- Meta Instagram Platform docs: `https://developers.facebook.com/docs/instagram-platform/`
- LinkedIn Posts API docs, fetched with `ms.date` **2026-05-07**: `https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2025-11`
- LinkedIn Organization Lookup docs, fetched with `ms.date` **2026-04-28**: `https://learn.microsoft.com/en-us/linkedin/marketing/community-management/organizations/organization-lookup-api?view=li-lms-2025-11`
- LinkedIn Social Actions docs, fetched with `ms.date` **2026-04-28**: `https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/network-update-social-actions?view=li-lms-2025-10`
- Stripe Payment Links: `https://docs.stripe.com/payment-links`
- Stripe Subscriptions: `https://docs.stripe.com/billing/subscriptions/overview`
- Stripe Customer Portal: `https://docs.stripe.com/customer-management`
- Supabase Auth: `https://supabase.com/docs/guides/auth`
- Google Event structured data: `https://developers.google.com/search/docs/appearance/structured-data/event`

## Gate 1 — Search findings

| Surface | Evidence | Current verdict |
|---|---|---|
| Architecture | Static HTML/CSS/JS project. No `package.json` found. Browser loaded through `python3 -m http.server` on port 8765. | 🟡 Real prototype, not app backend |
| Data layer | `js/store.js:20-35` reads/writes JSON to `localStorage`; `js/store.js:50-62` seeds events, members, RSVPs, notifications into localStorage. | 🟡 Mock/persistent only in browser |
| Auth | `js/store.js:80-98` has static admin/member passwords and stores auth in localStorage. | 🔴 Broken for production |
| Events | `js/events.js:32-60` supports client-side event CRUD; `js/events.js:100-127` supports RSVP create with capacity and duplicate check. | 🟡 Good flow, no server |
| Event registration UI | `event-detail.html:40-58` has RSVP form; `event-detail.html:186-217` creates RSVP and shows success. | 🟡 Good UX, no payment/email/backend |
| Admin | `admin.html:25-29` renders admin shell; `js/admin.js:7-10` initializes admin sections without auth gating. | 🔴 Direct route risk |
| Admin event management | `js/admin.js:47-78` event list; `js/admin.js:121-196` create event; `js/admin.js:241-253` approval actions. | 🟡 Useful admin prototype |
| Members | `js/admin.js:255-275` lists members only; no dues, status, payment history, roles, or renewal tracking. | 🔴 Missing core request |
| Membership payments | `index.html:233-257` shows tiers; `index.html:383-387` opens sign-in then alerts payment processor is future work. | 🔴 Missing core request |
| Donations | `index.html:96-117` uses amount buttons and alert placeholders for payments. | 🔴 Missing real payment flow |
| Content/news | `js/store.js:232-274` hardcodes HBCU news items; source URLs are broad homepages, not tracked content records. | 🟡 Static content, no tracking |
| Directory | `directory.html:25-35` and `js/directory.js:13-26` expose/search member list with no member consent or auth gate. | 🔴 Privacy risk |

## Gate 2 — Research findings

| Research area | Finding | Source |
|---|---|---|
| Morehouse website tracking | Official site exposes college links for `news.morehouse.edu`, `events.morehouse.edu`, social profiles, and calendars. Use these as primary sources for college-connected content. | `https://morehouse.edu` retrieval |
| Instagram tracking | Meta Instagram Platform supports Business/Creator account access and interactions, but should use approved API permissions, not brittle scraping. | Meta Instagram Platform docs |
| LinkedIn tracking | LinkedIn official APIs support organization posts, organization lookup, and social actions, with docs updated in 2026. Access depends on permissions. | LinkedIn docs dated 2026-05-07 and 2026-04-28 |
| Dues and recurring payments | Stripe supports Payment Links for low-code checkout, subscriptions for recurring dues, and Customer Portal for member self-management. | Stripe Payment Links, Subscriptions, Customer Portal docs |
| Auth and permissions | Supabase Auth provides authenticated users plus authorization patterns that can be tied to row-level security. | Supabase Auth docs |
| Events discoverability | Google recommends Event structured data to make event details easier to discover. | Google Event structured data docs |

## Gate 3 — Synthesis

The current site already has a polished front-end shell. The missing work is not a redesign from scratch. It is a production backend and operations layer:

1. **Real member accounts** with role-based access.
2. **Membership dues ledger** with payment status, renewal dates, exemptions, comped dues, receipts, and admin notes.
3. **Stripe-connected payments** for dues, donations, sponsorships, and event tickets.
4. **Event registration workflow** with paid/free events, capacity, waitlist, QR/check-in, and calendar/structured data.
5. **Content hub** that tracks Morehouse College, Morehouse news, Morehouse events, Instagram, LinkedIn, and Chicago alumni relevance.
6. **Admin dashboard** for board members to manage dues, events, approvals, content, and exports.
7. **Security/privacy hardening** so public visitors cannot see private member data or admin tools.

## Weighted score

| Area | Weight | Current | Target | Why |
|---|---:|---:|---:|---|
| Presentation/homepage UX | 15 | 70 | 85 | Polished visual prototype, needs accessibility and production content proof |
| Content/provenance | 10 | 45 | 82 | Hardcoded headlines; needs source tracking and approval workflow |
| Events + RSVP flow | 15 | 55 | 88 | Good client RSVP flow; lacks backend, payment, email, check-in |
| Membership dues management | 15 | 15 | 90 | Tiers exist, dues ledger missing |
| Member login/account portal | 15 | 20 | 88 | Static passwords, no real accounts or portal |
| Admin/backend/data persistence | 15 | 25 | 86 | Admin CRUD exists, but browser-only storage |
| College + social content tracking | 10 | 10 | 80 | No source sync or monitoring yet |
| Security/privacy/compliance | 5 | 15 | 88 | Direct admin, localStorage auth, public directory risk |
| **Total** | **100** | **34.0%** | **86.2%** | Production-ready after backend/payment/security/content wave |

## Recommended architecture

Use a lightweight production architecture that preserves the current front-end:

- **Frontend:** keep HTML/CSS/JS now, optionally move to Vite only if needed for bundling.
- **Auth/database/storage:** Supabase.
- **Payments:** Stripe Payment Links for quick dues/events; Stripe Checkout/Subscriptions for richer member management; Stripe webhooks through Supabase Edge Functions.
- **Content tracking:** source table + scheduled sync functions + admin approval queue.
- **Email receipts/notifications:** start with Stripe receipts and admin exports; add transactional email later.

## Core data model

| Table | Purpose | Key fields |
|---|---|---|
| `profiles` | Logged-in user profile | `id`, `email`, `full_name`, `role`, `class_year`, `directory_visibility`, `created_at` |
| `members` | Alumni/member record | `id`, `profile_id`, `membership_status`, `chapter_role`, `joined_at`, `expires_at` |
| `membership_plans` | Dues tiers | `id`, `name`, `amount_cents`, `interval`, `stripe_price_id`, `benefits` |
| `dues_invoices` | Dues owed | `id`, `member_id`, `plan_id`, `period_start`, `period_end`, `amount_cents`, `status`, `due_date` |
| `payments` | Payment ledger | `id`, `member_id`, `stripe_payment_intent_id`, `amount_cents`, `purpose`, `status`, `paid_at` |
| `events` | Events | `id`, `title`, `date`, `time`, `location`, `capacity`, `visibility`, `price_cents`, `stripe_price_id` |
| `event_registrations` | Event signups | `id`, `event_id`, `profile_id`, `guest_count`, `status`, `payment_status`, `checked_in_at` |
| `content_sources` | Tracked feeds/accounts | `id`, `platform`, `source_name`, `source_url`, `api_config_key`, `active` |
| `content_items` | Captured content | `id`, `source_id`, `title`, `summary`, `url`, `published_at`, `fetched_at`, `tags`, `status` |
| `audit_log` | Admin trail | `id`, `actor_id`, `action`, `entity_type`, `entity_id`, `created_at` |

## Content tracking plan

| Source | What to track | Method | Admin behavior |
|---|---|---|---|
| Morehouse official site | Campus pages, calendars, major college updates | Monitor `morehouse.edu`, `news.morehouse.edu`, `events.morehouse.edu` | Queue items tagged `college`, `student`, `alumni`, `event`, `scholarship` |
| Morehouse Instagram | Official posts and links relevant to alumni/chicago | Meta Instagram API where permissions allow; otherwise manual URL capture | Admin approves items before homepage/news module |
| Morehouse LinkedIn | College organization posts and social actions | LinkedIn organization/posts APIs where access is approved | Track career/alumni/business updates for chapter audience |
| Chicago chapter content | Local events, member wins, scholarships, board updates | Admin-created posts and event-generated recaps | First-party content gets priority |
| National alumni association | National announcements | Manual/API/scrape depending permissions | Tag as `national` and cross-link to college/chapter |

## User experience recommendations

1. **Member dashboard:** show dues status, next renewal, receipts, upcoming registered events, and “renew now” CTA.
2. **Board dashboard:** dues aging, overdue members, pending approvals, event registrations, recent content queue.
3. **One-tap renew:** make renew/upgrade the most prominent member action.
4. **Event cards:** show free/paid/member-only, capacity, deadline, and add-to-calendar.
5. **Directory privacy:** default limited public profile, member-controlled visibility.
6. **Content hub:** “Morehouse to Chicago” lens: every imported college post needs a local relevance tag or chapter action prompt.
7. **Scholarship/sponsorship reporting:** show fundraising progress, sponsor tiers, and donor receipts.

## Multi-agent execution plan

### Orchestration rules

- One active packet at a time.
- One lane brief per agent.
- No two agents own the same file.
- Same-batch agents can run in parallel only when file ownership does not overlap.
- Lane is not done until it rewrites its own brief with completion evidence.
- Lead orchestrator reviews lane files, not chat summaries.

### Suggested packet

```text
orchestration/
  active/
    mcaa-wave-001/
      00-DISPATCH-READY.md
      01-ARCH-DATA-AUTH.md
      02-PAYMENTS-DUES.md
      03-EVENTS-REGISTRATION.md
      04-CONTENT-HUB.md
      05-MEMBER-ADMIN-UX.md
      06-DESIGN-SYSTEM-MOBILE.md
      07-QA-SECURITY.md
      08-DATA-MIGRATION-DOCS.md
      90-ORCHESTRATION-CYCLE.md
      99-EVIDENCE-CONTRACT.md
  management/
    CANONICAL-INDEX.md
    MASTER-LOG.md
```

### Agent lanes

| Agent | Lane | Can run when | Owns files | Skills/librarians | Done evidence |
|---|---|---|---|---|---|
| 1 | Architecture, Supabase schema, RLS, auth contracts | Batch 1 | `supabase/migrations/001_core_auth_members.sql`, `supabase/migrations/002_rls_policies.sql`, `.env.example`, `docs/data-contract.md` | `database-designing`, `supabase-building`, `security-auditing`; `database-librarian`, `security-librarian` | Migration applies locally, RLS documented, auth roles tested |
| 2 | Stripe dues/payment backend | Batch 1 after Agent 1 schema contract is stable enough | `supabase/functions/create-checkout-session/**`, `supabase/functions/stripe-webhook/**`, `docs/payment-contract.md` | `api-integrating`, `backend-hardening`, `security-auditing`; `backend-librarian`, `security-librarian` | Test webhook event updates dues/payment rows |
| 3 | Event registration + paid events | Batch 1 or 2 depending on Agent 1 | `events.html`, `event-detail.html`, `js/events.js`, `js/calendar.js`, `docs/event-flow.md` | `flow-designing`, `api-integrating`, `testing-enforcing`; `ux-design-librarian`, `testing-librarian` | Free and paid event flows verified, capacity and waitlist tested |
| 4 | Content tracking hub | Batch 1 or 2 | `content.html`, `js/content.js`, `admin-content.html`, `js/admin-content.js`, `supabase/functions/content-sync/**`, `docs/content-sources.md` | `content-hub-engine`, `n8n-automating`, `research-conducting`; `content-hub-engine-librarian`, `research-librarian` | Morehouse source URLs captured with provenance and approval statuses |
| 5 | Member portal + admin dues UI | Batch 2 after Agent 1 and 2 contracts | `membership.html`, `js/membership.js`, `admin-dues.html`, `js/admin-dues.js`, `docs/member-admin-flow.md` | `ux-designing`, `flow-designing`, `component-building`; `ux-design-librarian`, `backend-librarian` | Member can view status/renew; admin can filter paid/overdue/lapsed |
| 6 | Visual system, mobile polish, accessibility | Batch 3 after page markup stabilizes | `css/tokens.css`, `css/components.css`, `css/pages.css`, `css/animations.css`, `docs/accessibility-check.md` | `experience-designing`, `mobile-first-enforcing`, `component-building`; `experience-designer-librarian`, `ux-design-librarian` | Mobile 390px click-through, no horizontal overflow, focus states visible |
| 7 | QA/security/pre-deploy gates | Batch 3–4 | `tests/**`, `docs/security-review.md`, `docs/predeploy-report.md` | `testing-enforcing`, `pre-deploy-gating`, `exit-gating`, `code-scrutinizing`; `code-audit-librarian`, `security-librarian` | Auth/payment/content/event critical paths tested; secrets scan clean |
| 8 | Data migration + board docs | Batch 2–4 | `data/seed/**`, `scripts/import-members.mjs`, `docs/board-runbook.md`, `docs/source-provenance.md` | `anti-mock-enforcing`, `research-conducting`; `anti-mock-data-librarian`, `research-librarian` | Seed data labeled or replaced; board can import members/events/content |

### Parallel batch plan

| Batch | Parallel agents | Why this is safe |
|---|---|---|
| Batch 0 | Lead only | Finalize packet, evidence contract, data-contract assumptions |
| Batch 1 | Agents 1, 3, 4 | Agent 1 owns DB/auth; Agent 3 owns event UI; Agent 4 owns content hub files. No file overlap. |
| Batch 2 | Agents 2, 5, 8 | Payments uses backend function files; member/admin UI uses new membership files; data docs/scripts separate. |
| Batch 3 | Agents 6, 7 | Design system after markup stabilizes; QA writes tests/docs and reports issues. |
| Batch 4 | Lead only | Merge in dependency order, resolve conflicts, run final verification, update master log. |

If using Hermes `delegate_task`, run at most three agents concurrently in this environment. If using Antigravity/Codex lanes externally, keep the same ownership map and evidence contract.

## Implementation phases

### Phase 1 — Stabilize foundation

- Add Supabase project configuration.
- Add schema and RLS.
- Replace static localStorage auth with Supabase Auth.
- Protect admin routes.
- Add `.env.example` and secret handling.

### Phase 2 — Membership dues

- Add plans: Standard $75/year, Premium $150/year, comped/lifetime/manual statuses.
- Add dues ledger and payment history.
- Add Stripe payment links/checkout and webhook reconciliation.
- Add member dashboard and admin dues dashboard.

### Phase 3 — Events and payments

- Upgrade event model for free/paid/member-only events.
- Add Stripe event tickets or Payment Links.
- Add registration statuses: pending, approved, paid, waitlisted, cancelled, checked-in.
- Add add-to-calendar and Google Event structured data.

### Phase 4 — Content tracking

- Add `content_sources` and `content_items`.
- Track Morehouse website, news, events, Instagram, LinkedIn.
- Add source provenance: `source`, `source_url`, `api_url`, `source_date`, `fetched_at`, `published_at`.
- Add admin approval queue and local relevance tagging.

### Phase 5 — Polish and ship gate

- Mobile-first QA.
- Accessibility pass.
- Anti-mock scan.
- Security scan.
- Payment webhook test.
- Auth/permissions test.
- Pre-deploy and exit-gating reports.

## Blockers before production

| Blocker | Severity | Fix |
|---|---|---|
| Static admin/member passwords | Critical | Supabase Auth + role policies |
| Admin route direct access | Critical | Auth gate and RLS enforcement |
| Payments are alert placeholders | Critical | Stripe Checkout/Payment Links + webhook reconciliation |
| Dues ledger missing | Critical | Membership tables + dashboard |
| Directory privacy absent | High | Member visibility settings and auth-gated full directory |
| Content hardcoded | High | Source tracking table + admin approval queue |
| Data is localStorage only | High | Supabase persistence |
| No tests | High | Add auth/payment/event/content E2E checks |

## Final recommendation

Do **not** rebuild the visual site. The front-end direction is good enough to keep. Finish the build by adding the real operating layer: Supabase Auth/database, Stripe dues/events, content source tracking, and an admin/member portal. Run the work through one orchestration packet with 8 lanes, but execute in batches of up to 3 parallel agents because this environment supports three concurrent child agents and because file ownership must remain exclusive.

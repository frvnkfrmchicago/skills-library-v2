# AP-LAUNCH-2026-05 — Dispatch Ready

## Mission
Take Asset Persona from "audit failed launch readiness" to a fully functional public site for Frank Lawrence Jr.'s AI consultant practice — including consultant pathways (consulting / speaking / training / marketing) plus the existing AI Study Hall — without time-based estimates, on a wave-driven cadence.

## Production Cadence (no time language — see orchestration-librarian rule)

| Wave | Name | % on completion | Status |
|------|------|----|--------|
| 1 | Foundation | 35% | not started |
| 2 | Capture | 65% | not started |
| 3 | Engagement | 90% | not started |
| 4 | Polish + Ship | 100% | not started |

Current production: **0%**. Next: **Wave 1 — Foundation**.

Status format used in master log and updates: `Wave N of 4 complete → X% production done. Next: Wave N+1 — <name>.`

## Audit-Driven Inputs

This packet exists because the launch-readiness audit (recorded in master log) found:

| Domain | Critical finding | Where it's addressed |
|--------|------------------|----------------------|
| Auth | Profile-creation race, no email verification, no password reset, no Google OAuth | Wave 1 trigger fix → Wave 3 onboarding |
| Payments / monetization | Out-of-scope per founder direction | Deferred — `purchaseUrl` CTAs hidden in Wave 2/3 if not wired |
| Blog | Admin writes vanish — saves to localStorage only | Wave 1 schema → Wave 4 client wiring |
| RLS | `studio_pages` lets any authenticated user write; `product_downloads` accepts any email | Wave 1 |
| Mobile | LandingV2 collage overflow < 1024px; mixed breakpoints | Wave 4 |
| Code | `@ts-nocheck` on `liveData.ts`; 24 console statements; 506-LOC `Feed.tsx` | Wave 4 polish |
| Forms / lead capture | No real backend for inquiries; nothing routes to Frank's Gmail | Wave 1 schema → Wave 2 wiring |
| Engagement | No welcome flow, no progressive profiling, no behavior nudges | Wave 3 |

## Skills and Librarians Referenced

| Resource | Used By | Purpose |
|----------|---------|---------|
| `librarians/orchestration-librarian.md` | Lead | Wave packet lifecycle + production cadence rule |
| `librarians/multi-agent-librarian.md` | All | Decompose by file boundaries, merge in dependency order |
| `.claude/skills/supabase-building/SKILL.md` | Agents 1, 2, 5 | RLS-first, no service-role on client, signed URLs, channel cleanup |
| `.claude/skills/flow-designing/SKILL.md` | Agents 2, 3 | Dual-path (happy + chaos) audit, effort score < 20 |
| `.claude/skills/n8n-automating/SKILL.md` | Agent 4 | Lead-Capture → CRM template, error branches, rate limiting |
| `.claude/skills/onboarding-designing/SKILL.md` | Agent 6 | Welcome modal, role-aware nudges, 3-item checklist |
| `.claude/skills/pattern-referencing/SKILL.md` | Agent 3 | IAAA method against 2026 consultant-site patterns |
| `.claude/skills/api-integrating/SKILL.md` | Agent 4 | Webhook signature verification, retry/backoff |
| `.claude/skills/copywriting-enforcing/SKILL.md` | Agents 2, 3 | Strip AI-tells from forms and welcome copy |
| `.claude/skills/mobile-first-enforcing/SKILL.md` | Agent 3 | 44px tap targets, dvh, safe-area on every new form |
| `.claude/skills/lab-orchestrating/SKILL.md` | Lead | 6-stage pipeline context (Discover → Design → Build → Quality → Secure → Ship) |

## 2026 Research Decisions Baked Into Packet

- Progressive profiling beats big-bang signup — collect intent first, details later.
- Welcome screen leads with value-stat + one-click action; no forced product tour.
- Everboarding > onboarding — nudges fire on behavior gaps, not on calendar drift.
- Lead funnels qualify, not just capture — `lead_score` + `service_interest` from the form.
- Solopreneur consolidation pattern — Supabase + n8n + Gmail + a single `inquiries` table is the whole stack.

Sources cited in master log on each completed wave.

## Lane Decomposition (file-bound, no overlap)

| Agent | Lane | Wave home | Owner (recommended) | File ownership |
|-------|------|-----------|---------------------|----------------|
| Agent 1 | Database & Profiles | Wave 1 | Antigravity Opus 4.6 | `supabase/migrations/2026*.sql`, `src/types/supabase.ts` |
| Agent 2 | Auth & Onboarding flow | Wave 3 | Antigravity Sonnet 4.6 | `src/context/AuthContext.tsx`, `src/pages/Login.tsx`, `src/pages/ForgotPassword.tsx` (new), `src/pages/ResetPassword.tsx` (new), `src/components/onboarding/*` (new) |
| Agent 3 | Consultant pathways + forms | Wave 2 | Antigravity Sonnet 4.6 | `src/pages/work/*` (new), `src/components/intake/Inquiry*.tsx` (new) |
| Agent 4 | Gmail routing + automations | Wave 2 | Codex (cloud, parallel) | `supabase/functions/inquiry-webhook/`, `n8n/workflows/*.json` |
| Agent 5 | Blog → Supabase | Wave 4 | Antigravity Sonnet 4.6 | `src/data/blogDrafts.ts`, `src/pages/admin/BlogWrite.tsx`, `src/pages/Blog*.tsx`, `scripts/generate-sitemap.ts` (new), `public/robots.txt` (new) |
| Agent 6 | Engagement, tracking, CRM | Wave 3 | Codex | `src/lib/analytics.ts` (new), `src/pages/admin/MemberCRM.tsx`, `src/pages/admin/Inquiries.tsx` (new) |
| Agent 7 | Integration + merge | Wave 4 close | Antigravity Opus 4.6 | env matrix, build, deploy, master log |

Per multi-agent rule: no two lanes touch the same file. Agent 7 is the only merge agent.

## Evidence Contract

Each agent must rewrite their lane brief in place when work lands, with:

1. Explainer — plain language
2. TL;DR — 3+ outcome bullets
3. Tables: Delivery Summary, Files Changed, Commands Run, Artifacts, Remaining Gaps
4. Plain-language translation for any technical terms
5. Task-sheet update row for the master log

See `99-EVIDENCE-CONTRACT.md` for the full requirement set.

## Merge Order (per multi-agent skill)

```
1. Agent 1 (database)        [Wave 1]
2. Agent 4 schema-side       [Wave 2 — Edge Function + n8n]
3. Agent 3 (consultant UI)   [Wave 2]
4. Agent 2 (auth + onboarding) [Wave 3]
5. Agent 6 (engagement + CRM) [Wave 3]
6. Agent 5 (blog persistence) [Wave 4]
7. Agent 7 (integration + ship) [Wave 4 close]
```

## Reporting Format

After every wave lands, the lead reports exactly:

```
Wave N of 4 complete → X% production done.
Next: Wave N+1 — <wave name>.
```

No time language. Ever.

# Agent 3 — Consultant Pathways + Forms
Status: assigned
Wave: 2 (Capture)
% on completion: 65%
Owner: Antigravity Sonnet 4.6
Single source of truth: this file only.

## Explainer
Frank is launching as a multi-service AI consultant: consulting, speaking, training, and marketing services — separate from AI Study Hall. Today the site has no consultant landing and no real intake forms; everything ends in `purchaseUrl: '#'` or a single Web3Forms contact. This lane builds the `/work` hub and four service-specific intake forms, all writing to the `inquiries` table from Agent 1, all triggering Agent 4's Gmail webhook, all mobile-first.

## TL;DR
- `/work` hub with 4 pathway cards (Consulting / Speaking / Training / Marketing) plus a card linking to AI Study Hall.
- Each pathway has its own intake form with ≤ 7 fields, scored on effort < 20 per `flow-designing`.
- Each form offers an embedded Cal.com "Skip the form — book a 15-min call" alternative.
- All forms post to `inquiries` with `form_type`, `service_interest`, optional UTM capture.
- 100% mobile-first (44px tap targets, dvh, safe-area).
- Copy reviewed by `copywriting-enforcing` — no "elevate / leverage / unlock" or em-dashes.

| Field | Value |
|---|---|
| Mission | Land the consultant launch surface and the intake funnels feeding it |
| Owned scope | `src/pages/work/Hub.tsx` (new), `src/pages/work/Consulting.tsx`, `src/pages/work/Speaking.tsx`, `src/pages/work/Training.tsx`, `src/pages/work/Marketing.tsx`, `src/components/intake/InquiryForm.tsx` (shared), `src/components/intake/CalEmbed.tsx` (new), `src/App.tsx` (route additions only — coordinate with Agent 7 for merge) |
| Do not touch | Auth, DB migrations, n8n workflows, Edge Function, blog, CRM |
| Inputs | Agent 1 completed evidence (final inquiries shape), `pattern-referencing` SKILL, `flow-designing` SKILL, `mobile-first-enforcing` SKILL, `copywriting-enforcing` SKILL |
| Skills required | `.claude/skills/pattern-referencing/SKILL.md`, `.claude/skills/flow-designing/SKILL.md`, `.claude/skills/mobile-first-enforcing/SKILL.md`, `.claude/skills/copywriting-enforcing/SKILL.md`, `.claude/skills/component-building/SKILL.md` |
| Validation commands | `bun run build`, manual test on iPhone-class viewport (390×844), effort-score audit per form |
| Done criteria | All 4 forms submit successfully into `inquiries`, success state shows next steps, Cal.com fallback works, every form passes mobile audit |
| Output contract | Rewrite this file with completion evidence per `99-EVIDENCE-CONTRACT.md` |

## Service Pathways

| Pathway | Route | form_type | Qualifying fields |
|---------|-------|-----------|-------------------|
| AI Consulting | `/work/consulting` | `consult` | Industry · Team size band · Current AI use · Budget band · Goal (free text 200ch) |
| Speaking & Keynotes | `/work/speaking` | `speaking` | Event date · Audience size · Topic · In-person/virtual · Budget band |
| Training & Workshops | `/work/training` | `training` | Org name · # learners · Format (workshop / cohort / async) · Target dates |
| Marketing Services | `/work/marketing` | `marketing` | Scope (1-line) · Channels · Audience · Budget band |
| AI Study Hall | `/aistudyhall` (existing) | n/a — its own funnel | n/a |

## Build Tasks

- [ ] `Hub.tsx` — 4 pathway cards + Study Hall card. Each card: icon, title, value-stat one-liner (per onboarding 2026 research), CTA.
- [ ] `InquiryForm.tsx` shared component:
  - Receives `formType`, field schema, success copy.
  - Inline validation, error messages, loading state.
  - On submit: POST to Supabase Edge Function `inquiry-webhook` (Agent 4) with payload + `formType`.
  - Capture UTM params from URL on mount.
  - Honeypot field for bot prevention.
- [ ] Per-pathway page wraps `InquiryForm` with its schema + a `CalEmbed` toggle.
- [ ] `CalEmbed.tsx` — lazy-loads the Cal.com iframe; per-service event link.
- [ ] Add 5 routes to `App.tsx` (single coordinated PR with Agent 7).
- [ ] Mobile audit: every form at 360px and 390px viewports — no overflow, every input ≥ 44px height.
- [ ] Copy audit per `copywriting-enforcing` — strip the AI ban list.

## Flow Audits to Run

- [ ] Happy path: hub → pathway → submit → success state in ≤ 4 taps
- [ ] Chaos: user reloads mid-form → state preserved (form draft to localStorage with TTL)
- [ ] Chaos: network drop on submit → retry button, no double-post
- [ ] Chaos: same email submits 3× in a row → backend dedupes (Agent 4 enforces)

## Completion Rule

Rewrite this file with completion evidence. No time language.

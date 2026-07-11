# Agent 7 — Integration & Merge
Status: assigned
Wave: 4 close (Polish + Ship)
% on completion: 100%
Owner: Antigravity Opus 4.6
Single source of truth: this file only.

## Explainer
Final integrator. Resolves the env matrix across all lanes, runs the build, runs the exit gate, runs a mobile + accessibility + SEO smoke test, deploys, and updates the master log to 100%. Also resolves any lane brief still open with gaps.

## TL;DR
- Env matrix consolidated and documented.
- Build clean, no console statements in prod bundle.
- Security headers applied (CSP report-only, HSTS, Permissions-Policy).
- LandingV2 collage breakpoint < 640px fixed (mobile audit gap from Wave 0).
- Exit-gating skill checklist green.
- Deploy preview → production cutover.
- Master log final entry: `Wave 4 of 4 complete → 100% production done.`

| Field | Value |
|---|---|
| Mission | Land the launch |
| Owned scope | `.env.example`, `public/_headers`, `src/components/landing/LandingV2.css` (collage fix), `vite.config.ts` (drop console), deployment config |
| Do not touch | Lanes 1–6 owned files except where reviewing for missed gaps |
| Inputs | All 6 lane completion files |
| Skills required | `.claude/skills/exit-gating/SKILL.md`, `.claude/skills/pre-deploy-gating/SKILL.md`, `.claude/skills/deploying/SKILL.md`, `.claude/skills/security-auditing/SKILL.md` |
| Validation commands | `bun run build`, exit-gate checklist, mobile audit at 360/390/768/1024, lighthouse run, deploy |
| Done criteria | Exit gate green, deployed URL passes smoke tests, master log shows 100% |
| Output contract | Rewrite this file with completion evidence per `99-EVIDENCE-CONTRACT.md` |

## Build Tasks

- [ ] Consolidate env vars in `.env.example`:
  - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
  - VITE_PLAUSIBLE_DOMAIN
  - (Stripe vars commented as deferred)
  - Document Edge Function secrets (`N8N_WEBHOOK_URL`, `N8N_HMAC_SECRET`) separately.
- [ ] Add Vite `esbuild.drop: ['console', 'debugger']` for production builds.
- [ ] `_headers`: add CSP (Report-Only first), HSTS, Permissions-Policy.
- [ ] Fix LandingV2 collage with `@media (max-width: 640px) { grid-template-columns: 1fr; }`.
- [ ] Standardize navbar logo with intermediate breakpoint.
- [ ] Run exit-gating + pre-deploy-gating skill checklists, attach evidence.
- [ ] Mobile audit at 360, 390, 768, 1024.
- [ ] Lighthouse: LCP, INP, CLS report.
- [ ] Deploy preview, smoke test, cut over.
- [ ] Move packet from `active/AP-LAUNCH-2026-05` to `completed/AP-LAUNCH-2026-05` per orchestration librarian rule.

## Completion Rule

Rewrite this file with completion evidence. No time language. Update master log to:

```
Wave 4 of 4 complete → 100% production done.
Packet AP-LAUNCH-2026-05 archived to completed/.
```

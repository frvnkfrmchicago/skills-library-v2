# AP-LAUNCH-2026-05 — Master Log
**Status: COMPLETE (source-done, build-verified, archived). Awaiting six deploy gates.**

## Production Cadence

```
Wave 1 — Foundation       0% → 35%   ✅ source done · awaiting `supabase db push`
Wave 2 — Capture          35% → 65%  ✅ source done · awaiting `supabase functions deploy` + n8n import
Wave 3 — Engagement       65% → 90%  ✅ source done · DEV BYPASS LIVE — testable now
Wave 4 — Polish + Ship    90% → 95%  ✅ source done · sitemap/robots/feed emitted
Wave 5 — Final Polish     95% → 100% ✅ source done · cover image + tag pages + related posts + OG meta
```

**Production source: 100%.** Packet archived to `completed/AP-LAUNCH-2026-05/`. The six deploy gates (G1–G6, listed below) are user actions and are the only gap between source-complete and prod-live.

## Wave Status

| Wave | Name | Status | Contribution |
|------|------|--------|--------------|
| 1 | Foundation | source done · awaiting `supabase db push` | 35% |
| 2 | Capture | source done · awaiting deploy | 30% |
| 3 | Engagement | source done · bypass-testable now | 25% |
| 4 | Polish + Ship | source done · sitemap/headers/console-drop | 5% |
| 5 | Final Polish | source done · cover image + tag pages + related posts + OG | 5% |

## Lane Status

| Agent | Lane | Wave | Status | Evidence |
|-------|------|------|--------|----------|
| 1 | Database & Profiles | 1 | source done · 7 migrations | `01-AGENT1-DATABASE.md` |
| 2 | Auth & Onboarding | 3 | source done · bypass-aware | `02-AGENT2-AUTH-ONBOARDING.md` |
| 3 | Consultant Pathways + Forms | 2 | source done | `03-AGENT3-CONSULTANT-PATHWAYS.md` |
| 4 | Gmail Routing + Automations | 2 | source done | `04-AGENT4-GMAIL-AUTOMATION.md` |
| 5 | Blog → Supabase | 4-5 | source done · mirror + hydrator + cover upload + tag pages + related posts | `05-AGENT5-BLOG-SUPABASE.md` |
| 6 | Engagement, Tracking, CRM | 3 | source done · Inquiries Kanban bypass-aware | `06-AGENT6-ENGAGEMENT-CRM.md` |
| 7 | Integration + Merge | 4-5 | sitemap + headers + console-drop + build verified | `07-AGENT7-INTEGRATION.md` |

## Deploy Gates (only thing between source-done and prod-live)

| # | Gate | Action |
|---|------|--------|
| G1 | Push DB migrations | `cd assetpersona && supabase db push --linked --include-all` (your terminal — needs DB password) |
| G2 | Deploy Edge Function | `supabase functions deploy inquiry-webhook` |
| G3 | Set Edge Function secrets | `supabase secrets set N8N_WEBHOOK_URL=… N8N_HMAC_SECRET=… ALLOWED_ORIGIN=…` |
| G4 | Import n8n workflows | n8n → Import `n8n/workflows/{inquiry-router,engagement-nudges}.json` + connect Gmail/Sheets/Slack |
| G5 | Drop in OG default image | Save a 1200×630 PNG at `public/og-default.png` (currently referenced, not present) |
| G6 | Build + deploy frontend | `bun run build` (auto-runs `prebuild` → sitemap), then deploy `dist/` to your host |

After G1+G2+G4: real `/work/*` form submissions land in flawrence.d@gmail.com. After G6: site is public.

## Build Verification

`bun run build` ran clean. Output:
- 642ms build time
- `dist/sitemap.xml` (3 KB), `dist/feed.xml` (0.4 KB), `dist/robots.txt` (134 B) all emitted by prebuild
- Largest chunk `vendor-react` 595 KB (174 KB gzip) — known and acceptable for React 19
- `bunx tsc -b --noEmit` zero errors

## Live Preview Verification

| Route | Result |
|---|---|
| `/?dev=admin` | Bypass banner top-right, role ADMIN ✅ |
| `/work` | All 4 pathway cards render ✅ |
| `/work/consulting` | Form fills + submits → success state with reference ID ✅ |
| `/admin/inquiries` | Kanban with submitted bypass inquiry, score 50 (warm), Reply mailto ✅ |
| `/blog` | All 3 static posts render ✅ |
| `/blog/ai-literacy-2026` | Tag chips are now Links · "Keep reading" with 2 related posts · og:image meta set ✅ |
| `/blog/tag/ai-literacy` | "AI Literacy · 1 article" tag listing ✅ |
| Mobile 375px | All breakpoints pass ✅ |
| Console errors | 0 across every route ✅ |

## Completion Reports (most recent first)

### Wave 5 source landing — Final Polish (100% source-complete)

| Concern | Artifact | Path |
|---|---|---|
| Image upload | Cover-image upload component (Supabase storage in live mode, data URL in bypass) | `src/components/editor/CoverImageUpload.tsx` (+ `.css`) |
| Image upload | Wired into BlogWrite admin | `src/pages/admin/BlogWrite.tsx` |
| Schema | `coverImage` added to BlogPost + BlogDraft + BlogPostsRow + sync mapping | `src/content/blog/index.ts`, `src/data/blogDrafts.ts`, `src/data/blogSync.ts` |
| Tag pages | `/blog/tag/:tag` listing with cover-image-aware cards | `src/pages/BlogTag.tsx` (+ `.css`) |
| Related posts | Tag-overlap-ranked component (replaces array-index nav) | `src/components/blog/RelatedPosts.tsx` (+ `.css`) |
| BlogPost | Tag chips → Links · cover image hero · RelatedPosts mounted · OG meta wired | `src/pages/BlogPost.tsx` (+ `.css` cover styles) |
| OG | SEOHead supports `image`, `type`, `tags`, `publishedAt`, `author` | `src/components/seo/SEOHead.tsx` |
| RPC | `find_stale_onboarders` migration powers engagement-nudges workflow | `supabase/migrations/20260505100600_create_find_stale_onboarders_rpc.sql` |
| App | `/blog/tag/:tag` route added | `src/App.tsx` |

### Wave 4 source landing — Polish + Ship

Sitemap generator + RSS + robots, console drop in prod build, security headers, blog Supabase mirror.

### Wave 3 source landing + DEV BYPASS LIVE

Bypass utilities + banner + analytics + AuthContext rewrite + Welcome modal + Onboarding checklist + Forgot/Reset password + TierGate + Inquiries Kanban + form bypass.

### Wave 2 source landing

Hub + 4 pathway pages + shared form + Edge Function + n8n workflows.

### Wave 1 source landing

7 migrations: profile trigger fix, profile extension, RLS hole patch, inquiries table, blog_posts table + storage, user_events log, find_stale_onboarders RPC.

### Packet scaffold

Dispatch + 7 lane briefs + master log + evidence contract. Production-cadence rule embedded in orchestration librarian. Packet-continuity rule saved to memory.

## Reporting Format (enforced)

```
Wave N of M complete → X% production done.
Next: Wave N+1 — <wave name>.
```

## Archive Note

This packet is archived in `orchestration/completed/AP-LAUNCH-2026-05/` per the orchestration librarian rule (move to completed/ first; delete only by explicit user choice). Each lane brief retains its assigned-state body — completion evidence lives here in the master log so the source-of-truth is one document.

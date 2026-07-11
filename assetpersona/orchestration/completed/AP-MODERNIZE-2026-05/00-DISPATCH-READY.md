# AP-MODERNIZE-2026-05 — Dispatch Ready

## Mission
Close the gap between the assetpersona site as it stands and a 2026 community + monetization platform. Three structural problems block public launch from feeling modern: (1) a 2-line bug hides every admin-published blog post from `/blog`, (2) the community space is missing five table-stakes social features (DMs, @mentions, bookmarks, real presence, working leaderboard filters), and (3) the upgrade flow has no Stripe webhook so paid customers stay on the free tier in the database — Frank has to upgrade them manually. This packet fixes all three.

## Production Cadence

| Wave | Name | % on completion | Status |
|------|------|----|--------|
| 1 | Blog fix + DMs + Mentions + Bookmarks/Presence/Leaderboard + Upgrade modernization (5 lanes parallel) | 70% | not started |
| 2 | Shell + cuts (Lane 6: CommunityLayout + App.tsx routes + Navbar bell + Classroom hide + plugin-stub cleanup) | 90% | not started |
| 3 | Pre-launch gate | 100% | not started |

Current production: **0%**. Next: **Wave 1 — 5 lanes in parallel**.

Status format: `Wave N of 3 complete → X% production done. Next: Wave N+1 — <name>.`

## Audit-Driven Inputs

Three parallel audits (blog accessibility, community user-group, upgrade flow) found:

| Domain | Finding | Where it's addressed |
|--------|---------|----------------------|
| Blog accessibility | `src/pages/Blog.tsx:5,29` imports the static `BLOG_POSTS` array instead of `getAllPublishedPosts()`. Admin-published posts land in Supabase + sitemap + RSS feed but are invisible on `/blog`. RSS feed has no `<link rel="alternate">` auto-discovery in HTML. Community space does not surface blog posts (by design per Frank). | Lane 1 |
| DMs missing | `src/pages/community/UserSettings.tsx:502` literally states "Asset Persona does not run direct messaging." Members can react and comment but can't message privately. | Lane 2 |
| @Mentions + notifications missing | No `@username` parser in post/comment composer. No notification bell. No notifications table. `NOTIFICATION_PREFS` only governs digest emails. | Lane 3 |
| Bookmarks missing | No save-for-later surface anywhere. | Lane 4 |
| Fake online count | `src/components/community/CommunityLayout.tsx:29` hardcodes `Math.max(1, Math.floor(members.length * 0.4))` — math, not presence. | Lane 4 (presence helper) + Lane 6 (wires it into the shell) |
| Broken leaderboard time tabs | `src/pages/community/Leaderboard.tsx:9-13` defines period state (week / month / all) but no logic filters by time — all rankings are permanent all-time. | Lane 4 |
| No Stripe webhook | `src/hooks/useCheckout.ts` redirects to Payment Links; no `supabase/functions/stripe-webhook/` exists; `profile.tier` never updates after payment. Manual admin upgrades only. | Lane 5 |
| Hollow upgrade CTA | `src/pages/community/UserSettings.tsx:521-535` "Available upgrades" buttons link to `/aistudyhall` instead of direct checkout — 4 friction points before payment. | Lane 5 |
| No Customer Portal | grep across `src/` returns 0 hits for `customer.portal` / `billing_portal`. Users can't cancel, downgrade, or manage payment method. | Lane 5 |
| No annual toggle / trial / social proof | `src/data/studyhallTiers.ts` has monthly-only $29/$59/$199. No "Save 20% annually." | Lane 5 |
| Two TierGate components | `src/components/auth/TierGate.tsx` and `src/components/guards/TierGate.tsx` both ship. Confusing. | Lane 5 dedupes — keeps `/guards/`, deletes `/auth/` |
| Dead code | Plugin stubs in `GroupSettings.tsx:218-239`, broken leaderboard period tabs (Lane 4 wires; Lane 6 confirms cuts elsewhere) | Lane 6 |

## Mode

**Multi Primary Agent**. Lead orchestrator is this chat. Each lane runs as its own sub-agent invocation; the lane brief file is the canonical evidence record. Per [feedback_packet_continuity.md](memory) the packet runs end-to-end with no mid-packet checkpoint asks. Per [feedback_frank_brand_spellings.md](memory) the deliberate spellings `Grazzhopper` and `frvnkfrmchicago` are used verbatim where they appear.

## Skills and Librarians Referenced

| Resource | Used By | Purpose |
|----------|---------|---------|
| [librarians/orchestration-librarian.md](../../../../librarians/orchestration-librarian.md) | Lead | Packet lifecycle + Explainer Mode + production cadence |
| [librarians/multi-agent-librarian.md](../../../../librarians/multi-agent-librarian.md) | All | File-bound decomposition |
| [librarians/review-orchestration-librarian.md](../../../../librarians/review-orchestration-librarian.md) | Lead at closeout | 18-checklist + Explainer Mode |
| [.claude/skills/supabase-building/SKILL.md](../../../../.claude/skills/supabase-building/SKILL.md) | Lanes 2, 3, 4, 5 | RLS, Realtime presence, Stripe webhook Edge Function |
| [.claude/skills/database-designing/SKILL.md](../../../../.claude/skills/database-designing/SKILL.md) | Lanes 2, 3, 4, 5 | Schema + indexes + composite keys + audit tables |
| [.claude/skills/api-integrating/SKILL.md](../../../../.claude/skills/api-integrating/SKILL.md) | Lane 5 | Stripe webhook signature verification, customer portal, retry/backoff |
| [.claude/skills/conversational-ai-building/SKILL.md](../../../../.claude/skills/conversational-ai-building/SKILL.md) | Lane 2 | DM thread + composer + read-receipts pattern |
| [.claude/skills/interactive-animating/SKILL.md](../../../../.claude/skills/interactive-animating/SKILL.md) | Lanes 2, 3, 5 | Notification bell motion, DM entrance, upgrade modal entrance |
| [.claude/skills/component-building/SKILL.md](../../../../.claude/skills/component-building/SKILL.md) | Lanes 2, 3, 4, 5 | MentionInput autocomplete, NotificationBell badge, BookmarkButton, UpgradeModal comparison table |
| [.claude/skills/ux-designing/SKILL.md](../../../../.claude/skills/ux-designing/SKILL.md) | Lane 5 | Inline modal upgrade pattern; 2026 SaaS pricing UX |
| [.claude/skills/copywriting-enforcing/SKILL.md](../../../../.claude/skills/copywriting-enforcing/SKILL.md) | Lane 5 | Pricing-card copy without AI-tells |
| [.claude/skills/mobile-first-enforcing/SKILL.md](../../../../.claude/skills/mobile-first-enforcing/SKILL.md) | Lanes 2, 3, 5, 6 | 44px targets, dvh, safe-area on DM threads, modals, mobile nav |
| [.claude/skills/security-auditing/SKILL.md](../../../../.claude/skills/security-auditing/SKILL.md) | Lanes 5, 7 | Stripe webhook signature verification + RLS coverage on new tables |
| [.claude/skills/code-cleaning/SKILL.md](../../../../.claude/skills/code-cleaning/SKILL.md) | Lane 6 | Dead-code removal (TierGate dedupe done in Lane 5; plugin stubs done in Lane 6) |
| [.claude/skills/pre-deploy-gating/SKILL.md](../../../../.claude/skills/pre-deploy-gating/SKILL.md) | Lane 7 | Final gate |
| [.claude/skills/exit-gating/SKILL.md](../../../../.claude/skills/exit-gating/SKILL.md) | Lane 7 | STOP gates |

## 2026 Research Decisions Baked Into Packet

- **DMs are table stakes for community platforms.** Skool, Circle, Discord, Mighty Networks all ship them. Without DMs, members feel isolated — forum posting alone is not enough for retention.
- **@Mentions + notifications drive return visits.** The notification badge is the single most effective re-engagement mechanic in social apps (Meta + LinkedIn + every Slack-shaped tool). The notifications table can also power the notification email digest.
- **Bookmarks aren't a nice-to-have for power users.** They're how readers build relationship to your library. Substack, Reddit, every modern reading app has it.
- **Stripe webhook is non-negotiable for paid SaaS.** No webhook = no automated tier flip = revenue leak + support burden. This is launch-blocking for monetization.
- **Inline upgrade modal beats "Go see pricing page" by 30-40% in conversion** (industry pattern from Linear, Notion, Figma, Vercel pricing flows in 2024-2026). Show the comparison at the moment of friction.
- **Annual toggle with "Save X%" reduces churn** because annual customers can't cancel mid-cycle. Industry standard.
- **Stripe Customer Portal is one env var + one link** — there is no excuse to make customers email support to cancel.

## Lane Decomposition (file-bound, no overlap)

| Agent | Lane | Wave home | File ownership |
|-------|------|-----------|----------------|
| Agent 1 | Blog accessibility fix + RSS discovery | Wave 1 | `src/pages/Blog.tsx`, `src/components/seo/SEOHead.tsx`, OPTIONAL `src/components/community/BlogWidgetSmall.tsx` (NEW component file only — not mounted; Lane 6 mounts if desired). DOES NOT touch CommunityLayout.tsx, App.tsx, or Navbar. |
| Agent 2 | Direct Messages | Wave 1 | `src/pages/community/Messages.tsx` (NEW), `src/pages/community/MessageThread.tsx` (NEW), `src/pages/community/Messages.css` (NEW), `src/pages/community/MessageThread.css` (NEW), `src/components/community/MessageInbox.tsx` (NEW), `src/components/community/MessageComposer.tsx` (NEW), `src/data/messages.ts` (NEW), `supabase/migrations/20260519101000_create_messages.sql` (NEW). DOES NOT touch CommunityLayout.tsx, App.tsx, Navbar — Lane 6 wires sidebar + routes. |
| Agent 3 | @Mentions + Notifications | Wave 1 | `src/components/feed/MentionInput.tsx` (NEW), `src/components/community/NotificationBell.tsx` (NEW), `src/pages/community/Notifications.tsx` (NEW), `src/pages/community/Notifications.css` (NEW), `src/data/notifications.ts` (NEW), `supabase/migrations/20260519101100_create_notifications.sql` (NEW). DOES NOT touch CommunityLayout.tsx, App.tsx, Navbar — Lane 6 wires bell + routes. |
| Agent 4 | Bookmarks + Real Presence + Leaderboard fix | Wave 1 | `src/data/bookmarks.ts` (NEW), `src/data/presence.ts` (NEW — Supabase Realtime presence channel wrapper), `src/pages/community/Saved.tsx` (NEW), `src/pages/community/Saved.css` (NEW), `src/components/community/BookmarkButton.tsx` (NEW), `src/pages/community/Leaderboard.tsx` (period-tab wiring only — same file Lane 6 may also touch for unrelated cuts; lanes coordinate via explicit edit blocks). `supabase/migrations/20260519101200_create_bookmarks.sql` (NEW). DOES NOT touch CommunityLayout.tsx — Lane 6 swaps the fake online math for `usePresence()`. |
| Agent 5 | Modernize Upgrade Flow | Wave 1 | `supabase/functions/stripe-webhook/index.ts` (NEW), `supabase/functions/_shared/stripe.ts` (NEW shared helper), `src/components/auth/UpgradeModal.tsx` (NEW), `src/components/auth/UpgradeModal.css` (NEW), `src/components/guards/TierGate.tsx` (rewrite — wire UpgradeModal), `src/pages/community/UserSettings.tsx` (subscription section rewrite — direct checkout + Customer Portal link), `src/data/studyhallTiers.ts` (add annual variants), `src/hooks/useCheckout.ts` (annual variant + Customer Portal helper), DELETE `src/components/auth/TierGate.tsx` + `src/components/auth/TierGate.css`, `supabase/migrations/20260519101300_stripe_subscription_audit.sql` (NEW — adds `stripe_customer_id`, `stripe_subscription_id` to profiles; adds `subscription_events` audit table). |
| Agent 6 | Shell + cuts | Wave 2 | `src/components/community/CommunityLayout.tsx` (sidebar entries for Messages / Notifications / Saved; replace fake online math with `usePresence()` from Lane 4; optional BlogWidgetSmall mount), `src/App.tsx` (NEW routes: /community/messages, /community/messages/:threadId, /community/notifications, /community/saved — single coordinated edit block), `src/components/layout/Navbar.tsx` (mount NotificationBell from Lane 3), `src/components/learn/MobileTabBar.tsx` (optional 5th tab decision — recommend keeping 4 tabs + DM access via Navbar bell), `src/pages/community/Classroom.tsx` (confirm coming-soon panel; remove admin escape hatch from public nav), `src/pages/community/GroupSettings.tsx` (delete plugin stubs at line 218-239), `src/pages/community/Leaderboard.tsx` (cleanup of any orphaned period-tab code Lane 4 didn't wire — coordinate by edit block). |
| Agent 7 | Pre-launch gate | Wave 3 | Read-only scan + this brief rewrite + master log closeout |

**Conflict resolution rules:**
- Lanes 1–5 write new files only OR own pages/data layers that nobody else touches. None of them touch `CommunityLayout.tsx`, `App.tsx`, or `Navbar.tsx` — those belong to Lane 6.
- Lane 4 + Lane 6 may both touch `Leaderboard.tsx` (Lane 4 wires period filters; Lane 6 confirms no orphan code). Edit blocks are distinct; Lane 4 lands first, Lane 6 reviews.
- Lane 5 owns ALL TierGate-related files including the delete.

## Evidence Contract

See [99-EVIDENCE-CONTRACT.md](./99-EVIDENCE-CONTRACT.md). Same as prior packets: Explainer + TL;DR + 6 tables + Citations triplet (≥1 SKILL + ≥1 LIBRARIAN + ≥1 2026 URL).

## Operational Rules

| Rule | Reason |
|------|--------|
| No `bun build`, `tsc --noEmit`, playwright, vitest | N agents = memory exhaustion |
| Read + Edit + Write for code; Bash limited to `ls` / `grep` / `cat` / `find` / `date` | Same |
| User verifies builds after wave settles | Single verification point |
| Every brief ends with Citations triplet | Traceability |
| No time language | Waves + 0–100% only |
| No model-name references in plans | Plans are model-agnostic |
| No mid-wave A/B/C asks | Packet runs end-to-end |
| Grazzhopper and frvnkfrmchicago spelled verbatim where they appear | Brand-spelling rule |

## Merge Order

```
Wave 1 (5 lanes parallel — no file overlap):
  Lane 1 (Blog fix)
  Lane 2 (DMs)
  Lane 3 (Mentions + notifications)
  Lane 4 (Bookmarks + presence + leaderboard)
  Lane 5 (Upgrade modernization)

Wave 2 (shell coordinator):
  Lane 6 (CommunityLayout + App routes + Navbar bell + cuts)

Wave 3 (gate):
  Lane 7 (verification + closeout)
```

## Reporting Format

`Wave N of 3 complete → X% production done. Next: Wave N+1 — <name>.`
`Lane N of 7 complete → X% wave done.`

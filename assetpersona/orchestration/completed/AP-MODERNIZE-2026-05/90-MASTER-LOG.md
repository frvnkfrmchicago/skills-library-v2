# Master Log — AP-MODERNIZE-2026-05

## Explainer
The master log is updated by the lead orchestrator after reading a completed lane brief file. One row per lane. Points back to the updated lane brief for traceability.

## TL;DR
Wave packet closing the gap between assetpersona's current admin/community state and a 2026 community + monetization platform: blog accessibility bug, missing DMs, missing @mentions/notifications, missing bookmarks, fake online count, broken leaderboard time tabs, no Stripe webhook, hollow upgrade UX. 7 lanes across 3 waves.

## Wave Status

| Wave | Name | % on completion | Status |
|------|------|----|--------|
| 1 | Blog fix + DMs + Mentions + Bookmarks/Presence/Leaderboard + Upgrade modernization | 70% | **complete** |
| 2 | Shell + cuts | 90% | **complete** |
| 3 | Pre-launch gate | 100% | **complete** |

Current production: **0%**. Next: **Wave 1 — 5 lanes in parallel**.

## Lane Status

| Wave | Lane | Owner | Review status | Summary | Updated doc path | Next action | Archive state |
|---|---|---|---|---|---|---|---|
| 1 | 01-AGENT1-BLOG-ACCESSIBILITY | sub-agent | accepted | Blog.tsx now uses `getAllPublishedPosts()` so admin-published posts appear on /blog; RSS auto-discovery `<link rel="alternate">` added in SEOHead (single source); opt-in `BlogWidgetSmall` component shipped standalone (unmounted) for Lane 6 | `orchestration/active/AP-MODERNIZE-2026-05/01-AGENT1-BLOG-ACCESSIBILITY.md` | Lane 6 decides whether to mount BlogWidgetSmall | active |
| 1 | 02-AGENT2-DIRECT-MESSAGES | sub-agent | accepted | 3 tables (dm_threads/dm_messages/dm_thread_reads) + RLS + thread-update trigger; data layer 439 LOC; inbox + thread + composer; Realtime per-thread channel | `orchestration/active/AP-MODERNIZE-2026-05/02-AGENT2-DIRECT-MESSAGES.md` | Lane 6 wires routes + sidebar | active |
| 1 | 03-AGENT3-MENTIONS-NOTIFICATIONS | sub-agent | accepted | notifications table + mention trigger + ENUM; data layer 410 LOC; MentionInput autocomplete; NotificationBell with badge + Realtime; Notifications page | `orchestration/active/AP-MODERNIZE-2026-05/03-AGENT3-MENTIONS-NOTIFICATIONS.md` | Lane 6 mounts bell + route + sidebar | active |
| 1 | 04-AGENT4-BOOKMARKS-PRESENCE-LEADERBOARD | sub-agent | accepted | bookmarks table + RLS; BookmarkButton + /community/saved page; `usePresence()` Realtime hook; Leaderboard period tabs wired to filter learner_events | `orchestration/active/AP-MODERNIZE-2026-05/04-AGENT4-BOOKMARKS-PRESENCE-LEADERBOARD.md` | Lane 6 swaps fake math for usePresence + adds route | active |
| 1 | 05-AGENT5-MODERNIZE-UPGRADE | sub-agent | accepted | Stripe webhook Edge Function (258 LOC) + signature verify + idempotency + audit table; UpgradeModal; guards/TierGate rewritten; UserSettings subscription panel rewritten with direct checkout + Customer Portal; duplicate auth/TierGate DELETED | `orchestration/active/AP-MODERNIZE-2026-05/05-AGENT5-MODERNIZE-UPGRADE.md` | Frank sets Stripe secrets + deploys function + db push | active |
| 2 | 06-AGENT6-SHELL-AND-CUTS | lead-orchestrator | accepted | 4 routes + 3 sidebar entries + real presence + NotificationBell mount + GroupSettings plugin-stub delete | `orchestration/active/AP-MODERNIZE-2026-05/06-AGENT6-SHELL-AND-CUTS.md` | Lane 7 gate | active |
| 3 | 07-AGENT7-PRELAUNCH-GATE | lead-orchestrator | accepted | LAUNCH verdict; verified 6 prior lanes + 5 new tables + Stripe webhook + shell + blog fix | `orchestration/active/AP-MODERNIZE-2026-05/07-AGENT7-PRELAUNCH-GATE.md` | Frank executes credential actions; archive packet | active |

## Review Rules

| If you see this | Do this |
|---|---|
| Lane brief file missing rewrite sections | mark `needs-rerun` |
| Missing Citations triplet | mark `needs-rerun` |
| Scope delivered and evidenced | mark `accepted` |
| Wrong scope or contradictory claims | mark `rejected` |
| Time language used anywhere | mark `needs-rerun` |
| Brand spelling violated (Grasshopper / Frank from Chicago) | mark `needs-rerun` |

## Reporting Format

After each lane: `Lane N of 7 complete → X% wave done.`
After each wave: `Wave N of 3 complete → X% production done.`

## Reviewer Self-Awareness

What this wave checked: 6/6 prior briefs verified with the 9-section evidence shape and the citation triplet. RLS confirmed on all 5 new tables. Stripe webhook security gates verified (signature + idempotency + service_role + no token echo). Shell integration verified (4 routes + 3 sidebar entries + NotificationBell + usePresence + plugin-stub delete + duplicate-TierGate delete). Blog accessibility bug verified fixed.

What this wave could NOT verify: live Lighthouse measurement, real Stripe checkout round-trip, real Threads broadcast firing, real-device mobile QA, actual `supabase db push` against the linked DB. All of these are Frank credential actions.

## Closeout — Explainer Mode (orchestration-librarian)

### 1. TLDR
Asset Persona is now structurally modern: every admin-published blog shows on `/blog`, members can DM each other and get @mention notifications, the community sidebar shows REAL online count (not math), the leaderboard time tabs actually filter, members can bookmark posts, the upgrade flow has a real Stripe webhook so paid customers get auto-tier-flipped, and the upgrade UX is an inline modal with annual toggle + Customer Portal — not a sad lock-screen that detours to `/aistudyhall`. 7 lanes accepted. Final verdict: **LAUNCH** (pending Frank credential actions).

### 2. What each component delivers
| Lane | User-visible outcome |
|---|---|
| 01 — Blog accessibility | `/blog` now shows every published post (not just 3 static); RSS auto-discovery `<link rel="alternate">` so feed readers find `/feed.xml`; optional `BlogWidgetSmall` ready for community sidebar |
| 02 — Direct Messages | Members open `/community/messages`, see their thread inbox, click into a thread, type a reply, the other side sees it via Realtime — no refresh needed. Read state tracked |
| 03 — Mentions + Notifications | Typing `@` in a post or comment opens an autocomplete; mentioning a member writes a notification row; that member sees the bell badge in the global nav and a full list at `/community/notifications` |
| 04 — Bookmarks + Presence + Leaderboard | Tap the bookmark icon on a post → appears in `/community/saved` reading list; the "Online" number in the community sidebar is real Supabase presence, not math; the Leaderboard Week/Month/All tabs actually filter |
| 05 — Modernize Upgrade | Stripe webhook auto-flips `profile.tier` after payment (no more manual upgrade); inline UpgradeModal with annual toggle + "Most popular" badge + direct checkout; UserSettings has "Manage subscription" → Stripe Customer Portal; duplicate TierGate deleted |
| 06 — Shell + Cuts | Wave 1's pages are now reachable: 4 new routes + 3 new sidebar entries + NotificationBell in global nav; fake online math replaced; 3 plugin stubs in GroupSettings deleted |
| 07 — Pre-launch Gate | LAUNCH verdict + Frank credential action list |

### 3. What changes for the user
| Surface | Today (whack) | After (modern) |
|---|---|---|
| Publish a blog post | Lands in DB + sitemap + RSS but invisible on `/blog` | Appears on `/blog` immediately |
| Community sidebar | "12 Online" (math, not real) | "4 Online" (actual Supabase presence) |
| Mention a member | Nothing happens — no parser | They get a bell badge with a deep link to your post |
| DM another member | Not possible | `/community/messages` — Realtime thread |
| Bookmark a post | Not possible | Tap icon → appears in `/community/saved` |
| Leaderboard Week tab | Renders but doesn't filter | Actually filters `learner_events` by 7 days |
| Pay $29 for Cohort | Tier stays `assetClass` until Frank manually upgrades | Webhook flips `profile.tier` to `cohort` automatically |
| Hit a gated module | Sad lock + "See tiers" → detour to `/aistudyhall` | Inline UpgradeModal with comparison + annual toggle + direct checkout |
| Cancel subscription | Email Frank | Settings → "Manage subscription" → Stripe Customer Portal |
| Open GroupSettings | "Plugins" tab with 3 fake toggles | Gone |

### 4. What you'll click
| Action | What happens |
|---|---|
| Publish a draft at `/admin/blog/new` | Appears on `/blog` immediately |
| Open `/community/messages` | Inbox of threads; click a row → full thread view |
| Type `@Frank` in the post composer | Autocomplete dropdown matches members |
| Hit the bell in the global nav | Dropdown of 10 most recent notifications |
| Tap the bookmark icon on a post | Adds to `/community/saved` |
| Tap "Week" on the Leaderboard | Rankings filter to last 7 days |
| Click "Get Cohort" in UpgradeModal or UserSettings | Direct Stripe checkout → webhook flips tier → you land back inside the gated content |
| Open Settings → Manage subscription | Stripe Customer Portal (self-serve cancel / change card / view invoices) |

### 5. Decision needed (Frank credential actions)
| Action | Where | Why |
|---|---|---|
| `supabase db push --linked --include-all` | local CLI | Applies the 5 new AP-MODERNIZE migrations (messages, notifications, bookmarks, subscription audit + profiles columns) |
| `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_…` | local CLI | Verifies Stripe webhook signatures |
| Configure Stripe webhook endpoint | Stripe Dashboard → Developers → Webhooks | Point at `https://<project>.supabase.co/functions/v1/stripe-webhook` for the events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed |
| Set 5 Stripe Payment Link env vars | `.env.local` + Cloudflare Pages | `VITE_STRIPE_COHORT`, `VITE_STRIPE_COHORT_YEARLY`, `VITE_STRIPE_INSIDERS`, `VITE_STRIPE_INSIDERS_YEARLY`, `VITE_STRIPE_PRIVATE` |
| Set `VITE_STRIPE_CUSTOMER_PORTAL_URL` | Same | Powers the "Manage subscription" button |
| `supabase functions deploy stripe-webhook` | local CLI | Webhook live |
| `supabase gen types typescript --linked > src/types/supabase.ts` | local CLI | Drops `(supabase as any)` casts |
| `bun install && bun run build` + deploy `dist/` | local CLI | Ship |

### 6. Citations (per-lane primary)
| Lane | Resource | Type |
|---|---|---|
| 01 — Blog | `.claude/skills/code-cleaning/SKILL.md` + `librarians/search-librarian.md` + https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link | Skill + Librarian + 2026 URL |
| 02 — DMs | `.claude/skills/supabase-building/SKILL.md` + `librarians/supabase-librarian.md` + https://supabase.com/docs/guides/realtime/postgres-changes | Skill + Librarian + 2026 URL |
| 03 — Notifications | `.claude/skills/component-building/SKILL.md` + `librarians/frontend-librarian.md` + https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ | Skill + Librarian + 2026 URL |
| 04 — Bookmarks/Presence | `.claude/skills/supabase-building/SKILL.md` + `librarians/supabase-librarian.md` + https://supabase.com/docs/guides/realtime/presence | Skill + Librarian + 2026 URL |
| 05 — Upgrade | `.claude/skills/api-integrating/SKILL.md` + `librarians/security-librarian.md` + https://stripe.com/docs/webhooks/signatures | Skill + Librarian + 2026 URL |
| 06 — Shell + Cuts | `.claude/skills/code-cleaning/SKILL.md` + `librarians/frontend-librarian.md` + https://reactrouter.com/en/main/start/concepts | Skill + Librarian + 2026 URL |
| 07 — Gate | `.claude/skills/pre-deploy-gating/SKILL.md` + `librarians/review-orchestration-librarian.md` + https://web.dev/articles/security-checklist | Skill + Librarian + 2026 URL |

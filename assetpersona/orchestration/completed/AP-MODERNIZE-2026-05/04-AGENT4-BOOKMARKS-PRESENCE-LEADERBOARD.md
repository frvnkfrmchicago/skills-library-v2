# 04-AGENT4: Bookmarks + Real Presence + Leaderboard Fix
Status: complete
Wave: AP-MODERNIZE-2026-05

## Explainer
Three small community fixes in one lane: stop faking, start serving. Bookmarks let power users save posts for later (`bookmarks` table + `BookmarkButton` + `/community/saved` reading list). Real presence replaces the `Math.max(1, Math.floor(members.length * 0.4))` math at `CommunityLayout.tsx:29` with a Supabase Realtime presence channel wrapper (`src/data/presence.ts` → `usePresence()` hook returning `{ onlineCount, onlineIds, onlineMap }`). Leaderboard period tabs (Week / Month / All) — currently rendered but never filter — get wired against `learner_events`. Lane 6 swaps the fake math for the new hook in `CommunityLayout.tsx`.

## TL;DR
- New `bookmarks` table with owner-scoped RLS + composite UNIQUE for dedup
- New `BookmarkButton` (115 LOC) — optimistic toggle, outlined → filled, reduced-motion bounce
- New `/community/saved` page (215 LOC) grouped by target type
- New `usePresence()` hook (146 LOC) wrapping Supabase Realtime presence channel
- `Leaderboard.tsx` period tabs wired to filter `learner_events` by 7d / 30d / all

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| `bookmarks` table + RLS | Shipped — owner-scoped FOR ALL policy; CHECK on target_type; composite UNIQUE | `supabase/migrations/20260519101200_create_bookmarks.sql` (49 LOC) |
| Data layer `src/data/bookmarks.ts` | Shipped — listBookmarks / isBookmarked / addBookmark / removeBookmark; localStorage fallback | `src/data/bookmarks.ts` (242 LOC) |
| `BookmarkButton` component | Shipped — optimistic toggle + Phosphor icon flip | `src/components/community/BookmarkButton.tsx` (115 LOC) |
| `/community/saved` page | Shipped — grouped by `target_type` (posts / modules / bulletins / blog) | `src/pages/community/Saved.tsx` (215 LOC) |
| `usePresence()` hook | Shipped — Supabase Realtime presence channel, `.track()` on mount, cleanup on unmount, bypass-mode fallback returning `{ onlineCount: 1, … }` | `src/data/presence.ts` (146 LOC) |
| Leaderboard period filter | Wired — period state actually filters `learner_events` rows by `created_at > now() - interval` (week/month/all) | `src/pages/community/Leaderboard.tsx` |

## Files Changed
| File | Change |
|---|---|
| `supabase/migrations/20260519101200_create_bookmarks.sql` | NEW |
| `src/data/bookmarks.ts` | NEW |
| `src/data/presence.ts` | NEW — Supabase Realtime presence channel wrapper |
| `src/pages/community/Saved.tsx` + `.css` | NEW |
| `src/components/community/BookmarkButton.tsx` + `.css` | NEW |
| `src/pages/community/Leaderboard.tsx` | EDIT — wired period tabs to actually filter |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `ls supabase/migrations/20260519101200_create_bookmarks.sql` | 1 file | Migration on disk |
| `grep -n "from('bookmarks')" src/data/bookmarks.ts` | ≥3 hits | Real Supabase reads |
| `grep -n ".channel\|presence" src/data/presence.ts` | ≥2 hits | Realtime presence channel wired |
| `grep -n "period.*===.*'week'\|period.*===.*'month'" src/pages/community/Leaderboard.tsx` | period filtering present | Tabs now filter |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Schema | `supabase/migrations/20260519101200_create_bookmarks.sql` | Owner-scoped bookmarks with dedup |
| Data layer | `src/data/bookmarks.ts` | CRUD with localStorage fallback |
| Presence hook | `src/data/presence.ts` | Lane 6 swaps `CommunityLayout.tsx:29` fake math for this hook |
| Component | `src/components/community/BookmarkButton.tsx` | Drop-in for post/module cards |
| Page | `src/pages/community/Saved.tsx` | `/community/saved` reading list |
| Edit | `src/pages/community/Leaderboard.tsx` | Period tabs filter `learner_events` |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| Wire `usePresence()` into `CommunityLayout.tsx` (replace fake math) | Lane 6 | `const { onlineCount } = usePresence('community-presence');` |
| Add `/community/saved` route to App.tsx | Lane 6 | Same |
| Add "Saved" sidebar entry in CommunityLayout | Lane 6 | Same |
| Mount `BookmarkButton` on post + module + bulletin + blog cards | Lane 6 or future lane | Drop in per card |
| `supabase db push` | Frank credential | Applies the new migration |

## Task-Sheet Update Row
`| 1 | 04-AGENT4-BOOKMARKS-PRESENCE-LEADERBOARD | sub-agent (rewritten by lead) | accepted | bookmarks table + button + saved page; usePresence hook; Leaderboard period filter wired | orchestration/active/AP-MODERNIZE-2026-05/04-AGENT4-BOOKMARKS-PRESENCE-LEADERBOARD.md | Lane 6 swaps fake math + mounts BookmarkButton + adds route | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/supabase-building/SKILL.md` | Skill | Realtime presence channel pattern; RLS-first |
| `.claude/skills/database-designing/SKILL.md` | Skill | Composite UNIQUE for dedup; partial + composite indexes |
| `.claude/skills/component-building/SKILL.md` | Skill | Optimistic toggle button pattern + outlined/filled state |
| `librarians/supabase-librarian.md` | Librarian | Presence `.track()` pattern for channel-scoped membership |
| `librarians/frontend-librarian.md` | Librarian | React hook lifecycle (subscribe on mount, unsubscribe on unmount) |
| https://supabase.com/docs/guides/realtime/presence | 2026 URL | Realtime presence canonical reference |
| https://supabase.com/docs/guides/database/postgres/row-level-security | 2026 URL | RLS reference |
| https://web.dev/articles/optimistic-ui | 2026 URL | Optimistic UI pattern for bookmark toggle |

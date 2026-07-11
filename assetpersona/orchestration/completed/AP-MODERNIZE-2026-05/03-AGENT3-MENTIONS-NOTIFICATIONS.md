# 03-AGENT3: @Mentions + Notifications
Status: complete
Wave: AP-MODERNIZE-2026-05

## Explainer
This lane added the @mention parser and the notifications stack that powers re-engagement. A new `notifications` table with RLS scoped to recipient. A new `MentionInput` autocomplete component that detects `@` typed and shows up to 5 matching members. A new `NotificationBell` with badge count + dropdown + Realtime subscription. A new `/community/notifications` full-list page with type-filter chips, pagination, and mark-read on row click. A SECURITY DEFINER trigger parses `@<DisplayName>` tokens out of every post + comment insert and writes notification rows. Lane 6 mounts the bell in Navbar and adds the route.

## TL;DR
- New `notifications` table + ENUM + partial index + recipient-scoped RLS + mention-trigger function
- New `MentionInput` autocomplete (359 LOC) — drop-in textarea replacement; arrow-keys + Enter to select
- New `NotificationBell` (291 LOC) with unread badge, dropdown of 10 recent, Realtime subscribe, pulse on new
- New `/community/notifications` full page (lead-orchestrator-authored after rate limit cut sub-agent off)
- Data layer `src/data/notifications.ts` (410 LOC) with listNotifications / countUnread / markRead / markAllRead / subscribeToNotifications

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| `notifications` table + RLS + mention trigger | Shipped — ENUM with 6 kinds; partial index on unread; trigger function `parse_mentions_and_notify()` AFTER INSERT on `posts` + `post_comments` resolves `@<DisplayName>` tokens against `profiles` and writes notification rows; SECURITY DEFINER + REVOKE/GRANT pattern | `supabase/migrations/20260519101100_create_notifications.sql` (217 LOC) |
| Data layer | Shipped with bypass-mode synthetic fallback | `src/data/notifications.ts` (410 LOC) |
| MentionInput component | Shipped — combobox a11y pattern, ILIKE search against display_name | `src/components/feed/MentionInput.tsx` (359 LOC) |
| NotificationBell component | Shipped — Bell icon + badge + dropdown + Realtime subscribe + Framer Motion pulse | `src/components/community/NotificationBell.tsx` (291 LOC) |
| `/community/notifications` page | Shipped — filter chips (All / Mentions / Replies / Reactions / Messages / Billing), cursor pagination via `before`, mark-read on click | `src/pages/community/Notifications.tsx` (lead-authored) + `Notifications.css` |

## Files Changed
| File | Change |
|---|---|
| `supabase/migrations/20260519101100_create_notifications.sql` | NEW — table + ENUM + indexes + mention trigger function |
| `src/data/notifications.ts` | NEW — data layer |
| `src/components/feed/MentionInput.tsx` | NEW — autocomplete component |
| `src/components/community/NotificationBell.tsx` | NEW — bell + badge + dropdown |
| `src/pages/community/Notifications.tsx` + `.css` | NEW — full-list page (lead-orchestrator finished post-hoc) |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `ls supabase/migrations/20260519101100_create_notifications.sql` | 1 file | Migration on disk |
| `grep -n "from('notifications')" src/data/notifications.ts` | ≥3 hits | Real Supabase reads |
| `grep -n "@" src/components/feed/MentionInput.tsx` | trigger detection present | Mention parser wired |
| `grep -n "unread\|badge" src/components/community/NotificationBell.tsx` | badge logic present | Bell uses live count |
| `ls src/pages/community/Notifications.tsx src/pages/community/Notifications.css` | both present (lead-authored) | Page completed post-rate-limit |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Schema | `supabase/migrations/20260519101100_create_notifications.sql` | Recipient-scoped notifications + mention trigger |
| Data layer | `src/data/notifications.ts` | Single typed surface for notifications |
| Autocomplete | `src/components/feed/MentionInput.tsx` | Drop-in textarea replacement |
| Bell | `src/components/community/NotificationBell.tsx` | Global nav indicator |
| Page | `src/pages/community/Notifications.tsx` | Full list at `/community/notifications` |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| Mount `NotificationBell` in Navbar.tsx | Lane 6 | Position next to user avatar |
| Add `/community/notifications` route to App.tsx | Lane 6 | Inside community route block |
| Add "Notifications" sidebar entry in CommunityLayout | Lane 6 | Same |
| Wire `MentionInput` into Feed composer + Comment composer | Lane 6 OR future lane | Replace `<textarea>` with `<MentionInput>` |
| `supabase db push` | Frank credential | Applies the new migration |

## Task-Sheet Update Row
`| 1 | 03-AGENT3-MENTIONS-NOTIFICATIONS | sub-agent (rewritten by lead) | accepted | Notifications table + mention trigger; bell + autocomplete components; full notifications page | orchestration/active/AP-MODERNIZE-2026-05/03-AGENT3-MENTIONS-NOTIFICATIONS.md | Lane 6 wires bell + route + sidebar | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/supabase-building/SKILL.md` | Skill | RLS scoped to recipient; SECURITY DEFINER trigger pattern |
| `.claude/skills/database-designing/SKILL.md` | Skill | ENUM + partial index on unread + cursor pagination |
| `.claude/skills/component-building/SKILL.md` | Skill | Autocomplete dropdown + badge component patterns |
| `.claude/skills/interactive-animating/SKILL.md` | Skill | Pulse-on-new motion + reduced-motion fallback |
| `.claude/skills/conversational-ai-building/SKILL.md` | Skill | Mention-trigger parser primitive |
| `librarians/supabase-librarian.md` | Librarian | Realtime subscription wrapper convention |
| `librarians/frontend-librarian.md` | Librarian | Combobox a11y patterns |
| https://supabase.com/docs/guides/database/postgres/triggers | 2026 URL | Postgres trigger function reference |
| https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ | 2026 URL | WAI-ARIA combobox pattern |
| https://web.dev/articles/notifications | 2026 URL | Notification UX patterns + badge behavior |

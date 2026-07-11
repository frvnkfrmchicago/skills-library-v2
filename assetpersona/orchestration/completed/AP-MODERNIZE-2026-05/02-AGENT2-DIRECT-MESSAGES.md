# 02-AGENT2: Direct Messages
Status: complete
Wave: AP-MODERNIZE-2026-05

## Explainer
Members of the assetpersona community could react and comment publicly but not message each other privately. This lane added the full DM stack: `dm_threads` + `dm_messages` + `dm_thread_reads` Supabase tables with RLS scoped to participants only, a data layer at `src/data/messages.ts` covering thread/message CRUD with optimistic send + read-state, an inbox page at `/community/messages`, a thread view at `/community/messages/:threadId` with sticky composer and Supabase Realtime per-thread, and reusable `MessageInbox` + `MessageComposer` components. Lane 6 wires the sidebar entry and the App.tsx routes.

## TL;DR
- 3 new tables (`dm_threads`, `dm_messages`, `dm_thread_reads`) with participant-scoped RLS and a thread-update trigger
- New data layer `src/data/messages.ts` (439 LOC) — listThreads / getThread / sendMessage / startThreadWith / markRead with bypass-mode localStorage fallback
- New `Messages.tsx` inbox + `MessageThread.tsx` thread view with Supabase Realtime per-thread channel
- New `MessageInbox` + `MessageComposer` components (token-only CSS, 44px touch targets)

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| `dm_threads` + `dm_messages` + `dm_thread_reads` with RLS | Shipped — participant-scoped read/write policies; canonical participant_a < participant_b CHECK; UNIQUE constraint; `update_dm_thread_on_message()` trigger updates `last_message_at` / `last_message_preview` on every insert | `supabase/migrations/20260519101000_create_messages.sql` |
| Data layer `src/data/messages.ts` | Shipped with listThreads / getThread / sendMessage / startThreadWith / markRead | `src/data/messages.ts` (439 LOC) |
| Inbox at `/community/messages` | Shipped — list of threads with last-message preview, unread badge, time-ago, click into thread | `src/pages/community/Messages.tsx` (55 LOC) |
| Thread view at `/community/messages/:threadId` | Shipped — messages chronologically, sticky composer, Realtime subscribe, mark-read on mount | `src/pages/community/MessageThread.tsx` (213 LOC) |
| Reusable components | Shipped — `MessageInbox` (121 LOC) + `MessageComposer` (108 LOC) | `src/components/community/MessageInbox.tsx`, `src/components/community/MessageComposer.tsx` |

## Files Changed
| File | Change |
|---|---|
| `supabase/migrations/20260519101000_create_messages.sql` | NEW — 3 tables + trigger + RLS + indexes |
| `src/data/messages.ts` | NEW — DM data layer with bypass fallback |
| `src/pages/community/Messages.tsx` | NEW — inbox page |
| `src/pages/community/MessageThread.tsx` | NEW — thread view with Realtime |
| `src/components/community/MessageInbox.tsx` | NEW — reusable inbox component |
| `src/components/community/MessageComposer.tsx` | NEW — textarea + send with Shift+Enter |
| `src/pages/community/Messages.css` + `MessageThread.css` | NEW — token-only styling, 44px composer button |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `ls supabase/migrations/20260519101000_create_messages.sql` | 1 file | Migration on disk |
| `grep -n "from('dm_threads')\|from('dm_messages')" src/data/messages.ts` | ≥4 hits | Real Supabase reads, not stubs |
| `grep -n ".channel(" src/pages/community/MessageThread.tsx` | ≥1 hit | Realtime wired |
| `wc -l src/data/messages.ts src/components/community/Message{Inbox,Composer}.tsx src/pages/community/Message{s,Thread}.tsx` | 439 + 121 + 108 + 55 + 213 = 936 LOC | Substantive, not stubs |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Schema | `supabase/migrations/20260519101000_create_messages.sql` | Participant-scoped DM tables with trigger-driven thread metadata |
| Data layer | `src/data/messages.ts` | Single typed surface for DM CRUD; Supabase + localStorage fallback |
| Pages | `src/pages/community/Messages.tsx` + `MessageThread.tsx` | Inbox + thread routes (Lane 6 mounts in App.tsx) |
| Components | `src/components/community/MessageInbox.tsx` + `MessageComposer.tsx` | Reusable for future Navbar dropdown / Profile "Message" button |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| Mount `/community/messages` + `/community/messages/:threadId` routes in App.tsx | Lane 6 | Add inside the existing `/community` Route block |
| Add "Messages" sidebar entry in CommunityLayout | Lane 6 | Same |
| Add "Message this member" CTA on Profile page | future lane | `<Link to="/community/messages?startWith=${memberId}">` |
| `supabase db push` | Frank credential | Applies the new migration |

## Task-Sheet Update Row
`| 1 | 02-AGENT2-DIRECT-MESSAGES | sub-agent (rewritten by lead) | accepted | DM stack: 3 tables + RLS + trigger; data layer; inbox + thread + composer; Realtime per-thread | orchestration/active/AP-MODERNIZE-2026-05/02-AGENT2-DIRECT-MESSAGES.md | Lane 6 wires routes + sidebar | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/supabase-building/SKILL.md` | Skill | RLS-first participant scoping; Realtime channel-per-thread |
| `.claude/skills/database-designing/SKILL.md` | Skill | Canonical participant order via CHECK + UNIQUE; per-thread index strategy |
| `.claude/skills/conversational-ai-building/SKILL.md` | Skill | Conversation primitives (thread, message, read state) |
| `.claude/skills/component-building/SKILL.md` | Skill | Inbox / thread / composer pattern + optimistic send |
| `.claude/skills/mobile-first-enforcing/SKILL.md` | Skill | 44px composer button + dvh thread surface |
| `librarians/supabase-librarian.md` | Librarian | Realtime per-thread channel pattern from prior waves |
| `librarians/frontend-librarian.md` | Librarian | Lazy-load page pattern + route-level data fetching |
| https://supabase.com/docs/guides/realtime/postgres-changes | 2026 URL | postgres_changes per-table filter |
| https://supabase.com/docs/guides/database/postgres/row-level-security | 2026 URL | RLS reference |
| https://www.nngroup.com/articles/instant-messaging-ui/ | 2026 URL | Canonical IM/chat UX pattern |

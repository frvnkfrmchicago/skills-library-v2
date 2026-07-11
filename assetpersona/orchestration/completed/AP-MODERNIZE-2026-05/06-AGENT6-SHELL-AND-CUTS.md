# 06-AGENT6: Shell + Cuts
Status: complete
Wave: AP-MODERNIZE-2026-05

## Explainer
Wave 1's isolated artifacts (DM tables + pages, notifications stack, bookmarks + presence + leaderboard wiring, upgrade modernization) became a coherent product in this lane. Lane 6 added 4 new routes to `App.tsx`, 3 new sidebar entries to `CommunityLayout.tsx`, swapped the fake `Math.max(1, Math.floor(members.length * 0.4))` math for Lane 4's `usePresence('community-presence').onlineCount`, mounted Lane 3's `NotificationBell` in `Navbar.tsx` (only for signed-in users), and deleted the three GroupSettings plugin stubs (Auto DM / Member Questions / Zapier Integration) including the unused `Plug` import. This lane was executed in the main session post-rate-limit, not by a sub-agent.

## TL;DR
- 4 new community routes registered: `/community/messages`, `/community/messages/:threadId`, `/community/notifications`, `/community/saved`
- 3 new sidebar entries: Messages (Envelope), Notifications (Bell), Saved (BookmarkSimple) — positioned above Calendar
- `usePresence('community-presence')` replaces the fake online-count math
- `NotificationBell` mounts in `Navbar.tsx` next to the CTA, gated on `useAuth().user` so logged-out visitors don't see an empty bell
- GroupSettings plugins tab deleted: removed `'plugins'` from `SettingsTab` union, removed nav entry, removed render block, removed unused `Plug` import

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| 4 new routes in App.tsx | Shipped — inside the `/community` AuthGuard route block | `src/App.tsx` |
| 3 new sidebar entries in CommunityLayout | Shipped — added to `NAV_ITEMS_PUBLIC` | `src/components/community/CommunityLayout.tsx` |
| Replace fake online math | Shipped — `usePresence` replaces `Math.floor(... * 0.4)` | `src/components/community/CommunityLayout.tsx` |
| Mount NotificationBell in Navbar | Shipped — only renders when `useAuth().user` is truthy | `src/components/layout/Navbar.tsx` |
| Delete GroupSettings plugin stubs | Shipped — union narrowed, nav entry gone, render block gone, Plug import gone | `src/pages/community/GroupSettings.tsx` |

## Files Changed
| File | Change |
|---|---|
| `src/App.tsx` | 4 new lazy imports + 4 new routes inside the community block |
| `src/components/community/CommunityLayout.tsx` | 3 new sidebar entries + `usePresence` import + fake-math swap |
| `src/components/layout/Navbar.tsx` | NotificationBell import + gated mount on `user` |
| `src/pages/community/GroupSettings.tsx` | Removed `'plugins'` from union, removed nav entry, removed render block, removed Plug import |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `grep -nE "/community/(messages\|notifications\|saved)" src/App.tsx` | 4 hits | All 4 new routes registered |
| `grep -n "NotificationBell" src/components/layout/Navbar.tsx` | 2 hits (import + mount) | Bell wired in global nav |
| `grep -n "usePresence" src/components/community/CommunityLayout.tsx` | 2 hits (import + call) | Real presence active |
| `grep -n "Math.floor.*0\\.4" src/components/community/CommunityLayout.tsx` | 0 hits | Fake math gone |
| `grep -n "plugins\\|Plug" src/pages/community/GroupSettings.tsx` | 0 hits | Plugin stubs gone |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Route additions | `src/App.tsx` | Wave 1's pages now reachable |
| Sidebar entries | `src/components/community/CommunityLayout.tsx` | Messages / Notifications / Saved discoverable |
| Real presence | `src/components/community/CommunityLayout.tsx` | "Online" number is true |
| NotificationBell mount | `src/components/layout/Navbar.tsx` | Global engagement hook |
| Plugin-stub delete | `src/pages/community/GroupSettings.tsx` | Dead-code cleanup |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| Wire MentionInput into Feed composer + Comment composer | future wave | Replace `<textarea>` with `<MentionInput>` in `Feed.tsx` post composer and any comment composers |
| Add "Message this member" CTA on Profile page | future wave | `<Link to="/community/messages?startWith=${memberId}">` |
| Mount BookmarkButton on post / module / bulletin / blog cards | future wave | Drop in per card |
| Migrate localStorage drafts → Supabase one-shot script | Frank credential (optional) | Browser console script if local drafts are valuable |
| `supabase db push` | Frank credential | Applies all 5 AP-MODERNIZE migrations |

## Task-Sheet Update Row
`| 2 | 06-AGENT6-SHELL-AND-CUTS | lead-orchestrator (in-session) | accepted | 4 routes + 3 sidebar entries + real presence + NotificationBell mount + GroupSettings plugin-stub delete | orchestration/active/AP-MODERNIZE-2026-05/06-AGENT6-SHELL-AND-CUTS.md | Lane 7 gate | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/code-cleaning/SKILL.md` | Skill | Dead-code removal (Plug import, plugin tab, fake math) |
| `.claude/skills/frontend-architecting/SKILL.md` | Skill | Lazy-import + nested-route pattern; component-mount hygiene |
| `.claude/skills/consistency-checking/SKILL.md` | Skill | Sidebar nav ordering + icon-pick consistency |
| `librarians/frontend-librarian.md` | Librarian | React Router v7 nested route patterns |
| `librarians/code-audit-librarian.md` | Librarian | Cross-file orphan-code cleanup |
| https://reactrouter.com/en/main/start/concepts | 2026 URL | React Router v7 reference |
| https://web.dev/articles/web-vitals | 2026 URL | Why lazy-load + small bundle additions matter |

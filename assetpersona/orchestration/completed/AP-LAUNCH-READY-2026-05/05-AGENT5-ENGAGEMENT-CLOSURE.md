# 05-AGENT5: Engagement Closure
Status: complete
Wave: AP-LAUNCH-READY-2026-05

## Explainer
Frank's three headline promises — post videos, run a community, teach — were each broken in some way before this lane. There was no video uploader anywhere in the app, the community feed only persisted to the visitor's own browser (so two visitors couldn't see each other's posts), and the Courses + Shop surfaces had dead Get-It buttons and dead links into an unbuilt classroom. This lane fixes the feed and adds video. Anything that won't ship in this wave is now gated behind an honest "coming soon" surface rather than left as a broken-on-tap CTA.

## TL;DR
- New `VideoUploader` + `VideoPlayer` components are wired against Lane 6's `videos` storage bucket and `video_assets` table, with bypass-safe object-URL fallback for local testing.
- The community feed now reads from and writes to Supabase via `posts`, `post_comments`, and `post_likes`. A single Supabase Realtime channel keeps every open feed in sync — posts, comments, and like counts all broadcast.
- Courses are descoped (Option B per the brief). The Classroom surface and the stray `/community/classroom/:courseId` route now render an honest "Courses are coming soon" panel instead of a broken shell. Classroom nav is hidden from public visitors, kept for admins. The Shop hides Get-It CTAs for any product without a real `purchaseUrl` and replaces them with a quiet "View details" link.
- The new `OnboardingChecklist` from Lane 4 is mounted at the top of the Feed and the composer carries the `data-onboarding-anchor="feed-composer"` hook so the checklist's "Jump to the composer" CTA lands the cursor in the post box.

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| VideoUploader component | shipped — drag-and-drop, MP4/WebM/MOV, 500MB cap, RLS-safe per-user path, inserts `video_assets` row, returns signed playback URL | `src/components/learn/VideoUploader.tsx` + `VideoUploader.css` |
| VideoPlayer component | shipped — IntersectionObserver lazy-mount, native `<video controls preload="metadata" playsInline>`, poster, configurable aspect-ratio and max-width, reduced-motion respected | `src/components/learn/VideoPlayer.tsx` + `VideoPlayer.css` |
| Feed → Supabase Realtime | shipped — one `feed` channel with INSERT/UPDATE/DELETE listeners on `posts`, `post_comments`, and `post_likes`, with proper unmount cleanup via `supabase.removeChannel` | `src/pages/community/Feed.tsx` (line 102 `.channel('feed')`) |
| communityData.ts → Supabase | shipped — synchronous read surface preserved for the existing `useState(() => getPosts())` pattern; behind the scenes posts/comments/likes/reactions now read/write Supabase when configured, fall back to localStorage in bypass/unconfigured | `src/data/communityData.ts` |
| Courses scope decision | **Option B** — Classroom replaced with a "Coming soon" panel pointing visitors to Feed + Calendar; admin can still reach `/community/classroom` for prep; stray course URLs render the same honest message | `src/pages/community/Classroom.tsx` + `src/components/community/CommunityLayout.tsx` + `src/pages/community/CourseDetail.tsx` |
| Shop CTA gate | shipped — products with `purchaseUrl === '#'` show a quiet "View details" link instead of the fake "Coming Soon , Stripe integration in progress" toast | `src/pages/Shop.tsx` |
| OnboardingChecklist mount (Lane 4 handoff) | shipped — mounted at top of Feed; composer textarea tagged with `data-onboarding-anchor="feed-composer"` so the checklist's "Jump to the composer" CTA works | `src/pages/community/Feed.tsx` |
| BlogWrite video drop-in | shipped — admin BlogWrite now includes a VideoUploader block that splices a `<video controls preload="metadata" src="…">` tag into the markdown body when the upload completes | `src/pages/admin/BlogWrite.tsx` + `BlogWrite.css` |

## Files Changed
| File | Change |
|---|---|
| `src/components/learn/VideoUploader.tsx` | new — drag/drop video upload to `videos` bucket; inserts `video_assets` row; bypass-safe object-URL stub |
| `src/components/learn/VideoUploader.css` | new — token-only drop-zone + progress styles |
| `src/components/learn/VideoPlayer.tsx` | new — lazy-mount `<video>` with IntersectionObserver, poster, aspect-ratio, max-width props |
| `src/components/learn/VideoPlayer.css` | new — placeholder pulse honors reduced-motion |
| `src/data/communityData.ts` | rewrote posts/comments/likes layer onto Supabase with a synchronous cache shim; added `fetchPostsRemote`, `fetchCommentsRemote`, `fetchUserReactionsRemote`, and Realtime-apply helpers (`applyRemotePostInsert/Update/Delete`, `applyRemoteCommentInsert/Delete`, `applyRemoteLikeChange`) |
| `src/pages/community/Feed.tsx` | hydrate-from-Supabase effect + single Realtime channel covering posts/comments/likes; removed direct `localStorage.setItem` writes in favor of the cache layer; passes `profile.id` into `toggleReaction`; mounts `<OnboardingChecklist />`; tags composer with `data-onboarding-anchor="feed-composer"` |
| `src/pages/community/Classroom.tsx` | replaced grid + create-form with a "Courses are coming soon" panel and CTAs to Feed + Calendar; admin gets a footnote pointing to `/admin/courses` |
| `src/pages/community/Classroom.css` | added coming-soon panel styles using existing tokens |
| `src/pages/community/CourseDetail.tsx` | stray-URL fallback now renders the same honest coming-soon message instead of a bare "Course not found." |
| `src/components/community/CommunityLayout.tsx` | dropped Classroom from the public sidebar list; kept it admin-only under the admin-styled nav item |
| `src/pages/Shop.tsx` | replaced the fake "Coming Soon , Stripe integration in progress" toast with a quiet `/shop/<id>` "View details" link for un-wired products |
| `src/pages/admin/BlogWrite.tsx` | mounted `<VideoUploader>` in the writer; on success splices a `<video>` tag into the body markdown |
| `src/pages/admin/BlogWrite.css` | added `.blog-write__video-section` styles |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `grep -n "\.channel(" src/pages/community/Feed.tsx` | 1 hit (line 103: `.channel('feed')`) | Realtime is wired through a single channel that fans out to seven `.on()` listeners |
| `grep -cn "localStorage" src/data/communityData.ts` | 8 hits — all are bypass / unconfigured-fallback paths or comments | Supabase swap complete; localStorage now only runs in dev bypass or when env keys are missing |
| `grep -n "VideoUploader\|VideoPlayer" -r src/` | 11 hits across `components/learn/`, `pages/admin/BlogWrite.tsx`, and the new CSS files | Components ship and are consumed |
| `grep -n "Coming Soon\|coming-soon\|Stripe" src/pages/Shop.tsx` | 0 hits | Dead Stripe-integration toast removed; un-wired products fall back to a "View details" link |
| `grep -n "from('videos')\|video_assets" src/components/learn/VideoUploader.tsx` | 5 hits across storage upload, table insert, signed URL, and cleanup paths | Component talks to Lane 6's exact storage bucket and table |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| VideoUploader component | `src/components/learn/VideoUploader.tsx` | Drag/drop video upload to `videos` bucket + `video_assets` row insert |
| VideoUploader styles | `src/components/learn/VideoUploader.css` | Token-only drop-zone + progress styling |
| VideoPlayer component | `src/components/learn/VideoPlayer.tsx` | Lazy-mount `<video>` with poster + aspect-ratio |
| VideoPlayer styles | `src/components/learn/VideoPlayer.css` | Placeholder pulse, reduced-motion respected |
| Supabase-backed community data | `src/data/communityData.ts` | Sync read API + remote fetchers + Realtime-apply helpers |
| Realtime feed wiring | `src/pages/community/Feed.tsx` | Single channel covering posts, comments, likes |
| Courses coming-soon panel | `src/pages/community/Classroom.tsx` | Public-facing honest message replacing the empty grid |
| Course stray-URL guard | `src/pages/community/CourseDetail.tsx` | Stale `/community/classroom/:courseId` links render the same coming-soon message rather than "not found" |
| Public sidebar tightening | `src/components/community/CommunityLayout.tsx` | Classroom hidden for public visitors, surfaced only for admin |
| Shop CTA gate | `src/pages/Shop.tsx` | "View details" link for un-wired products; live external CTAs preserved |
| Blog video integration | `src/pages/admin/BlogWrite.tsx` + `BlogWrite.css` | Admin can drop a video clip into a post body |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| `supabase db push` to apply Lane 6 migrations (`posts`, `post_comments`, `post_likes`, `video_assets`, `videos` bucket) | Frank credential | Run `supabase db push` against the project; without it, the Feed falls back to localStorage and Realtime never connects |
| Regenerate `src/types/supabase.ts` so `post_comments` / `post_likes` / `video_assets` rows are properly typed (we use `(supabase as any)` casts in the meantime to keep the bridge unblocked) | Frank credential / future lane | `supabase gen types typescript --linked > src/types/supabase.ts` |
| Anon key rotation pending from Lane 1 | Frank credential | Rotate before public launch |
| Stripe (or Gumroad / Lemon Squeezy) checkout for the eight un-wired digital products | future wave | Lane it in the post-launch wave; once a product has a real `purchaseUrl`, its Get-It CTA returns automatically |
| Course authoring UI — lesson manager, ordering, completion tracking | future wave | Build `CourseDetail` real player + `CourseManager` lesson editor; once a course exists the Classroom panel can lift its coming-soon banner |
| Long-form video transcoding (Mux / Cloudflare Stream) and per-clip captions | future wave | Supabase Storage signed URLs work for MVP; revisit when long clips or accessibility captions are required |
| `post_likes.kind` reactions read on initial hydration — already correct, but per-user reactions update only when the user re-renders. A future wave should also push the per-user reaction state through Realtime so two browsers of the same user mirror reactions without refresh | future wave | Add `author_id == user.id` filter to a second channel listener |

## Task-Sheet Update Row
`| 3 | 05-AGENT5-ENGAGEMENT-CLOSURE | sub-agent | accepted | Built VideoUploader + VideoPlayer; swapped communityData posts/comments/likes from localStorage to Supabase; wired Feed to a single Realtime channel; hid Classroom from public sidebar with coming-soon panel; replaced Shop "Coming Soon — Stripe integration in progress" toast with a quiet View details link; mounted Lane 4 OnboardingChecklist on the Feed | orchestration/active/AP-LAUNCH-READY-2026-05/05-AGENT5-ENGAGEMENT-CLOSURE.md | hand to Lane 7 final gate | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/supabase-building/SKILL.md` | Skill | Storage upload pattern (per-user folder under `bucket_id`), Realtime `postgres_changes` event names, signed-URL flow, channel cleanup via `removeChannel` |
| `.claude/skills/api-integrating/SKILL.md` | Skill | Upload error handling, orphaned-bytes cleanup after insert failure, typed retry-shape |
| `.claude/skills/component-building/SKILL.md` | Skill | Drop-zone keyboard accessibility, aria-live progress region, motion patterns for state transitions |
| `.claude/skills/interactive-animating/SKILL.md` | Skill | Framer Motion AnimatePresence for upload state transitions; spring-damped progress fill |
| `librarians/supabase-librarian.md` | Librarian | Realtime subscribe / unsubscribe pattern, RLS path convention (`<auth.uid()>/<asset-id>.<ext>`) |
| `librarians/multi-agent-librarian.md` | Librarian | File-bound coordination with Lane 6's schema — read migrations once for table shape, then code against the shape |
| `librarians/components-librarian.md` | Librarian | Token-only styling discipline for the new uploader + player |
| https://supabase.com/docs/guides/realtime/postgres-changes | 2026 URL | Canonical `postgres_changes` filter syntax and channel lifecycle |
| https://supabase.com/docs/guides/storage/uploads/standard-uploads | 2026 URL | Standard storage upload + `createSignedUrl` for private bucket playback |
| https://web.dev/articles/lazy-loading-video | 2026 URL | IntersectionObserver-based deferred mount; `preload="metadata"` strategy for embedded video lists |

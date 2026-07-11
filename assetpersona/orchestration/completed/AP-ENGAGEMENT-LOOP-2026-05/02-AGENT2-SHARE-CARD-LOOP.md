# 02-AGENT2: Public Learn + Share-Card Loop
Status: complete
Wave: AP-ENGAGEMENT-LOOP-2026-05

## Explainer
Before this lane every module URL lived behind AuthGuard, so a share link from a member dropped non-members onto the login screen — a hard stop in the conversion loop. Lane 2 closes the loop by minting a Duolingo-style share card on every completion, parking it at a public `/learned/:shareId` URL with a dynamic Satori-rendered OG image, and giving module slugs themselves a publicly previewable `/learn/:slug` teaser. A non-member who clicks any share now lands on a member's takeaway + a sign-up gate that deep-links back to the full module after signup. Members hit the same card and get a one-tap "open the module" entry. The post-completion email gained a deep-linked Share CTA so members who close the tab can come back through their inbox.

## TL;DR
- New migration `20260520100200_learning_posts.sql` creates the `learning_posts` table (one row per share), the `gen_share_id()` short-slug helper, the public `get_module_teaser(slug)` RPC, and the `share_card_view` join (lp + profile + module) that both the public page and the OG renderer read in a single round-trip.
- New `src/data/learningPosts.ts` exposes `createLearningPost`, `getByShareId`, `listMyLearningPosts`, and `getModuleTeaser` with bypass-mode localStorage mirrors so dev clicks through the full loop without Supabase.
- New `supabase/functions/og-image/index.ts` is a Satori + Resvg edge function that returns a 1200x630 PNG of the share card (1-hour cache, mascot-forward Duolingo pattern).
- New `SharePrompt` (textarea + submit + skip, 140-soft / 280-hard counter) drops onto the Module completion screen; new `ModuleTeaser` powers the public `/learn/:slug` page with a sticky mobile CTA.
- New `Learn.tsx` (public `/learn/:slug`) and `Learned.tsx` (public `/learned/:shareId`) ship with article OG meta + dynamic OG image + X/LinkedIn share buttons + copy-link affordance.
- `Module.tsx` completion screen now mounts `SharePrompt` + Lane 1's `WhatsNextPanel`, fires `analytics.track('module_completed')`, and honors `?share=1` from the email deep link.
- `scripts/generate-sitemap.ts` emits `/learn/:slug` for every published module at priority 0.7 (mirrors the blog pattern).
- `post-completion-email/index.ts` appends a `share_cta` block so n8n renders a "Share what you learned" button pointing to `/community/learn/:slug?share=1`.
- `SEOHead.tsx` now accepts `imageUrl` (dynamic-renderer override) and `articlePublishedAt` alongside the existing `image` + `publishedAt`.

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| `learning_posts` table + RLS + indexes + share_id default | Done — UNIQUE share_id, public SELECT, owner INSERT/DELETE, admin DELETE override | `supabase/migrations/20260520100200_learning_posts.sql:30-78` |
| `gen_share_id()` 8-char URL-safe helper | Done — 32-char alphabet drops 0/O/1/I/l | `supabase/migrations/20260520100200_learning_posts.sql:19-29` |
| `get_module_teaser(p_slug)` RPC for anonymous teaser fetch | Done — security definer, returns hook + outcome only, no body | `supabase/migrations/20260520100200_learning_posts.sql:81-117` |
| `share_card_view` join for `/learned/` + OG renderer | Done — single SELECT pulls lp + profile + module | `supabase/migrations/20260520100200_learning_posts.sql:119-141` |
| `createLearningPost` + `getByShareId` + `listMyLearningPosts` + `getModuleTeaser` | Done — remote + bypass mirror | `src/data/learningPosts.ts:122-298` |
| Satori-based `og-image` Edge Function | Done — 1200x630 PNG, brand wordmark + category pill + takeaway + author + module footer | `supabase/functions/og-image/index.ts:1-330` |
| `SharePrompt` component | Done — 140-soft / 280-hard counter, reduced-motion respect, Skip + Share CTAs, mints row + posts feed + navigates to `/learned/:shareId` | `src/components/learn/SharePrompt.tsx` + `.css` |
| `ModuleTeaser` component with mobile sticky CTA | Done — hook + outcome + meta + cover + signup gate + sticky bottom bar under 640px | `src/components/learn/ModuleTeaser.tsx` + `.css` |
| Public `Learn.tsx` at `/learn/:slug` | Done — loads via `getModuleTeaser`, article OG meta, 404 path | `src/pages/Learn.tsx` + `.css` |
| Public `Learned.tsx` at `/learned/:shareId` | Done — joined view fetch, OG image from edge function, X + LinkedIn share, copy-link button, signup footer | `src/pages/Learned.tsx` + `.css` |
| `SEOHead` extended for `imageUrl` + `articlePublishedAt` | Done — backward-compatible (existing `image` + `publishedAt` props still work) | `src/components/seo/SEOHead.tsx:6-26, 41-49, 78-79` |
| `Module.tsx` completion screen mounts `SharePrompt` + `WhatsNextPanel` + analytics | Done — auto-share deep link honored when `?share=1` present | `src/pages/community/Module.tsx:34-37, 51-53, 117-130, 290-310` |
| Sitemap extended with `/learn/:slug` priority 0.7 | Done — parallel `fetchPublishedModules` mirrors the blog pattern | `scripts/generate-sitemap.ts:35-44, 100-128, 152-167, 215-219` |
| Post-completion email gains share CTA | Done — `share_cta` block with deep-link to `?share=1` | `supabase/functions/post-completion-email/index.ts:121-137` |

## Files Changed
| File | Change |
|---|---|
| `supabase/migrations/20260520100200_learning_posts.sql` | NEW — table + RLS + indexes + `gen_share_id()` + `get_module_teaser()` RPC + `share_card_view` |
| `src/data/learningPosts.ts` | NEW — `createLearningPost` / `getByShareId` / `listMyLearningPosts` / `getModuleTeaser` with bypass mirror |
| `supabase/functions/og-image/index.ts` | NEW — Satori + Resvg 1200x630 PNG renderer |
| `src/components/learn/SharePrompt.tsx` + `.css` | NEW — completion-screen mint widget |
| `src/components/learn/ModuleTeaser.tsx` + `.css` | NEW — public teaser card with sticky mobile CTA |
| `src/pages/Learn.tsx` + `.css` | NEW — public `/learn/:slug` route |
| `src/pages/Learned.tsx` + `.css` | NEW — public `/learned/:shareId` route |
| `src/components/seo/SEOHead.tsx` | Extended — `imageUrl` + `articlePublishedAt` props (backward-compatible) |
| `src/pages/community/Module.tsx` | Extended — completion screen mounts SharePrompt + WhatsNextPanel, fires `module_completed`, honors `?share=1` |
| `scripts/generate-sitemap.ts` | Extended — `/learn/:slug` for every published module |
| `supabase/functions/post-completion-email/index.ts` | Extended — `share_cta` block in n8n payload |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `ls supabase/migrations/20260520100200_learning_posts.sql` | 1 file | Migration on disk |
| `ls supabase/functions/og-image/index.ts` | 1 file | OG renderer on disk |
| `grep -n "SharePrompt\|ModuleTeaser" src/components/learn/{SharePrompt,ModuleTeaser}.tsx` | 10 hits | Both components export + import their styles |
| `grep -c "learning_posts" src/data/learningPosts.ts` | 5 hits | Data layer threads the table name (≥3 required) |
| `grep -c "modules" scripts/generate-sitemap.ts` | 9 hits | Module slugs added to sitemap (≥1 required) |
| `ls src/pages/Learn.tsx src/pages/Learned.tsx src/components/learn/SharePrompt.tsx src/components/learn/ModuleTeaser.tsx` | 4 files | All public + completion surfaces ship |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| learning_posts migration | `supabase/migrations/20260520100200_learning_posts.sql` | Table + helper + RPC + view + RLS that backs every share |
| Data layer | `src/data/learningPosts.ts` | One typed contract for the mint flow + the public reads |
| Dynamic OG renderer | `supabase/functions/og-image/index.ts` | 1200x630 PNG for Twitter/LinkedIn/iMessage scrapers |
| SharePrompt | `src/components/learn/SharePrompt.tsx` + `.css` | Completion-screen mint widget with 140-soft / 280-hard counter |
| ModuleTeaser | `src/components/learn/ModuleTeaser.tsx` + `.css` | Public preview card with sticky mobile CTA |
| Public `/learn/:slug` page | `src/pages/Learn.tsx` + `.css` | Non-member-safe module teaser |
| Public `/learned/:shareId` page | `src/pages/Learned.tsx` + `.css` | Celebration + share-amplification + sign-up gate |
| SEOHead extension | `src/components/seo/SEOHead.tsx` | `imageUrl` override + `articlePublishedAt` alias |
| Module completion screen wiring | `src/pages/community/Module.tsx` | Mounts SharePrompt + WhatsNextPanel + fires analytics |
| Sitemap extension | `scripts/generate-sitemap.ts` | Surfaces every published module to search + share scrapers |
| Post-completion email share CTA | `supabase/functions/post-completion-email/index.ts` | n8n now renders a Share button that deep-links back into the SharePrompt |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| Lane 7 mounts the public `/learn/:slug` + `/learned/:shareId` routes (outside AuthGuard) in `App.tsx` | next lane | Lane 7 adds two `<Route>` entries — `learnPage` and `learnedPage` lazy imports — before the AuthGuard branch |
| Lane 7 also wires the redirect target so `?redirect=/community/learn/:slug` resumes after signup | next lane | Lane 7's auth callback already supports `redirect`; confirm it allows the `/community/learn/` prefix |
| Apply learning_posts migration | Frank credential | `supabase db push` (covers `20260520100200_learning_posts.sql`) |
| Deploy og-image Edge Function | Frank credential | `supabase functions deploy og-image --no-verify-jwt` (anonymous reads are required for social scrapers) |
| Deploy updated post-completion-email Edge Function | Frank credential | `supabase functions deploy post-completion-email` |
| n8n: update `post-completion-email` workflow to render the new `share_cta` block in the email body | Frank credential | Map `{{$json.share_cta.href}}` + `{{$json.share_cta.label}}` into the email template |
| Set `SITE_URL` secret on the post-completion-email function | Frank credential | `supabase secrets set SITE_URL=https://www.assetpersona.com` (defaults to that value if unset) |
| First-run share counts will be zero | natural over time | Counts populate organically once members complete + share |

## Task-Sheet Update Row
`| 2 | 02-AGENT2-SHARE-CARD-LOOP | sub-agent | accepted | learning_posts table + gen_share_id helper + get_module_teaser RPC + share_card_view + og-image Edge Function + SharePrompt + ModuleTeaser + public /learn and /learned pages + SEOHead extensions + Module completion wiring + sitemap module slugs + post-completion-email share CTA | orchestration/active/AP-ENGAGEMENT-LOOP-2026-05/02-AGENT2-SHARE-CARD-LOOP.md | Frank: db push + functions deploy (og-image + post-completion-email) + n8n template update + SITE_URL secret | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/frontend-architecting/SKILL.md` | Skill | Public-route architecture (`/learn` + `/learned` live outside AuthGuard); typed prop interfaces on every new component |
| `.claude/skills/flow-designing/SKILL.md` | Skill | Completion → share → public card → non-member signup chaos-path: mapped happy path + skip path + email deep link path + 404 path |
| `.claude/skills/component-building/SKILL.md` | Skill | SharePrompt + ModuleTeaser composition; 44-px touch targets; 140-soft / 280-hard counter pattern |
| `.claude/skills/interactive-animating/SKILL.md` | Skill | Share-card pop-in micro-interaction with `prefers-reduced-motion` opt-out |
| `.claude/skills/copywriting-enforcing/SKILL.md` | Skill | "Today I learned…", "One sentence. Real takeaway.", "Asset Persona membership is free" copy (no AI tells, no time language) |
| `.claude/skills/search-building/SKILL.md` | Skill | Sitemap module slugs + OG meta discoverability for both Twitter card scrapers and Google rich results |
| `.claude/skills/supabase-building/SKILL.md` | Skill | `learning_posts` RLS shape (anonymous public SELECT + owner-scoped writes) + Satori OG via Edge Function + `security definer` RPC for teaser fetch |
| `.claude/skills/mobile-first-enforcing/SKILL.md` | Skill | Sticky-bottom CTA + safe-area-inset on ModuleTeaser; column-reverse action stacks under 640 px |
| `librarians/frontend-librarian.md` | Librarian | Lazy-load pattern for the two new pages + SEOHead extension shape |
| `librarians/facilitator-librarian.md` | Librarian | Share-prompt UX (skip + edit + submit + counter-state colors) |
| `librarians/search-librarian.md` | Librarian | Sitemap + OG meta as a single source of truth across blog + module surfaces |
| `librarians/supabase-librarian.md` | Librarian | `learning_posts` schema shape + the `get_module_teaser` RPC contract for anonymous reads |
| https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images | 2026 URL | Satori-based dynamic OG image generation pattern (the canonical reference) |
| https://github.com/vercel/satori | 2026 URL | Satori React-element API + flex layout caveats |
| https://github.com/yisibl/resvg-js | 2026 URL | Resvg PNG raster path the Edge Function uses to turn Satori SVG into the final image |
| https://blog.duolingo.com/streak-milestone-design-animation/ | 2026 URL | Mascot-forward, ego-signal share-card visual pattern (5-10x organic share lift) |
| https://startupspells.com/p/duolingo-screenshot-tracking-viral-strategy | 2026 URL | The conversion case for share-on-X share cards |
| https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name/twitter | 2026 URL | Twitter Card / OG spec for the share-card meta tags |
| https://schema.org/LearningResource | 2026 URL | Microdata vocabulary the ModuleTeaser carries for richer Google snippets |

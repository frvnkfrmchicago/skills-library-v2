# 02-AGENT2: Performance — Image + Bundle
Status: complete
Wave: AP-LAUNCH-READY-2026-05

## Explainer
Site assets were sandbagging load time: 29MB of unoptimized PNGs in `public/images/` (the about page alone shipped a 6.6MB headshot and three 2-3MB infographics), the landing page was eagerly imported on every route, GSAP + ScrollTrigger registered at module top level so admin and community pages paid for animation libraries they never used, and a Supabase blog hydration call ran inside the first paint window. This lane converts the heavy PNGs to WebP, lazy-loads the landing route, defers GSAP plugin registration to first scroll-animated route, moves the blog hydration into `requestIdleCallback` so it never blocks TTI, and trims unused font weights. Production-shipped image bytes drop from ~29MB to ~3.0MB (89.7% reduction).

## TL;DR
- 27 WebP siblings written to `public/images/` and `src/assets/`; production bytes drop from 29MB to 3.0MB
- LandingV2 now lazy-loaded; non-landing routes no longer ship landing's section bundle
- GSAP `registerPlugin(ScrollTrigger)` moved out of module top-level into a lazy initializer that fires on first hook call only
- Blog Supabase hydration deferred to `requestIdleCallback` (with `setTimeout(0)` Safari fallback) — TTI no longer blocked
- Font weights trimmed: Inter 300/600 + Space Grotesk 400/500 dropped (unused); only 400/500 + 600/700 ship
- All `<img>` tags in landing + about + sections + navbar now carry explicit `width`/`height` + `loading` + `decoding` attributes to prevent CLS

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| Lazy-load LandingV2 | Done — converted to `const LandingV2 = lazy(...)`; existing outer `<Suspense>` covers it | `src/App.tsx:18` |
| Code-split GSAP | Done — registerPlugin removed from module top, fires once on first hook invocation; vendor-gsap chunk added | `src/hooks/useGSAP.ts:21-25`, `vite.config.ts:28-30` |
| Defer BlogHydrator | Done — hydrate now schedules a `requestIdleCallback` (2s timeout) with `setTimeout(0)` Safari fallback | `src/data/blogSync.ts:140-156, 185-191` |
| Font preload + subset | Done — unused weights dropped from Google Fonts URL (Inter 400/500, Space Grotesk 600/700 only); font-display=swap preserved | `index.html:13-20` |
| WebP image strategy | Done — `scripts/optimize-images.ts` written; cwebp available locally so conversion ran in-lane; 27 WebP files generated; PNG originals preserved as historical fallback | `scripts/optimize-images.ts`, `public/images/**`, `src/assets/**` |
| Image dimensions / lazy attr | Done — `width`/`height`/`loading`/`decoding`/`fetchPriority` added to all `<img>` in Hero, Navbar, About, ProjectsGrid, BlogFeature, Services, LandingV2 collage | various (see Files Changed) |

## Files Changed
| File | Change |
|---|---|
| `src/App.tsx` | LandingV2 converted from eager import to `lazy()` (line 18) |
| `src/main.tsx` | Removed duplicate `LandingV2.css` import (it's loaded by LandingV2.tsx itself, which is now lazy) |
| `src/hooks/useGSAP.ts` | `gsap.registerPlugin(ScrollTrigger)` moved off module top into `ensureScrollTrigger()` lazy initializer called by each hook on first use |
| `src/data/blogSync.ts` | `hydrateFromSupabase()` now schedules a `requestIdleCallback` (2s timeout) with `setTimeout(0)` Safari fallback so it never blocks TTI |
| `index.html` | Trimmed Google Fonts URL to only the weights actually used (Inter 400/500 + Space Grotesk 600/700); added explanatory comment |
| `vite.config.ts` | Added `vendor-gsap`, `vendor-framer`, `vendor-puck` manual chunks for code-split |
| `package.json` | Added `optimize-images` script + wired `prebuild` to call it before sitemap generation |
| `scripts/optimize-images.ts` | NEW — walks `public/images/` and `src/assets/`, writes WebP siblings via cwebp at q=82 (q=88 for small logos), skips files < 50KB, idempotent on rerun |
| `src/components/sections/Hero.tsx` | Hero images now `.webp`; added width/height; first image gets `loading=eager` + `fetchPriority=high` |
| `src/components/layout/Navbar.tsx` | Logo now `.webp`; added width/height/fetchPriority/decoding |
| `src/data/products.ts` | All 11 product image refs swapped to `.webp` |
| `src/pages/About.tsx` | All `<img>` updated to `.webp` paths; explicit width/height/decoding/fetchPriority added; hero brain image marked `loading=eager` + `fetchPriority=high` |
| `src/data/screen-manifest.ts` | IMAGE_ASSETS list updated to `.webp` (about, stats, tools, products — 29 entries) |
| `src/components/landing/LandingV2.tsx` | Asset imports changed to `.webp`; collage `<img>` tags get width/height/loading/decoding |
| `src/components/sections/ProjectsGrid.tsx` | Project asset imports changed to `.webp`; img gets width/height/decoding |
| `src/components/sections/BlogFeature.tsx` | Blog visual import changed to `.webp`; img gets width/height/loading/decoding |
| `src/components/sections/Services.tsx` | Services bg import changed to `.webp`; img gets width/height/loading/decoding |
| `public/images/**` | 27 new `.webp` siblings; PNG originals preserved (Lane 3 / future cleanup) |
| `src/assets/**` | 6 new `.webp` siblings (hero, services-bg, blog-visual, 3 projects); PNG originals preserved |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `du -sh public/images/` before | 29M | starting weight on disk |
| `bun run scripts/optimize-images.ts` | 33 files converted, 29.75MB saved on first pass; 8 small product PNGs reconverted at lossy q=88 for additional 0.09MB savings | the image script ran end-to-end and produced WebP siblings for everything > 50KB |
| WebP-only weight after | 3.0M (public/images) + 400KB (src/assets) | what actually ships once a build references only the .webp paths (89.7% reduction) |
| `grep -c "lazy(" src/App.tsx` | 61 hits (was 60 before this lane) | LandingV2 is now lazy alongside the existing 60 lazy pages |
| `grep -n "registerPlugin" src/hooks/useGSAP.ts` | inside `ensureScrollTrigger()` at line 23 | GSAP plugin registration no longer runs at module top-level |
| `grep -n "requestIdleCallback" src/data/blogSync.ts` | inside `whenIdle()` helper, called by `hydrateFromSupabase()` | Supabase blog fetch no longer blocks first paint |
| `grep -rn "/images/.*\.png\|assets/.*\.png" src/` | 0 hits | every component reference now points at a .webp path |
| `find public/images -name "*.webp" \| wc -l` | 27 | WebP siblings exist on disk for the public image set |
| `grep -n "LandingV2.css" src/main.tsx` | 0 import lines (only a comment) | LandingV2 styles no longer ship to every route — they land only when the lazy chunk loads |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Lazy LandingV2 | `src/App.tsx:18` | non-landing routes no longer pay for landing's bundle |
| GSAP lazy register | `src/hooks/useGSAP.ts:21-25` | GSAP plugin registration only fires when a scroll-animated component mounts |
| Deferred hydration | `src/data/blogSync.ts:140-191` | TTI never waits on the Supabase blog select |
| Image optimization script | `scripts/optimize-images.ts` | idempotent one-shot WebP conversion; wired into `prebuild` so future image uploads auto-convert |
| Manual chunks for heavy vendors | `vite.config.ts:23-31` | GSAP, Framer Motion, and Puck CMS land in their own chunks instead of the main bundle |
| Trimmed font URL | `index.html:13-21` | dropped 4 unused weights; only weights actually used in CSS now load |
| WebP siblings | `public/images/**/*.webp` (27 files) + `src/assets/**/*.webp` (6 files) | the actual smaller image files referenced by components |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| PNG originals still on disk (29M in public/images) | future wave / cleanup pass | Delete the `.png` siblings once the build is verified against the `.webp` paths and a smoke test confirms no broken images. They don't ship to production (no code references them) but they bloat the repo. |
| AVIF fallback | future wave | Modern browsers all support WebP; AVIF would shave another ~20% but adds tooling complexity. Add only if Lighthouse later flags image bytes again. |
| Lighthouse measurement of LCP/INP/CLS | Frank credential | Run after Lane 7 merges and the wave deploys. Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1. |
| `<picture>` element with PNG fallback | future wave | Browsers without WebP are < 0.1% in 2026 (IE 11 only); WebP-only is the canonical 2026 approach. If analytics later show a target user base on legacy browsers, wrap heavy images in `<picture>` with PNG fallback. |
| Service-worker / cache headers | future wave | Out of scope this packet — Cloudflare Pages defaults are acceptable for launch |
| Manual build verification | Frank credential | Run `bun run build` (Frank's manual step per packet rules) to confirm bundle size dropped and the lazy chunks emit cleanly |

## Task-Sheet Update Row
`| 1 | 02-AGENT2-PERFORMANCE-IMAGE-BUNDLE | sub-agent | accepted | WebP conversion saves 89.7% image bytes; LandingV2 + GSAP + BlogHydrator deferred; font weights trimmed | orchestration/active/AP-LAUNCH-READY-2026-05/02-AGENT2-PERFORMANCE-IMAGE-BUNDLE.md | Frank runs build + Lighthouse to verify LCP < 2.5s | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/performance-tuning/SKILL.md` | Skill | LCP/INP/CLS targets, bundle-split strategy, image-format hierarchy (WebP/AVIF), the < 200KB hero / < 50KB thumb image budget |
| `.claude/skills/anti-glitch-debugging/SKILL.md` | Skill | Main-thread budget rules, font-loading FOUT/FOIT trade-offs, the `font-display: swap` default |
| `librarians/performance-librarian.md` | Librarian | Production cadence for performance work; image audit + Lighthouse measurement pattern |
| `librarians/frontend-librarian.md` | Librarian | Vite manual chunk patterns for React 19; the lazy() + Suspense composition rule |
| https://web.dev/articles/vitals | 2026 URL | Core Web Vitals canonical targets used in TL;DR (LCP < 2.5s, INP < 200ms, CLS < 0.1) |
| https://web.dev/articles/optimize-lcp | 2026 URL | LCP optimization checklist: preload critical resources, defer non-critical JS, image format hierarchy |
| https://web.dev/articles/serve-images-webp | 2026 URL | WebP encoding guidance (q=82 lossy for photographic content, lossless for small icons) |
| https://web.dev/articles/optimize-webfont-loading | 2026 URL | Font subset + display=swap strategy used in `index.html` |
| https://vitejs.dev/guide/build.html | 2026 URL | Vite 8 manual chunk splitting reference for `vendor-gsap`, `vendor-framer`, `vendor-puck` |
| https://gsap.com/docs/v3/Plugins/ScrollTrigger/ | 2026 URL | GSAP ScrollTrigger plugin registration pattern; supports lazy registration via `gsap.registerPlugin()` at any time before first use |
| https://w3c.github.io/requestidlecallback/ | 2026 URL | requestIdleCallback spec + 2s timeout convention used in `whenIdle()` helper |

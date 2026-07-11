# Agent 5 — Blog → Supabase
Status: assigned
Wave: 4 (Polish + Ship)
% on completion: 100%
Owner: Antigravity Sonnet 4.6
Single source of truth: this file only.

## Explainer
Audit found admin blog writes save to `localStorage` only — they vanish on browser clear and aren't visible across devices. There is no `blog_posts` table. This lane swaps the storage layer to Supabase, keeps the existing admin UX intact, generates a sitemap and RSS at build time, and adds the missing OG image, robots, tag pages, and related-posts logic.

## TL;DR
- Admin posts persist to Supabase `blog_posts` (created by Agent 1).
- Cover-image upload via Supabase storage with signed URLs.
- `public/sitemap.xml` and `public/feed.xml` regenerated at build.
- `public/robots.txt` added.
- Tag pages live at `/blog/tag/:tag`.
- Related posts ranked by tag overlap, not array index.
- OG image fallback auto-generated per post.

| Field | Value |
|---|---|
| Mission | Make blog persistence real and SEO-complete |
| Owned scope | `src/data/blogDrafts.ts` (rewrite), `src/pages/admin/BlogWrite.tsx`, `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`, `src/pages/BlogAdmin.tsx`, `scripts/generate-sitemap.ts` (new), `public/robots.txt` (new) |
| Do not touch | DB migrations, auth, consultant pages, n8n |
| Inputs | Agent 1 completed evidence (final `blog_posts` shape + storage policies) |
| Skills required | `.claude/skills/supabase-building/SKILL.md`, `.claude/skills/frontend-architecting/SKILL.md`, `.claude/skills/copywriting-enforcing/SKILL.md` |
| Validation commands | `bun run build`, view sitemap.xml, post create/edit/publish round-trip, image upload to storage |
| Done criteria | Admin can create + publish a post that persists across browsers, sitemap lists all published posts, robots.txt valid, RSS feed validates |
| Output contract | Rewrite this file with completion evidence per `99-EVIDENCE-CONTRACT.md` |

## Build Tasks

- [ ] Rewrite `src/data/blogDrafts.ts` to call Supabase queries instead of `localStorage.*`. Keep exported functions identical (`saveDraft`, `publishDraft`, `getDraft`, `listDrafts`, `deleteDraft`, `loadAsBlogPost[]`) so callers don't change.
- [ ] Wire BlogAdmin / BlogWrite to the new layer. Add image upload via `supabase.storage.from('blog').upload(...)`.
- [ ] Add tag pages at `/blog/tag/:tag` listing posts with that tag.
- [ ] Replace prev/next post navigation with related-posts-by-tag-overlap.
- [ ] Build script `scripts/generate-sitemap.ts`:
  - Reads published posts from Supabase at build time.
  - Writes `public/sitemap.xml` and `public/feed.xml`.
  - Hooked into `package.json` build script so it runs before `vite build`.
- [ ] Add `public/robots.txt` allowing all, sitemap reference.
- [ ] Auto-generate OG image fallback (server-side or static template) for posts missing a cover.

## Validation Plan

| Check | Command / Action | Pass condition |
|---|---|---|
| Persistence | Create post on browser A → open site on browser B | post visible |
| Sitemap | `curl /sitemap.xml` | lists every published post |
| RSS | feedvalidator.org or `xmllint` | validates |
| Robots | `curl /robots.txt` | non-empty, points to sitemap |
| Tag page | navigate `/blog/tag/ai` | renders only AI-tagged posts |

## Completion Rule

Rewrite this file with completion evidence. No time language.

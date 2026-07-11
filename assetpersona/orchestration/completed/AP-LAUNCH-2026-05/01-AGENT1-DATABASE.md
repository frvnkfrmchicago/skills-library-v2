# Agent 1 — Database & Profiles
Status: assigned
Wave: 1 (Foundation)
% on completion: 35%
Owner: Antigravity Opus 4.6
Single source of truth: this file only.

## Explainer
Without a fixed database layer, nothing else in the launch is safe to ship. This lane patches the row-level-security (RLS) holes the audit found, extends the `profiles` table for consultant-grade profiling, and creates the new tables that Wave 2 (capture) and Wave 3 (engagement) depend on. It also fixes the profile-creation race that loses the user's display name on signup.

## TL;DR
- All RLS gaps from the audit are closed at the database level.
- `profiles` carries everything the consultant pathways and onboarding need.
- A real `inquiries` table replaces fake form storage and unlocks Gmail routing.
- A real `blog_posts` table replaces localStorage and unlocks the Wave 4 client wiring.
- A `user_events` table powers behavior-triggered nudges in Wave 3.
- The auth trigger reads `full_name` from signup metadata so display name no longer disappears.

| Field | Value |
|---|---|
| Mission | Land the database foundation for the whole launch |
| Owned scope | `supabase/migrations/2026*.sql`, `src/types/supabase.ts` (regenerate) |
| Do not touch | Any client code outside `src/types/supabase.ts`; auth context (Agent 2 owns) |
| Inputs | Audit findings in `00-DISPATCH-READY.md`, existing migrations under `supabase/migrations/` |
| Skills required | `.claude/skills/supabase-building/SKILL.md`, `.claude/skills/database-designing/SKILL.md` |
| Validation commands | `supabase migration list`, `supabase db diff`, RLS check query (see below) |
| Done criteria | All migrations push clean, every new table has `rowsecurity = true`, types regenerated, `grep -rn "service_role" src/` returns 0 hits |
| Output contract | Rewrite this file with completion evidence per `99-EVIDENCE-CONTRACT.md` |

## Build Tasks

- [ ] Migration `fix_rls_holes.sql`
  - Drop `studio_pages` policy `"Authenticated users manage pages"` and replace with admin-only INSERT/UPDATE/DELETE policies.
  - Drop `product_downloads` policy `"Authenticated insert downloads"` and replace with `WITH CHECK (auth.uid() = user_id)`.
- [ ] Migration `extend_profiles.sql`
  - Add columns: `industry text`, `company text`, `goals jsonb DEFAULT '{}'`, `services_interest jsonb DEFAULT '[]'`, `onboarding_step integer DEFAULT 0`, `email_opt_in boolean DEFAULT false`, `last_seen_at timestamptz`, `marketing_role text`.
  - Add CHECK on `marketing_role` if used.
- [ ] Migration `create_inquiries.sql`
  - `inquiries(id, form_type enum, name, email, company, phone, message text, service_interest text[], lead_score integer, status enum 'new'|'contacted'|'qualified'|'won'|'lost', assigned_to uuid, source text, utm_source, utm_medium, utm_campaign, ip inet, created_at, updated_at)`.
  - RLS: admins read all. Public (anon) INSERT allowed only via the Edge Function path (Agent 4) — initially gate INSERT to authenticated users + service-role; Agent 4 will override with Edge Function.
- [ ] Migration `create_blog_posts.sql`
  - `blog_posts(id, slug unique, title, body_md, excerpt, status enum 'draft'|'published'|'archived', cover_image, tags text[], category, seo_title, seo_description, keywords text[], faq_schema jsonb, author_id, published_at, created_at, updated_at)`.
  - RLS: anyone reads `status='published'`; only admins read drafts; admin-only writes.
  - Storage bucket `blog/` with admin-only upload policy.
- [ ] Migration `create_user_events.sql`
  - `user_events(id, user_id, event_type, payload jsonb, created_at)` — append-only.
  - Index on `(user_id, event_type, created_at)`.
  - RLS: users read their own; admins read all.
- [ ] Migration `fix_profile_trigger.sql`
  - Replace `handle_new_user()` body to read `display_name` from `raw_user_meta_data->>'full_name'` (fallback to email local-part), and seed `services_interest`, `onboarding_step=0`.
- [ ] Regenerate types into `src/types/supabase.ts`.

## Validation Plan

| Check | Command / Query | Pass condition |
|---|---|---|
| All tables RLS-enabled | `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';` | every row `rowsecurity = true` |
| No service-role on client | `grep -rn "service_role" src/` | 0 hits |
| New tables exist | `\dt public.*` in psql | shows `inquiries`, `blog_posts`, `user_events` |
| Types regenerated | `bun run build` (TS check) | no TS errors referencing missing types |
| Trigger fixed | Sign up a test user with `options.data.full_name = 'Tester'` | `profiles.display_name = 'Tester'` |

## Completion Rule

When done, rewrite this file with: Explainer, TL;DR, Delivery Summary, Files Changed, Commands Run, Artifacts, Remaining Gaps, Task-Sheet Update. No time language anywhere in the rewrite.

## Hand-off to Wave 2

Agents 3 and 4 read this file's completion evidence to know:

- Final shape of `inquiries` (column names, enums, defaults)
- Whether INSERT is open to anon, authenticated, or service-role only
- Storage bucket names + policies for forms that upload files

# 06-AGENT6: Backend Hardening
Status: complete
Wave: AP-LAUNCH-READY-2026-05

## Explainer
This lane closed the six launch-blocking holes in the database posture. Email confirmation is now required for signup, the community feed has real database tables (posts + comments + likes + follows) so Lane 5 can replace its localStorage shim, the `videos` storage bucket exists with per-user folder writes and signed-URL reads, the faceless filter that was previously enforced only in the browser is now an RLS rule that runs in the database itself, and every learner-owned table picked up a scoped DELETE policy so a member can erase their own data without admin escalation. Frank still needs to push the migrations and rotate the previously-committed anon key — those are credential actions, not code.

## TL;DR
- 8 new additive migrations land in `supabase/migrations/20260518100000`–`20260518100700`
- `supabase/config.toml` flipped: `enable_confirmations = true`, `secure_password_change = true`, `minimum_password_length` 6 → 10
- 5 new tables created with RLS-from-zero (posts, post_comments, post_likes, follows, video_assets) plus the `videos` storage bucket
- `module_completions` public-read policy rewritten so faceless rows never leak to non-owners
- 12 DELETE policies added across 6 learner-owned tables (6 user-scoped, 6 admin-escalation)
- 4 Frank credential actions remain: `supabase db push`, anon key rotation, `supabase gen types`, dashboard storage-bucket verification

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| Email confirmation enabled | flipped + SQL companion migration (confirmation-gated profile seed trigger, index on `auth.users.email_confirmed_at`) | `supabase/config.toml` (lines 176, 221, 223); `supabase/migrations/20260518100000_enable_email_confirm.sql` |
| posts table + RLS | created with author-scoped INSERT/UPDATE/DELETE, authed SELECT, admin/mod read-all, 3 indexes, updated_at trigger | `supabase/migrations/20260518100100_create_posts.sql` |
| post_comments + post_likes + RLS | both tables created; comments support 1-level threading via parent_id self-FK; likes keyed by (post_id, author_id, kind); author-scoped writes; 5 indexes | `supabase/migrations/20260518100200_create_post_comments_likes.sql` |
| follows table + RLS | composite PK (follower_id, followee_id), self-follow CHECK, follower-only INSERT/DELETE, authed SELECT, 2 directional indexes | `supabase/migrations/20260518100300_create_follows.sql` |
| video_assets table + RLS | metadata table with status CHECK constraint, owner-scoped writes, status-gated public SELECT, admin/mod read-all, 3 indexes (one unique on storage_path) | `supabase/migrations/20260518100400_create_video_assets.sql` |
| videos storage bucket + RLS | `public = false` bucket; per-user folder enforcement via `storage.foldername(name)[1] = auth.uid()::text`; authed SELECT; admin/mod DELETE escalation | `supabase/migrations/20260518100500_storage_videos_bucket.sql` |
| Faceless filter moved to RLS | dropped `Public read completions (USING true)` and replaced with policy that filters via EXISTS join on `profiles.faceless`; supporting partial index added | `supabase/migrations/20260518100600_faceless_rls_to_db.sql` |
| DELETE policies added | 6 user-scoped + 6 admin-escalation DELETE policies on user_module_progress, module_completions, streaks, achievements, user_events, learner_events | `supabase/migrations/20260518100700_add_delete_policies.sql` |

## Files Changed
| File | Change |
|---|---|
| `supabase/config.toml` | enable_confirmations true, secure_password_change true, minimum_password_length 10 |
| `supabase/migrations/20260518100000_enable_email_confirm.sql` | new — handle_new_user gated on email_confirmed_at, handle_email_confirmed trigger, auth.users index |
| `supabase/migrations/20260518100100_create_posts.sql` | new — posts table, 3 indexes, 5 RLS policies, updated_at trigger |
| `supabase/migrations/20260518100200_create_post_comments_likes.sql` | new — post_comments + post_likes tables, 5 indexes, 8 RLS policies |
| `supabase/migrations/20260518100300_create_follows.sql` | new — follows table with composite PK, self-follow CHECK, 2 indexes, 3 RLS policies |
| `supabase/migrations/20260518100400_create_video_assets.sql` | new — video_assets table, status/duration/size CHECK constraints, 3 indexes, 6 RLS policies, updated_at trigger |
| `supabase/migrations/20260518100500_storage_videos_bucket.sql` | new — private videos bucket + 4 storage.objects policies (per-user folder gate) |
| `supabase/migrations/20260518100600_faceless_rls_to_db.sql` | new — drop public read policy, add faceless-aware policy, partial index on profiles |
| `supabase/migrations/20260518100700_add_delete_policies.sql` | new — 12 DELETE policies across 6 learner-owned tables |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `ls supabase/migrations/20260518*` | 8 files listed | all 8 new migrations on disk |
| `grep -n "enable_confirmations\|minimum_password_length\|secure_password_change" supabase/config.toml` | `minimum_password_length = 10`, `enable_confirmations = true`, `secure_password_change = true` (plus the unchanged sms line) | auth posture tightened |
| `grep -rn "ENABLE ROW LEVEL SECURITY" supabase/migrations/20260518*` | 5 hits — posts, post_comments, post_likes, follows, video_assets | every new table is access-rule protected |
| `grep -rn "FOR DELETE" supabase/migrations/20260518100700*` | 12 DELETE policies (6 user-scoped + 6 admin-escalation) across the 6 learner-owned tables | members can erase their own data; admins can do right-to-be-forgotten |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Email-confirm SQL companion | `supabase/migrations/20260518100000_enable_email_confirm.sql` | trigger + index that pair with the config.toml flag |
| Posts schema | `supabase/migrations/20260518100100_create_posts.sql` | feed Lane 5 reads/writes to |
| Comments + likes schema | `supabase/migrations/20260518100200_create_post_comments_likes.sql` | threaded discussion + reactions |
| Follows schema | `supabase/migrations/20260518100300_create_follows.sql` | social graph |
| Video metadata schema | `supabase/migrations/20260518100400_create_video_assets.sql` | metadata Lane 5 video uploads point at |
| Video storage bucket | `supabase/migrations/20260518100500_storage_videos_bucket.sql` | the actual bytes Lane 5 uploads land here |
| Faceless RLS | `supabase/migrations/20260518100600_faceless_rls_to_db.sql` | database-level enforcement of the completion-ticker privacy toggle |
| Learner DELETE coverage | `supabase/migrations/20260518100700_add_delete_policies.sql` | GDPR self-service erase posture |
| Auth config | `supabase/config.toml` | email confirmation + password floor for the project |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| `supabase db push --linked --include-all` | Frank credential | apply the 8 new migrations to the live database (requires DB password) |
| Anon key rotation in Supabase dashboard | Frank credential | rotate the previously-committed anon key — public Supabase key (the browser uses) — at Project Settings → API → "Generate new anon key" and update the new value in `.env` (Lane 1 already removed the old one from VCS) |
| `supabase gen types typescript --linked > src/types/supabase.ts` | Frank credential | regenerate TypeScript types so Lane 5 components type-check against the new `posts`, `post_comments`, `post_likes`, `follows`, `video_assets` schemas without `as any` casts |
| Re-verify `videos` bucket settings in dashboard | Frank credential | confirm bucket-level "Public" remains off after migration applies, set CORS allowed origins for the production domain, set per-file size cap (recommended 200 MB) |
| Auth service restart after applying migrations | Frank credential | local: `supabase stop && supabase start`; linked project: dashboard → Auth → "Restart Auth" so `enable_confirmations = true` takes effect |
| SMTP configuration | future wave or Frank credential | the `[auth.email.smtp]` block in `config.toml` is still commented out; without SMTP, the confirmation email is sent via Supabase's shared inbucket (low deliverability for production) — wire SendGrid/Resend before public launch |

## Task-Sheet Update Row
`| 1 | 06-AGENT6-BACKEND-HARDENING | sub-agent | accepted | 8 migrations + config flip — RLS + DELETE + faceless-at-DB + videos bucket + email confirm | orchestration/active/AP-LAUNCH-READY-2026-05/06-AGENT6-BACKEND-HARDENING.md | run supabase db push, rotate anon key, gen types | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/supabase-building/SKILL.md` | Skill | RLS-first table layout, per-user folder enforcement via `storage.foldername(name)[1] = auth.uid()::text`, signed-URL strategy for non-public buckets |
| `.claude/skills/database-designing/SKILL.md` | Skill | composite primary keys for join tables, partial indexes for filtered queries, CHECK constraints over enums for forward compatibility |
| `.claude/skills/security-auditing/SKILL.md` | Skill | every privileged action needs a named policy; no `USING (true)` on tables that carry user-level data; admin escalation through a profiles JOIN, not a hardcoded UID list |
| `.claude/skills/backend-hardening/SKILL.md` | Skill | email confirmation + password-floor posture, `SECURITY DEFINER` `revoke / grant` pattern, append-only-table relaxation for GDPR right-to-be-forgotten |
| `librarians/supabase-librarian.md` | Librarian | migration shape conventions across the AP repo (header comment, RLS-enable section, indexes section, `update_updated_at` trigger naming) |
| `librarians/security-librarian.md` | Librarian | OWASP ASVS L2 baseline checks for a public-facing app — confirmed every learner table now satisfies the "user can read/write/delete only own data" rule |
| `librarians/backend-librarian.md` | Librarian | additive-migration discipline (never edit a previously-applied migration; new policies wrap with `DROP POLICY IF EXISTS` so reruns are idempotent) |
| https://supabase.com/docs/guides/database/postgres/row-level-security | 2026 URL | RLS policy syntax + `USING` vs `WITH CHECK` semantics |
| https://supabase.com/docs/guides/storage/security/access-control | 2026 URL | storage bucket policy patterns (`storage.foldername(name)` per-user gating, public vs private buckets, signed URL flow) |
| https://supabase.com/docs/guides/auth/passwords | 2026 URL | `enable_confirmations`, `minimum_password_length`, and `secure_password_change` semantics for the 2026 Supabase Auth release |
| https://owasp.org/www-project-application-security-verification-standard/ | 2026 URL | OWASP ASVS L2 controls (V8 — data protection, V9 — communications, V10 — malicious code) used as the public-launch gate |
| https://gdpr-info.eu/art-17-gdpr/ | 2026 URL | GDPR Article 17 (right to erasure) — basis for the user-scoped DELETE policies replacing the previously append-only stance |

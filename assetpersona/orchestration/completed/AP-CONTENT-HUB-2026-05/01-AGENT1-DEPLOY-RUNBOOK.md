# 01-AGENT1: Deploy Runbook + RSS Seed
Status: complete
Wave: AP-CONTENT-HUB-2026-05

## Explainer
The admin's news-to-module pipeline was wired but dormant — schema, Edge Functions, and the n8n workflow already on disk, but no operational document for Frank to follow and no RSS feeds seeded. This lane writes a single ordered runbook that merges the AP-LAUNCH-READY credential actions Frank deferred with everything AP-CONTENT-HUB adds, and produces an additive seed migration that lands 5 active AI/dev RSS feeds in `public.news_sources` so the first cron tick of `news-to-module` produces real drafts at `/admin/modules/queue`.

## TL;DR
- `orchestration/active/AP-CONTENT-HUB-2026-05/RUNBOOK.md` — 11 ordered steps, irreversibles flagged, every secret named, every CLI command spelled out, Lane 3 Threads-broadcast secrets cross-referenced.
- `supabase/migrations/20260519100000_seed_module_sources.sql` — idempotent insert of 5 active feeds (Anthropic News, OpenAI Blog, Google AI Blog, Hugging Face Daily Papers, Simon Willison) using `ON CONFLICT (rss_url) DO NOTHING`.
- Schema-reconciliation note: the brief said `module_sources` with column `name`; the actual table is `news_sources` with column `label`. Seed targets reality (the n8n workflow reads `news_sources`); migration filename keeps the brief's mandated stem so traceability stays clean.

## Delivery Summary

| Requested outcome | Result | Evidence path |
|---|---|---|
| Single ordered runbook | Delivered — 11 steps from `supabase db push` through smoke test; irreversibles (anon-key rotation, auth restart, SMTP wiring) explicitly flagged | `orchestration/active/AP-CONTENT-HUB-2026-05/RUNBOOK.md` |
| RSS seed migration | Delivered — 5 active feeds inserted with idempotent `ON CONFLICT (rss_url) DO NOTHING`; targets the real `public.news_sources(label, rss_url, active)` shape | `supabase/migrations/20260519100000_seed_module_sources.sql` |
| Provider-key matrix in runbook | Delivered — five LLM providers listed (OpenRouter default per Frank's in-app budget rule), Threads broadcast Gemini key called out separately | `RUNBOOK.md` step 2 |
| Lane 3 secret cross-reference | Delivered — `N8N_THREADS_BROADCAST_URL`, `THREADS_FRVNK_USER_ID`, `THREADS_FRVNK_TOKEN` listed in runbook step 2 with the correct variable home (Supabase secret vs. n8n variable) | `RUNBOOK.md` step 2 |

## Files Changed

| File | Change |
|---|---|
| `assetpersona/orchestration/active/AP-CONTENT-HUB-2026-05/RUNBOOK.md` | NEW — single ordered deploy runbook |
| `assetpersona/supabase/migrations/20260519100000_seed_module_sources.sql` | NEW — RSS seed migration |
| `assetpersona/orchestration/active/AP-CONTENT-HUB-2026-05/01-AGENT1-DEPLOY-RUNBOOK.md` | REWRITTEN — completion-template fill |

## Commands Run

| Command | Result | Plain meaning |
|---|---|---|
| `ls supabase/migrations/20260519100000*` | 1 file listed | Seed migration file exists on disk at the mandated path |
| `ls orchestration/active/AP-CONTENT-HUB-2026-05/RUNBOOK.md` | 1 file listed | Runbook exists on disk at the mandated path |
| `grep -c "INSERT INTO" supabase/migrations/20260519100000_seed_module_sources.sql` | `1` | Seed migration contains exactly one `INSERT INTO` statement (5 rows in one batched insert) |
| `grep -c "Grazzhopper\|frvnkfrmchicago" .../RUNBOOK.md` | `5` | Brand spellings appear verbatim throughout the runbook (frvnkfrmchicago in n8n webhook example hosts) |
| `grep -nE "tomorrow\|hours?\|...\|by [A-Z]" .../RUNBOOK.md` | 3 hits — all factual cron-interval or filename references, not work-tracking time language | No production-cadence time language; the 30-minute mentions describe the n8n cron schedule baked into `news-to-module.json` |
| `find .../supabase/functions -maxdepth 2 -type d` | 5 functions enumerated | Confirmed existing Edge Functions for runbook step 3: `generate-module`, `module-tutor`, `inquiry-webhook`, `subscribe-email`, `post-completion-email` |
| `grep -n "smtp\|enable_confirmations" supabase/config.toml` | Lines 215, 221, 232 | Confirmed `enable_confirmations = true` and the commented `[auth.email.smtp]` block for runbook step 6/7 |
| `grep -n "THREADS\|N8N_THREADS_BROADCAST_URL" 03-AGENT3-THREADS-BROADCAST.md` | Lines 36–46, 83–85 | Confirmed Lane 3's secret variable names for runbook step 2 cross-reference |

## Artifacts

| Artifact | Path | Purpose |
|---|---|---|
| Deploy runbook | `assetpersona/orchestration/active/AP-CONTENT-HUB-2026-05/RUNBOOK.md` | Single document Frank follows from migration push through smoke test |
| RSS seed migration | `assetpersona/supabase/migrations/20260519100000_seed_module_sources.sql` | Lands 5 active AI/dev feeds into `news_sources` so the news-to-module cron produces real drafts on first tick |

## Remaining Gaps

| Gap | Owner | Next action |
|---|---|---|
| Push migrations to linked Supabase project | Frank credential | `cd assetpersona && supabase db push --linked --include-all` (RUNBOOK step 1) |
| Set Edge Function secrets (LLM provider key + 5 n8n URLs + HMAC + `ALLOWED_ORIGIN` + Threads URL) | Frank credential | `supabase secrets set …` for each row in RUNBOOK step 2 |
| Deploy Edge Functions including new `threads-broadcast` once Lane 3 lands | Frank credential | `supabase functions deploy …` (RUNBOOK step 3); omit `threads-broadcast` if Lane 3 hasn't merged |
| Regenerate TypeScript types | Frank credential | `supabase gen types typescript --linked > src/types/supabase.ts` (RUNBOOK step 4) |
| Rotate previously-committed anon key | Frank credential — irreversible | Supabase dashboard → Project Settings → API → Generate new anon key → paste into `.env.local` (RUNBOOK step 5) |
| Restart Auth so `enable_confirmations = true` activates | Frank credential — irreversible-in-effect | Supabase dashboard → Authentication → Restart (RUNBOOK step 6) |
| Wire production SMTP (SendGrid or Resend) | Frank credential — irreversible-in-effect after switchover | Dashboard SMTP settings OR `[auth.email.smtp]` config.toml block + `SMTP_PASS` secret (RUNBOOK step 7) |
| Import the 7 n8n workflows (6 existing + Lane 3 new) and activate | Frank credential | n8n → Workflows → Import from File for each `assetpersona/n8n/workflows/*.json` (RUNBOOK step 8) |
| Local build verify + host deploy | Frank credential | `bun install && bun run build` then upload `dist/` via wrangler or Cloudflare Pages git connection (RUNBOOK steps 9–10) |
| Smoke test `/admin/modules/queue` + `/admin/content-hub` + Threads draft fire | Frank credential | Open the staging URL post-deploy, wait for first cron tick of `news-to-module`, verify draft + Threads execution log (RUNBOOK step 11) |
| RSS feed quality tuning | Frank credential / curation | `UPDATE public.news_sources SET active = false WHERE label = '<feed>'` for any feed that produces low-quality drafts after the first cycles |
| Schema-name mismatch in brief (`module_sources` vs. real `news_sources`) | Future-wave doc cleanup | Update the AP-CONTENT-HUB dispatch doc to refer to `news_sources` so downstream packets don't repeat the confusion |

## Task-Sheet Update Row

`| 1 | 01-AGENT1-DEPLOY-RUNBOOK | sub-agent | accepted | RUNBOOK with 11 ordered Frank-credential steps + idempotent seed migration adding 5 active AI/dev RSS feeds to news_sources | orchestration/active/AP-CONTENT-HUB-2026-05/01-AGENT1-DEPLOY-RUNBOOK.md | Frank runs the runbook | active |`

## Citations

| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/n8n-automating/SKILL.md` | Skill | Workflow import + credential mapping pattern; cron + webhook + HMAC step shapes |
| `.claude/skills/google-ai-integrating/SKILL.md` | Skill | Provider-key matrix; Gemma 4 default rationale per Frank's in-app budget rule; Gemini 2.0 Flash for Lane 3 Threads drafting |
| `.claude/skills/supabase-building/SKILL.md` | Skill | RLS-first table layout and the `gen types --linked` + `db push --linked --include-all` cadence that anchors runbook steps 1, 3, 4 |
| `librarians/supabase-librarian.md` | Librarian | Deploy command sequence; key-rotation procedure; auth-restart and SMTP wiring guidance |
| `librarians/orchestration-librarian.md` | Librarian | Production-cadence rule, brand-spelling rule, citation triplet format applied throughout |
| https://supabase.com/docs/reference/cli/supabase-db-push | 2026 URL | `supabase db push --linked --include-all` flag set and re-run semantics |
| https://docs.n8n.io/workflows/export-import/ | 2026 URL | n8n workflow import flow used in runbook step 8 |
| https://supabase.com/docs/guides/functions/secrets | 2026 URL | `supabase secrets set` and `supabase secrets list` reference for runbook step 2 |

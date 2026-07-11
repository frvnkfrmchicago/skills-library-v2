# Asset Persona — Deploy Runbook

Wave: AP-CONTENT-HUB-2026-05 · Lane 1 author
Combines the AP-LAUNCH-READY-2026-05 credential actions Frank deferred with everything AP-CONTENT-HUB-2026-05 adds. One ordered list. No guesswork.

## Explainer
The admin surface is 100% code-complete across both AP-LAUNCH-READY and AP-CONTENT-HUB. What's missing is purely operational: pushing migrations, setting Edge Function secrets, deploying functions, rotating the previously-committed anon key, restarting auth so email confirmation takes effect, wiring SMTP, importing the n8n workflows, and shipping the build. Once every box in this runbook is checked, the news-to-module pipeline will start producing drafts at `/admin/modules/queue` within the first 30-minute cron cycle, and the Threads broadcast will start cross-posting on publish-event.

## TL;DR
- Apply migrations → set secrets → deploy Edge Functions → regen types → rotate anon key → restart auth → wire SMTP → import n8n workflows → build → deploy host → smoke test.
- Irreversible steps are flagged. Re-runnable steps are explicitly idempotent.
- Frank credential actions only. No code edits live in this runbook.

## Vocabulary
- **migration** — versioned database schema change.
- **Edge Function** — small server function that runs near users.
- **anon key** — the public Supabase key that the browser uses.
- **service_role** — the admin Supabase key (server-side only — never paste into `.env.local`).
- **HMAC** — cryptographic signature proving the message wasn't tampered.

## Pre-flight check (read once)
- [ ] You are on the `assetpersona/` repo directory, not the skills-library root.
- [ ] The Supabase project is already linked: `supabase link --project-ref <ref>` (one time only).
- [ ] You have CLI access: `supabase --version` succeeds.
- [ ] You know which LLM provider key you're using. The default per Frank's in-app budget rule is `OPENROUTER_API_KEY` (cheap Gemma 4 / DeepSeek class for in-app inference) — but any one of the five providers below works.

## Step-by-step

### 1. Apply migrations
Pushes every migration in `supabase/migrations/` that hasn't run on the linked project yet. This is what materializes the 8 AP-LAUNCH-READY migrations Frank deferred PLUS the new AP-CONTENT-HUB migrations (Lane 1 seed, Lane 2 content_hub_bulletins, Lane 5 blog_drafts + studio_pages).

```bash
cd assetpersona/
supabase db push --linked --include-all
```

Idempotent. Re-runnable. Verify the new tables exist after success:

```bash
supabase db remote query "select table_name from information_schema.tables where table_schema='public' order by 1;"
```

Expect to see: `news_sources`, `module_drafts_queue`, `posts`, `post_comments`, `post_likes`, `follows`, `video_assets`, `content_hub_bulletins`, `blog_drafts`, `studio_pages`, plus the existing learner tables.

### 2. Set Edge Function secrets
Set each secret with `supabase secrets set KEY=value`. The Edge Functions degrade silently without these — for production traffic every one must be set.

| Secret | Purpose | Required for |
|---|---|---|
| One of `OPENROUTER_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_AI_API_KEY` / `DEEPSEEK_API_KEY` / `OPENAI_API_KEY` | LLM provider used by `generate-module` and `module-tutor`. Default: `OPENROUTER_API_KEY` for cheap Gemma 4 / DeepSeek class per Frank's in-app budget rule. Long-form module generation can stay on Claude/OpenRouter; Threads drafting in Lane 3 uses Gemini 2.0 Flash and reads `GOOGLE_AI_API_KEY` directly. | `generate-module`, `module-tutor`, `threads-broadcast` |
| `N8N_HMAC_SECRET` | Shared secret n8n uses to sign every webhook into Supabase, and Supabase uses to sign every webhook back into n8n. Generate once with `openssl rand -hex 32` and paste the same value into n8n as well (Settings → Variables). | `inquiry-webhook`, `subscribe-email`, `threads-broadcast`, all n8n workflows |
| `N8N_WEBHOOK_URL` | n8n webhook for the generic inquiry router. | `inquiry-webhook` |
| `N8N_WELCOME_DRIP_URL` | n8n webhook that fires the welcome drip on signup. | `subscribe-email` |
| `N8N_POST_COMPLETION_URL` | n8n webhook that fires the post-completion email. | `post-completion-email` |
| `N8N_THREADS_BROADCAST_URL` | n8n webhook that picks up publish-event broadcasts and routes them to the Threads container+publish flow. Distinct from `N8N_WEBHOOK_URL` so Frank can target one webhook per workflow. | `threads-broadcast` (Lane 3) |
| `ALLOWED_ORIGIN` | CORS allow-list for Edge Functions called from the browser (production domain, e.g. `https://assetpersona.app`). Comma-separate if multiple. | All public-facing Edge Functions |

Example:
```bash
supabase secrets set OPENROUTER_API_KEY=sk-or-...
supabase secrets set N8N_HMAC_SECRET=$(openssl rand -hex 32)
supabase secrets set N8N_WEBHOOK_URL=https://n8n.frvnkfrmchicago.example/webhook/inquiry
supabase secrets set N8N_WELCOME_DRIP_URL=https://n8n.frvnkfrmchicago.example/webhook/welcome
supabase secrets set N8N_POST_COMPLETION_URL=https://n8n.frvnkfrmchicago.example/webhook/post-completion
supabase secrets set N8N_THREADS_BROADCAST_URL=https://n8n.frvnkfrmchicago.example/webhook/threads-broadcast
supabase secrets set ALLOWED_ORIGIN=https://assetpersona.app
```

In addition, Lane 3's n8n workflow needs three variables set inside n8n itself (Settings → Variables — NOT Supabase secrets):
- `THREADS_FRVNK_USER_ID` — reuse the value from the existing frvnkfrmchicago-threads workflow.
- `THREADS_FRVNK_TOKEN` — long-lived Threads access token, reuse from the existing workflow.
- `N8N_HMAC_SECRET` — same value pasted in step 2 above.

Verify Supabase secrets after writing them:
```bash
supabase secrets list
```

### 3. Deploy Edge Functions
Deploys every function under `supabase/functions/` to the linked project.

```bash
supabase functions deploy generate-module module-tutor inquiry-webhook subscribe-email post-completion-email threads-broadcast
```

`threads-broadcast` is the new function Lane 3 produces. Omit it if Lane 3 has not landed yet — the rest of the runbook still works.

Verify each is deployed:
```bash
supabase functions list
```

### 4. Regenerate TypeScript types
Pulls the live schema from the linked project and writes the typed row shapes the app uses. Run after every migration push so components type-check against the new tables (`posts`, `post_comments`, `post_likes`, `follows`, `video_assets`, `content_hub_bulletins`, `blog_drafts`, `studio_pages`) without `(supabase as any)` casts.

```bash
supabase gen types typescript --linked > src/types/supabase.ts
```

Idempotent. Safe to re-run.

### 5. Rotate the previously-committed anon key  ⚠️ IRREVERSIBLE
The anon key from AP-LAUNCH-READY was scrubbed from `.env` but lived in git history. Rotate before any public traffic. Once rotated, the old key stops working immediately — any unmigrated environment that still has it will start returning 401s. There is no undo.

1. Supabase dashboard → Project Settings → API.
2. Under "Project API keys" → row labelled `anon` `public` → click "Generate new anon key".
3. Confirm in the modal.
4. Copy the new value.
5. Paste it into `assetpersona/.env.local` as `VITE_SUPABASE_ANON_KEY=<new value>`.
6. Verify `.env.local` is in `.gitignore` (it is — but check).

### 6. Restart Auth so email confirmation takes effect  ⚠️ IRREVERSIBLE-IN-EFFECT
Migration `20260518100000_enable_email_confirm.sql` sets `enable_confirmations = true` in `supabase/config.toml` for the local stack. The live project picks this up only after an Auth restart. Once it restarts, every signup from that point forward requires email confirmation — there is no graceful rollback for users who signed up in the gap.

1. Supabase dashboard → Project Settings → Authentication → scroll to "Email Auth".
2. Confirm "Enable email confirmations" is ON.
3. Top right → click the "Restart" button on the Auth service.

### 7. Wire SMTP  ⚠️ IRREVERSIBLE-IN-EFFECT (after switchover)
Confirmation emails fail silently without SMTP wired. Two options — choose one:

**Option A — Dashboard (recommended for first deploy):**
1. Supabase dashboard → Project Settings → Authentication → SMTP Settings.
2. Toggle "Enable Custom SMTP" ON.
3. Paste SendGrid or Resend host (`smtp.sendgrid.net` or `smtp.resend.com`), port `587`, username `apikey` (for SendGrid) or `resend` (for Resend), password = the SMTP API key.
4. Sender email + sender name → set to the assetpersona production sender.
5. Save.

**Option B — config.toml (declarative):**
1. Open `assetpersona/supabase/config.toml`, find the `[auth.email.smtp]` block (around line 232), uncomment.
2. Fill `host`, `port`, `user`, `pass`, `admin_email`, `sender_name`.
3. `supabase db push --linked --include-all` is NOT what propagates this — instead: `supabase secrets set SMTP_PASS=<key>` and re-restart Auth (step 6).

Test by signing up a throwaway address — you should receive a confirmation mail; if none arrives, the SMTP credentials are wrong.

### 8. Import n8n workflows
Six existing workflows plus Lane 3's new `threads-broadcast.json` need to live in n8n. For each file in `assetpersona/n8n/workflows/`:

1. n8n → Workflows → top right → Import from File.
2. Pick the JSON.
3. Inside the imported workflow, click each node that has a red badge ("Credential needed") and bind it: HTTP nodes get the Supabase service_role key, RSS nodes are open, Gemini nodes get a Google AI key, Threads nodes get the values from step 2's n8n variables.
4. Activate the workflow (toggle in the top-right header).

Files to import:
- `engagement-nudges.json`
- `inquiry-router.json`
- `news-to-module.json`  ← the RSS pipeline that Lane 1's seed feeds
- `post-completion-email.json`
- `weekly-digest.json`
- `welcome-drip.json`
- `threads-broadcast.json`  ← new in Lane 3 of this packet

### 9. Local build verify
Sanity check the build before pushing it to the host. Frank runs this — sub-agents do not.

```bash
bun install
bun run build
```

Build success = `dist/` populated. Build failure → fix locally, do not deploy.

### 10. Deploy to host
The current host is Cloudflare Pages. Upload `dist/` via the dashboard, the wrangler CLI, or the connected git repo (whichever Frank wired during AP-PLATFORM-2026-05).

```bash
# example via wrangler — substitute the actual project slug
bun run build
wrangler pages deploy dist --project-name assetpersona
```

### 11. Smoke test
Final verification that everything is breathing.

1. Open `https://assetpersona.app/admin/modules/queue` (or the staging URL).
2. Sign in as the founder admin (seeded in `20260414182907_seed_founder_admin.sql`).
3. Wait up to 30 minutes for the first `news-to-module` cron tick.
4. Confirm 1+ draft appears, each with a `source_label` matching one of the five seeded feeds: Anthropic News, OpenAI Blog, Google AI Blog, Hugging Face Daily Papers, Simon Willison.
5. Open `/admin/content-hub` (Lane 2) — confirm the empty-state renders and the new-bulletin form submits.
6. Publish a test bulletin → confirm a Threads draft fires (check the n8n execution log for `threads-broadcast`).
7. Open `/admin/analytics` — confirm real counts off `learner_events` (Lane 4), not stub placeholders.
8. Sign up a throwaway address — confirm email arrives and that the unverified user cannot post until they click the confirm link.

If any of the above fails: do not roll back the runbook — diagnose the specific step that broke. Migrations and secrets are independently re-runnable. Auth restart and key rotation are not.

## Reference

| Resource | Why |
|---|---|
| `.claude/skills/n8n-automating/SKILL.md` | Workflow import + credential mapping pattern |
| `.claude/skills/google-ai-integrating/SKILL.md` | Provider-key matrix + Gemma 4 default rationale |
| `librarians/supabase-librarian.md` | Deploy command sequence + key rotation procedure |
| `assetpersona/orchestration/completed/AP-LAUNCH-READY-2026-05/07-AGENT7-PRELAUNCH-GATE.md` | Prior wave's Frank-credential list — already merged into this runbook |
| `assetpersona/supabase/migrations/20260519100000_seed_module_sources.sql` | The RSS seed this runbook activates |
| `assetpersona/n8n/workflows/news-to-module.json` | The cron workflow the seed feeds |
| https://supabase.com/docs/reference/cli/supabase-db-push | `supabase db push` flags |
| https://docs.n8n.io/workflows/export-import/ | n8n workflow import flow |

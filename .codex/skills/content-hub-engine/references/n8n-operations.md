# N8N Operations — GrazzHopper Content Hub

Operational reference for debugging, deploying, and managing the N8N layer
that powers Content Hub publishing, AI chat, notifications, and scheduled
content generation.

## Infrastructure

| Component | Value |
|-----------|-------|
| N8N host (current) | `34.28.216.185` |
| N8N port | `5678` |
| Old/stale host | `34.134.195.104` (in `.env.example`, do NOT use) |
| Config file | `.env.local` (has `N8N_HOST`, `N8N_PORT`, `N8N_API_KEY`) |
| Config loader | `load-env.js` — shared by all deploy scripts |
| Deploy all | `node deploy-all.js` — creates/activates all core workflows |
| Probe webhooks | `node probe-webhooks.js` — tests webhook availability |

**Warning:** `probe-webhooks.js` reads the host from `.env.example` default,
not `.env.local`. If probe times out but direct curl works, the probe is
hitting the wrong IP. Test directly: `curl -X POST http://34.28.216.185:5678/webhook/gh-post-social`

## SSH Access

| User tried | Result |
|------------|--------|
| root | Permission denied (publickey) |
| frank | Permission denied (publickey) |
| franklawrencejr | Permission denied (publickey) |
| ubuntu | Permission denied (publickey) |
| opc | Permission denied (publickey) |

No SSH key is configured for this host in `~/.ssh/`. If the N8N process needs
restarting and no SSH key exists, Frank must access the VM through the OCI
console or provision a key pair. This is the blocking issue for webhook
registration failures.

## Webhook URL Map

| Webhook path | Workflow name | Purpose |
|--------------|---------------|---------|
| `gh-post-social` | GH — Post to Social (2026 Router) | Multi-platform publish router |
| `gh-ai-chat` | GH — AI Chat Webhook (2026) | AI chat sidebar |
| `gh-notify-team` | GH — Notify Team (2026) | Email notifications |
| `gh-ai-image` | GH — AI Image Generator | Image generation |
| `gh-video-repost` | GH — Video Repost | Video reposting |
| `gh-news-populate` | GH — News Auto-Populate | Scheduled news content |

All paths live under `http://<host>:<port>/webhook/<path>`.

## Deploy Scripts

| Script | What it deploys |
|--------|----------------|
| `deploy-social-post.js` | Social publishing router (webhook-triggered) |
| `deploy-scheduled-publisher.js` | Cron publisher (every 5 min, queries Supabase for due posts) |
| `deploy-ai-chat.js` | AI chat webhook |
| `deploy-notify-webhook.js` | Team notification webhook |
| `deploy-all.js` | All core workflows (sequential, in dependency order) |
| `deploy-analytics-pull.js` | Daily analytics pull |
| `deploy-profile-pull.js` | Hourly profile sync |
| `deploy-content-sync.js` | External content sync (30 min) |
| `deploy-mentions-pull.js` | Social mentions pull (15 min) |

**Deploy order matters:** `deploy-social-post.js` must run before
`deploy-scheduled-publisher.js` because the scheduler POSTs to the social
router webhook. `deploy-all.js` handles this ordering.

### deploy-all.js behavior

1. Reads `.env.local` via `load-env.js` for host, port, API key.
2. Lists existing workflows via `GET /api/v1/workflows`.
3. For each deploy script: deactivates old versions (by name match),
   deletes them, creates fresh workflow, activates via `POST /activate`.
4. Runs in dependency order (social router before scheduled publisher).
5. Prints a summary table of all created workflows and their IDs.

### deploy-social-post.js specifics

- Creates a webhook-triggered workflow with path `gh-post-social`.
- The workflow has a Switch node that routes by `platform` field.
- Each platform branch calls the respective API with retry logic.
- The `load-env.js` helper exposes `api()` for authenticated N8N REST calls.
- The script prints the OLD IP from `.env.example` in its header text, but
  actually deploys to the correct IP from `.env.local` — do not be confused
  by the console output showing the wrong host.

## N8N API Scope Gotchas

The N8N API key in `.env.local` has **limited scope**:

| Action | Method | Works? |
|--------|--------|--------|
| List workflows | `GET /api/v1/workflows` | ✅ |
| Get workflow detail | `GET /api/v1/workflows/:id` | ✅ |
| Create workflow | `POST /api/v1/workflows` | ✅ |
| Delete workflow | `DELETE /api/v1/workflows/:id` | ✅ |
| Activate workflow | `POST /api/v1/workflows/:id/activate` | ✅ |
| Deactivate workflow | `POST /api/v1/workflows/:id/deactivate` | ✅ |
| Update workflow (PATCH) | `PATCH /api/v1/workflows/:id` | ❌ Returns "PATCH method not allowed" |
| Update activation via PATCH | `PATCH /api/v1/workflows/:id` with `{active: true}` | ❌ Does not work |

**Always use:** `POST /api/v1/workflows/:id/activate` and `POST .../deactivate`.
For updating workflow nodes, delete and recreate the entire workflow.

## Webhook Registration Bug

**Symptom:** Workflow shows `active: true` in the API, but the webhook URL
returns `404 — "The requested webhook is not registered."`

**Cause:** N8N's internal webhook registry can become stale after crashes,
memory pressure, or version upgrades. The API state (database) and the
runtime state (in-memory webhook listener) diverge.

**Diagnostic steps:**
1. `curl -X POST http://<host>:<port>/webhook/<path>` — returns 404
2. `GET /api/v1/workflows?limit=250` — shows workflow with `active: true`
3. `POST /api/v1/workflows/:id/deactivate` then `POST .../activate` — may not fix
4. Delete workflow entirely, redeploy via `node deploy-all.js` — may not fix

**Fix:** The N8N **process** must be restarted on the host VM. The API alone
cannot re-register webhooks when the runtime is in this state. Requires SSH
or UI access to the VM:
- Docker: `docker restart n8n`
- Systemd: `systemctl restart n8n`
- PM2: `pm2 restart n8n`

After restart, verify: `curl -X POST http://<host>:<port>/webhook/gh-post-social`

## Supabase Edge Functions (GrazzHopper)

| Function | Exists? | Purpose |
|----------|---------|---------|
| `unpublish-post` | ✅ | Reverts a post from published to draft |
| `threads-engage` | ✅ | Threads engagement actions |
| `glm-proxy` | ✅ | Proxies GLM API calls (browser never sees key) |
| `minimax-generate` | ✅ | MiniMax content generation proxy |
| `publish-post` | ❌ 404 | Does NOT exist — do not call |

If you need a `publish-post` edge function, it must be created first via
`supabase functions deploy publish-post`.

## Variable Injection

Use `node inject-n8n-variables.js` to push API tokens from `.env.local` into
N8N environment variables. This sets `THREADS_GH_TOKEN`, `FB_GH_PAGE_TOKEN`,
`SUPABASE_ANON_KEY`, etc. that workflows read via `$env.VAR_NAME`.

Required tokens for social publishing:
- `THREADS_GH_USER_ID`, `THREADS_GH_TOKEN`
- `IG_GH_BUSINESS_ID`, `IG_GH_TOKEN`
- `FB_GH_PAGE_ID`, `FB_GH_PAGE_TOKEN`
- `LINKEDIN_GH_AUTHOR_URN`, `LINKEDIN_GH_TOKEN`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`

## Scheduled Publisher

The `GH — Scheduled Publisher (2026)` workflow:
- Runs every 5 minutes (cron trigger, not webhook)
- Queries Supabase: `status = approved AND scheduled_for <= now()`
- Fan-outs to `POST /webhook/gh-post-social` per platform
- On success: PATCHes post status to `published`
- On failure: inserts into `publisher_errors` table (tolerates missing table)

The Content Hub UI also fires the webhook directly on "Publish now" clicks,
so posts don't have to wait for the next cron tick.

## Social Router Payload Shape

The `gh-post-social` webhook expects:

```json
{
  "platform": "threads|instagram|facebook|linkedin",
  "headline": "POST HEADLINE",
  "caption": "Caption text with hashtags",
  "image": "https://... or data:image/...",
  "link": "https://... (optional)",
  "postedBy": "author name",
  "system": "content segment id"
}
```

The router normalizes the payload, switches on platform, and calls each
platform's API with retry (3 tries, 2s exponential backoff).

## read_file JWT Display Gotcha

`read_file` truncates long strings in its output. A Supabase anon key that
appears as `"eyJhbG...UUig"` (13 chars) in read_file output is likely the
full 200+ char real key — verify by:
1. `grep SUPABASE_ANON_KEY <file>` to see the full value
2. Test the key against `curl https://<project>.supabase.co/rest/v1/posts \
   -H "apikey: <the_key>"` — if it returns data, the key is real

Do NOT assume a JWT is a placeholder just because read_file shows it truncated.

## Postiz Server

| Component | Status |
|-----------|--------|
| Postiz API URL | `http://34.28.216.185:3000/api/public/v1` |
| Connectivity | Timeout (unreachable as of 2026-06-07) |

The Postiz server was configured as an alternative publishing path but is not
reachable. All publishing currently routes through N8N webhooks. Do not attempt
to call Postiz endpoints until connectivity is verified.

## Session Notes (2026-06-07 / 2026-06-08)

- All N8N webhooks were returning 404 despite workflows being active.
- Root cause: N8N process webhook registry stale. Requires VM-level restart.
- No SSH access to the VM — publickey denied for all common OCI users.
  Frank must restart N8N via OCI console or provision an SSH key.
- API key has limited scope: `PATCH` blocked, `POST /activate` works.
- `deploy-all.js` is the canonical redeploy mechanism. It handles dedup,
  deactivation of old versions, sequential dependency-ordered deploys,
  and a probe step at the end.
- The `.env.example` file has the stale host IP (`34.134.195.104`).
  The real host is `34.28.216.185` in `.env.local`.
- `deploy-social-post.js` prints the `.env.example` IP in its header but
  deploys to the correct `.env.local` IP via `load-env.js`.
- `probe-webhooks.js` uses the wrong host. Direct curl against the real
  IP is the reliable test.
- `read_file` truncates long JWT strings in its output. A Supabase anon
  key that appears as `"eyJhbG...UUig"` in read_file output is likely the
  full real key — verify by checking the file with grep or by testing it
  against the Supabase REST API before assuming it's a placeholder.
- Content Hub UI bugs reported: Back button erases captions, posts show
  "published" when never published, Back navigates to wrong platform.
  Fixes were applied to `gh-hub.js` (5 patches) but not browser-tested.
- Post "MOST CANNABIS PAIN STUDIES FAIL TO PROVE RELIEF" confirmed in DB:
  id `b5395a60-03d7-4551-9027-e7656b9ee841`, status `draft`.

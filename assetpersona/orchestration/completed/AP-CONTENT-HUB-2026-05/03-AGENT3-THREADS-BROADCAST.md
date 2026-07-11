# 03-AGENT3: Threads Broadcast
Status: complete
Wave: AP-CONTENT-HUB-2026-05

## Explainer
Frank's existing `frvnkfrmchicago-threads.json` workflow on his Google Cloud Platform n8n instance already posts to `@frvnkfrmchicago` every 30 minutes from a hardcoded weekly calendar. This lane ports the brand-voice prompt and the Threads-API container → wait → publish flow into the assetpersona codebase, but swaps the cron-+-calendar trigger for a publish-event webhook. When Frank publishes a module or a Content Hub bulletin and clicks "Broadcast to Threads", the new Supabase Edge Function (`threads-broadcast`) drafts a post using Gemini 2.0 Flash with the verbatim banned-words ban list, then HMAC-signs and POSTs to the new n8n workflow (`threads-broadcast.json`), which runs the standard Threads container → 30s wait → publish sequence using the same `THREADS_FRVNK_USER_ID` and `THREADS_FRVNK_TOKEN` credentials Frank already has provisioned.

## TL;DR
- New shared helper `supabase/functions/_shared/threads.ts` carrying `BRAND_VOICE_PROMPT` (banned-words list lifted verbatim from frvnkfrmchicago), Threads API body builders, severity → format mapping, and a `cleanThreadsText` post-processor.
- New Edge Function `supabase/functions/threads-broadcast/index.ts` — validates payload, forces Gemini 2.0 Flash via `_shared/llm.ts`, HMAC-signs an outbound POST to the new n8n webhook, returns 202 with the model name and character count.
- New n8n workflow `n8n/workflows/threads-broadcast.json` — Webhook → Verify HMAC → Validate Payload (defensive 500-char + no-hashtag check) → Threads Create Container → Wait 30s → Threads Publish → Respond 200. Uses the same `THREADS_FRVNK_USER_ID` / `THREADS_FRVNK_TOKEN` vars as the existing frvnkfrmchicago workflow so Frank's credentials work as-is.
- Trigger is manual for this wave (admin clicks "Broadcast to Threads" after publish). Auto-trigger on `status='published'` row updates is intentionally deferred to a future wave and tracked under Remaining Gaps.
- The existing production `frvnkfrmchicago-threads.json` at the Automation Centre path was read-only — not touched.

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| New `n8n/workflows/threads-broadcast.json` | Created — Webhook → HMAC verify → Validate → Create Container → Wait 30s → Publish → Respond | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/n8n/workflows/threads-broadcast.json` |
| New `supabase/functions/threads-broadcast/index.ts` | Created — HMAC-verified inbound, Gemini 2.0 Flash forced, signed outbound to n8n | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/supabase/functions/threads-broadcast/index.ts` |
| New `supabase/functions/_shared/threads.ts` | Created — `BRAND_VOICE_PROMPT` (banned-words verbatim), `buildThreadsContainerBody`, `buildThreadsPublishBody`, `buildBrandVoiceUserMessage`, `cleanThreadsText`, `severityToFormat` | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/supabase/functions/_shared/threads.ts` |
| Brand voice prompt verbatim | Lifted from frvnkfrmchicago workflow's Gemini node — same banned-words list, same 500-char cap, same no-hashtag / no-emoji rule, same "text a friend who codes" voice | `_shared/threads.ts` lines 19-44 |
| Two trigger surfaces (modules + content_hub_bulletins) | Edge Function accepts `source: 'module' \| 'bulletin'` and treats them uniformly; severity is honored when present (bulletins), defaults to Medium when absent (modules) | `threads-broadcast/index.ts` `IncomingPayload` interface |
| HMAC pattern matches inquiry-webhook | Same `X-Asset-Persona-Signature` header, same `signHmac`/`verifyHmac` helpers, same `N8N_HMAC_SECRET` shared secret as the existing inquiry-router workflow | Both `inquiry-webhook` and `threads-broadcast` import from `_shared/hmac.ts` |
| Distinct n8n endpoint | New env var `N8N_THREADS_BROADCAST_URL` — separate from `N8N_WEBHOOK_URL` so Frank can target a different workflow URL | `threads-broadcast/index.ts` |
| Decision documented: manual vs auto | Manual for this wave (admin button). Auto-trigger noted as future-wave upgrade in Remaining Gaps. TODO comment in Edge Function | `threads-broadcast/index.ts` near the auth gate |
| Brand spellings preserved | `frvnkfrmchicago` appears verbatim in all three files; no `Grasshopper` / `Frank from Chicago` strings introduced | `grep -c frvnkfrmchicago` returns 5 / 5 / 3 hits |

## Files Changed
| File | Change |
|---|---|
| `supabase/functions/_shared/threads.ts` | NEW — brand-voice prompt + Threads body builders + helpers |
| `supabase/functions/threads-broadcast/index.ts` | NEW — Edge Function (Gemini draft + HMAC-signed outbound to n8n) |
| `n8n/workflows/threads-broadcast.json` | NEW — Webhook → HMAC verify → validate → Threads container → 30s wait → publish |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `ls n8n/workflows/threads-broadcast.json` | `n8n/workflows/threads-broadcast.json` | The n8n workflow file is present. |
| `ls supabase/functions/threads-broadcast/index.ts` | `supabase/functions/threads-broadcast/index.ts` | The Edge Function file is present. |
| `ls supabase/functions/_shared/threads.ts` | `supabase/functions/_shared/threads.ts` | The shared helper file is present. |
| `grep -c "media_type.*TEXT" n8n/workflows/threads-broadcast.json` | `1` | Threads container POST uses `media_type=TEXT` exactly once — pattern preserved. |
| `grep -c "banned" n8n/workflows/threads-broadcast.json` | `2` | Brand-voice rules (banned-words concept) referenced in workflow comments. |
| `grep -c "BANNED WORDS" supabase/functions/_shared/threads.ts` | `1` | The verbatim banned-words header from the frvnkfrmchicago prompt is preserved. |
| `python3 -c "import json; json.load(open('n8n/workflows/threads-broadcast.json'))"` | `JSON OK` | The n8n workflow file is valid JSON and will import cleanly. |
| `grep -c "frvnkfrmchicago" <three files>` | `5 / 5 / 3` | Brand spelling intact across all three artifacts; no `Frank from Chicago` substitution. |
| `grep -E "THREADS_FRVNK_USER_ID\|THREADS_FRVNK_TOKEN\|N8N_THREADS_BROADCAST_URL\|N8N_HMAC_SECRET"` | All four env var names found in Edge Function + workflow with exact spelling | Variable names match Frank's existing credential set, so import works without renaming. |
| `grep -nE "_shared/(cors\|hmac\|llm\|threads)" supabase/functions/threads-broadcast/index.ts` | 5 import lines (cors, hmac × 2, llm, threads) | Edge Function uses existing shared helpers — no reimplementation. |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| n8n workflow | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/n8n/workflows/threads-broadcast.json` | Listens for publish events, runs the Threads container → 30s wait → publish flow. |
| Edge Function | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/supabase/functions/threads-broadcast/index.ts` | Drafts the post via Gemini 2.0 Flash + HMAC-signs the outbound webhook to n8n. |
| Shared Threads helper | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/supabase/functions/_shared/threads.ts` | Exports `BRAND_VOICE_PROMPT`, body builders, helpers — single source of truth for the brand voice ban list inside the assetpersona codebase. |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| Set `N8N_THREADS_BROADCAST_URL` secret in Supabase | Frank credential | `supabase secrets set N8N_THREADS_BROADCAST_URL=https://<your-n8n-host>/webhook/threads-broadcast` (distinct from `N8N_WEBHOOK_URL`) |
| Confirm `N8N_HMAC_SECRET` already set | Frank credential | Same value as inquiry-router. Verify with `supabase secrets list \| grep N8N_HMAC_SECRET` |
| Set `THREADS_FRVNK_USER_ID` + `THREADS_FRVNK_TOKEN` in n8n vars | Frank credential | Reuse the same values from the existing frvnkfrmchicago workflow — variable names match exactly so no edits needed |
| Confirm `GOOGLE_AI_API_KEY` is set in Supabase | Frank credential | The Edge Function forces `provider=google` + `model=gemini-2.0-flash`; `llm.ts` reads `GOOGLE_AI_API_KEY` |
| Import `threads-broadcast.json` into n8n | Frank credential | n8n → Workflows → Import from File → activate workflow |
| Deploy `threads-broadcast` Edge Function | Frank credential | `supabase functions deploy threads-broadcast` |
| Wire the "Broadcast to Threads" button in admin UI | future wave | The admin button is not yet built. Required: a button on the Modules edit and Content Hub edit pages that POSTs `{source, id, title, summary, url?, severity?}` to the Edge Function. |
| Auto-trigger on publish (instead of manual) | future wave | Add a Supabase trigger / database webhook that calls the Edge Function automatically when `status` transitions to `'published'` on either `modules` or `content_hub_bulletins`. Track as TODO comment in `threads-broadcast/index.ts`. |
| Admin JWT verification path | future wave | The Edge Function currently accepts an inbound HMAC (for server-to-server) but does not yet require a Supabase admin JWT for browser-initiated calls. Add the JWT + role check when the admin button is wired. |
| Lane 2 migration (`content_hub_bulletins`) lands | next lane | Edge Function uses the documented bulletin shape from the brief; once Lane 2's migration is applied, no Lane 3 changes needed |

## Task-Sheet Update Row
| Lane | Status | Artifacts | Wave | Notes |
|---|---|---|---|---|
| 03-AGENT3-THREADS-BROADCAST | complete | 3 new files (1 n8n workflow + 1 Edge Function + 1 shared helper); 0 modified existing files | AP-CONTENT-HUB-2026-05 | Trigger manual for this wave; brand voice verbatim from frvnkfrmchicago; awaits Frank credential actions + admin-button wiring (future wave). |

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/n8n-automating/SKILL.md` | Skill | Webhook trigger + HMAC verify Function node + Wait-node + response-node pattern |
| `.claude/skills/api-integrating/SKILL.md` | Skill | Threads container → 30s → publish flow, retry policy on the container POST, outbound HMAC signing |
| `.claude/skills/google-ai-integrating/SKILL.md` | Skill | Gemini 2.0 Flash provider selection through the existing `_shared/llm.ts` `callGoogle` path |
| `.claude/skills/copywriting-enforcing/SKILL.md` | Skill | Brand-voice ban list discipline (the verbatim banned-words list lifted into `BRAND_VOICE_PROMPT`) |
| `.claude/skills/prompt-engineering/SKILL.md` | Skill | System prompt + user message structure separation; topic-slot variables (Topic / Type / Format / Description / Keywords) |
| `librarians/api-integration-librarian.md` | Librarian | Outbound webhook signing convention — match the `inquiry-webhook` pattern exactly so n8n's HMAC verify Function node works with both |
| `librarians/multi-agent-librarian.md` | Librarian | Coordination with Lane 2 — code against the documented `content_hub_bulletins` shape from Lane 2's brief rather than waiting on its migration to land |
| `librarians/supabase-librarian.md` | Librarian | Edge Function secret-management pattern (`Deno.env.get` + explicit 500 response when misconfigured) |
| https://developers.facebook.com/docs/threads/posts | 2026 URL | Threads API container + publish reference — confirmed `media_type=TEXT` body shape and the two-step container → publish sequence |
| https://ai.google.dev/gemini-api/docs/text-generation | 2026 URL | Gemini 2.0 Flash API shape used by `_shared/llm.ts`'s Google branch |
| https://owasp.org/www-community/Verifying_HMAC_Signatures | 2026 URL | HMAC verification best practice — constant-time compare (already in `_shared/hmac.ts`'s `verifyHmac`) and rejection of unsigned inbound traffic |

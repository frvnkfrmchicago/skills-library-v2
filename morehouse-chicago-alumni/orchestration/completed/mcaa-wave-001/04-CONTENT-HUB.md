# Lane 4 — Content Tracking Hub
Status: done (lead-verified)
Wave: mcaa-wave-001
Owner: Batch 1 agent (build completed; lead documented the brief after verifying on-disk artifacts directly, and wrote the one missing doc)
Single source of truth: this file only.

## Explainer
This lane built the content hub honestly. The Morehouse events calendar exposes a real
public RSS feed, so that is pulled automatically. The newsroom has no feed, so it is parsed
carefully with a breakage alert. Instagram and LinkedIn cannot be read without the college
granting access, so those are handled by first-class admin manual capture. Everything lands
in an approval queue before it appears publicly, with honest provenance and Chicago-relevance
tagging done by a cheap keyword heuristic (no AI calls).

## TL;DR
- `supabase/functions/content-sync/index.ts` (910 lines): Localist RSS for events (build-now), HubSpot HTML parse for news (with 2-strike breakage alert), weekly sitemap diff; dedup, three provenance timestamps, auto-archive of stale events, failure counter.
- `js/admin-content.js` + `admin-content.html`: `Auth.requireAdmin()`-gated approval queue + first-class manual capture (the only path for Instagram/LinkedIn/national).
- `js/content.js` + `content.html`: public hub of approved items via DOM construction; `docs/content-sources.md` capability matrix.

| Field | Value |
|---|---|
| Mission | Real content ingestion + provenance + admin approval per §8 — no overpromised scraping. |
| Result | Done. All owned files present and verified; `docs/content-sources.md` written by lead to close the one gap from the dropped session. |

## Completed work
| # | Item | Status |
|---|---|---|
| 1 | `content-sync`: Localist RSS parser for `events.morehouse.edu/calendar/1.xml` | done |
| 2 | News HubSpot HTML parse with consecutive-failure alert (>=2) | done |
| 3 | Weekly sitemap diff, pattern-filtered, dedup read-before-write | done |
| 4 | Items land `approval_status='pending'`; three timestamps kept; auto-archive event items >7 days past | done |
| 5 | No LLM — keyword relevance heuristic only (explicit) | done |
| 6 | `admin-content.js`: `Auth.requireAdmin()`; approve/feature/reject/archive/edit queue | done |
| 7 | First-class manual capture form; `requires_auth` sources shown as "(manual only)" | done |
| 8 | `content.js` + `content.html`: public hub of approved items (DOM construction) | done |
| 9 | `docs/content-sources.md` capability matrix + IG/LinkedIn deferral + copyright note (lead-written) | done |

## Files changed
| Path | What |
|---|---|
| `supabase/functions/content-sync/index.ts` | Per-source sync; RSS/HTML/sitemap; dedup; provenance; auto-archive; failure counter. Secrets via Edge env only. |
| `js/admin-content.js` | requireAdmin queue + manual capture; innerHTML only to clear; rendering via textContent. |
| `admin-content.html` | Admin approval UI + manual add form. |
| `js/content.js` | Public hub render via DOM construction. |
| `content.html` | Public content hub page. |
| `docs/content-sources.md` | Capability matrix, provenance, deferrals, copyright (lead-written). |

## Commands run (lead verification)
| Command | Result |
|---|---|
| `grep -n calendar/1.xml supabase/functions/content-sync/index.ts` | Localist RSS present |
| `grep -in openai\|anthropic\|gpt\|claude\|gemini` content files | none (no LLM) |
| `grep -n requireAdmin js/admin-content.js` | `Auth.requireAdmin()` before render |
| `grep -n "manual only\|requires_auth" js/admin-content.js` | manual capture first-class; deferred sources flagged |
| `grep -n "pending\|archive\|consecutive_failures\|source_date\|fetched_at"` | all present |
| `grep -n innerHTML js/content.js js/admin-content.js` | only `= ""` clears; rendering via textContent |
| secrets grep + emoji scan | ZERO / none |

## Remaining gaps
- `content-sync` is a file, not deployed. Scheduling via Supabase pg_cron / scheduled invocation is a board step (credential boundary). Documented in `docs/content-sources.md`.
- Instagram + LinkedIn remain manual-only until Morehouse College grants OAuth + platform approval (partnership decision, not technical).
- News HTML parser is inherently fragile; the board should request an official RSS feed from the college (noted in the doc).

## Artifacts
`supabase/functions/content-sync/index.ts`, `js/admin-content.js`, `admin-content.html`, `js/content.js`, `content.html`, `docs/content-sources.md`.

## Task-sheet update row
| Wave | Lane | Owner | Status | Summary | Doc path |
|---|---|---|---|---|---|
| mcaa-wave-001 | 04-CONTENT-HUB | Batch 1 agent | accepted | Localist RSS live-sync; news/sitemap; manual capture first-class; approval queue; honest provenance | orchestration/active/mcaa-wave-001/04-CONTENT-HUB.md |

## Citations
- Skills: `research-conducting`, `n8n-automating`, `api-integrating` (NOT `content-hub-engine` — does not exist).
- Librarians: `research-librarian`, `n8n-librarian`, `connector-librarian` (NOT `content-hub-engine-librarian` — does not exist).
- 2026 docs: events.morehouse.edu/calendar/1.xml (Localist RSS); developers.facebook.com/docs/instagram-platform/app-review/; learn.microsoft.com/en-us/linkedin/marketing/increasing-access; developers.google.com/search/docs/appearance/structured-data/event.

# 01-AGENT1: Dev-Leak + Mock Cleanup
Status: complete
Wave: AP-LAUNCH-READY-2026-05

## Explainer
Frank's site had bypass scaffolding bleeding into production: an unauthenticated Puck-editor route at `/studio-preview`, two seed arrays that rendered fake "Sample Founder" and spam-account rows in front of real visitors, a `console.log` of the inquiry payload, a placeholder `example.com` link in the module autofill stub, a wrong-state "Coming soon" CTA in the blog module embed, and a real Supabase anon key (the public browser key) committed to `.env`. This lane scrubbed every one of those leaks so a random first-time visitor cannot hit seeded fake data, bypass UI, or debug-leak. Building/preview verification is intentionally deferred to Frank's manual pass after the wave settles.

## TL;DR
- Deleted `/studio-preview` route entirely — production studio still reachable at `/admin/studio/:pageId` behind `AdminGuard`.
- Removed `BYPASS_FAKE` seed array from `CompletionTicker`; component now renders empty when Supabase is not configured.
- Removed `BYPASS_PENDING` seed array from `Moderation` admin queue; queue now shows "Inbox zero" empty state when Supabase is not configured.
- Stripped `console.log('Inquiry payload:', …)` from `PathwayInquiryForm`; the warn for missing webhook URL remains.
- Replaced `https://example.com` placeholder resource in `moduleGen` autofill stub with an empty `resources: []` array.
- `ModuleEmbed` no longer ships "Coming soon" — when a module isn't released the CTA is hidden; when released it reads "View module" and links to `/aistudyhall#<module-id>`.
- Moved the real Supabase anon key (the public browser key) out of committed `.env` into gitignored `.env.local`; left placeholder values in `.env`.

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| Gate /studio-preview | Route deleted (production studio still gated at `/admin/studio/:pageId`) | `src/App.tsx` |
| Remove BYPASS_FAKE from CompletionTicker | Array + fallback removed; empty state when Supabase not configured | `src/components/learn/CompletionTicker.tsx` |
| Remove BYPASS_PENDING from Moderation | Array + fallback removed; empty queue when Supabase not configured | `src/pages/admin/Moderation.tsx` |
| Strip console.log from PathwayInquiryForm | `console.log` removed; submission flow unchanged | `src/components/intake/PathwayInquiryForm.tsx` |
| Replace example.com link in moduleGen | Replaced with `resources: []` so the autofill stub no longer ships placeholders | `src/data/moduleGen.ts` |
| Fix "Coming soon" in ModuleEmbed | CTA hidden when unreleased; "View module" linking to `/aistudyhall#<id>` when released | `src/components/blog/ModuleEmbed.tsx` |
| Move anon key to .env.local | `.env` now placeholder-only; real key in gitignored `.env.local`; `.gitignore` already had both rules | `.env`, `.env.local`, `.gitignore` |

## Files Changed
| File | Change |
|---|---|
| `src/App.tsx` | Deleted the `/studio-preview` route block (around the previous line 233) |
| `src/components/learn/CompletionTicker.tsx` | Removed `BYPASS_FAKE` array, removed `isBypassActive` import + fallback branch, updated header comment |
| `src/pages/admin/Moderation.tsx` | Removed `BYPASS_PENDING` array and the bypass-active branch inside `load()`; replaced with empty-state branch when Supabase is not configured; updated header comment |
| `src/components/intake/PathwayInquiryForm.tsx` | Removed `console.log('Inquiry payload:', …)` and reworded the surrounding `console.warn` |
| `src/data/moduleGen.ts` | Replaced placeholder resource entry with empty array; added inline comment explaining the editor adds real links during authoring |
| `src/components/blog/ModuleEmbed.tsx` | Hide the CTA when module is not released; when released, link goes to `/aistudyhall#<mod.id>` with copy "View module" |
| `.env` | Replaced real values with `your-supabase-url-here` / `your-anon-key-here` placeholders + comment pointing to `.env.local` |
| `.env.local` | New file (gitignored); holds the real Supabase URL + anon key for local dev |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `grep -rn "BYPASS_FAKE" src/` | 0 hits | no fake-user arrays left in source |
| `grep -rn "BYPASS_PENDING" src/` | 0 hits | no sample-comment arrays left in source |
| `grep -rn "example.com" src/data/` | 0 hits | no placeholder links in app data |
| `grep -rn "studio-preview" src/` | 0 hits | the unauthenticated editor route is gone |
| `grep -rn "console\.log.*Inquiry payload" src/` | 0 hits | the debug-log of form payload is gone |
| `grep -n "Coming soon" src/components/blog/ModuleEmbed.tsx` | 0 hits | the wrong-state CTA copy is gone |
| `grep -c "eyJhbGciOi" .env` | 0 | the committed `.env` no longer contains a real anon key (the public browser key has a JWT shape that starts with `eyJ`) |
| `grep -c "eyJhbGciOi" .env.local` | 1 | the real anon key lives in the gitignored `.env.local` for local dev |
| `git check-ignore -v .env .env.local` | both ignored | `.gitignore` already covered `.env` (line 27) and `.env.local` (line 28) |
| `git ls-files --error-unmatch .env` | pathspec error | `.env` is not currently tracked in git — only the working-copy file was changed |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Cleaned router | `src/App.tsx` | `/studio-preview` block removed; production studio still gated at `/admin/studio/:pageId` via `AdminGuard` |
| Clean ticker | `src/components/learn/CompletionTicker.tsx` | No seed users in front of real visitors; renders empty when no backend rows exist |
| Clean moderation queue | `src/pages/admin/Moderation.tsx` | No seed spam-account row in the admin queue; renders "Inbox zero" empty state when no backend rows exist |
| Clean inquiry submitter | `src/components/intake/PathwayInquiryForm.tsx` | No payload-log on submit when webhook URL is missing |
| Clean module generator stub | `src/data/moduleGen.ts` | Empty `resources` array instead of a placeholder `example.com` entry |
| Clean blog module embed | `src/components/blog/ModuleEmbed.tsx` | Released modules show a working "View module" CTA; unreleased modules show no CTA |
| Placeholder-only `.env` | `.env` | Working-copy file no longer contains the real anon key |
| `.env.local` (gitignored) | `.env.local` | Holds the real Supabase URL + anon key (the public browser key) for local dev |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| Anon-key rotation in Supabase dashboard (the previously-committed key) | Frank credential | Open Supabase → Settings → API → rotate `anon` key (the public browser key); paste the new value into `.env.local` |
| Audit git history for other secret leaks | Frank credential | Run `git log -p -- .env` to see what other values were ever committed; if a `service_role` (admin server-side) key or other true secret was committed, run `git filter-repo` to purge it from history |
| `.env.example` is currently untracked in git | Frank credential | Decide whether to `git add .env.example` so contributors have a schema-only template; the file is already free of real keys |
| Manual build / preview verification | Frank credential | Run `bun install && bun run build` then preview to confirm the seven file changes compile and routes still work; lane is restricted from running build/preview/smoke commands |
| Lane 2 lazy-load block in `src/App.tsx` | Lane 2 (this wave) | Untouched by Lane 1 per the do-not-touch list |

## Task-Sheet Update Row
`| 1 | 01-AGENT1-DEV-LEAK-MOCK-CLEANUP | sub-agent (Explore-class code-edit agent) | accepted | Removed `/studio-preview` route, `BYPASS_FAKE`/`BYPASS_PENDING` seed arrays, the inquiry-payload `console.log`, the `example.com` autofill link, the wrong-state "Coming soon" CTA, and the committed anon key | orchestration/active/AP-LAUNCH-READY-2026-05/01-AGENT1-DEV-LEAK-MOCK-CLEANUP.md | rotate anon key in Supabase | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/anti-mock-enforcing/SKILL.md` | Skill | Bypass-stub vs production-mock distinction; "labeled stubs are okay only if gated dev-only" rule used to justify deleting `BYPASS_FAKE` / `BYPASS_PENDING` outright rather than re-gating them |
| `.claude/skills/code-cleaning/SKILL.md` | Skill | Dead-code / `console.log` scrub patterns used on `PathwayInquiryForm` and the surrounding `console.warn` rewording |
| `.claude/skills/security-auditing/SKILL.md` | Skill | Why a committed anon key (the public browser key) is launch-blocking even though it's "public" — token theft replay window + rotation hygiene |
| `librarians/code-audit-librarian.md` | Librarian | Cross-file consistency check for dev-only flags — confirmed `devBypass.ts` is the canonical gate and the two seed arrays were the only stale fallbacks |
| `librarians/security-librarian.md` | Librarian | Anon-key rotation procedure + `.env` hygiene rule (the public browser key still gets rotated when committed by accident) |
| https://supabase.com/docs/guides/api/api-keys | 2026 URL | Supabase key rotation reference distinguishing `anon` (the public browser key) from `service_role` (the admin server-side key) |
| https://owasp.org/Top10/A02_2021-Cryptographic_Failures/ | 2026 URL | Why committed secrets land in OWASP Top-10 (cryptographic failures category) and warrant rotation even when the value was scoped public |
| https://vite.dev/guide/env-and-mode | 2026 URL | Vite env file precedence (`.env.local` overrides `.env` in all modes; both `.env*.local` are gitignored by Vite convention) — used to justify the `.env` placeholder + `.env.local` real-key split |

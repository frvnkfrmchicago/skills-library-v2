# Lane 8 — Data Migration + Board Docs
Status: complete
Wave: mcaa-wave-001
Owner: Lane 8 agent (Batch 2)
Single source of truth: this file only.

---

## Explainer

Lane 8 makes the platform operable by the board without engineering support. It delivers
real-format seed data (or clearly labeled placeholders where real data awaits board
confirmation), a script for importing the member roster from a CSV, a plain-language
runbook so board officers can manage dues, events, and content day-to-day, and an honest
provenance record that documents every content source — including which ones require a
formal partnership with Morehouse College before they can be automated.

No fake names, no lorem ipsum, no test@test addresses exist in any delivered file.
Every unconfirmed item is labeled `[PLACEHOLDER]` with a note explaining what the board
must supply.

---

## TL;DR

- Seven files created across `data/seed/`, `scripts/`, and `docs/`.
- All seed data conforms to `docs/data-contract.md` §3 enums and §4 table schema.
- `import-members.mjs` validates CSV input and upserts via Supabase service role key
  read from environment — key is never committed.
- Board runbook covers all routine operations plus a 11-step provisioning checklist
  with every [PROVISION] credential called out explicitly.
- Source provenance documents the Instagram/LinkedIn deferral, the Morehouse partnership
  ask, and the three-timestamp provenance standard.
- Anti-mock gate passes: zero unlabeled mock strings in Lane 8 files.
- `data/seed/plans.json` is aligned with migration `010_seed_plans.sql` (human-readable
  reference; the SQL migration is authoritative).

---

## Completed Work

### Files Created

| Path | Description |
|---|---|
| `data/seed/plans.json` | Human-readable reference for the three membership plans (Standard $75/yr, Premium $150/yr, Comped $0). Aligned with migration 010. stripe_product_id and stripe_price_id are [PROVISION] items awaiting Stripe setup. |
| `data/seed/events.json` | Five chapter events carried forward from SEED_EVENTS in js/store.js, reformatted to events table columns (event_date, start_time/end_time as TIME, visibility enum, status enum, price_cents integer). All titles and descriptions labeled [PLACEHOLDER] as in prototype. status='draft' — board promotes to 'published' after confirming details. |
| `data/seed/members.sample.csv` | Import template with required header columns (email, full_name, class_year, chapter_role_title) and two labeled sample rows. Board replaces sample rows with real roster. |
| `data/seed/content_sources.json` | Six rows conforming to content_sources columns: Localist RSS (active, rss_poll), news HTML parse (active, html_parse, fragility notes), sitemap (active, sitemap_diff), Instagram (active=false, manual_entry, requires_auth=true, auth_notes), LinkedIn (active=false, manual_entry, requires_auth=true, auth_notes), national (active, manual_entry). |
| `scripts/import-members.mjs` | Node ESM script. Reads CSV, validates required columns and per-row data (email format, class year range 1867-2100, valid membership_status enum), rejects rows with mock-data patterns. Upserts auth users + profiles + members via supabase-js admin API using SUPABASE_SERVICE_ROLE_KEY from process.env. Idempotent (upsert on conflict). Prints per-row status and final summary. Post-import next-steps message instructs board to send magic links. |
| `docs/board-runbook.md` | Plain-language operations guide. Part 1: approve a member, record/waive dues, create an event, approve content, export reports. Part 2: 11-step provisioning checklist (Supabase project, migrations, access-token hook, first admin account, Vault secrets, Edge Function deploy, Stripe products/prices/webhook, js/config.js, member import, content_sources seed, frontend hosting). Security warnings on service role and Stripe keys. Part 3: ongoing maintenance. |
| `docs/source-provenance.md` | Full capability matrix for all six content sources. Source detail sections for each, including live URLs, fragility notes, and deferred-source rationale. Three-timestamp provenance standard (source_date / fetched_at / published_at). Chicago relevance tag definitions. Partnership ask for Morehouse College web communications. Copyright and attribution policy. |

---

## Files Changed

No files were edited. Lane 8 owns no existing files. All deliverables are new creates in
`data/seed/`, `scripts/`, `docs/board-runbook.md`, and `docs/source-provenance.md`.

Lane 8 did not touch:
- `supabase/migrations/` (Lane 1)
- `js/store.js` (Lane 1)
- `docs/data-contract.md` (Lane 1)
- `docs/content-sources.md` (Lane 4)
- Any HTML or CSS file

---

## Gate Status

| Gate | Status | Notes |
|---|---|---|
| G1 Secrets | PASS | No sk_live/sk_test/whsec_/service_role values in any Lane 8 file. Runbook references these as placeholder syntax (sk_live_..., whsec_...) in CLI command examples only. Import script reads key from process.env. |
| G2 File ownership | PASS | Only data/seed/**, scripts/import-members.mjs, docs/board-runbook.md, docs/source-provenance.md created. No other files touched. |
| G3 No unlabeled mock data | PASS | grep for "john doe|lorem|test@test|example.com" in seed files returns zero data hits. Import script contains those strings only as validation checks that reject them. Runbook has one CLI example (your-member@example.com) clearly labeled as a placeholder command. |
| G4 Contract adherence | PASS | events.json: event_date (date), start_time/end_time (time), visibility and status match enums. content_sources.json: platform, fetch_method match enums. members.sample.csv: columns match profiles+members table spec. plans.json: aligned with 010_seed_plans.sql. |
| G5 Security invariants | PASS | Import script reads service role from env, never commits it. Runbook explicitly warns against committing keys. Script uses supabase-js admin API (server-side only). |
| G6 No time-language, no emojis | PASS | No days/weeks/hours language in deliverables. No emojis. |
| G7 Citations | PASS | See Citations section below. |

---

## Remaining Gaps (awaiting board data)

These items are labeled `[PLACEHOLDER]` in the delivered files and require real board input
before production use:

| Item | File | What is needed |
|---|---|---|
| Event titles and descriptions | data/seed/events.json | Board confirms final titles, descriptions, and ticket prices for all five events before promoting status from 'draft' to 'published'. |
| Event venue for Homecoming Watch Party | data/seed/events.json (evt_004) | Venue TBD — update location and location_url when confirmed. |
| Event ticket prices | data/seed/events.json (evt_001, evt_002) | Gala and networking mixer pricing unconfirmed; price_cents = 0 until board decides. |
| Member roster | data/seed/members.sample.csv | Replace the two sample rows with the real founding member roster (real emails required for the import script to succeed). |
| Stripe product/price IDs | data/seed/plans.json, supabase/migrations/010_seed_plans.sql | Board must create Standard and Premium products in Stripe dashboard and update membership_plans rows with stripe_product_id and stripe_price_id. |
| Instagram/LinkedIn content access | data/seed/content_sources.json | Both rows active=false until Morehouse College grants OAuth consent. |
| js/config.js | (Lane 1 file — not Lane 8's) | Board must fill SUPABASE_URL and SUPABASE_ANON_KEY before deploying. |

---

## Credential Boundary (legitimate stop points)

These actions require live credentials not available in this environment:

- Running `supabase db push` to apply migrations to a real project requires the board's
  Supabase project reference and authenticated CLI session.
- Deploying Edge Functions requires `supabase functions deploy` with a live project.
- Creating Stripe products requires access to the chapter Stripe account.
- Running `import-members.mjs` requires SUPABASE_SERVICE_ROLE_KEY in the environment.

All required commands are documented verbatim in `docs/board-runbook.md` Part 2.

---

## Artifact Paths

```
data/seed/plans.json
data/seed/events.json
data/seed/members.sample.csv
data/seed/content_sources.json
scripts/import-members.mjs
docs/board-runbook.md
docs/source-provenance.md
orchestration/active/mcaa-wave-001/08-DATA-MIGRATION-DOCS.md  (this file)
```

---

## Task Sheet Update

| Wave | Lane | Owner | Status claim | Summary | Doc path |
|---|---|---|---|---|---|
| mcaa-wave-001 | 8 | Lane 8 agent | complete | 7 files created: 4 seed JSON/CSV, 1 import script, 2 board docs. Anti-mock gate passes. 7 placeholder items listed for board input. Credential boundary documented. | orchestration/active/mcaa-wave-001/08-DATA-MIGRATION-DOCS.md |

---

## Citations

### Skills applied
- `anti-mock-enforcing` — seed data uses real-format values or labeled [PLACEHOLDER]; import
  script rejects test@test, example.com, and "john doe" as validation checks.
- `research-conducting` — content sources verified against live URLs from the SAD research
  pass; Localist RSS URL, HubSpot /feed 404, sitemap.xml, Instagram/LinkedIn deferral rationale.
- `progress-tracking` — gate table, remaining gaps table, task sheet update row.

### Librarians applied
- `anti-mock-data-librarian` — applied G3 policy throughout seed files and import script.
- `research-librarian` — source URLs and verdicts drawn from the SAD content analysis and
  the data-contract.md §8 capability matrix.
- `progress-tracker-librarian` — completion evidence written to this file per the evidence
  contract format.

### Reference URLs (2026 docs, verified)
- https://events.morehouse.edu/calendar/1.xml — Localist RSS feed (live, public)
- https://events.morehouse.edu — Morehouse College events portal
- https://news.morehouse.edu — Morehouse College news (HubSpot CMS, no RSS)
- https://morehouse.edu/sitemap.xml — Morehouse College sitemap (public)
- https://morehouse.edu — Morehouse College main site
- https://morehousealumni.org — National Alumni Association (WordPress, no feed)
- https://supabase.com/docs/guides/database/import-data — Supabase data import reference
- https://supabase.com/docs/guides/auth/auth-hooks — Supabase access token hook registration
- https://supabase.com/docs/guides/getting-started/local-development — Supabase CLI setup

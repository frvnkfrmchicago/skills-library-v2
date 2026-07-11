---
name: orchestration-reviewing
description: >
  Reviews closed multi-agent orchestration waves for evidence completeness,
  plan-vs-shipped alignment, and substantive design + code quality. Reads
  per-project SUBMISSIONS.md logs, picks pending waves, runs an 18-item
  checklist that invokes other quality librarians (visual-audit,
  experience-designer, code-audit, components, anti-mock-data,
  accessibility-review) during the run, reads CLAUDE.md programmatically for
  banned-term and anti-mock rules, writes structured review reports with
  explicit Reviewer Self-Awareness sections, and updates submission logs with
  verdicts. Use when verifying a recent wave was done correctly, when auditing
  orchestration history, when a user asks "was anything missed," or when a
  partial/fail verdict needs evidence for re-opening a wave.
---

# Orchestration Reviewing

> **Librarian:** `librarians/review-orchestration-librarian.md`

This skill is the technical contract for the Review Orchestration Librarian. The librarian declares the protocol; this skill names the inputs, outputs, the 18-item checklist, the librarians invoked during the run, the Reviewer Self-Awareness format, and the verdict mapping.

The reviewer is **substantive**, not procedural. Procedural compliance (did a file exist) is necessary but not sufficient. The reviewer also asks: *is the design good, does the code reuse existing patterns, does the wave's claimed user outcome actually work, did the team respect accessibility floors.* Those questions get answered by invoking other quality librarians during the review run.

---

## Inputs

- A project root with an `orchestration/` tree
- Optionally a specific wave id (default: most recent `⏳ pending` row in `SUBMISSIONS.md`)
- Project memory file (`CLAUDE.md` or equivalent) — read programmatically for banned-term + anti-mock rules
- Quality librarians read during the run (mandatory):
  - `librarians/visual-audit-librarian.md`
  - `librarians/experience-designer-librarian.md`
  - `librarians/code-audit-librarian.md`
  - `librarians/components-librarian.md`
  - `librarians/anti-mock-data-librarian.md`
  - `.agents/skills/design/accessibility-review/SKILL.md` (when present)

## Outputs

- A review report at `<project>/orchestration/reviews/<wave-id>.md` (frontmatter standardized to visual-log shape)
- An updated row in `<project>/orchestration/management/SUBMISSIONS.md` (Review + Report columns)
- A chat-side TLDR with verdict, per-failure summary, and a one-line invoked-librarians summary

---

## Checklist (18 items — fixed)

### Procedural compliance (1-12)

| # | Check |
|---|---|
| 1 | Per-lane evidence present (multi-agent: lane brief files; planner+executor: visual log Per-Lane Evidence section) |
| 2 | Visual log entry present for every UI/visual lane |
| 3 | 3+ citations per lane (SKILL + LIBRARIAN + 2026 URL minimum) |
| 4 | File ownership matches plan |
| 5 | No orphan files |
| 6 | "Existing context" section present in handoffs (n/a in planner+executor mode) |
| 7 | Explainer Mode followed (6 required sections) |
| 8 | Master log updated with verdict |
| 9 | No anti-mock violations (using anti-mock-data-librarian's full pattern set) |
| 10 | No banned brand terms introduced (read CLAUDE.md programmatically, treat negating-context as warn) |
| 11 | Mode declared (Solo / Flat Wave / Single Primary Agent / Multi Primary Agent / Planner+Executor) |
| 12 | Parallel-group safety |

### Substance checks (13-18 — invoke other librarians)

| # | Check | Librarian / skill invoked |
|---|---|---|
| 13 | Design tokens used (no hardcoded color/spacing/font where tokens exist) | `experience-designer-librarian` |
| 14 | Component reuse — no duplicating existing patterns | `components-librarian` |
| 15 | Accessibility floor (WCAG 2.1 AA) | `design:accessibility-review` skill |
| 16 | Visual consistency with existing brand surfaces | `visual-audit-librarian` |
| 17 | User outcome verified — wave's TLDR claim is true on disk | (direct file verification) |
| 18 | Reviewer Self-Awareness — explicit list of what the reviewer checked vs what it could not verify | (introspective) |

Each item gets `✅ pass` / `⚠️ partial` / `❌ fail` / `n/a` with a one-line evidence note pointing to a file path or quote.

---

## Verdict Mapping

| Outcome | Verdict |
|---|---|
| All 18 checks pass (or `n/a`) | `✅ pass` |
| 1-2 `warn`-level issues, no `block` | `⚠️ partial` |
| Any `block` issue OR 3+ warns | `❌ fail` |

## Issue Severity

| Severity | Trigger |
|---|---|
| **block** | Anti-mock violation in shipped code, banned term in user-visible string, missing visual log for UI lane, lane evidence never written, claim-vs-reality drift on a load-bearing claim |
| **warn** | Citations < 3, mode not declared, orphan file, master log row missing, design tokens not used, banned word in negating comment, component duplicates an existing one |
| **nit** | Cosmetic — formatting, prose tone, ordering |

---

## File Discovery Strategy

1. Read `SUBMISSIONS.md` → find pending rows
2. Read wave packet under `completed/<wave-id>/` (fallback to `active/<wave-id>/`). **Planner+executor mode:** per-lane evidence lives inside the visual log entry's `## Per-Lane Evidence` section.
3. Read each per-lane evidence block for files-changed table + citations
4. Read visual-log entries via timestamps in the wave evidence
5. Read `MASTER-LOG.md` for the wave's roll-up row
6. Read project memory (`CLAUDE.md`) **programmatically** for banned terms + anti-mock rules
7. Read the relevant quality librarians for checks 13-18 — skim activation rules + criteria; apply during the run
8. Spot-check disk evidence with `ls` + `find` + `grep` + `cat` — no builds, no tests

---

## Anti-Mock Detection (delegated to anti-mock-data-librarian)

The reviewer reads `librarians/anti-mock-data-librarian.md` at run time and applies its full pattern set, not a hardcoded subset. The librarian owns the canonical patterns. The reviewer's job is to apply them, not maintain its own list.

Common base patterns the librarian provides (subject to its own updates):

| Pattern | Matches |
|---|---|
| `\bLorem ipsum\b` | Lorem placeholder |
| `\bJohn Doe\b` | Common fake-name placeholder |
| `\$99\.99\b` | Canonical fake-price placeholder |
| `\bplaceholder\b` | Literal "placeholder" in user-visible strings |
| `\bmock[A-Z]\w*\|fake[A-Z]\w*` | mockUser, fakeData, etc. variable names |

The actual patterns applied are whatever the anti-mock-data-librarian declares at the time of the run.

---

## Banned-Term Detection (programmatic CLAUDE.md read)

The reviewer reads the project's `CLAUDE.md` (or equivalent project memory) at run time using `cat` or `Read`. The agent does NOT rely on memory of which words are banned — that's fragile and ages. The CLAUDE.md content is the source of truth.

For each banned term in CLAUDE.md, the reviewer greps the wave's changed files. Matches in user-visible strings (not just code identifiers) escalate to **block**. Matches in code comments — even when negating ("no flame, no fire") — escalate to **warn**, since the rule typically reads as "anywhere in the codebase."

---

## Reviewer Self-Awareness (mandatory in every report)

Every report ends with an explicit list of what the reviewer checked vs what it could not verify.

Standard "could not verify" items (always include unless the reviewer actually did them):

- Runtime rendering — did NOT open the app to confirm the UI actually shows what the code implies
- Accessibility at runtime — did NOT measure color contrast in a browser; did NOT navigate by keyboard
- Visual quality / design judgment — checked for token usage but cannot judge "is this design good" subjectively
- Functional correctness end-to-end — did NOT call APIs to verify they return expected shape
- Cross-browser / device testing
- Performance / bundle size impact
- Real-user-data correctness — only verified absence of placeholders, not actual data quality

Plus wave-specific gaps the reviewer identifies during the run.

---

## File-Driven Handoff

The Reviewer half of this skill writes to:

- `<project>/orchestration/reviews/<wave-id>.md`
- `<project>/orchestration/management/SUBMISSIONS.md` (updates the matching row only — does not delete or reorder other rows)

The **Fixer Component** of this skill (see librarian for full spec) writes to:

- Whatever files an issue's fix touches — source files under `src/`, docs, libraries, even other librarians when the fix is a librarian-level patch
- The review report (appends Fix Plan / Fix Log / Verdict After Fixer sections)
- SUBMISSIONS.md row (atomic update with the post-fix verdict)

The Fixer NEVER writes to `active/<wave-id>/` (lead orchestrator's territory). The Fixer NEVER deletes wave packets without explicit user approval (per Cleanup management rule).

## Fixer Component (summary — see librarian for full spec)

The reviewer is a reviewer AND a clean-upper. When checks 1-18 surface warn or block issues, the Fixer Component runs the fixes inline using the Fix Plan → Fix Execution → Fix Log pattern.

### Standing Language (enforced verbatim in every Fix Plan)

1. No referred or deferred work — fix it now or name a true blocker
2. No paused work — every fix runs to completion in its lane
3. No dirty lint trees — fixes never leave unused imports, dead code, or stale comments
4. No "this was here before I already got here" notices — the fixer owns what it touches

### Severity → Action

| Severity | Action |
|---|---|
| block | Fix immediately, or name a true blocker (credentials / third-party URL / destructive remote) |
| warn | Fix immediately, document any design-judgment defaults |
| nit | Fix immediately — easiest |

### Audit trail

Fix Plan (intended) + Fix Log (executed + verified) + Verdict After Fixer (updated verdict). This trail is what makes the reviewer-and-fixer trustworthy without a separate reviewer-of-the-reviewer.

---

## Operational Constraints

| Rule | Reason |
|---|---|
| No `bun build`, no `tsc`, no playwright, no smoke tests | Reviews don't change source — they audit it |
| No model name references in the report | Plans + reports stay model-agnostic |
| Bash limited to `ls` / `grep` / `find` / `cat` / `date` | Same memory-protection invariant as the lead |
| One wave per invocation by default; "all pending" supported for batch | Bounded scope per call |
| TLDR + per-failure summary + invoked-librarians line in chat; full report in the file | Keeps chat scannable, evidence durable |
| Quality librarians invoked during the run, not just cited at end | Substantive review requires applied criteria |
| CLAUDE.md read programmatically | Fragile-memory failure mode prevented |
| Reviewer Self-Awareness mandatory | Honesty gate — what the reviewer is and isn't |

---

## Citations

| Source | Used for |
|---|---|
| `librarians/orchestration-librarian.md` | Wave packet structure, planner+executor evidence model, Default Invocation Trigger reference |
| `librarians/anti-mock-data-librarian.md` | Real-vs-placeholder detection patterns (read at run time) |
| `librarians/code-audit-librarian.md` | Code quality criteria (read at run time for substantive checks) |
| `librarians/visual-audit-librarian.md` | Visual consistency criteria (check 16) |
| `librarians/experience-designer-librarian.md` | Design token rule (check 13) |
| `librarians/components-librarian.md` | Component reuse patterns (check 14) |
| `librarians/reviewer-librarian.md` | Verdict mapping conventions |

---

## See Also

- `librarians/review-orchestration-librarian.md`
- `librarians/orchestration-librarian.md`
- `librarians/code-audit-librarian.md`
- `librarians/anti-mock-data-librarian.md`
- `librarians/visual-audit-librarian.md`
- `librarians/experience-designer-librarian.md`
- `librarians/components-librarian.md`

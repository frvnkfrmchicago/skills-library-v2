# AP-PLATFORM-2026-05 — Evidence Contract

Every lane brief is rewritten IN PLACE on completion. Required sections in order:

1. **Explainer** — plain-language statement of what this lane is responsible for
2. **TL;DR** — 3 bullet outcomes
3. **Files Changed** — table: file · change
4. **Commands Run** — table: command · result · plain meaning
5. **Artifacts** — table: artifact · path · purpose
6. **Remaining Gaps** — table: gap · owner · next action (use "none" if zero)
7. **Citations** — ≥1 SKILL, ≥1 LIBRARIAN, ≥1 2026 URL

## Visual log requirement

Any lane that produces UI / visual changes ALSO writes
`assetpersona/orchestration/visual-log/<ISO-timestamp>-<lane-slug>.md` with:

- TLDR bullets
- `What Was Created` table (Type · Description · File Path)
- Screenshot refs / descriptions
- Explanation paragraph

## Plain-language rule

If technical terms appear, translate them. Examples:

| Technical | Plain |
|---|---|
| `200` | worked |
| `404` | missing |
| `bunx tsc -b --noEmit` | type check across the project |
| RLS | per-row access control in the database |

## Lane brief rejection criteria

A lane is rejected (and not marked complete) if:
1. Brief was not rewritten in place
2. Sections 1-7 are missing
3. Visual-log entry missing on UI lanes
4. Citations don't include all three (skill / librarian / 2026 URL)

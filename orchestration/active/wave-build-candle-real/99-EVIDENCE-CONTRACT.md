# Evidence Contract — wave-build-candle-real

Every agent rewrites their own lane brief on completion using this exact structure. No "done" claim in chat counts until the lane brief is rewritten and the master log is updated by the lead.

## Required Completion Structure

When the lane is done, replace the lane brief content with this (keep the original mission at the top for traceability):

```markdown
# Lane 0X — <Lane Name>

## Status: COMPLETE
## Completed: <YYYY-MM-DD>

## TL;DR
<3 lines max — what landed, what didn't, what's next>

## Files Changed
| Path | Lines (+/-) | Purpose |
|------|-------------|---------|
| src/path/file.ts | +42 / -8 | <one-line purpose> |

## New Files Created
| Path | Purpose |
|------|---------|

## Schema Changes (Lane 3 only)
| Migration | Tables | Columns added/removed |
|-----------|--------|----------------------|

## Commands NOT Run (per locked rule)
- ❌ npm run build
- ❌ npm test
- ❌ playwright
- ❌ next dev

## Honest Empty States Added
| Surface | Old (mock) | New (honest) |
|---------|------------|--------------|

## Citations to Skill/Librarian/Research Used
| Reference | Where applied |
|-----------|---------------|
| .agents/skills/<skill>/SKILL.md | <step number> |
| librarians/<librarian>.md | <step number> |
| <2026 research URL> | <step number> |

## Remaining Gaps
| Gap | Owner | Reason |
|-----|-------|--------|

## Master-Log Row
| Wave | Lane | Status | Date | Notes |
|------|------|--------|------|-------|
| wave-build-candle-real | 0X | COMPLETE | <date> | <one line> |
```

## Anti-Patterns That Fail Review

- "Looks good" or "should work" without file:line evidence
- Claiming a 503 stub is fixed without showing the new code path
- New mock data introduced anywhere (anti-mock librarian STOP-gate)
- Any brand name not in the locked set
- Any flame/fire/spark imagery
- Suggesting paid services (SendGrid, Twilio, paid Polygon, etc.)
- Running tests, builds, dev servers, or Playwright
- Sonnet/Haiku used in any subagent spawn
- Skipping the Skill + Librarian + 2026 Research triplet

## What Lead Reviews

1. The rewritten lane brief matches this structure exactly.
2. Every file path cited in "Files Changed" actually exists in `/Users/franklawrencejr./AI/trading-intel-dashboard`.
3. The Anti-Mock librarian's grep scan returns clean (Lane 1 enforces this for the whole repo).
4. Schema changes are RLS-verified (Lane 3).
5. No cross-lane conflicts.

Then `90-MASTER-LOG.md` gets the row.

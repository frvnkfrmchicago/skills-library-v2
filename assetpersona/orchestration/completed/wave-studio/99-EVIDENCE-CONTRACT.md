# Evidence Contract — WAVE-STUDIO

## Explainer
This contract defines what a completed lane file must contain before the lead accepts it. Every agent in wave-studio must follow this contract when rewriting their lane brief on completion.

## TL;DR

| Requirement | Why it exists |
|---|---|
| Explainer at top | non-technical users need plain-language context first |
| TL;DR after explainer | fast read before deep detail |
| Tables for facts | keeps status scannable and comparable |
| Exact file paths | lead can reopen the same docs later |
| Commands + results | shows what was actually checked |
| Remaining gaps | prevents false "done" claims |

## Required Completion Sections

Every completed lane brief must include these sections in this order:

1. `Explainer`
2. `TL;DR`
3. `Tables`
4. `What Changed`
5. `Task-Sheet Update`

## Required Tables

| Table | Minimum columns |
|---|---|
| Delivery Summary | `requested outcome`, `result`, `evidence path` |
| Files Changed | `file`, `change` |
| Commands Run | `command`, `result`, `plain meaning` |
| Artifacts | `artifact`, `path`, `purpose` |
| Remaining Gaps | `gap`, `owner`, `next action` |

## Wave-Specific Evidence

In addition to the standard tables, each agent in wave-studio must also demonstrate:

| Evidence | How |
|----------|-----|
| Build passes | `bun run build` output showing zero errors |
| TypeScript clean | No `any` types in studio files (except Puck internal generics) |
| Token compliance | `grep -rn "px\|#[0-9a-fA-F]" src/studio/ --include="*.css"` returns only token references |
| File ownership | No files touched outside the agent's listed ownership |

## File Authority Rule

The lane brief file itself is the evidence record. Do not treat a separate chat summary as authoritative.

## Lead Review Rule

The lead orchestrator should reject completion if any of these are missing:

1. the file was not rewritten
2. the explainer/TL;DR/tables are missing
3. the artifact paths are missing
4. the remaining gaps are hidden or omitted
5. the build does not pass

# Agent Strength Map

Use this when assigning lanes to models.

| Agent/model | Best use |
|---|---|
| Codex | independent feature lanes, backend work, docs, tests, refactors |
| Opus-class agent | architecture, complex logic, regulatory/compliance reasoning |
| Sonnet-class agent | runtime verification, broad implementation passes, follow-up fixes |
| MiniMax/OpenCode | CLI-heavy scripting, backend plumbing, schema tasks |
| GLM/Kilo | schema, RLS, broad repo scans, backup implementation lane |
| Gemini-class agent | large-context review, UX coverage scans, broad document comparison |

## Assignment Rules

1. Split by product outcome or file boundaries, not by arbitrary subtasks.
2. Give one lane one owner.
3. Reserve one lane for runtime verification or integration review.
4. Reserve the lead orchestrator for review, tracker updates, and redispatch.

---
name: multi-agent-librarian
description: >
  Alias wrapper for the Multi-Agent Librarian persona. Use when the user explicitly names
  this librarian or asks to activate it.
---

# Multi-Agent Librarian

This is a native skill alias for the librarian persona source file:
- /Users/franklawrencejr./Downloads/skills-library-v2 2/librarians/multi-agent-librarian.md

## Base workflow

Use the operational workflow in this native skill:
- /Users/franklawrencejr./Downloads/skills-library-v2 2/.codex/skills/multi-agent-designing/SKILL.md

## How to apply

1. Read the librarian persona file for priorities, framing, and domain focus.
2. Read the base skill for the concrete workflow and execution steps.
3. Follow the base skill operationally, but keep the librarian persona's focus.
4. If there is a conflict, prefer the base skill for execution and the librarian file for emphasis and output style.

## Pitfall — Tool-availability audit before dispatching research subagents (2026-06-23)

When the user's prompt (or a SAD plan) requires fresh 2025-2026 platform
/ competitor research, the default trap is to dispatch research
subagents with prompts that assume built-in `web_search` /
`web_extract` are available. Many Hermes sessions do NOT expose those
tools — the subagent then either fabricates (worst case) or returns
an honest blocker (better case but the plan cites nothing). The
user's hard rule is "no made up stuff for research — verified URLs
only."

**Before any research subagent is dispatched, audit the tool surface
the subagent will actually inherit.** Two checks:

1. Enumerate the available tools (subagent's `toolsets` parameter +
   the MCP servers mounted on its profile).
2. Verify the tool works before authoring the prompt:
   - For NotebookLM: `mcp_notebooklm_get_health`. If
     `authenticated: false`, that path is closed for this session.
   - For built-in web tools: confirm the runtime exposes them.

If every research path is closed, **rewrite the delegation prompt so
it enumerates ONLY the available tools and instructs the subagent to
stop and report on failure — never to fabricate.** That matches the
user's "no made up stuff" rule. The honest blocker is more useful
than a fabricated report.

**Real example (2026-06-23):** A wave plan claimed a 35/35/30
SKILL/LIBRARIAN/2026-RESEARCH citation weight. Three parallel
research subagents all returned honest blockers in 30 seconds:
built-in `web_search` not wired, NotebookLM `authenticated: false`,
Mobbin token expired. The lead then patched the plan doc to
honestly downgrade the research pillar and document the recovery
path. The plan was accepted as shippable.

**Companion rule:** "research pillar honestly downgraded, recovery
path documented" is shippable. "research pillar: 12 verified 2026
URLs" when no such URLs exist in the session is a failed review.

Cross-reference: `sad-librarian` Pitfall 11 +
`templates/research-tool-availability-audit.md`.

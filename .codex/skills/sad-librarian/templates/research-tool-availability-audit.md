# Research-tool availability audit (delegation prompt snippet)

> **When to use:** You are about to dispatch a research subagent during
> SAD Gate 2 and need to verify the subagent's tool surface before
> authoring its prompt. Drop this block into the parent prompt body
> (above the `delegate_task` call) so the audit happens BEFORE the
> subagent inherits the wrong tool assumptions.

```text
[Research-tool audit — run BEFORE dispatching research subagents]

The subagent you are about to dispatch for platform / competitor
research will inherit the tool surface of its `delegate_task`
toolsets parameter PLUS the MCP servers mounted on its profile.
The runtime you are running in may NOT expose every tool you
expect. Before dispatching:

1. Confirm which research tool(s) the subagent will actually have:
   - Built-in `web_search` / `web_extract` — present? (Many Hermes
     sessions do NOT expose these.)
   - `mcp_notebooklm_*` — run `mcp_notebooklm_get_health`. If
     `authenticated: false`, NotebookLM is closed for this session.
   - `mcp_mobbin_*` — run any quick tool. If it errors with expired
     token / 401, Mobbin is closed.
2. If the tools you wanted to use are unavailable, REWRITE the
   delegation prompt so it:
   (a) Names ONLY the tools that are actually available.
   (b) Instructs the subagent: "If your tools fail, STOP and report
       exactly which tools failed. Do NOT fabricate any URLs, paper
       titles, author names, or platform feature descriptions. Do
       NOT fall back to memory or training data."
3. If NO research tool will work in this session, downgrade the
   plan's "2026 Research" pillar honestly: add a "Research Pillar
   Status" section to the master plan doc, naming the unavailable
   tools, stating what the pillar is grounded in instead (existing
   librarian references + the codebase itself + prior session
   findings), and documenting the recovery path for the user
   (`notebooklm.auth-setup` next session, or run the wave in a
   web-tool-equipped runtime).

A "research pillar: 12 verified 2026 URLs" claim when no such URLs
exist in the session is a failed review. An honest "research pillar
downgraded, recovery path documented" is shippable.
```

## Recovery actions Frank can take in a future session

1. **Wire NotebookLM auth.** From a terminal run `notebooklm.auth-setup`
   (Hermes prompt). Complete Google sign-in in the visible Chrome
   window. The MCP persists cookies for future runs. Then re-dispatch
   the research subagents — the URL lists and prompt bodies are
   already prepared from the prior session.

2. **Switch to a web-tool-equipped runtime.** Run the wave in a Hermes
   session that exposes `web_search` + `web_extract`. The plan and
   lane briefs work as-is in that runtime.

3. **Accept honest downgrade.** Ship the plan with the 30% research
   pillar honestly downgraded to whatever librarian references +
   codebase evidence exists. This is shippable per the SAD review
   rule.

## Anti-pattern (do NOT do)

Do NOT pad the plan's research pillar with citations drawn from
training-data memory when no fresh research was performed. The user
calls this out on receipt ("are you running research? we had research
on them before!"). A confident-looking citation table built from
memory is a failed review. The honest downgrade is always better
than the fabricated padding.

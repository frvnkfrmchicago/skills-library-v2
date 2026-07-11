# Subagent Research Patterns

Lessons from multi-agent cannabis license data research across 39 US jurisdictions.

## Key Lessons (2026-06-04)

### 1. Browser iteration cap — research agents MUST write files early

All 7 research agents hit the 50-iteration browser cap before writing output files. Every agent returned rich findings in their summary but produced no artifact on disk.

**Rule: For research subagents using browser tools, the first 15 iterations should establish findings, then WRITE the output file by iteration 20 at the latest. Browser verification comes after the file is safe.**

### 2. Web search first, browser second

Research agents that used `browser_navigate` as their primary discovery tool burned through iterations navigating between pages. Agents that used web_search to identify endpoints FIRST, then browser_navigate only for verification, were far more efficient.

**Pattern: web_search → collect candidate URLs → browser_navigate to verify top 3-5 → write file.**

### 3. CDP browser contention across concurrent agents

When multiple agents share the same Chrome CDP endpoint (port 9222), they interfere with each other:
- Tabs from Agent A appear in Agent B's `browser_snapshot`
- `browser_navigate` in one agent can switch the focused tab for another
- Cross-origin console evaluation from one agent's page context fails for another's URLs

**Mitigation: Stagger browser-heavy agents. If 3 agents run concurrently, at most 1-2 should use browser tools. The others should use web_search or terminal-based approaches.**

### 4. max_concurrent_children is typically 3

`delegate_task` rejects batches > max_concurrent_children (default 3). Plan waves of ≤3 agents.

**Pattern: Wave 1 (3 agents) → collect results → Wave 2 (3 agents) → collect results → parent writes consolidation report.**

### 5. Government open data source patterns

When researching state/federal government data:

| Pattern | Signal | Examples |
|---------|--------|---------|
| **Socrata/Open Data** | `data.X.gov` URLs | PA (data.pa.gov), CT (data.ct.gov) |
| **ArcGIS Hub** | `opendata-X.hub.arcgis.com` | MD, DC, AZ |
| **XLS/XLSX download** | Agency "frequently requested lists" | WA (lcb.wa.gov), NV (ccb.nv.gov) |
| **DataTables HTML** | jQuery paginated tables | MT (revenue.mt.gov) |
| **Salesforce/Accela** | eLicense portals | MI (Accela), OH (Salesforce) |
| **Tableau embed** | iframe data visualizations | IL (cannabis.illinois.gov), MO |
| **Socrata REMOVED** | Old feeds gone | WA (data.wa.gov), OR (data.oregon.gov) |

**Critical: Socrata/open data feeds are being removed by states. Always verify the endpoint is still live before wiring an adapter.**

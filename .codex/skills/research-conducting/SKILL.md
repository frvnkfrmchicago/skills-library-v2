---
name: research-conducting
description: >
  Conducts systematic topic research including question framing, multi-angle
  exploration, source evaluation (CRAAP test), competitive analysis, and
  synthesis into actionable reports. Different from search (targeted retrieval):
  research is broader topic exploration that builds understanding. Use when
  investigating a market, evaluating competitors, building a research report,
  or when user mentions research, competitive analysis, or market exploration.
---

## Subagent Research Patterns

When dispatching research subagents via `delegate_task`, see `references/subagent-research-patterns.md` for lessons on browser iteration management, web-search-first ordering, CDP contention, wave sizing, and government open-data source patterns. Key rules:
- Research agents MUST write output files by iteration 20; browser verification comes after.
- Use web_search to identify candidates, browser_navigate only for verification.
- At most 1-2 concurrent agents should use browser tools; others use web_search/terminal.
- Waves of ≤3 agents (max_concurrent_children default).
- Socrata/open data feeds are being removed by states — always verify endpoints are still live.

### Subagent Time Budgets (Verified June 2026)

A `delegate_task` subagent that tries to exhaustively fetch every URL inline **will time out at 600s**. The default timeout is hard, and a subagent stuck in a slow fetch chain has no way to abort early. Symptoms of a doomed run: status=`timeout` with 30-50 API calls completed and no summary returned.

The fix that works — apply to every research subagent that needs to populate citations:
1. **Give the agent an explicit time budget** in the context ("ship in 8 minutes", "ship in 6 minutes"). Without a number, agents default to "fetch everything thoroughly" and time out.
2. **Train the agent to use prior knowledge for well-known sources.** DOIs the prompt mentions by name (e.g. "Russo 2011 Taming THC"), canonical regulatory URLs (FDA, NCSL, state cannabis control boards), and well-known advocacy orgs (NORML, Project CBD, MAPS) should be cited from training knowledge, not fetched.
3. **Ship-don't-verify directive.** Tell the agent: "Mark uncertain items as `needs verification` rather than fetching. Quality of one verified source beats ten fabricated." This unblocks the agent from slow URL chains.
4. **Hard cap on verification.** Tell the agent: "Only fetch a URL if you have time at the end. Document `not fetched (time budget)` honestly in the verification log." This is the move that turned three timeouts into three shipped documents.
5. **Output path locked at dispatch.** Three agents writing to three distinct paths avoids file-ownership races and lets the parent verify each file independently after the batch returns.

When the first batch times out: do NOT re-dispatch with the same prompt. Tighten scope, add the time budget + ship-don't-verify directive, and re-dispatch. The second batch ships in a fraction of the time because the agents don't fight the URL chain.

### Skill-Name Collision Gotcha (Verified June 2026)

Some skill names resolve to two files across the agent's local skills dir and the loaded skills-library external dir (e.g. `research-conducting` lives at both `.codex/skills/research-conducting/SKILL.md` and `.claude/skills/research-conducting/SKILL.md`). When you call `skill_view(name="...")` with the bare name, the tool refuses to guess and returns the list of matches.

Resolution: prefer the `.codex/` path for skills-library content. The Claude skills-library path is Frank's authoring workspace; the Codex path is the canonical SKILL.md. If both return the same name, ask Frank to consolidate — but for read-time use, the `.codex/` file is the one to load.

## Parallel Research-Document Dispatch (verified pattern, June 2026)

When the user wants a research artifact (topic catalog, citation registry, source-priority list, market scan) and explicitly says "documents only / no code," dispatch parallel research agents via `delegate_task` with these non-negotiable rules baked into the context. Worked on the GrazzHopper /learn research wave (2026-06-21) for 3 agents: topic catalog, citation registry, interactive-strategy + source-quickref.

**Per-agent context must include:**

1. **Hard output path** — absolute file path the agent writes to. No choice. Example: `~/Documents/Project/.../docs/research/01-TOPICS-CATALOG.md`.
2. **Hard scope statement** — "research and documentation only. Do not modify any code in the [project-name] codebase."
3. **Hard real-source floor** — "cite only real, verifiable URLs. If you cannot verify a URL, omit it. Three verified sources beat ten invented ones." Include the verification-log requirement: every URL gets a row in a table (URL, date tested, HTTP status, what the page actually said).
4. **Existing-state read** — tell the agent the file sizes and line counts it should expect to see when it opens the codebase. This preempts "the user said X but actually it's Y" discovery churn. Example: "existing courses.ts is 118KB, 2,241 lines, 27 hand-authored courses. Don't claim it's 3 lessons."
5. **Plain-language / no-AI-slop constraint** — "no 'leverage', 'engage', 'delve'. These are research artifacts Frank will read, not pitch decks."
6. **The deliverable's structural template** — exact section headings the agent should fill in. Don't let the agent invent the doc shape; you as the lead are the shape-owner.

**When to use this pattern:**
- User says "no code, just documents" or "research only" or "I want a citation registry"
- Work naturally splits into 3 or fewer parallel research streams (one per topic cluster, one per file type, one per domain)
- Output is research artifacts (markdown docs) for Frank or a future agent to consume
- The agents MUST be able to run without cross-dependencies (no agent B needs agent A's output to start)

**When NOT to use it:**
- The work is single-topic and would fit in one focused research pass
- Agents would need to wait on each other (cross-dependencies → serialize instead)
- The user wants a build plan, not research (use SAD Gate 4 orchestration instead)
- The deliverable is one cohesive document, not N independent documents

**Verification after the agents return:** Never trust subagent self-reports. For each output file: `read_file` it back, scan the verification log for completeness, spot-check 2-3 URLs by hitting them yourself with `web_extract` or `browser_navigate`, confirm the file size is plausible for the scope. If the verification log is empty or thin, push back on the agent and demand a re-run with that section filled in.

**Example dispatch (GrazzHopper learn research wave, 2026-06-21):**
- 3 agents, each writing a separate file under `grazzhopper-landing/docs/learn-research/`
- Agent 1: topic catalog — 25+ new topics with verified citations, organized by 5 existing categories
- Agent 2: citation registry — verified URL database by topic cluster + tier (peer-reviewed/regulatory/editorial) + verification log
- Agent 3: interactive strategy + source quickref — game-kind-to-topic mapping with research citations + author one-stop reference
- Each agent received: locked output path, hard "documents only" rule, hard "real URLs only" floor, hard "verification log required" floor, structural template with section headings, the existing-state read (file sizes, line counts, citation count)
- All three ran in parallel (background), consolidated results came back as a single message when all finished

## Frank's Research Preferences

- Always prefer responses grounded in research with cited sources
- Up-to-date sources required for claims about current state (2025-2026)
- Historical/conceptual claims still need relevant supported dated sources
- If a source cannot be verified, say so explicitly — never present estimated dates as facts

## Pitfalls

- **Distinguish between similar products explicitly.** When researching financial products, never conflate index options (e.g., SPX) with single-stock options (e.g., AMZN). They have different listing dates, different regulatory filings, different liquidity profiles. Mixing timelines across product categories produces confident but wrong answers that erode trust.
- **Subagent research timeouts.** delegate_task with web research can time out. If a subagent returns empty or times out, run browser_navigate + browser_snapshot directly to get primary sources. Google search snippets often contain the key date/quote you need before even clicking through.
- **Primary source documents.** For regulatory changes (SEC, CBOE, exchange filings), search for the exact filing on federalregister.gov or the exchange's notices page. Google search snippets frequently surface the effective date and key terms before you need to click through to the full document.
- **Reference files.** Store condensed domain-specific research findings under `references/` so future sessions don't re-research the same topic. See `references/options-market-structure-2026.md` for an example.
- **Government open-data research.** When researching licensed businesses or regulatory data across multiple jurisdictions, check these source patterns in order: (1) Socrata/open-data portals (append `.json?$limit=50000`), (2) ArcGIS FeatureServer REST endpoints (`/arcgis/rest/services/`), (3) CSV/XLSX downloads from the regulator site, (4) JSON API behind a license-verification search tool (inspect network requests), (5) manual HTML scrape as last resort. See `references/cannabis-regulator-sources-2026.md` for a worked example covering 39 US cannabis jurisdictions.
---

# Research Conducting

Systematically explore topics, evaluate sources, perform competitive analysis,
and synthesize findings into actionable reports. Research is exploration; search
is retrieval. This skill covers exploration.

---

## Research vs Search — When to Use Each

```
Research (this skill):
  "What are the best approaches to monetizing indie apps?"
  "How do competitors in the cannabis tech space position themselves?"
  "What design patterns work best for gamified experiences?"
  → Output: Comprehensive report with analysis and recommendations

Search (different skill):
  "What's the Codex double usage end date?"
  "Does Kimi K2.5 API work in Cursor?"
  "What's the current price of Google AI Ultra?"
  → Output: Specific answer + sources
```

---

## Research Methodology

### Step 1: Frame the Question

Define clear boundaries. Unbounded research produces unfocused results.

```markdown
## Research Frame

**Question:** What monetization strategies work for indie developer apps in 2026?

**Scope:**
- Focus: Solo developers and small teams (< 5 people)
- Platforms: Web apps and mobile (PWA)
- Exclude: Enterprise SaaS, VC-backed startups
- Time range: 2025-2026 data only

**Expected output:** Ranked list of strategies with revenue data and examples
```

```
❌ Bad:  "How do apps make money?"
   (Too broad — millions of answers, no useful direction)

✅ Good: "What monetization models generate $1K-10K/mo for solo developer
          web apps in 2026?"
   (Specific audience, specific range, specific timeframe)
```

### Pitfalls

### "Support page" citations are not architecture research

When researching the architecture of a platform (X, YouTube, TikTok, Threads, Meta), do NOT cite product help centers (support.google.com, help.instagram.com, the in-product FAQ) as architectural sources. Help centers confirm **product behavior** ("Shorts views count starts to play or replay", "Reels tab lives next to Home") but they do NOT document the ranking algorithm, the candidate pool, or how posts are selected for the feed. For architecture, cite one of:

- **Engineering blogs** (engineering.fb.com, blog.youtube, newsroom.tiktok.com — but read past marketing to the technical posts; the Threads and X posts about heavy-ranker weights and Meta's "How we built Threads in 5 months" are the real ones, not the launch announcements)
- **Open-source repos** (raw.githubusercontent.com/<owner>/<repo>/<branch>/<path> — the actual weights.py / config/defaults.yaml, not the marketing README)
- **arXiv papers** (always read the abstract before citing; in ML the title often overlaps with unrelated topics)
- **Live DOM rendering** (browser_snapshot + browser_console on the existing CDP Chrome at 127.0.0.1:9222 — for product surface, tab structure, action sets)

A citation like "per YouTube Help Center, Shorts views count starts to play" is a **behavior** citation, not an architecture one. If the architecture is not publicly documented, mark the claim **[ungrounded]** in the research report. Don't promote behavior claims to architecture claims.

### "Title-citing" an arXiv paper without reading the abstract

Never cite a paper from its title alone. In ML the title often overlaps with unrelated topics (real example from a 2026 session: `arxiv.org/abs/2502.02545` was cited as "Pinterest KDD 2025 cold-start prior" but the paper is actually "Optimal Spectral Transitions in High-Dimensional Multi-Index Models" — totally unrelated). Always read 1-2 paragraphs of the abstract before citing. The `export.arxiv.org/api/query?...` endpoint returns full metadata including `<summary>` — read it.

## Step 2: Multi-Angle Exploration

Investigate from at least 3 different angles:

| Angle | What to Look For | Sources |
|-------|------------------|---------|
| Industry data | Market size, trends, growth rates | Reports, analyst publications |
| Competitor analysis | Pricing, positioning, features | Product Hunt, competitor sites |
| Community insights | Practitioner reports | Reddit, Indie Hackers, Twitter/X |
| Technical feasibility | Can you implement this? | Docs, tutorials, GitHub |
| Case studies | Specific examples with numbers | Blog posts, podcasts, interviews |

### Step 3: Source Evaluation (CRAAP Test)

Rate every source before including it:

| Criteria | Question | Red Flag |
|----------|----------|----------|
| **Currency** | When published? | Older than 18 months for fast-moving topics |
| **Relevance** | Applies to our context? | Generic advice not tailored to situation |
| **Authority** | Who wrote this? Credentials? | Anonymous, no track record |
| **Accuracy** | Data verifiable? | Claims without evidence or citations |
| **Purpose** | Why was this written? | Hidden sales pitch disguised as research |

### Step 4: Synthesis

Combine findings into a structured report:

```markdown
## Research Report: [Topic]

### Executive Summary
[2-3 sentences — the key takeaway]

### Key Findings

| Finding | Evidence | Confidence | Source Count |
|---------|----------|------------|-------------|
| [Finding 1] | [Data points] | High/Medium/Low | 4 sources |
| [Finding 2] | [Data points] | High/Medium/Low | 2 sources |

### Analysis
[What the findings mean for our specific situation]

### Recommendations
1. [Specific action] — because [evidence-backed reason]
2. [Specific action] — because [evidence-backed reason]

### Knowledge Gaps
- [What we still don't know]
- [Where more research is needed]

### Sources
1. [Author], "[Title]", [Publication], [Date]. [URL]
2. [Author], "[Title]", [Publication], [Date]. [URL]
```

---

## Competitive Analysis Framework

```markdown
## Competitive Analysis: [Your Product] vs Market

### Competitors Identified
| Competitor | Category | Size | Pricing |
|------------|----------|------|---------|
| [Name] | Direct | [Users/Revenue] | [Price] |
| [Name] | Indirect | [Users/Revenue] | [Price] |

### Feature Comparison
| Feature | You | Comp A | Comp B | Comp C |
|---------|-----|--------|--------|--------|
| [Feature 1] | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |

### Positioning Gaps
- [What competitors miss that you can own]
- [What competitors do well that you must match]

### Strategic Recommendations
1. [Differentiation strategy based on gaps]
2. [Feature priority based on competitive landscape]
```

---

## Research Output Formats

| Format | Sources | Time | Best For |
|--------|---------|------|----------|
| Quick Research | 3-5 sources | 30 min | Quick decisions, "is this worth pursuing?" |
| Standard Research | 10-15 sources | 2-4 hours | Product planning, market entry |
| Deep Research | 25+ sources | 1-2 days | Major pivots, investor presentations |

---

## NEVER

- **NEVER** present opinions as facts — always attribute claims to sources
- **NEVER** draw conclusions from a single source — cross-reference minimum 3
- **NEVER** ignore contradictory evidence — present both sides
- **NEVER** use sources older than 18 months for fast-moving tech topics
- **NEVER** skip source evaluation — not all information is equal

---

## ⛔ STOP GATE

DO NOT deliver research without:
1. Research question clearly framed with scope boundaries
2. Multiple angles explored (not just one perspective)
3. Sources evaluated for credibility (CRAAP test applied)
4. Findings cross-referenced (no single-source conclusions)
5. Report follows structured format (summary → findings → analysis → recommendations)
6. All claims have source attribution
7. Knowledge gaps explicitly stated

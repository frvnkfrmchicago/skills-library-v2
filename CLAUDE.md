# Skills Library

This workspace contains 50 Agent Skills in `.claude/skills/`. They auto-discover at session start.

## Skills Available

**Quality & Security:** `security-auditing`, `hacker-scanning`, `code-scrutinizing`, `code-auditing`, `code-cleaning`, `testing-enforcing`, `performance-tuning`, `anti-glitch-debugging`, `consistency-checking`, `code-reviewing`

**Design & UX:** `experience-designing`, `typography-enforcing`, `animation-designing`, `interactive-animating`, `three-d-developing`, `component-building`, `mobile-first-enforcing`, `ux-designing`, `visual-auditing`, `pattern-referencing`

**Building & Architecture:** `backend-hardening`, `frontend-architecting`, `database-designing`, `api-integrating`, `supabase-building`, `flow-designing`, `implementation-guiding`, `onboarding-designing`, `web-game-foundations`, `r3f-game-building`, `three-webgl-game-building`, `playmaster`, `web-3d-asset-pipeline`, `pre-deploy-gating`

**AI & Automation:** `google-ai-integrating`, `conversational-ai-building`, `model-fine-tuning`, `prompt-engineering`, `multi-agent-designing`, `orchestration-managing`, `n8n-automating`, `copywriting-enforcing`, `anti-mock-enforcing`, `research-conducting`

**DevOps & Meta:** `deploying`, `exit-gating`, `aws-building`, `azure-building`, `lab-orchestrating`, `facilitating`, `progress-tracking`, `tech-advising`, `search-building`, `remotion-best-practices`

## How To Use

Match user requests to skill descriptions. Load the full SKILL.md when relevant. Skills are in `.claude/skills/<name>/SKILL.md`.

## Librarians

49 manual-activation librarian personas in `librarians/`. Activate with "activate [X] librarian." Wings in `librarians/WINGS.md` group multiple librarians.

## Reference Skills

146 deep reference skills in `agents/`. Technology-specific knowledge (Stripe, GSAP, Supabase, etc.).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

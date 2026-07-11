# WAVE-UXCEL-ADAPTATION — Dispatch Ready

## Mission
Adapt Asset Persona into a premium, interactive, and gamified AI education and portfolio platform, emulating the layout, gamification mechanics, and interactive user experience patterns of Uxcel.com. We will implement high-fidelity interactive cards, timed assessments, a skill graph portfolio, weekly reset leagues, AI design briefs, group study dashboards, public project showcase galleries, and an AI arcade.

We strictly reference the skills library, librarians, and 2026 research tokens for decision-making, quality controls, and interactive motion designs.

This implementation is directly based on:
- [uxcel_research_citations.md](file:///Users/franklawrencejr./.gemini/antigravity/brain/759da154-a200-4f22-ae06-49cd4640daed/uxcel_research_citations.md)
- [orchestration-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/orchestration-librarian/SKILL.md)
- [multi-agent-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/multi-agent-librarian/SKILL.md)

## Technology Decisions (2026 Research)

| Feature | Library/Engine | Verdict | Reference / Citations |
|---------|----------------|---------|------------------------|
| **Quiz Animations** | Framer Motion + canvas-confetti | **Selected.** Provides physics-based celebration feedback. | [animation-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/animation-designing/SKILL.md) |
| **Interactive Graphs** | Recharts (Radar Chart) | **Selected.** Standard interactive component with native React responsiveness. | [frontend-architecting](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/frontend-architecting/SKILL.md) |
| **Tutorial Snippet Runner** | WebAssembly JS sandbox | **Selected.** Safe browser-based environment for executing prompt/JS examples. | [api-integrating](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/api-integrating/SKILL.md) |
| **Certificate PDF Export** | html2canvas + jspdf | **Selected.** Allows client-side PDF render of verified certificate layout. | [experience-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/experience-designing/SKILL.md) |
| **Arcade Games** | React state-engine + CSS grid animations | **Selected.** High performance, zero canvas bloat. | [web-game-foundations](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/web-game-foundations/SKILL.md) |

## Wave Structure

| Agent | Lane | Theme | Citations / References |
|-------|------|-------|------------------------|
| Agent 1 | `01-AGENT1-GAMIFICATION-LEAGUES` | Weekly leagues, streak logic, SQL migrations | [database-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/database-designing/SKILL.md) |
| Agent 2 | `02-AGENT2-QUIZ-ENGINE` | Fullscreen interactive quiz reader & validation bar | [animation-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/animation-designing/SKILL.md) |
| Agent 3 | `03-AGENT3-AI-BRIEFS` | AI prompting brief list, details, checklists | [flow-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/flow-designing/SKILL.md) |
| Agent 4 | `04-AGENT4-TIMED-ASSESSMENTS` | Timed assessment introductory and exam states | [experience-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/experience-designing/SKILL.md) |
| Agent 5 | `05-AGENT5-SKILL-GRAPH` | Radar skill graphs on profiles (Recharts) | [frontend-architecting](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/frontend-architecting/SKILL.md) |
| Agent 6 | `06-AGENT6-INTERACTIVE-TUTORIALS` | Editorial tutorials, code sandbox runner | [api-integrating](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/api-integrating/SKILL.md) |
| Agent 7 | `07-AGENT7-TEAM-LEARNING` | Group study challenges, team dashboards | [flow-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/flow-designing/SKILL.md) |
| Agent 8 | `08-AGENT8-CREDENTIALS-CERTIFICATES` | Verified certificate badges, shares, and PDF export | [exit-gating](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/exit-gating/SKILL.md) |
| Agent 9 | `09-AGENT9-PROJECT-SHOWCASE` | Project showcase gallery, sandbox embeds | [frontend-architecting](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/frontend-architecting/SKILL.md) |
| Agent 10 | `10-AGENT10-AI-ARCADE` | Prompt Battles and Jailbreak puzzle challenges | [web-game-foundations](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/web-game-foundations/SKILL.md) |
| Agent 11 | `11-AGENT11-ROUTING-STATE` | Wires routes, layout sidebars, status notifications | [experience-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/experience-designing/SKILL.md) |

## Evidence Contract
Each agent must produce:
1. Working code at the file paths listed in their lane brief.
2. `bun run build` passes with zero errors.
3. Lane brief rewritten in place with completion evidence.

## Merge Order
1. Agent 1 (Migrations + Leagues database layer)
2. Agents 2, 3, 4, 6, 7, 9, 10 — in parallel.
3. Agent 5 + Agent 8 — depends on Agent 4.
4. Agent 11 (Routing + State coordinator) — depends on all lanes.

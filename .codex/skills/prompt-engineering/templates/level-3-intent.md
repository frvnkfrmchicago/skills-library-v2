# L3 SAD-Integrated Prompt Template

This template encodes the full SAD protocol — gates, graphify wiring scan,
grounding rules, readiness scoring, and behavioral rules — so nothing gets
lost when the receiving agent skims. The librarian fills the brackets; you
paste the output and go.

---

## Template

```markdown
## Goal
[State what you want in plain language — be specific about the outcome]

## Target Tool
[Antigravity / Claude Code / Codex / Hermes] ([model])

## SAD Protocol
Run SAD (Sequential Agentic Development) on the goal above.

Read these IN FULL first, then follow them exactly:
- ~/Downloads/skills-library-v2 2/librarians/sad-librarian.md
  (5 gates + Gate-1 graphify map + grounding)
- ~/Downloads/skills-library-v2 2/librarians/orchestration-librarian.md
  (Gates 4–5: multi-agent waves)
- ~/Downloads/skills-library-v2 2/.codex/skills/orchestration-managing/SKILL.md
[DOMAIN SKILLS — librarian fills these based on the task]
[DOMAIN LIBRARIANS — librarian fills these based on the task]
- Every additional domain skill + librarian that matches
  (via librarians/WINGS.md — check [relevant Wings])

### Gate 1 — UNDERSTAND
Open with `graphify update .` (or `graphify .` if no graph exists).
Drive the 5-surface scan off the graph (file:line references), not guesswork:
- Architecture — component tree, routing, layouts
- API routes — endpoints, middleware, auth
- Data layer — schemas, queries, state management
- Configuration — env vars, build config, dependencies
- UI/UX — screens, flows, interactive states

Classify every finding as REAL / MOCK / BROKEN.
Readiness % comes from the build probe (what actually works), never node counts.
graphify = wiring map, not a function checker.

### Gate 2 — RESEARCH
Find 2026 sources for the feature's current pain points.
GROUND, don't scrape — for every source (2026 URL, skill, librarian),
distill the actual concept/principle and state how it applies to THIS build.
A link with no extracted, applied rule transfers nothing.
Flag stale sources (>6 months).
Cross-reference claims with 3+ sources for anything consequential.

### Gate 3 — SYNTHESIZE
Map skills + librarians + 2026 research to the task.
Every citation must extract AND apply a concept.
Build the grounding citations table (SKILL + LIBRARIAN + 2026 URL per item).

### Gate 4 — DECOMPOSE
File-exclusive lanes, batched by dependency.
Use `graphify affected` so lanes never collide.
No cap on agent count — file-exclusivity is the only governor.
If single-agent: decompose into sequential phases instead of parallel lanes.

### Gate 5 — EXECUTE
Ship in waves with progression tracking.
Per-item citations table. Semantic commits per deliverable.

Confirm each gate before proceeding to the next.
Hold at Gate 4 — present the plan, no code until I approve.

### Self-Assessment
Before the plan, score readiness by surface (0-100 each), weighted by importance.
Cite Gate 1 evidence for each score. State the target after the wave ships.

| Surface | Score | Evidence | Target |
|---------|-------|----------|--------|
| Architecture | [0-100] | [What graphify + manual inspection found] | [Target] |
| API Routes | [0-100] | [What exists, what's missing] | [Target] |
| Data Layer | [0-100] | [Schema state, mock vs real] | [Target] |
| Configuration | [0-100] | [Env vars, build, deps] | [Target] |
| UI/UX | [0-100] | [Screen state, flow completeness] | [Target] |

Overall: [N]% → Target: [M]% → [Which wave gets us there]

### Resource Requirements
- **SKILLS**: Load every skill that matches the task domain from .codex/skills/.
  Read each in full. Apply their workflows, not just their names.
  Use as many as the work demands — never limit to 1.
- **LIBRARIANS**: Activate every matching librarian from librarians/.
  Read the persona file for framing, then the base skill for execution.
  Librarian emphasis + skill execution.
- **2026 RESEARCH**: Ground every decision in current-year sources.
  Stale (>6 months) must be flagged. Cross-reference claims with 3+ sources
  for anything consequential.

### Rules
- Pick the obvious default and ship — no A/B/C option menus
- No deferral — every item ships or is dropped with reason
- Always commit — semantic commit messages (feat:, fix:, refactor:, docs:, chore:)
- No banned phrases: "approximate," "known limitation," "for simplicity," "TODO," "best-effort"
- No internal build output in UI (no hashes, model names, graphify IDs)
- Per-item citations: every deliverable ends with a citations table
- Be extensive in the plan
- Ship, don't defer

## Grounding Directive
Ground every decision in the skills, librarians, and 2026 sources loaded above.
For each deliverable, end with a citations table showing: which skill rule you
followed, which librarian pattern shaped the output, and which 2026 source
informed the approach. Do not name a skill without extracting and applying a
concept from it. A citation with no extracted, applied rule transfers nothing.

## Grounding Citations
| Type | Reference | Applied Concept |
|------|-----------|----------------|
| SKILL | [name] | [extracted rule → application to this task] |
| LIBRARIAN | [name] | [persona focus → how it shapes output] |
| 2026 URL | [source] | [extracted concept → application to this task] |
```

---

## Example: Auth Flow Rebuild

```markdown
## Goal
Rebuild the authentication flow for the GrazzHopper dispensary platform.
Replace the current email/password-only auth with social login (Google, Apple),
magic link, and age verification (21+ required for dispensary access).

## Target Tool
Antigravity (Opus 4.6)

## SAD Protocol
Run SAD (Sequential Agentic Development) on the goal above.

Read these IN FULL first, then follow them exactly:
- ~/Downloads/skills-library-v2 2/librarians/sad-librarian.md
- ~/Downloads/skills-library-v2 2/librarians/orchestration-librarian.md
- ~/Downloads/skills-library-v2 2/.codex/skills/orchestration-managing/SKILL.md
- ~/Downloads/skills-library-v2 2/.codex/skills/flow-designing/SKILL.md
- ~/Downloads/skills-library-v2 2/.codex/skills/security-auditing/SKILL.md
- ~/Downloads/skills-library-v2 2/.codex/skills/backend-hardening/SKILL.md
- ~/Downloads/skills-library-v2 2/.codex/skills/gamification-design/SKILL.md
- ~/Downloads/skills-library-v2 2/librarians/flow-librarian.md
- ~/Downloads/skills-library-v2 2/librarians/security-librarian.md
- ~/Downloads/skills-library-v2 2/librarians/experience-designer-librarian.md
- ~/Downloads/skills-library-v2 2/librarians/gamification-librarian.md
- Every additional match via librarians/WINGS.md (Design Wing + Quality Wing)

### Gate 1 — UNDERSTAND
Run `graphify update .` and drive the 5-surface scan off the graph.
Scan the current auth implementation: files, middleware, API routes, token storage,
session management, CORS config. Classify real/mock/broken.

### Gate 2 — RESEARCH
Find 2026 best practices for social auth, magic link, and age verification
in regulated industries (cannabis). Ground, don't scrape — distill concepts.

### Gate 3 — SYNTHESIZE
Map flow-designing (happy path + chaos path), security-auditing (auth middleware),
backend-hardening (CORS, rate limiting), gamification-design (age gate UX).
Extract specific rules from each.

### Gate 4 — DECOMPOSE
File-exclusive lanes. Use `graphify affected` to prevent collision.

### Gate 5 — EXECUTE
Ship in waves. Semantic commits per deliverable.

Confirm each gate. Hold at Gate 4 — present the plan, no code until I approve.

### Self-Assessment
| Surface | Score | Evidence | Target |
|---------|-------|----------|--------|

Overall: ?% → Target: 90%+ → Which wave gets us there.

### Rules
- Pick the obvious default and ship — no A/B/C option menus
- No deferral. Always commit. No banned phrases.
- No internal build output in UI. Per-item citations. Be extensive.
- Ship, don't defer.

## Grounding Citations
| Type | Reference | Applied Concept |
|------|-----------|----------------|
| SKILL | flow-designing | Happy + chaos path mapping → map auth success AND failure states |
| SKILL | security-auditing | Auth middleware verification → every auth route gets middleware |
| SKILL | backend-hardening | CORS whitelist + rate limiting → applied to auth endpoints |
| SKILL | gamification-design | Age gate slider verification → 21+ UX for dispensary compliance |
| LIBRARIAN | flow-librarian | Journey validation → auth covers signup through verified session |
| LIBRARIAN | security-librarian | Security-first review → auth is highest-risk surface |
| LIBRARIAN | experience-designer-librarian | Token architecture → auth UI follows design tokens |
| 2026 URL | [Gate 2 will find] | Social auth + magic link + age verification patterns |
```

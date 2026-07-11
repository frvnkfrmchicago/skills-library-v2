# L2 Context-Grounded Prompt Template

Library-aware prompts that load specific skills and librarians. Every citation
extracts a concept and states how it applies.

---

## Template

```markdown
## Target Tool
[Antigravity / Claude Code / Codex / Hermes] ([model])

## Domain Context
- Project: [name]
- Codebase: [path or description]
- Current state: [what exists, what's broken, what's missing]

## Skills Library Context
Read and follow these skills IN FULL before proceeding:
- ~/Downloads/skills-library-v2 2/.codex/skills/[skill-1]/SKILL.md — for [specific aspect]
- ~/Downloads/skills-library-v2 2/.codex/skills/[skill-2]/SKILL.md — for [specific aspect]

Activate these librarian personas:
- ~/Downloads/skills-library-v2 2/librarians/[librarian-1].md — for [focus area]

## Task
[Clear instruction that references the skills' workflows and patterns]

## Constraints
- [Constraint from skill-1's STOP gate]
- [Constraint from skill-2's patterns]
- [Project-specific constraint]

## Output Format
[Structure — state which skill's format you're following if applicable]

## Grounding Directive
Ground every decision in the skills and librarians loaded above. For each
deliverable, cite the specific skill rule or librarian pattern you followed.
Do not name a skill without extracting and applying a concept from it.
A citation with no extracted, applied rule transfers nothing.

## Grounding Citations
| Type | Reference | Applied Concept |
|------|-----------|-----------------|
| SKILL | [name] | [extracted rule → how it applies here] |
| SKILL | [name] | [extracted rule → how it applies here] |
| LIBRARIAN | [name] | [persona focus → how it shapes output] |
```

---

## Example: Design Token Build

```markdown
## Target Tool
Antigravity (Sonnet 4.6)

## Domain Context
- Project: GrazzHopper dispensary platform
- Codebase: ~/projects/grazzhopper
- Current state: Dashboard uses raw hex colors (#1a1a2e, #e94560) and px
  values throughout 23 component files. No design tokens. Dark mode implemented
  as CSS filter inversion which breaks brand colors.

## Skills Library Context
Read and follow these skills IN FULL before proceeding:
- ~/Downloads/skills-library-v2 2/.codex/skills/experience-designing/SKILL.md
  — for token cascade architecture, 7 token categories, and dark mode as token swap
- ~/Downloads/skills-library-v2 2/.codex/skills/consistency-checking/SKILL.md
  — for grep-based detection of hardcoded values and token gaps

Activate these librarian personas:
- ~/Downloads/skills-library-v2 2/librarians/experience-designer-librarian.md
  — for design system prioritization and the elevation framework

## Task
1. Create tokens.css following the token cascade architecture from
   experience-designing (Section: Core Token Template). Include all 7
   categories: colors, typography, spacing, borders/radii, shadows, motion, z-index.
2. Implement dark mode as a token swap via [data-theme="dark"] selector —
   NOT color inversion. Provide separate dark values for primary, surface,
   text, border, and shadow tokens.
3. Scan all component files using the grep commands from consistency-checking
   to find every raw hex color and px font-size value.
4. Replace every raw value with a token reference.
5. Run the final grep scan to verify zero raw values remain.

## Constraints
- Zero raw hex colors or px font sizes in component files after completion
  (enforced via grep scan from consistency-checking STOP gate)
- Use clamp() for fluid typography tokens (from experience-designing fluid patterns)
- Support prefers-reduced-motion (zero out all duration tokens)
- Follow the 4px base grid for spacing tokens
- Typography: Use Inter for body, Space Grotesk for headings, JetBrains Mono
  for code (from experience-designing defaults)

## Output Format
1. tokens.css file (complete, all 7 categories + dark mode swap)
2. List of all modified component files with before/after for each
3. Final grep scan proving zero raw values remain

## Grounding Citations
| Type | Reference | Applied Concept |
|------|-----------|-----------------|
| SKILL | experience-designing | Token cascade architecture (tokens.css → components → pages) → single source of truth for GrazzHopper's 23 component files |
| SKILL | experience-designing | Dark mode as token swap (not inversion) → replaces current CSS filter approach |
| SKILL | consistency-checking | Hardcoded value detection via grep → scan and replace all raw hex/px values |
| LIBRARIAN | experience-designer-librarian | Elevation framework (Functional → Polished → Delightful → Exceptional) → sets quality bar at Polished minimum |
```

---

## Example: API Security Audit

```markdown
## Target Tool
Claude Code (Opus 4.7)

## Domain Context
- Project: SaaS billing API
- Codebase: ~/projects/billing-api (Express + Prisma + PostgreSQL)
- Current state: 14 API routes, JWT auth on most routes, CORS set to "*",
  no rate limiting, env vars in .env (not in vault)

## Skills Library Context
Read and follow these skills IN FULL before proceeding:
- ~/Downloads/skills-library-v2 2/.codex/skills/security-auditing/SKILL.md
  — for the 5-phase security scan methodology and route protection analysis
- ~/Downloads/skills-library-v2 2/.codex/skills/backend-hardening/SKILL.md
  — for CORS policy, rate limiting patterns, and env-based configuration

Activate these librarian personas:
- ~/Downloads/skills-library-v2 2/librarians/security-librarian.md
  — for security-first prioritization
- ~/Downloads/skills-library-v2 2/librarians/hacker-attacker-librarian.md
  — for offensive security perspective

## Task
Run the 5-phase security audit from security-auditing against all 14 API
routes. For each finding, provide the fix inline. Apply the CORS policy
from backend-hardening (explicit origin whitelist, not "*"). Add rate
limiting using the patterns from backend-hardening.

## Constraints
- Every route must have auth middleware (from backend-hardening auth checklist)
- CORS must use explicit origin whitelist (from backend-hardening CORS section)
- No secrets in .env — provide migration path to vault/encrypted store
- Run all grep/bash scan commands from security-auditing Phase 1

## Output Format
Structured report following security-auditing output format:
1. Summary severity table
2. Critical issues with file:line and fix
3. Warnings with file:line and fix
4. Good practices found

## Grounding Citations
| Type | Reference | Applied Concept |
|------|-----------|-----------------|
| SKILL | security-auditing | 5-phase scan (secrets, injection, XSS, routes, deps) → systematic audit of all 14 routes |
| SKILL | backend-hardening | CORS explicit whitelist + rate limiting patterns → replace current CORS "*" and add throttling |
| LIBRARIAN | security-librarian | Security-first prioritization → critical findings block deployment |
| LIBRARIAN | hacker-attacker-librarian | Offensive perspective → test routes as an attacker would |
```

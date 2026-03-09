---
name: lab-orchestrating
description: >
  Master orchestrator that coordinates multiple agent skills in sequence to
  build full applications from a single prompt. Runs a 6-stage pipeline:
  Discover, Design, Build, Quality, Secure, Ship. Supports full-auto,
  checkpoint, and variation execution modes. Use when building a complete
  app from scratch, running "the computer lab", orchestrating multi-agent
  workflows, or doing one-prompt application building.
---

# Lab Orchestrating

The master orchestrator. Coordinate all skills in sequence to go from idea
to shipped product in one pipeline.

---

## ⛔ STOP — Gather Context First

Before running the lab, fill this context lock:

```markdown
## Lab Context

**Project:** [What are we building?]
**Audience:** [Who is it for?]
**Constraints:** [Timeline, budget, tech limitations]
**Mode:** [Full Auto / Checkpoint / Variation]
**Special Requirements:** [Compliance, integrations, etc.]
```

DO NOT skip this step. Every skill in the pipeline needs this context.

---

## Execution Modes

| Mode | Activation | Behavior |
|------|------------|----------|
| **Full Auto** | "run lab full auto" | Execute entire pipeline, deliver final output |
| **Checkpoint** | "run lab checkpoint" | Pause at each stage for approval |
| **Variation** | "run lab variations" | Generate 2-3 options at key decision points |
| **Mixed** | "run lab checkpoint + variations" | Pause AND show options |

---

## The 6-Stage Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 1. DISCOVER │ ──→ │ 2. DESIGN   │ ──→ │ 3. BUILD    │
│ Tech Advisor│     │ UX + Tokens │     │ Frontend +  │
│ + Research  │     │ + Animation │     │ Backend + DB│
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       ▼                                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 6. SHIP     │ ←── │ 5. SECURE   │ ←── │ 4. QUALITY  │
│ Exit Gate + │     │ Security    │     │ Code Audit  │
│ Deployment  │     │ Audit       │     │ + Testing   │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Stage Details

### Stage 1: DISCOVER

**Skills activated:** `tech-advising`, `search-building`

Directives:
1. Lock project context (audience, constraints, scale)
2. Research current 2026 stack options via web search
3. Evaluate 3+ stack options with scoring matrix
4. Select stack with documented reasoning
5. Pass context forward to Design stage

**Output:** Stack recommendation with scoring table

### Stage 2: DESIGN

**Skills activated:** `experience-designing`, `frontend-architecting`

Directives:
1. Define design tokens (colors, typography, spacing)
2. Plan component hierarchy
3. Define animation system and micro-interactions
4. Create responsive layout strategy
5. Pass design system forward to Build stage

**Output:** Design token file, component tree, animation spec

### Stage 3: BUILD

**Skills activated:** `frontend-architecting`, `backend-hardening`

Directives:
1. Scaffold project with chosen framework
2. Implement design token system
3. Build components using token architecture
4. Implement backend API and database
5. Wire frontend to backend

**Output:** Working application code

### Stage 4: QUALITY

**Skills activated:** `security-auditing`, `hacker-scanning`

Directives:
1. Run TypeScript strict mode check
2. Run linter
3. Check bundle size
4. Review error handling coverage
5. Run test suite (if exists)

**Output:** Quality report with metrics

### Stage 5: SECURE

**Skills activated:** `security-auditing`, `hacker-scanning`

Directives:
1. Scan for hardcoded secrets
2. Verify auth on all endpoints
3. Check CORS configuration
4. Run dependency audit
5. Verify environment variable safety

**Output:** Security report

### Stage 6: SHIP

**Skills activated:** `exit-gating`, `deploying`

Directives:
1. Run exit gate checklist
2. Deploy to target platform
3. Verify live URL loads
4. Test on mobile
5. Document deployment

**Output:** Live URL, exit report

---

## Checkpoint Flow

```
Stage 1: Discover
├─ [Tech Advisor output]
└─ "Type 'continue' to proceed or provide feedback"

[User: continue]

Stage 2: Design
├─ [Design system output]
└─ "Type 'continue' to proceed or provide feedback"

... continues through all 6 stages ...
```

---

## Variation Flow

At key decision points, present 2-3 options:

```
Stack Selection:

Option A: Next.js + Supabase + Clerk
├─ Pros: Fast, batteries included
├─ Cons: Vendor lock-in

Option B: Vite + Firebase + Auth.js
├─ Pros: Flexible, well-known
├─ Cons: More manual setup

Option C: Astro + PlanetScale + Lucia
├─ Pros: Maximum performance
├─ Cons: Less ecosystem

"Pick A, B, or C"
```

---

## Customization

Users can modify the pipeline:

```
"Run lab but skip security — this is a prototype"
→ Removes Stage 5

"Run lab, design phase only"
→ Runs only Stage 2

"Run lab but add 3D to design"
→ Adds 3D skill to Stage 2

"Run lab but include AI content"
→ Adds AI skill to Stage 3
```

---

## Full Auto Output Template

```markdown
## Lab Output: [Project Name]

### Stack Selected
[Framework, DB, auth, hosting with reasoning]

### Design System
[Tokens, components, animations defined]

### Implementation
[What was built, files created, architecture]

### Quality Report
[Build status, lint, types, bundle size]

### Security Status
[Scan results, all gates passed/failed]

### Ship Status
[Live URL, deployment platform, environment config]
```

---

## ⛔ STOP GATE

DO NOT mark lab run as complete without:
1. All selected stages executed
2. Context passed between each stage
3. Final output document generated
4. User confirmed satisfaction with result

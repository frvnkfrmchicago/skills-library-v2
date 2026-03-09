---
name: computer-lab
description: Master workflow orchestration. One prompt → Full application. Chains librarians with optional checkpoints and variations.
last_updated: 2026-03
---

# Computer Lab

One prompt. Full application. Your librarians, orchestrated.

---

## TL;DR

| Mode | What Happens |
|------|--------------|
| **Full Auto** | Runs entire sequence, delivers final output |
| **Checkpoint** | Pauses at each stage for approval |
| **Variation** | Generates 2-3 options at key stages |

**Activate with:** `"run computer lab"` or `"computer lab"`

---

## Execution Modes

### Full Auto Mode

```
"Run computer lab full auto"
```

I execute the entire sequence:
1. Tech Advisor → Stack recommendation
2. UX Design → User flows, IA
3. Implementation → Build features
4. Code Audit → Quality check
5. Security → Security review
6. Exit → Ship checklist

**Output:** Complete implementation with all stages documented.

---

### Checkpoint Mode

```
"Run computer lab checkpoint mode"
```

I pause at each stage:

```
Stage 1: Tech Advisor
├─ [OUTPUT]
└─ "Approve to continue, or request changes"

Stage 2: UX Design
├─ [OUTPUT]
└─ "Approve to continue, or request changes"

... continues ...
```

**You control the pace.** Say "continue" to proceed, or give feedback to iterate.

---

### Variation Mode

```
"Computer lab variations"
```

At key decision points, I generate options:

```
Stage 1: Tech Stack (3 variations)
├─ Option A: Next.js + Supabase + Stripe
├─ Option B: Astro + Firebase + Stripe
├─ Option C: Remix + PlanetScale + Stripe
└─ "Pick A, B, or C"

Stage 2: UI Approach (2 variations)
├─ Option A: Minimal, brutalist
├─ Option B: Rich, animated
└─ "Pick A or B"
```

**You get choices.** I build based on your selections.

---

## The Full Sequence

```
┌─────────────────────────────────────────────────────────┐
│                      COMPUTER LAB                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. DISCOVER                                            │
│     ├─ Tech Advisor → Research + Stack recommendation   │
│     └─ Research Librarian → Context gathering           │
│                                                         │
│  2. DESIGN                                              │
│     ├─ UX Librarian → User flows, IA                   │
│     ├─ Components Librarian → UI components            │
│     └─ Animation Librarian → Motion plan               │
│                                                         │
│  3. BUILD                                               │
│     ├─ Implementation Librarian → Execute the plan     │
│     ├─ Frontend Librarian → UI execution               │
│     ├─ Backend Librarian → API, data layer             │
│     └─ Database Librarian → Schema, queries            │
│                                                         │
│  4. QUALITY                                             │
│     ├─ Code Audit Librarian → Quality review           │
│     ├─ Testing Librarian → Tests                       │
│     └─ Performance Librarian → Optimization            │
│                                                         │
│  5. SECURE                                              │
│     └─ Security Librarian → Security audit             │
│                                                         │
│  6. SHIP                                                │
│     ├─ Exit Librarian → Final checklist                │
│     └─ Deployment → Go live                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## How to Use

### Starting The Lab

```markdown
"Run computer lab. Build me a [describe your project]."

Options:
- "Run computer lab full auto" — No stops
- "Run computer lab checkpoint mode" — Pause at each stage
- "Computer lab variations" — Give me options at each stage
- "Computer lab checkpoint + variations" — Both
```

### Example Prompts

```markdown
"Run computer lab full auto. Build me a cannabis dispensary 
management SaaS with inventory tracking, compliance 
reporting, and payment processing."

"Computer lab variations. I need a landing page for 
my AI startup. Show me different design approaches."

"Run computer lab checkpoint mode. Build a dashboard for 
tracking creator analytics across TikTok and YouTube."
```

---

## Stage Details

### Stage 1: Discover

**Librarians:** Tech Advisor, Research

**Actions:**
- Lock context (what, who, constraints)
- Research current tech landscape
- Generate stack recommendation
- Pull relevant skills from library

**Output:** Stack decision + skill references

---

### Stage 2: Design

**Librarians:** UX, Components, Animation

**Actions:**
- Define user flows
- Plan component architecture
- Decide animation approach
- Reference design philosophy

**Output:** Design plan + component list

---

### Stage 3: Build

**Librarians:** Implementation, Frontend, Backend, Database

**Actions:**
- Execute implementation plan
- Build features per spec
- Set up data layer
- Connect integrations

**Output:** Working code

---

### Stage 4: Quality

**Librarians:** Code Audit, Testing, Performance

**Actions:**
- Run quality checks (security, performance, code smells)
- Generate tests
- Optimize critical paths

**Output:** Audit report + fixes

---

### Stage 5: Secure

**Librarians:** Security

**Actions:**
- Security audit
- Check auth flows
- Validate data handling
- Review env vars

**Output:** Security sign-off

---

### Stage 6: Ship

**Librarians:** Exit, Deployment

**Actions:**
- Final checklist
- Pre-deploy verification
- Deploy

**Output:** Live application

---

## Customizing The Sequence

You can skip or add stages:

```markdown
"Run computer lab, but skip the security audit — 
this is just a prototype."

"Run computer lab and include the 3D librarian — 
I want WebGL elements."

"Run computer lab, design phase only — 
I'll build it myself."
```

---

## Context Template

When activating Computer Lab, I gather:

```markdown
## Lab Context

**Project:** [What you're building]
**Audience:** [Who it's for]
**Constraints:** [Timeline, budget, tech limitations]
**Mode:** [Full Auto / Checkpoint / Variation]
**Special Requirements:** [Compliance, integrations, etc.]
```

---

## Related

- `librarians/tech-advisor-librarian.md` — Stack decisions
- `librarians/facilitator-librarian.md` — Library health
- `ai-builder/agentic-workflows/SKILL.md` — Under-the-hood patterns
- `tech-stack/STACK-ROUTER.md` — App type blueprints

---

## Future: RAG Enhancement

The Lab can be enhanced with RAG retrieval:
1. Embed all skills in vector DB
2. User prompt → retrieve relevant skills automatically
3. Orchestrator chains based on retrieved context

See `implementation_plan.md` for roadmap.

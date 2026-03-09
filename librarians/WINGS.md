---
name: wings
description: Wings are grouped sets of librarians that activate together. Instead of calling one librarian at a time, activate a Wing to load every librarian needed for a specific objective. Think of Wings as departments within the library, each staffed by specialists who work in concert.
last_updated: 2026-03-08
---

# Wings

A **Wing** is a curated group of librarians that activate together for a specific objective. Instead of remembering which 5 librarians to load for an app build, activate one Wing and get them all.

---

## How to Use

```
"Open the Build Wing"
"Activate the Design Wing"
"I need the Ship Wing"
"Launch Quality Wing"
```

The agent should load ALL librarians in that Wing and apply them throughout the conversation. Each librarian retains its own rules and gates.

---

## Wing: Build

**For:** Building a new application from scratch or adding significant features.

**Activate when:** "I'm building an app" or "new feature" or "start a project"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `experience-designer-librarian` | Design tokens, visual system |
| `typography-librarian` | Type scale, font cascade |
| `components-librarian` | Interactive components |
| `flow-librarian` | User story flows (auth, onboarding, payment) |
| `copywriting-librarian` | UI text, error messages, labels |
| `anti-mock-data-librarian` | Real data from the start |
| `mobile-first-librarian` | Responsive, touch-first |

---

## Wing: Design

**For:** Visual design work, UI decisions, creating or refining the look and feel.

**Activate when:** "Design this" or "make it look better" or "visual overhaul"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `experience-designer-librarian` | Token system, color, spacing |
| `typography-librarian` | Type hierarchy, font selection |
| `animation-librarian` | Motion design, micro-interactions |
| `3d-librarian` | 3D elements, WebGL effects |
| `components-librarian` | Interactive component behavior |
| `mobbin-librarian` | Real-world pattern reference |

---

## Wing: Ship

**For:** Getting a project from "works locally" to "live on the internet."

**Activate when:** "Deploy this" or "ship it" or "put it live" or "push to production"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `deployment-librarian` | GitHub Pages, Vercel, Cloudflare |
| `pre-deployment-librarian` | Pre-deploy verification checklist |
| `hacker-attacker-librarian` | Security scan before push |
| `anti-glitch-librarian` | Performance check before deploy |
| `anti-mock-data-librarian` | Verify no mock data ships |
| `exit-librarian` | Final ship checklist |

---

## Wing: Quality

**For:** Auditing, reviewing, and hardening an existing project.

**Activate when:** "Audit this" or "review the code" or "is this production ready"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `code-scrutinizer-librarian` | 7-lens code review |
| `hacker-attacker-librarian` | Security vulnerability scan |
| `anti-glitch-librarian` | Performance and loading diagnosis |
| `performance-librarian` | Core Web Vitals targets |
| `testing-librarian` | Test coverage and quality |
| `visual-audit-librarian` | Visual consistency check |
| `consistency-librarian` | Code style consistency |

---

## Wing: Mobile

**For:** Building or optimizing for iOS and Android.

**Activate when:** "Mobile app" or "React Native" or "Expo" or "App Store"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `mobile-first-librarian` | Mobile-specific standards and compliance |
| `experience-designer-librarian` | Token system (responsive tokens) |
| `flow-librarian` | Mobile user flows (onboarding, payment, notifications) |
| `onboarding-librarian` | First-run experience |
| `anti-glitch-librarian` | Mobile performance optimization |
| `deployment-librarian` | Mobile deploy pipeline (EAS, Fastlane) |

---

## Wing: Content

**For:** Writing, copywriting, and content strategy.

**Activate when:** "Write copy for" or "content strategy" or "marketing page"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `copywriting-librarian` | Voice, tone, AI language ban |
| `research-librarian` | Audience and market research |
| `anti-mock-data-librarian` | Real content, not lorem ipsum |
| `experience-designer-librarian` | Content fits within design system |

---

## Wing: Intelligence

**For:** AI features, LLM integration, agent systems.

**Activate when:** "AI feature" or "chatbot" or "LLM" or "agent system"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `multi-agent-librarian` | Multi-agent orchestration |
| `prompt-librarian` | Prompt engineering |
| `conversational-ai-librarian` | Chat and conversational UI |
| `google-ai-librarian` | Google AI integration |
| `n8n-librarian` | Workflow automation |
| `hacker-attacker-librarian` | AI-specific security (prompt injection) |

---

## Wing: Backend

**For:** Database, API, server-side architecture.

**Activate when:** "Build the backend" or "database design" or "API architecture"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `backend-librarian` | Server architecture |
| `database-librarian` | Schema design, queries |
| `api-integration-librarian` | API patterns |
| `supabase-librarian` | Supabase-specific patterns |
| `security-librarian` | Security policy |

---

## Custom Wings

Users can create their own Wings:

```markdown
## Wing: [Name]

**For:** [What this Wing is used for]

**Activate when:** [Trigger phrases]

| Librarian | Role in This Wing |
|-----------|-------------------|
| `[librarian-name]` | [What it does in this context] |
```

---

## Wing Stacking

You can stack Wings when a task spans multiple concerns:

```
"Open Build Wing + Mobile Wing"
→ Loads all librarians from both Wings (deduplicated)

"Ship Wing on top of Quality Wing"
→ Quality audit first, then deployment checklist
```

When Wings overlap (same librarian in multiple Wings), the librarian is loaded once but its rules apply throughout.

---

## Full Librarian Index

For reference, here is every librarian organized by primary concern:

### Visual & Design
- `experience-designer-librarian` — Design token hub
- `typography-librarian` — Type system
- `animation-librarian` — Motion design
- `3d-librarian` — 3D/WebGL
- `components-librarian` — Interactive components
- `mobbin-librarian` — Pattern reference
- `interactive-animation-librarian` — Advanced animations

### Quality & Security  
- `code-scrutinizer-librarian` — 7-lens code review
- `hacker-attacker-librarian` — Offensive security scanning
- `security-librarian` — Security policy
- `anti-glitch-librarian` — Performance debugging
- `performance-librarian` — Core Web Vitals
- `testing-librarian` — Test quality
- `code-audit-librarian` — Code audit
- `code-cleaner-librarian` — Code cleanup
- `visual-audit-librarian` — Visual consistency
- `consistency-librarian` — Style consistency
- `reviewer-librarian` — Code review

### Building & Architecture
- `flow-librarian` — User story flows
- `mobile-first-librarian` — Mobile standards
- `frontend-librarian` — Frontend architecture
- `backend-librarian` — Server architecture
- `database-librarian` — Database design
- `api-integration-librarian` — API integration
- `supabase-librarian` — Supabase patterns
- `implementation-librarian` — Implementation guidance
- `onboarding-librarian` — Onboarding design
- `game-dev-librarian` — Game development

### Content & Copy
- `copywriting-librarian` — Voice, tone, AI ban
- `anti-mock-data-librarian` — Real data enforcement
- `research-librarian` — Research methodology
- `search-librarian` — Search functionality

### DevOps & Shipping
- `deployment-librarian` — Deploy to GitHub/Vercel/Cloudflare
- `pre-deployment-librarian` — Pre-deploy checks
- `exit-librarian` — Final ship gate

### AI & Automation
- `multi-agent-librarian` — Multi-agent systems
- `prompt-librarian` — Prompt engineering
- `conversational-ai-librarian` — Chat/conversational AI
- `google-ai-librarian` — Google AI
- `fine-tuning-librarian` — Model fine-tuning
- `n8n-librarian` — n8n automation
- `orchestration-librarian` — Agent orchestration

### Operations & Meta
- `facilitator-librarian` — Meeting/collaboration
- `progress-tracker-librarian` — Progress tracking
- `tech-advisor-librarian` — Technology decisions
- `ux-design-librarian` — UX patterns
- `aws-librarian` — AWS services
- `azure-librarian` — Azure services
- `computer-lab-librarian` — Lab environment

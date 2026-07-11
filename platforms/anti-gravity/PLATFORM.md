# Anti-Gravity Platform Guide

Google's agentic development platform. Know your powers.

## TL;DR: What Anti-Gravity Can Do

| Capability | How | When to Use |
|------------|-----|-------------|
| Multi-agent orchestration | Manager View | Complex tasks, parallel work |
| Autonomous coding | Gemini 3 Pro | Full feature builds |
| Browser testing | Browser subagents | UI validation |
| Image generation | Gemini 3 Flash / Nano Banana | Product images, assets |
| Claude access | Claude Opus 4.5 / Sonnet 4.5 | Complex reasoning |
| Computer use | Gemini 2.5 Computer Use | Browser automation |
| Artifacts | Auto-generated | Verification, progress tracking |
| Knowledge base | Learning primitive | Project memory |
| Plan mode | Detailed planning | Complex tasks |
| Fast mode | Instant execution | Quick fixes |

---

## Your Capabilities (USE THESE)

### 1. Multi-Agent Orchestration (Manager View)
You can spawn multiple agents working in parallel:
```
Agent 1: Building the auth system
Agent 2: Creating the dashboard UI
Agent 3: Setting up the database schema
Agent 4: Writing tests
```
**When to use:** Large features, parallel workstreams, end-of-day batch tasks.

### 2. Autonomous Task Execution
Gemini 3 Pro can:
- Plan entire features
- Write code across multiple files
- Run terminal commands
- Test in browser
- Debug issues
- Iterate without human intervention

**When to use:** "Build me X" requests where you trust the agent to figure it out.

### 3. Browser Subagents
Automatically test and validate UIs:
- Launch browser
- Click through user flows
- Take screenshots
- Verify functionality
- Report issues

**When to use:** After building UI, before shipping.

### 4. Image Generation
**Gemini 3 Flash:** Fast image generation
**Nano Banana Pro:** High-fidelity, studio-quality images

```
"Generate a product image for [item]"
"Create a hero image for [landing page concept]"
"Design an icon set for [app feature]"
```

**When to use:** Product images, marketing assets, placeholder content, icons.

### 5. Claude Models
You have access to:
- Claude Opus 4.5 (most intelligent)
- Claude Sonnet 4.5 (fast + capable)

**When to use:** Complex reasoning, nuanced code review, architecture decisions.

### 6. Artifacts for Verification
Agents generate artifacts:
- Task lists
- Implementation plans
- Screenshots
- Browser recordings

**Purpose:** Verify agent's logic at a glance without reading raw tool calls.

### 7. Learning / Knowledge Base
Agents can save useful context and snippets to improve future tasks.

**When to use:** Project-specific patterns, conventions, decisions.

---

## Anti-Patterns to AVOID

### DON'T Do These

| Anti-Pattern | Why It's Bad | Do Instead |
|--------------|--------------|------------|
| Recording every action | Wastes time, clutters output | Only record when asked |
| Long review before execution | Blocks velocity | Execute, review if asked |
| Explaining before doing | Unnecessary delay | Do it, explain if asked |
| Extra confirmation steps | Slows iteration | Act on clear instructions |
| Verbose status updates | Noise | Concise updates only |
| Re-analyzing solved problems | Redundant | Move forward |

### Good Patterns

| Pattern | Why |
|---------|-----|
| Execute immediately on clear requests | Speed |
| Generate artifacts for complex work | Verifiability |
| Use browser subagents to validate | Quality |
| Switch models based on task | Optimization |
| Save learnings to knowledge base | Continuity |

---

## Model Selection

| Task | Best Model | Why |
|------|------------|-----|
| Full feature build | Gemini 3 Pro | Best agentic coding |
| Complex reasoning | Claude Opus 4.5 | Deepest thinking |
| Quick edits | Gemini 3 Flash | Speed |
| Image generation | Nano Banana Pro | Quality |
| Browser automation | Gemini 2.5 Computer Use | Specialized |
| Code review | Claude Sonnet 4.5 | Balanced |

---

## Collaboration Principles

### Flexibility Over Rigidity

```
These skills are GUIDES, not LAWS.

If the user provides context that conflicts with a skill:
1. Ask clarifying question if genuinely confused
2. Otherwise, follow user's direction
3. Skills adapt to the situation
```

### When Conflicting Instructions

```
User says X, skill says Y?
→ User wins (they have context you don't)
→ Ask only if genuinely unclear
→ Don't argue or lecture
```

### Innovation Focus

```
Goal: Build gold-standard, innovative products
Skills exist to ENABLE this, not restrict it
Break patterns when it serves the outcome
```

---

## Workflow Integration

### With Skills Library

```
/skills-library/ in your workspace?
→ Reference it for patterns
→ But adapt to current context
→ Search for latest 2025/2026 info when needed
```

### Research Capability

You have web access. USE IT:
```
"What's the current best practice for [X]?"
"Search for [library] latest patterns 2025"
"Find examples of [pattern] in production"
```

Don't rely only on training data. Search for current info.

### With Other Tools

| Handoff | When |
|---------|------|
| Anti-Gravity → Cursor | Quick iterations, tab completion |
| Anti-Gravity → Claude Code | CLI workflows, terminal-heavy |
| Cursor → Anti-Gravity | Need image gen, multi-agent |
| Claude Code → Anti-Gravity | Need browser testing, parallel agents |

---

## Quick Commands

### Start a Feature
```
Plan mode: Create detailed plan first
Fast mode: Execute immediately
```

### Generate Images
```
"Generate a [style] image of [subject] for [context]"
"Create product images for: [list]"
```

### Multi-Agent Task
```
"Spawn agents to work on:
1. [Task A]
2. [Task B]
3. [Task C]
Run in parallel, report when done."
```

### Browser Validation
```
"Test the [feature] flow in browser:
1. Navigate to [url]
2. Click [element]
3. Verify [expected result]
Screenshot each step."
```

---

## Remember

1. **You are powerful** - Use multi-agent, browser testing, image gen
2. **Speed matters** - Execute, don't over-explain
3. **Search for current info** - Don't rely on stale knowledge
4. **Adapt to user** - Skills are flexible, not rigid
5. **Innovation is the goal** - Break patterns when needed

# Your Workflow

How YOU work with AI agents. Systems thinking for the AI product engineer.

## TL;DR

```
DEFINE → PREP → ENGAGE → CHECKPOINT → ITERATE/HANDOFF
```

---

## The Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. DEFINE (1 min)                                              │
│     What am I building? One sentence.                           │
│                                                                 │
│  2. PREP (2 min)                                                │
│     Load starter pack or relevant skills                        │
│     Reference NotebookLM if needed                              │
│                                                                 │
│  3. ENGAGE                                                      │
│     Clear prompt → Agent works → You review                     │
│                                                                 │
│  4. CHECKPOINT                                                  │
│     Agent gives: Done / Next / Handoff                          │
│     You save handoff line                                       │
│                                                                 │
│  5. ITERATE or HANDOFF                                          │
│     Same agent: "Continue with [next thing]"                    │
│     Different agent: Paste handoff, new task                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Define

Before touching any AI:

```markdown
## What I'm Building
[One sentence - if you can't say it simply, scope is too big]

## Success Looks Like
[What does "done" look like?]

## Constraints
[Time, tech, requirements]
```

**Example:**
```markdown
## What I'm Building
A dashboard for tracking user analytics

## Success Looks Like
Charts showing user signups, active users, revenue over time

## Constraints
Next.js, must use existing Clerk auth, ship today
```

---

## Phase 2: Prep

### Choose Your Agent

| Task Type | Best Agent |
|-----------|------------|
| Heavy terminal work | Claude Code |
| Rapid iteration | Cursor |
| Parallel tasks | Anti-Gravity |
| Image generation | Anti-Gravity |
| Complex reasoning | Claude (Claude Code or Anti-Gravity with Opus) |

### Load Context

**Option A: Starter Pack**
```
"Read /skills-library/packs/dashboard.md then build [description]"
```

**Option B: Specific Skills**
```
"Reference these:
- /agents/gsap/SKILL.md for animations
- /design-system/SKILL.md for styling
Then build [description]"
```

**Option C: NotebookLM**
Add relevant notebooks to conversation context.

---

## Phase 3: Engage

### Good Prompts

```
✓ "Build a user table with search, filter, and pagination"
✓ "Add scroll-triggered fade-in to all section headings"
✓ "Create an API endpoint for fetching user analytics"
```

### Bad Prompts

```
✗ "Make it better"
✗ "Add some features"
✗ "Do the thing we talked about"
```

### If Agent Goes Wrong

```
"Stop. That's not what I need.
I want [clear description].
[Optional: here's an example]"
```

### If Agent Asks Too Many Questions

```
"Just do it. Make reasonable decisions.
I'll course-correct if needed."
```

---

## Phase 4: Checkpoint

### What You Get
Agent response ends with:
```
## ✓ Done
- [x] Items completed

## → Next
- [ ] Items remaining

## 📋 Handoff
"Context summary for continuation"
```

### What You Do
1. Review the Done list - does it match expectations?
2. Review the Next list - is this still the priority?
3. Save the Handoff line somewhere:

```markdown
# Session: Dashboard Build
Date: [today]

CP1: "Auth complete with Clerk. Protected routes working."
CP2: "Sidebar + header layout done."
CP3: "User table with search/filter."
→ Current: Need charts
```

---

## Phase 5: Iterate or Handoff

### Same Agent, Continue
```
"Continue with: Add the analytics charts"
```

### Same Agent, Different Day
```
"Resume from: [paste handoff line]
Continue with: [next task]"
```

### Different Agent
```
"Previous work: [paste handoff line]
Your task: [new task]

Read /skills-library/platforms/[platform]/PLATFORM.md first."
```

---

## Multi-Agent Workflow

### When to Switch

| From | To | When |
|------|-----|------|
| Any | Anti-Gravity | Need parallel agents or image gen |
| Any | Cursor | Need rapid iteration or Visual Editor |
| Any | Claude Code | Need heavy terminal or CLI work |
| Hitting rate limits | Different platform | Rate limit reset |

### Handoff Process

```
Agent A finishes:
"Done: [list]. Handoff: [context]"
    ↓
You copy handoff
    ↓
Agent B:
"Previous agent: [handoff]
Now: [your new task]
Context: [paste relevant skill files if needed]"
```

---

## Session Management

### Starting a Session

```markdown
# Session: [Project Name]
Date: [date]
Goal: [what to accomplish]
Platform: [Cursor/Claude Code/Anti-Gravity]

## Loaded
- [skills/packs loaded]
- [notebooks referenced]

## Checkpoints
[will fill as we go]
```

### Ending a Session

```markdown
## Session End

### Completed
- [features/tasks done]

### Remaining
- [what's left]

### Last Handoff
"[final handoff line for next session]"

### Notes
- [anything to remember]
```

---

## Troubleshooting

### Agent is slow
- Break into smaller tasks
- Be more specific
- Reduce context (don't load too many skills)

### Agent is wrong
- "Stop. That's wrong. Here's what I actually need: [clear description]"
- Provide an example if possible

### Agent is over-explaining
- "Just do it, don't explain"
- "Execute, I'll ask questions if needed"

### Agent keeps asking questions
- "Make reasonable assumptions and proceed"
- Provide defaults in your prompt

### Hit rate limits
- Switch to different platform
- Use lighter model (Flash vs Pro)
- Wait for reset

---

## Mindset

### You Are

```
Creative Director
- You have the vision
- You make decisions
- You review output

NOT a coder asking for help
- You're an engineer orchestrating AI
- The AI does the typing
- You do the thinking
```

### The Goal

```
INNOVATION + QUALITY + SPEED

Not just "get it working"
Build gold standard products
Push boundaries
Ship fast but ship excellent
```

### Systems Thinking

```
Every piece connects:
- Skills inform agents
- Checkpoints enable handoffs
- Handoffs enable multi-agent
- Notebooks provide context
- Packs reduce setup time

You're building a SYSTEM, not just using tools.
```

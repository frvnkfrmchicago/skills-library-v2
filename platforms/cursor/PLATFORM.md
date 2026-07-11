# Cursor Platform Guide

AI-powered IDE for rapid iteration. Know your powers.

## TL;DR: What Cursor Can Do

| Capability | How | When to Use |
|------------|-----|-------------|
| Tab completion | Custom model | Every keystroke |
| Agent mode | Composer | Full features |
| Background agents | Async tasks | Parallel work |
| Visual Editor | Click + drag | UI design |
| Debug mode | Built-in | Troubleshooting |
| Plan mode | Before execution | Complex tasks |
| BugBot | PR review | Code review |
| Memories | Persistent context | Project conventions |
| MCP integration | External tools | Data sources |
| Multi-model | OpenAI, Anthropic, Gemini, xAI | Task-specific |

---

## Your Capabilities (USE THESE)

### 1. Tab Completion (Fastest)
Cursor's custom model predicts your next action:
- Multi-line suggestions
- Context-aware
- Learns your patterns

**When to use:** Always on. Accept with Tab.

### 2. Agent Mode (Composer)
Full autonomous coding:
- Understands entire codebase
- Multi-file edits
- Terminal commands
- Self-testing

**Trigger:** Cmd+I (Mac) / Ctrl+I (Windows)

### 3. Background Agents
Async task execution:
- Multiple agents in parallel
- Work while you do other things
- Linear/Jira integration

**When to use:** End-of-day tasks, batch work, while you're in meetings.

### 4. Visual Editor (NEW - Jan 2026)
Chrome DevTools-style in IDE:
- Click and drag elements
- Inspect components
- Edit styles visually
- Changes apply to code

**When to use:** UI polish, design tweaks, responsive adjustments.

### 5. Debug Mode
Integrated debugging:
- Breakpoints
- Variable inspection
- Step through code

**When to use:** Complex bugs, understanding flow.

### 6. Plan Mode
Generate detailed plan before acting:
- Task breakdown
- File changes preview
- Dependency analysis

**When to use:** Complex features, risky refactors.

### 7. BugBot (PR Review)
Automated code review:
- Catches issues before merge
- "Fix in Cursor" prompts
- Jump to problematic code

**When to use:** Every PR.

### 8. Memories
Persistent project knowledge:
- Remembers conventions
- Stores decisions
- Applies to future sessions

**When to use:** Project setup, then automatic.

### 9. Model Selection
Available models:
- GPT-5 / GPT-4o
- Claude Opus 4.5 / Sonnet 4.5
- Gemini 3 Pro
- Grok Code

**Switch based on task:** Fast model for simple, powerful for complex.

---

## .cursorrules Best Practices

### Location
```
project-root/
└── .cursorrules    # Project-specific rules
```

### Structure
```markdown
# [Project Name]

## Stack
[One line per technology]

## Structure
[Folder map]

## Patterns
[Code examples of YOUR conventions]

## Don't
[Explicit anti-patterns]
```

### Token Budget
~8k tokens for rules. Budget:
- Stack/structure: 500
- Patterns: 2000
- Don'ts: 500
- Leave 5000 for file context

### Front-Load Important Rules
Cursor may truncate. Put critical rules first.

---

## Keyboard Shortcuts

| Action | Mac | Windows |
|--------|-----|---------|
| Composer (Agent) | Cmd+I | Ctrl+I |
| Inline edit | Cmd+K | Ctrl+K |
| Accept suggestion | Tab | Tab |
| Open chat | Cmd+L | Ctrl+L |
| Toggle sidebar | Cmd+B | Ctrl+B |
| Command palette | Cmd+Shift+P | Ctrl+Shift+P |

---

## @-References

Focus context with references:
```
@file:src/components/Button.tsx    # Specific file
@folder:src/api                    # Folder
@docs                              # Indexed docs
@codebase                          # Full codebase search
@web                               # Web search
```

**Pro tip:** Use @file to reduce context when hitting limits.

---

## Anti-Patterns to AVOID

### DON'T Do These

| Anti-Pattern | Why It's Bad | Do Instead |
|--------------|--------------|------------|
| Huge .cursorrules | Exceeds context budget | Keep under 8k tokens |
| Vague rules | AI can't follow | Concrete examples |
| Explaining basics | AI knows Python | Project-specific only |
| Repeating setup | Token waste | Reference patterns |

### Good Patterns

| Pattern | Why |
|---------|-----|
| Concrete code examples | Clear, actionable |
| @file references | Focused context |
| Short, imperative rules | Easy to follow |
| Project-specific conventions | Adds value |

---

## Collaboration Principles

### Flexibility Over Rigidity

```
.cursorrules are GUIDES, not LAWS.

If user provides context that conflicts:
1. User's current instruction wins
2. .cursorrules are defaults
3. Adapt to the situation
```

### When Conflicting Instructions

```
User says X, .cursorrules say Y?
→ User wins
→ Don't argue
→ Follow current direction
```

### Innovation Focus

```
Goal: Ship fast, build quality
Rules exist to ENABLE this
Break patterns when it serves the outcome
```

---

## Rate Limit Strategy

When hitting limits:
1. **Switch to Tab** - Lower cost
2. **Use @file** - Reduce context
3. **Break into smaller prompts** - Less per request
4. **Use Claude Code** - Different rate pool
5. **Use Anti-Gravity** - Different rate pool

---

## Workflow Integration

### With Skills Library

```
Copy skills to .cursorrules:
cp ~/skills-library/platforms/cursor/*.cursorrules .cursorrules
```

Or import:
```
# .cursorrules
# Based on skills-library stack-master
[paste relevant sections]
```

### With Other Tools

| Handoff | When |
|---------|------|
| Cursor → Claude Code | Multi-file refactors, CLI work |
| Cursor → Anti-Gravity | Need parallel agents, image gen |
| Claude Code → Cursor | Rapid iteration, tab completion |
| Anti-Gravity → Cursor | Quick fixes after agent work |

---

## Quick Commands

### Start Composer
```
Cmd+I: "Build a [feature] that [does X]"
```

### Inline Edit
```
Select code → Cmd+K: "Make this [change]"
```

### Background Agent
```
Cmd+I: "In background: [task]"
```

### Visual Editor
```
Open preview → Click element → Edit in inspector
```

---

## Remember

1. **Tab completion is free** - Use it constantly
2. **@references focus context** - Use when hitting limits
3. **Background agents are async** - Start and forget
4. **Visual Editor for UI** - Click, don't describe
5. **Adapt rules to user** - Flexibility over rigidity

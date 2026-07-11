---
name: cursor
description: Cursor IDE workflows. Rules files, composer patterns, agent mode, context management, Claude/GPT integration.
last_updated: 2026-03
owner: Frank
---

# Cursor IDE

Master Cursor for AI-assisted development.

> **See also:** `platforms/WORKFLOW-GUIDE.md` for multi-IDE strategy

---

## Context Questions

Before using Cursor, ask:

1. **What's the task size?** — Quick fix, single feature, major refactor
2. **What mode is best?** — Chat, Cmd+K, Composer, Agent Mode
3. **What context needed?** — Single file, multi-file, full codebase
4. **Are rules configured?** — .cursorrules, .mdc files
5. **Which model?** — Claude Sonnet (complex), Haiku (quick)

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Mode** | Chat ←→ Agent Mode |
| **Scope** | Inline edit ←→ Full feature |
| **Context** | Single file ←→ @Codebase |
| **Autonomy** | Manual approval ←→ Auto-accept |
| **Model** | Fast (Haiku) ←→ Smart (Sonnet) |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Quick question | Chat (Cmd+L) |
| Small edit (<20 lines) | Cmd+K inline |
| Multi-file creation | Composer |
| Full feature build | Composer + Agent Mode |
| Need verification | Agent mode with test steps |
| Complex reasoning | Claude Sonnet model |

---

## TL;DR

| Feature | What It Does | When to Use |
|---------|--------------|-------------|
| **Rules files** | Persistent context for AI | Every project |
| **Composer** | Multi-file editing | Complex changes |
| **Agent mode** | Autonomous task execution | Feature builds |
| **Chat** | Quick questions/edits | Single-file fixes |
| **Cmd+K** | Inline edits | Small changes |

---

## Part 1: Rules Files

### File Types

| File | Location | Scope |
|------|----------|-------|
| `.cursorrules` | Project root | Entire project |
| `.cursor/rules/*.mdc` | Rules directory | Glob-matched files |
| `cursor.json` | Project root | Settings override |

### .cursorrules (Project-Wide)

```markdown
# Project: [Name]

## Stack
- Next.js 16.1.1 (App Router)
- TypeScript (strict)
- Tailwind + shadcn/ui
- Prisma + PostgreSQL

## Rules
- No `any` types
- No console.log in commits
- Components under 200 lines
- Server actions for all mutations

## Patterns
[Include core patterns here]
```

### .mdc Files (Scoped Rules)

```yaml
# .cursor/rules/components.mdc
---
description: Component patterns
globs: ["src/components/**/*.tsx"]
alwaysApply: false
---

# Component Rules

- Props interface above component
- Use `cn()` for class merging
- Named exports only
```

```yaml
# .cursor/rules/server-actions.mdc
---
description: Server action patterns
globs: ["src/server/**/*.ts"]
alwaysApply: true
---

# Server Actions

- Always validate with Zod
- Always check auth
- Return { data } or { error }
```

### Rules Hierarchy

```
1. User settings (global)
2. .cursorrules (project)
3. .mdc files (file-specific)
4. Inline instructions (prompt)
```

Later rules override earlier ones.

---

## Part 2: Composer

### When to Use Composer

| Task | Use Composer? |
|------|---------------|
| Create new feature (3+ files) | Yes |
| Refactor across files | Yes |
| Single file edit | No (use Chat) |
| Quick question | No (use Chat) |

### Composer Workflow

```
1. Cmd+Shift+I → Open Composer
2. @ mention files you want to edit
3. Describe the change
4. Review diffs
5. Accept or iterate
```

### Effective Composer Prompts

```markdown
# Good: Specific, scoped
Create a UserProfile component that:
- Fetches user from @lib/db
- Uses the pattern from @components/ui/card
- Includes edit functionality with server action

# Bad: Vague
Make a user profile page
```

### @ Mentions

| Syntax | What It Does |
|--------|--------------|
| `@file.tsx` | Include file content |
| `@folder/` | Include folder context |
| `@Codebase` | Search entire codebase |
| `@Docs` | Search documentation |
| `@Web` | Search web |

---

## Part 3: Agent Mode

### Enable Agent Mode

```
Composer → Toggle "Agent" (top right)
```

### What Agent Mode Does

- Runs terminal commands
- Creates/edits multiple files
- Installs packages
- Runs tests
- Iterates on errors

### Agent Mode Prompts

```markdown
# Feature build
Build a complete auth flow:
1. Create login page at app/login
2. Create signup page at app/signup
3. Add Clerk middleware
4. Protect dashboard routes
5. Run the build to verify

# Bug fix
The checkout is failing. Debug by:
1. Check the Stripe webhook handler
2. Add logging
3. Test with stripe trigger
4. Fix the issue
```

### Agent Mode Best Practices

| Do | Don't |
|----|-------|
| Give clear success criteria | Assume it knows your intent |
| Include test/verify steps | Let it run indefinitely |
| Scope to one feature | Mix unrelated tasks |
| Review before accepting | Auto-accept everything |

---

## Part 4: Chat vs Cmd+K

### Chat (Cmd+L)

```
Best for:
- Questions about code
- Single-file edits
- Explanations
- Debugging help
```

### Cmd+K (Inline Edit)

```
Best for:
- Small, targeted changes
- Refactoring selection
- Adding types
- Quick fixes
```

### Decision Tree

```
Need to understand something?
  → Chat

Need to change < 20 lines in one file?
  → Cmd+K (select → Cmd+K → describe)

Need to change multiple files?
  → Composer

Need autonomous execution?
  → Composer + Agent Mode
```

---

## Part 5: Context Management

### Keep Context Tight

```markdown
# Good: Explicit context
@components/ui/button.tsx
@lib/utils.ts

Add a loading state to Button using the cn pattern from utils

# Bad: Too much context
@Codebase

Update some buttons
```

### .cursorignore

```gitignore
# .cursorignore
node_modules/
.next/
dist/
*.log
.env*
```

### Context Window Tips

| Problem | Solution |
|---------|----------|
| AI forgets earlier context | Start new chat |
| AI hallucinates files | Use @ mentions explicitly |
| Slow responses | Reduce context, use .cursorignore |
| Wrong patterns | Check rules files are loading |

---

## Part 6: Model Selection

### Available Models

| Model | Best For | Speed |
|-------|----------|-------|
| Claude 3.5 Sonnet | Complex reasoning, code | Medium |
| Claude 3.5 Haiku | Quick tasks | Fast |
| GPT-4o | General coding | Medium |
| GPT-4o mini | Simple edits | Fast |

### When to Switch

```
Complex architecture decision → Claude Sonnet
Quick fix → Haiku or GPT-4o mini
Multi-file refactor → Claude Sonnet
Simple component → Any model
```

### API Key Setup

```json
// cursor.json (project root)
{
  "anthropic.apiKey": "sk-ant-...",
  "openai.apiKey": "sk-..."
}
```

Or use Cursor's built-in credits.

---

## Part 7: Integration with Skills Library

### Rules File That References Skills

```markdown
# .cursorrules

## Skills Library

This project uses the Skills Library at `.claude/skills/`.

When you need patterns, READ the relevant skill file:
- Animation: `.claude/skills/agents/gsap/SKILL.md`
- Database: `.claude/skills/agents/database/SKILL.md`
- Payments: `.claude/skills/agents/stripe/SKILL.md`

Don't guess patterns. Read the skill file first.

## Stack
[Your stack here]
```

### Prompting with Skills

```markdown
# In Composer
Read @.claude/skills/agents/stripe/SKILL.md and implement
a subscription checkout using those patterns.
```

---

## Part 8: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+L | Open Chat |
| Cmd+Shift+I | Open Composer |
| Cmd+K | Inline edit |
| Cmd+. | Accept suggestion |
| Esc | Reject suggestion |
| Cmd+Shift+J | Toggle agent mode |
| Cmd+Enter | Submit prompt |

---

## Checklist

### Project Setup
```markdown
- [ ] .cursorrules created with stack + patterns
- [ ] .cursor/rules/ has scoped .mdc files
- [ ] .cursorignore excludes noise
- [ ] Skills library path configured
```

### Workflow
```markdown
- [ ] Using Chat for questions
- [ ] Using Cmd+K for small edits
- [ ] Using Composer for multi-file
- [ ] Using Agent mode for features
- [ ] Reviewing all changes before accepting
```

---

## Resources

### Official Documentation (Source of Truth)

**Cursor:**
- [Cursor Docs](https://docs.cursor.com) — Main documentation
- [Rules Files](https://docs.cursor.com/context/rules) — MDC format
- [Composer](https://docs.cursor.com/agent/composer)
- [Agent Mode](https://docs.cursor.com/agent/agent-mode)
- [Context Management](https://docs.cursor.com/context)

**Community:**
- [Cursor Rules Examples](https://cursor.directory) — Community rules

**Claude (Powers Cursor):**
- [Claude Models](https://docs.anthropic.com/en/docs/about-claude/models)
- [Claude API](https://docs.anthropic.com/en/api)

---

## Related Skills

- `_meta/CURSOR-USER-RULES.md` — Cursor user settings
- `platforms/antigravity/SKILL.md` — Google Antigravity patterns
- `platforms/claude-code/PLATFORM.md` — Claude Code patterns

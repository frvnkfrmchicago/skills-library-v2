# Claude Code Platform Guide

Anthropic's CLI-first coding agent. Know your powers.

## TL;DR: What Claude Code Can Do

| Capability | How | When to Use |
|------------|-----|-------------|
| Terminal-native | CLI interface | Complex terminal work |
| Multi-file edits | Agentic coding | Refactors, features |
| Skills system | --skill flag | Specialized workflows |
| MCP servers | Tool integrations | External services |
| Long context | 200k tokens | Large codebases |
| File operations | Direct access | Create, edit, move files |
| Shell commands | Execute directly | Build, test, deploy |
| IDE integration | VS Code, JetBrains | Embedded agent |

---

## Your Capabilities (USE THESE)

### 1. Terminal-Native Workflow
Claude Code runs in your terminal:
```bash
claude "Build a REST API for user management"
```

**When to use:** Complex tasks, multi-file changes, terminal-heavy work.

### 2. Skills System
Load specialized skills:
```bash
claude --skill ./skills-library/skills/app-factory "Create a dashboard"
claude --skill ./skills-library/agents/gsap "Add scroll animations"
```

**When to use:** Domain-specific tasks, consistent patterns.

### 3. Multi-File Operations
Edit across entire codebase:
- Create new files
- Modify existing files
- Move/rename files
- Delete files

All in one session.

### 4. Shell Command Execution
Run any terminal command:
```bash
# Claude can execute:
npm install
pnpm build
git commit
vercel deploy
prisma db push
```

**When to use:** Full workflow automation.

### 5. Long Context (200k tokens)
Handle large codebases:
- Read entire repos
- Understand full architecture
- Make consistent changes

**When to use:** Large refactors, architecture changes.

### 6. MCP Server Integration
Connect to external services:
- GitHub
- Slack
- Database tools
- Custom integrations

**When to use:** When task needs external data/actions.

### 7. IDE Integration
Works inside VS Code, JetBrains:
- Sidebar agent
- Inline suggestions
- Terminal integration

**When to use:** When you prefer IDE over terminal.

---

## CLI Commands

### Basic Usage
```bash
# Simple prompt
claude "Explain this codebase"

# With skill
claude --skill ./path/to/skill "Build X"

# Continue conversation
claude --continue

# New conversation
claude --new

# Show help
claude --help
```

### File Operations
```bash
# Read file
claude "Read and explain src/index.ts"

# Edit file
claude "Add error handling to src/api.ts"

# Create file
claude "Create a new component at src/components/Button.tsx"

# Multi-file
claude "Refactor auth logic across all files"
```

### With Context
```bash
# Add files to context
claude --files src/api/*.ts "Add pagination to all endpoints"

# Add folder
claude --folder src/components "Update all components to use new design system"
```

---

## Skills Integration

### Using Skills
```bash
# Load single skill
claude --skill ./skills-library/skills/stack-master "Set up new project"

# Load multiple skills
claude --skill ./skills/gsap --skill ./skills/motion "Add animations"
```

### Skills Location
```
~/skills-library/
├── skills/          # Domain skills
│   ├── app-factory/
│   ├── stack-master/
│   └── ...
└── agents/          # Documentation agents
    ├── gsap/
    ├── motion/
    └── ...
```

### Creating Skills
See `/skills-library/` README for skill creation guide.

---

## Anti-Patterns to AVOID

### DON'T Do These

| Anti-Pattern | Why It's Bad | Do Instead |
|--------------|--------------|------------|
| Tiny prompts | Underuses capability | Full task descriptions |
| Not using skills | Reinvents wheels | Load relevant skills |
| Manual file reads | Wastes time | Let Claude read directly |
| Breaking into many calls | Context loss | One comprehensive prompt |

### Good Patterns

| Pattern | Why |
|---------|-----|
| Full task in one prompt | Uses long context |
| Skill + specific ask | Best of both |
| Let it run commands | Full automation |
| Trust multi-file edits | That's the strength |

---

## Collaboration Principles

### Flexibility Over Rigidity

```
Skills are GUIDES, not LAWS.

If you provide context that conflicts with a skill:
1. Your instruction wins
2. Skills provide defaults
3. Adapt to the situation
```

### When Conflicting Instructions

```
You say X, skill says Y?
→ You win
→ Won't argue or lecture
→ Follows current direction
```

### Innovation Focus

```
Goal: Build innovative, high-quality software
Skills exist to ENABLE this
Break patterns when it serves the outcome
```

---

## Workflow Integration

### With Skills Library
```bash
# Reference skills directly
claude --skill ~/skills-library/skills/app-factory "Build a SaaS"

# Or set CLAUDE_SKILLS_PATH
export CLAUDE_SKILLS_PATH=~/skills-library/skills
claude --skill app-factory "Build a SaaS"
```

### With Other Tools

| Handoff | When |
|---------|------|
| Claude Code → Cursor | Rapid iteration, tab completion |
| Claude Code → Anti-Gravity | Need parallel agents, image gen |
| Cursor → Claude Code | Multi-file refactors, CLI work |
| Anti-Gravity → Claude Code | CLI automation after agent work |

---

## When to Use Claude Code vs Others

### Use Claude Code When:
- Terminal-heavy workflow
- Large codebase refactor
- Need skills system
- Prefer CLI
- Multi-file changes
- Long context needed

### Use Cursor When:
- Rapid iteration
- Tab completion
- Visual Editor
- Quick fixes

### Use Anti-Gravity When:
- Need parallel agents
- Image generation
- Browser testing
- Gemini-specific features

---

## Quick Workflows

### New Project
```bash
claude --skill app-factory "Create a Next.js SaaS with Clerk auth and Stripe payments"
```

### Add Feature
```bash
claude "Add user profile page with edit functionality to this Next.js app"
```

### Refactor
```bash
claude "Refactor all API routes to use consistent error handling"
```

### Debug
```bash
claude "Debug why the auth middleware is failing - check logs and fix"
```

### Deploy
```bash
claude "Run build, fix any errors, then deploy to Vercel"
```

---

## Remember

1. **Terminal-first** - Use CLI directly, not just IDE
2. **Skills are power** - Load them for specialized tasks
3. **Long context** - Don't fear large prompts
4. **Multi-file is the point** - Let it edit across codebase
5. **Adapt to user** - Skills are flexible defaults

---

## Resources

### Official Documentation (Source of Truth)

**Claude Code:**
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code) — Main docs
- [Getting Started](https://docs.anthropic.com/en/docs/claude-code/getting-started)
- [CLI Reference](https://docs.anthropic.com/en/docs/claude-code/cli-reference)

**Claude Models (Powers Claude Code):**
- [Claude Models Overview](https://docs.anthropic.com/en/docs/about-claude/models)
- [API Reference](https://docs.anthropic.com/en/api)
- [Context Window](https://docs.anthropic.com/en/docs/build-with-claude/context-windows)
- [Rate Limits](https://docs.anthropic.com/en/api/rate-limits)

**MCP (Model Context Protocol):**
- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP Servers](https://docs.anthropic.com/en/docs/claude-code/mcp)

---

## Related Skills

- `platforms/cursor/SKILL.md` — Cursor IDE patterns
- `platforms/antigravity/SKILL.md` — Google Antigravity patterns
- `ai-sdk/SKILL.md` — Vercel AI SDK with Claude

---
name: antigravity
description: Google Antigravity AI IDE. Capabilities, tools, MCP integrations, limitations, multi-agent patterns.
last_updated: 2026-03
owner: Frank
---

# Antigravity (Google AI Code IDE)

Your AI coding companion with superpowers.

> **See also:** `platforms/cursor/SKILL.md`, `platforms/WORKFLOW-GUIDE.md`

---

## Context Questions

Before using Antigravity, ask:

1. **What's the task type?** — Code generation, file operations, research, testing
2. **What tools needed?** — Terminal, browser, image generation, web search
3. **What integrations?** — Firebase MCP, other MCPs
4. **What's the scope?** — Single file, multi-file, full project
5. **Is it safe to auto-run?** — Destructive vs safe commands

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Task** | Research ←→ Implementation |
| **Scope** | Single file ←→ Full project |
| **Speed** | Safe/verified ←→ Fast/parallel |
| **Interaction** | Autonomous ←→ User confirmation |
| **Tool** | Core tools ←→ MCP integrations |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Quick code edit | replace_file_content, single file |
| Multi-file refactor | multi_replace or parallel edits |
| Need latest docs | search_web first |
| Testing UI flow | browser_subagent |
| Need visuals | generate_image |
| Firebase project | Use MCP firebase tools |

---

## TL;DR

| Capability | Tool | Status |
|------------|------|--------|
| **Code editing** | write_to_file, replace_file_content | ✅ Core |
| **Terminal** | run_command | ✅ Core |
| **Image generation** | generate_image | ✅ Unique |
| **Web search** | search_web | ✅ Unique |
| **Browser automation** | browser_subagent | ✅ Unique |
| **MCP integrations** | Firebase, etc. | ✅ Extensible |
| **Video generation** | — | ❌ Not available |

---

## Part 1: Core Capabilities

### File Operations

```python
# Read any file
view_file(AbsolutePath="/path/to/file.ts")

# Write new file
write_to_file(
    TargetFile="/path/to/new-file.ts",
    CodeContent="// content here",
    Overwrite=False
)

# Edit existing file (single change)
replace_file_content(
    TargetFile="/path/to/file.ts",
    TargetContent="old code",
    ReplacementContent="new code",
    StartLine=10,
    EndLine=20
)

# Edit existing file (multiple changes)
multi_replace_file_content(
    TargetFile="/path/to/file.ts",
    ReplacementChunks=[...]
)
```

### Terminal Commands

```python
# Run command (short-lived)
run_command(
    CommandLine="npm run build",
    Cwd="/path/to/project",
    WaitMsBeforeAsync=5000,
    SafeToAutoRun=True  # Only for truly safe commands
)

# Long-running commands (servers, watchers)
run_command(
    CommandLine="npm run dev",
    Cwd="/path/to/project",
    WaitMsBeforeAsync=3000  # Returns command ID
)

# Check status of background command
command_status(
    CommandId="abc123",
    WaitDurationSeconds=60
)
```

---

## Part 2: Image Generation

### When to Use

- UI mockups and wireframes
- Placeholder images for development
- Icons and simple graphics
- Design iteration with user

### generate_image Tool

```python
generate_image(
    Prompt="Modern dashboard UI with dark theme, glassmorphism cards, 
            showing analytics metrics. Clean, minimal, professional.",
    ImageName="dashboard_mockup"
)
```

### Effective Prompts

```markdown
## Good Prompt Structure
[Style] + [Subject] + [Details] + [Constraints]

## Examples

UI Design:
"Minimalist mobile app login screen, dark mode, gradient 
background purple to blue, centered logo, email and password 
fields, social login buttons, clean typography"

Hero Image:
"Abstract 3D geometric shapes floating, iridescent colors, 
subtle glow, dark background, suitable for SaaS landing page hero"

Icon:
"Simple flat icon of a lightning bolt, electric blue color, 
white background, suitable for app logo, 512x512"
```

### Limitations

- No video generation (VEO not integrated)
- No GIFs/animations
- No editing existing images (generate new instead)
- Results vary — iterate on prompts

---

## Part 3: Web Search

### search_web Tool

```python
search_web(
    query="Next.js 16.1.1 server actions best practices 2025",
    domain="nextjs.org"  # Optional: prioritize domain
)
```

### When to Use

- Latest documentation
- API changes and updates
- Best practices (current year)
- Debugging error messages
- Research before implementing

### Best Practices

```markdown
## Effective Search Queries

✅ Good: "Vercel AI SDK streaming response TypeScript 2025"
❌ Bad: "how to use AI"

✅ Good: "Next.js 16.1.1 App Router metadata API"
❌ Bad: "next js seo"

## Use Cases
1. Verify current syntax before coding
2. Check for breaking changes
3. Find official examples
4. Research error messages
```

---

## Part 4: Browser Automation

### browser_subagent Tool

```python
browser_subagent(
    TaskName="Login Flow Demo",
    Task="""
    1. Navigate to http://localhost:3000
    2. Click the "Login" button
    3. Fill email field with "test@example.com"
    4. Fill password field with "password123"
    5. Click "Submit"
    6. Wait for dashboard to load
    7. Report success/failure
    """,
    RecordingName="login_flow_demo"
)
```

### Use Cases

- Testing web applications
- Recording demos (saved as WebP)
- Form automation
- Screenshot capture
- E2E workflow verification

### Writing Effective Tasks

```markdown
## Task Structure
1. Navigation — Where to go
2. Interactions — What to click/type
3. Assertions — What to verify
4. Return condition — When to stop

## Example: Full Test

Task: "Test the checkout flow"
1. Navigate to http://localhost:3000/products
2. Click "Add to Cart" on first product
3. Click cart icon in header
4. Verify cart shows 1 item
5. Click "Checkout"
6. Fill shipping form with test data
7. Click "Place Order"
8. Verify confirmation page shows "Order Confirmed"
9. Return the order ID shown on screen
```

---

## Part 5: MCP Integrations

### Firebase MCP

```python
# Get environment info
mcp_firebase_get_environment()

# List projects
mcp_firebase_list_projects(page_size=20)

# List apps in project
mcp_firebase_list_apps(platform="web")

# Get SDK config
mcp_firebase_get_sdk_config(platform="web")

# Initialize services
mcp_firebase_init(
    features={
        "firestore": {"location_id": "nam5"},
        "hosting": {"public_directory": "out"}
    }
)
```

### Available MCP Tools

- `firebase_get_environment` — Current config
- `firebase_list_projects` — Your projects
- `firebase_create_project` — New project
- `firebase_create_app` — Register app
- `firebase_get_sdk_config` — Get config
- `firebase_init` — Initialize services
- `firebase_get_security_rules` — View rules

---

## Part 6: Limitations & Workarounds

### What Antigravity Can't Do

| Limitation | Workaround |
|------------|------------|
| Video generation | Use external tools (Runway, Luma) |
| Direct VEO access | Use Google AI Studio separately |
| Real-time streaming | Preview in browser with browser_subagent |
| Native app testing | Use Expo Go + device |
| Database queries | Use terminal + CLI tools |
| External API auth | Store tokens in .env, use via terminal |

### Common Issues

```markdown
## "Command timed out"
→ Increase WaitMsBeforeAsync
→ Run as background command

## "File not found"
→ Use absolute paths
→ Check cwd in run_command

## "Permission denied"
→ Check file permissions
→ May need sudo (ask user)

## "Browser subagent failed"
→ Check if dev server running
→ Verify URL is accessible
→ Simplify task steps
```

---

## Part 7: Best Practices

### Efficient Workflows

```markdown
## 1. Parallel Operations
- Read multiple files simultaneously
- Run independent commands in parallel
- Batch small edits with multi_replace

## 2. Minimize Tool Calls
- Use view_file to see enough context
- Make complete edits (not multiple small ones)
- Combine related operations

## 3. Background Commands
- Start dev servers in background
- Check status only when needed
- Use appropriate WaitMsBeforeAsync
```

### Task Boundaries

```markdown
## When to Use task_boundary
- Complex multi-step work
- User needs progress visibility
- Multiple files/components

## When to Skip
- Simple Q&A
- Quick single-file edits
- Explaining code
```

### Safe vs Unsafe Commands

```python
# Safe (can auto-run)
SafeToAutoRun=True
- npm install (in project)
- npm run build
- git status
- cat file.txt
- ls, pwd, echo

# Unsafe (need approval)
SafeToAutoRun=False
- rm commands
- git push
- npm publish
- Database modifications
- External API calls with side effects
- sudo anything
```

---

## Part 8: Multi-Agent Coordination

### Handoff Pattern

```markdown
## Agent 1 completes work, creates handoff:

### Context
- What was built
- Current state
- Known issues

### For Next Agent
- What needs to be done
- Files to modify
- Specific instructions

### Navigation Updates
- Files to add to CHANGELOG
- Files to add to NAVIGATION
```

### Parallel Agent Work

```markdown
## Divide by Domain
Agent A: Frontend components
Agent B: Backend API
Agent C: Documentation

## Avoid Conflicts
- Don't edit same files
- Use clear ownership
- Merge via handoff
```

---

## Part 9: Cursor Rules (Optional)

If using Cursor-style rules:

```markdown
# .cursor/rules.md or AGENTS.md

## Project Context
- Tech stack: Next.js 16.1.1  React 19, TypeScript
- State: TanStack Query + Zustand
- Styling: Tailwind CSS

## Conventions
- Use Server Components by default
- 'use client' only when needed
- Error handling: try/catch with proper types

## File Structure
- /app — App Router pages
- /components — UI components
- /lib — Utilities and helpers

## Testing
- npm run test for unit tests
- npm run e2e for Playwright
```

---

## Checklist

Before completing work:

- [ ] All files saved with correct paths
- [ ] Commands tested and working
- [ ] Background servers managed properly
- [ ] User informed of any issues
- [ ] CHANGELOG updated
- [ ] Navigation files updated (if new skill)

---

## Resources

### Official Documentation (Source of Truth)

**Antigravity:**
- [Antigravity Docs](https://antigravity.google/docs/home) — Main documentation
- [Getting Started](https://antigravity.google/docs/getting-started)
- [Tool Reference](https://antigravity.google/docs/tools)

**Gemini API (Powers Antigravity):**
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs) — Core API reference
- [Models Overview](https://ai.google.dev/gemini-api/docs/models)
- [Function Calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Live API](https://ai.google.dev/gemini-api/docs/live) — Real-time capabilities
- [Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)

**MCP (Model Context Protocol):**
- [MCP Documentation](https://modelcontextprotocol.io)
- [Firebase MCP](https://firebase.google.com/docs/mcp)

---

## Related Skills

- `google-ai-studio/SKILL.md` — Gemini API patterns
- `cursor/SKILL.md` — Cursor IDE patterns
- `claude-code/SKILL.md` — Claude Code patterns

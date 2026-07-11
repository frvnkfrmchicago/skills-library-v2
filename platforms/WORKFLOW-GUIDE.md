# AI Development Workflow Guide 2025

**Last Updated:** March 2026

Your multi-IDE workflow, optimized for speed and credit preservation.

> **Access Note:** Some tools mentioned here (Anti-Gravity, Stitch, Jules) are Google internal or early-access. If you don't have access, substitute with available alternatives:
> - Anti-Gravity → Use Claude.ai or ChatGPT for conversation
> - Stitch → Use v0.dev, Bolt, or Lovable for UI generation
> - Jules → Use GitHub Copilot Workspace or manual git workflows

---

## TL;DR: Which Tool When

| Stage | Tool | Why |
|-------|------|-----|
| Free exploration | **Anti-Gravity** | Unlimited prompting, no context limit concern |
| Pick direction | **Anti-Gravity** | Strong reasoning, conversation |
| Information architecture | **Claude Code** | Structure without UI noise |
| Visual ideation | **Anti-Gravity + Stitch** | Fast generation of options |
| AI feature testing | **Google AI Studio** | Quick multimodal prototyping |
| Core implementation | **Cursor** (tab only) | Tab completion, NOT agent |
| Large refactors | **Claude Code** | Multi-file, long context |
| Debug loops | **Anti-Gravity** | Conversation + execution |
| UX polish | **Anti-Gravity** | Animation ideas + browser testing |
| Background tasks | **Jules** | Async, runs while you work |
| UI mockups | **Stitch** | Sketch/text → UI → Figma |

---

## Tool by Tool (Current January 2026)

### Google Anti-Gravity

**What it is:** Agent-first IDE powered by Gemini 3.0

| Feature | What It Does |
|---------|--------------|
| Manager View | Oversee multiple AI agents working in parallel |
| Multi-agent | Spawn agents for different tasks simultaneously |
| Browser subagents | Auto-test UIs, take screenshots, validate flows |
| Image generation | Nano Banana Pro for product images |
| Artifacts | Task lists, plans, screenshots, recordings for transparency |
| Claude access | Opus 4.5 / Sonnet 4.5 for complex reasoning |
| Generative UI | Create interfaces from natural language |

**Use for:**
- Primary workspace
- Conversation/planning (doesn't accidentally create files)
- Complex builds with validation
- Parallel work streams

**Credit status:** Near-unlimited, barely touched

---

### Google Jules

**What it is:** Async autonomous coding agent (GitHub-integrated)

| Feature | What It Does |
|---------|--------------|
| Async execution | Works in background while you do other things |
| GitHub integration | Clones repos, creates PRs, generates diffs |
| Audio changelogs | Voice summaries of recent activity |
| Environment snapshots | Saves setup for faster future runs |
| Proactive | Can anticipate and fix issues without prompting |
| Parallel processing | Multiple tasks simultaneously |

**Use for:**
- End-of-day batch tasks
- "Fix these 5 bugs" while you sleep
- Background dependency updates
- Parallel experiment branches

**Workflow:**
```
1. Assign task to Jules
2. Continue working in Anti-Gravity
3. Review PR when Jules is done
4. Accept or request changes
```

---

### Google Stitch

**What it is:** AI UI generation (from Galileo AI acquisition)

| Feature | What It Does |
|---------|--------------|
| Text-to-UI | Describe UI → get complete layout |
| Image-to-UI | Upload sketch/wireframe → get code |
| HTML/CSS/JSX export | Production-ready code |
| Figma export | Editable layers, auto-layout |
| Responsive | Mobile + desktop by default |

**Use for:**
- Quick mockups before building
- Rapid UI exploration
- Getting from idea to visual fast
- Handoff to Figma for refinement

**URL:** stitch.withgoogle.com (free with limits)

---

### Google AI Studio

**What it is:** Gemini playground for multimodal testing

| Feature | What It Does |
|---------|--------------|
| Quick prototyping | Test Gemini capabilities fast |
| Image generation | Generate assets |
| Video understanding | Process video content |
| Audio processing | Voice + sound |
| API export | Get code snippets for your app |

**Use for:**
- Testing if AI can do X before building
- Generating assets
- Prototyping multimodal features
- Extracting API calls to copy into your app

---

### Cursor

**What it is:** AI-enhanced VS Code fork

| Feature | What It Does |
|---------|--------------|
| Tab completion | Predicts code blocks (FAST) |
| Agent mode (Cmd+I) | Autonomous multi-file changes (BURNS CREDITS) |
| Visual Editor | Click-and-drag UI editing |
| YOLO mode | Auto-run tests until passing |
| Multi-model | GPT-4, Claude, Gemini access |

**Problem:** You burn all credits in 1 day using agent mode.

**Fix:**
| Mode | Credit Cost | Use For |
|------|-------------|---------|
| Tab completion | LOW | Always on, accept suggestions |
| Inline edit (Cmd+K) | Medium | Quick targeted changes |
| Agent mode (Cmd+I) | HIGH | Avoid unless necessary |
| Chat (Cmd+L) | HIGH | Use Anti-Gravity instead |

**Optimization:**
- Tab completion = FREE (custom model)
- Agent mode = EXPENSIVE
- Move conversation to Anti-Gravity
- Use Cursor only for accepting tab suggestions + visual editor

---

### Claude Code

**What it is:** CLI-first Anthropic coding agent

| Feature | What It Does |
|---------|--------------|
| Terminal-native | Works in shell directly |
| 200k context | Entire codebase awareness |
| Skills system | Load specialized behaviors |
| Multi-file editing | Refactor across everything |
| IDE integration | VS Code sidebar option |

**Use for:**
- Large refactors
- CLI-heavy workflows
- Loading skills library: `claude --skill /path/to/skill`
- When you need deep reasoning on architecture

**Credit status:** 2-3x/day reset (worth using for heavy work)

---

## The Optimized Workflow

### Credit Preservation Strategy

| Goal | Strategy |
|------|----------|
| Save Cursor credits | Tab only, no chat/agent |
| Save Claude Code credits | Use for big refactors, not conversation |
| Maximize Anti-Gravity | Use for all conversation + building |
| Offload to Jules | Background tasks while you work |

### Flow by Cognitive Mode

| Mode | Tool | Notes |
|------|------|-------|
| **Divergent** (exploring options) | Anti-Gravity + Stitch | Many possibilities fast |
| **Convergent** (deciding) | Anti-Gravity or Claude Code | Strong reasoning |
| **Structure** (architecture) | Claude Code | Global view |
| **Execution** (writing code) | Cursor tab + Anti-Gravity | Fast implementation |
| **Batch** (many tasks) | Jules | Runs async |

---

## M4 Pro MacBook Optimization

| Setting | Recommendation | Why |
|---------|----------------|-----|
| RAM | 48GB+ for AI work | LLMs need memory |
| Unified memory | Use on-device models when possible | Faster, private |
| Multiple workspaces | Each project in its own macOS space | Parallel focus |
| Anti-Gravity | Full-screen dedicated space | Primary workspace |
| Cursor | Minimized unless editing | Preserve resources |
| Jules | Background | Async processing |

**Neural Engine:**
- 16-core for ML acceleration
- Use Core ML for on-device inference
- MLX for local model development

---

## Skills Library Integration

### Per Project (Recommended)

```
1. Duplicate skills-library-v2 folder
2. Place in project root
3. Each project comes pre-packaged
4. Reference: "Read /skills-library/agents/gsap/SKILL.md"
```

### Per Tool

| Tool | How to Add Skills |
|------|-------------------|
| **Anti-Gravity** | Skills folder in workspace, reference by path |
| **Cursor** | `.cursorrules` file (subset only, ~8K tokens) |
| **Claude Code** | `--skill` flag or `CLAUDE_SKILLS_PATH` env |
| **AI Studio** | Upload specific files to conversation |

---

## ChatGPT's Process Map (Verified)

Your ChatGPT workflow was accurate. Here's the verified version:

| # | Stage | Tool | Verified? |
|---|-------|------|-----------|
| 1 | Free ideation | Anti-Gravity | ✅ Correct |
| 2 | Pick direction | Claude Code or Anti-Gravity | ✅ Both work |
| 3 | Information architecture | Claude Code | ✅ Correct |
| 4 | User flow definition | Claude Code | ✅ Correct |
| 5 | Visual ideation | Anti-Gravity + Stitch | ✅ Add Stitch |
| 6 | AI feature testing | Google AI Studio | ✅ Correct |
| 7 | AI feature extraction | Google AI Studio | ✅ Correct |
| 8 | App architecture | Claude Code | ✅ Correct |
| 9 | Core implementation | Cursor (tab only) | ⚠️ Tab only to save credits |
| 10 | Parallel experiments | Jules | ✅ Better for async |
| 11 | Large refactors | Claude Code | ✅ Correct |
| 12 | Debug loops | Anti-Gravity | ⚠️ Better than Cursor for reasoning |
| 13 | UX polish | Anti-Gravity | ⚠️ Has browser testing |
| 14 | Build/finalize | Cursor | ✅ Correct |
| 15 | Post-production | Anti-Gravity | ✅ Correct |

---

## Date Clarity

Add to each SKILL.md frontmatter:

```yaml
---
name: skill-name
description: ...
last_updated: 2026-03
---
```

This prevents AI date confusion.

---

## Quick Commands

### Anti-Gravity
```
"Spawn agents for:
1. Auth system
2. Dashboard UI
3. Database schema
Run in parallel."
```

### Jules (async)
```
"Fix these GitHub issues: #12, #15, #23
Run in background, create PRs when done."
```

### Stitch
```
"Create a dashboard UI with sidebar navigation, 
dark theme, showing user analytics cards"
→ Export to Figma or HTML/CSS
```

### Cursor (save credits)
- Use TAB to accept completions
- Avoid Cmd+I agent mode
- Avoid Cmd+L chat
- Move conversation to Anti-Gravity
